/**
 * Response caching utilities for HTTP APIs
 * Provides helper functions for setting Cache-Control headers
 *
 * @module lib/cache-utils
 */

/**
 * Cache control configuration with timing and staleness options
 */
interface CacheConfig {
  maxAge: number;       // Max age in seconds
  staleWhileRevalidate?: number;  // Can serve stale while revalidating
  staleIfError?: number;          // Can serve stale on error
  isPrivate?: boolean;  // Private vs public cache
}

/**
 * Build Cache-Control header value from configuration
 *
 * @example
 * getCacheControl({ maxAge: 3600, staleWhileRevalidate: 86400 })
 * // Returns: "public, max-age=3600, stale-while-revalidate=86400"
 */
export function getCacheControl(config: CacheConfig): string {
  const parts: string[] = [];
  
  // Add public/private directive
  parts.push(config.isPrivate ? 'private' : 'public');
  
  // Add max-age (required)
  parts.push(`max-age=${config.maxAge}`);
  
  // Add optional directives
  if (config.staleWhileRevalidate) {
    parts.push(`stale-while-revalidate=${config.staleWhileRevalidate}`);
  }
  if (config.staleIfError) {
    parts.push(`stale-if-error=${config.staleIfError}`);
  }
  
  return parts.join(', ');
}

/**
 * Predefined cache configurations for common use cases
 */
export const CACHE_PRESETS = {
  NO_CACHE: getCacheControl({ maxAge: 0 }),
  SHORT: getCacheControl({ maxAge: 60 }),           // 1 minute
  MEDIUM: getCacheControl({ maxAge: 300 }),         // 5 minutes
  LONG: getCacheControl({ maxAge: 3600 }),          // 1 hour
  VERY_LONG: getCacheControl({ maxAge: 86400 }),    // 24 hours
  
  // With stale-while-revalidate for background refresh
  SHORT_SWR: getCacheControl({
    maxAge: 300,
    staleWhileRevalidate: 3600
  }),
  MEDIUM_SWR: getCacheControl({
    maxAge: 3600,
    staleWhileRevalidate: 86400
  }),
  LONG_SWR: getCacheControl({
    maxAge: 86400,
    staleWhileRevalidate: 604800
  }),
  
  // Private cache for authenticated users
  PRIVATE_SHORT: getCacheControl({
    maxAge: 300,
    isPrivate: true
  }),
  PRIVATE_MEDIUM: getCacheControl({
    maxAge: 3600,
    isPrivate: true
  }),
} as const;

/**
 * Set Cache-Control headers on a Response object
 *
 * @example
 * const response = new Response(data);
 * setCacheControl(response, CACHE_PRESETS.MEDIUM);
 */
export function setCacheControl(
  response: Response,
  cacheControl: string
): Response {
  response.headers.set('Cache-Control', cacheControl);
  return response;
}

/**
 * Compute ETags for conditional requests
 * Simple implementation - use strong hash in production
 *
 * @example
 * const etag = getETag(JSON.stringify(data));
 */
export function getETag(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `"${Math.abs(hash).toString(36)}"`;
}

/**
 * Check if cached response is still fresh
 */
export function isFresh(cacheAge: number, maxAge: number): boolean {
  return cacheAge < maxAge;
}

/**
 * Calculate cache age in seconds
 */
export function getCacheAge(cacheTime: number): number {
  return (Date.now() - cacheTime) / 1000;
}

/**
 * Cache key builder for consistent key generation
 */
export class CacheKeyBuilder {
  private prefix: string;
  
  constructor(prefix: string = 'cache') {
    this.prefix = prefix;
  }
  
  /**
   * Build a namespaced cache key
   * @example
   * const builder = new CacheKeyBuilder('beats');
   * builder.key('genre', 'electronic') // Returns: beats:genre:electronic
   */
  key(...parts: (string | number)[]): string {
    return [this.prefix, ...parts].join(':');
  }
  
  /**
   * Generate cache key from request URL
   */
  fromUrl(url: string): string {
    const parsed = new URL(url);
    return this.key(parsed.pathname.replace(/\//g, ':'));
  }
  
  /**
   * Generate cache key from query parameters
   */
  fromParams(baseKey: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params).sort();
    const paramString = sortedParams
      .map(key => `${key}=${params[key]}`)
      .join('&');
    
    return this.key(baseKey, paramString);
  }
}

/**
 * Simple in-memory cache implementation
 * Use Redis for distributed caching in production
 */
export class MemoryCache<T> {
  private cache = new Map<string, { value: T; expires: number }>();
  
  /**
   * Set a cache entry with TTL
   */
  set(key: string, value: T, ttlSeconds: number): void {
    this.cache.set(key, {
      value,
      expires: Date.now() + (ttlSeconds * 1000)
    });
  }
  
  /**
   * Get a cache entry (returns undefined if expired)
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) return undefined;
    
    // Check if expired
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return undefined;
    }
    
    return entry.value;
  }
  
  /**
   * Check if key exists and is fresh
   */
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }
  
  /**
   * Delete a cache entry
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }
  
  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * Get cache entries count
   */
  size(): number {
    return this.cache.size;
  }
}

/**
 * Get-or-create pattern with caching
 * Automatically caches computed values
 *
 * @example
 * const value = await getOrCreate(
 *   'beats:all',
 *   () => db.query.beats.findMany(),
 *   300  // 5 minute TTL
 * );
 */
export async function getOrCreate<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number,
  cache: MemoryCache<T> = new MemoryCache()
): Promise<T> {
  // Check cache first
  const cached = cache.get(key);
  if (cached !== undefined) {
    return cached;
  }
  
  // Fetch and cache
  const value = await fetcher();
  cache.set(key, value, ttlSeconds);
  
  return value;
}

export default {
  getCacheControl,
  CACHE_PRESETS,
  setCacheControl,
  getETag,
  isFresh,
  getCacheAge,
  CacheKeyBuilder,
  MemoryCache,
  getOrCreate,
};
