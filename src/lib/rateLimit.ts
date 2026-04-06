// In-memory rate limiting for development
// For production, use Upstash Redis or similar

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Cleanup expired entries every 10 minutes
    if (typeof global !== 'undefined') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 10 * 60 * 1000);
    }
  }

  check(key: string, limit: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetTime) {
      this.store.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (entry.count < limit) {
      entry.count++;
      return true;
    }

    return false;
  }

  reset(key: string) {
    this.store.delete(key);
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
  }
}

export const rateLimiter = new RateLimiter();

// Rate limit errors
export class RateLimitExceededError extends Error {
  constructor(public retryAfter: number) {
    super(`Rate limit exceeded. Retry after ${retryAfter}ms`);
    this.name = 'RateLimitExceededError';
  }
}

// Helper function for use in API routes
export function createRateLimitMiddleware(limit: number = 10, windowMs: number = 60000) {
  return (key: string) => {
    if (!rateLimiter.check(key, limit, windowMs)) {
      throw new RateLimitExceededError(windowMs);
    }
  };
}
