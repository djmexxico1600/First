/**
 * Performance profiling and timing utilities
 * Tracks operation timings, database queries, and API calls
 *
 * @module lib/performance-profiler
 */

/**
 * Track timing for an operation
 */
interface TimingEntry {
  name: string;
  duration: number; // milliseconds
  startTime: number;
  endTime: number;
}

/**
 * Performance profiler for tracking operation metrics
 */
export class PerformanceProfiler {
  private timings: Map<string, TimingEntry[]> = new Map();
  private activeTimers: Map<string, number> = new Map();
  
  /**
   * Start tracking an operation
   */
  startTimer(name: string): string {
    const timerId = `${name}:${Date.now()}:${Math.random()}`;
    this.activeTimers.set(timerId, performance.now());
    return timerId;
  }
  
  /**
   * End tracking and record timing
   * @returns Duration in milliseconds
   */
  endTimer(timerId: string): number {
    const startTime = this.activeTimers.get(timerId);
    if (!startTime) {
      console.warn(`Timer ${timerId} not found`);
      return 0;
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    const name = timerId.split(':')[0];
    
    // Record timing
    if (!this.timings.has(name)) {
      this.timings.set(name, []);
    }
    
    this.timings.get(name)!.push({
      name,
      duration,
      startTime,
      endTime
    });
    
    this.activeTimers.delete(timerId);
    return duration;
  }
  
  /**
   * Get all timings for an operation
   */
  getTimings(name: string): TimingEntry[] {
    return this.timings.get(name) || [];
  }
  
  /**
   * Get statistics for an operation
   */
  getStats(name: string) {
    const timings = this.getTimings(name);
    
    if (timings.length === 0) {
      return {
        count: 0,
        min: 0,
        max: 0,
        avg: 0,
        total: 0,
        p50: 0,
        p95: 0,
        p99: 0,
      };
    }
    
    const durations = timings.map(t => t.duration).sort((a, b) => a - b);
    const total = durations.reduce((a, b) => a + b, 0);
    
    return {
      count: timings.length,
      min: durations[0],
      max: durations[durations.length - 1],
      avg: total / durations.length,
      total,
      p50: this.percentile(durations, 0.5),
      p95: this.percentile(durations, 0.95),
      p99: this.percentile(durations, 0.99),
    };
  }
  
  /**
   * Clear all timings
   */
  clear(): void {
    this.timings.clear();
    this.activeTimers.clear();
  }
  
  /**
   * Get summary of all tracked operations
   */
  getSummary() {
    const summary: Record<string, any> = {};
    
    for (const [name] of this.timings) {
      summary[name] = this.getStats(name);
    }
    
    return summary;
  }
  
  private percentile(sorted: number[], p: number): number {
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[Math.max(0, index)] || 0;
  }
}

/**
 * Global profiler instance
 */
export const globalProfiler = new PerformanceProfiler();

/**
 * Time an async function execution
 *
 * @example
 * const result = await timeAsync(
 *   () => db.query.beats.findMany(),
 *   'db:beats:findMany'
 * );
 */
export async function timeAsync<T>(
  fn: () => Promise<T>,
  label: string,
  profiler: PerformanceProfiler = globalProfiler
): Promise<T> {
  const timerId = profiler.startTimer(label);
  try {
    return await fn();
  } finally {
    const duration = profiler.endTimer(timerId);
    if (duration > 1000) {
      console.warn(`Slow operation: ${label} took ${duration.toFixed(2)}ms`);
    }
  }
}

/**
 * Time a sync function execution
 */
export function timeSync<T>(
  fn: () => T,
  label: string,
  profiler: PerformanceProfiler = globalProfiler
): T {
  const timerId = profiler.startTimer(label);
  try {
    return fn();
  } finally {
    profiler.endTimer(timerId);
  }
}

/**
 * Request timing tracker
 * Tracks timings for different phases of request processing
 */
export class RequestTimer {
  private startTime = Date.now();
  private marks: Map<string, number> = new Map();
  
  /**
   * Mark a checkpoint in request processing
   */
  mark(name: string): void {
    this.marks.set(name, Date.now());
  }
  
  /**
   * Get time elapsed since request start
   */
  elapsed(): number {
    return Date.now() - this.startTime;
  }
  
  /**
   * Get time between two marks
   */
  between(mark1: string, mark2: string): number | null {
    const time1 = this.marks.get(mark1);
    const time2 = this.marks.get(mark2);
    
    if (!time1 || !time2) return null;
    return time2 - time1;
  }
  
  /**
   * Get time from start to mark
   */
  to(mark: string): number | null {
    const time = this.marks.get(mark);
    if (!time) return null;
    return time - this.startTime;
  }
  
  /**
   * Get all marks as object
   */
  getAllMarks() {
    const result: Record<string, number> = {};
    for (const [name, time] of this.marks) {
      result[name] = time - this.startTime;
    }
    return result;
  }
  
  /**
   * Export timing data
   */
  export() {
    return {
      total: this.elapsed(),
      marks: this.getAllMarks(),
    };
  }
}

/**
 * Database query performance tracker
 */
export class QueryProfiler {
  private queries: Array<{
    sql: string;
    duration: number;
    timestamp: number;
    params?: any;
  }> = [];
  
  /**
   * Record a query execution
   */
  recordQuery(
    sql: string,
    duration: number,
    params?: any
  ): void {
    this.queries.push({
      sql,
      duration,
      timestamp: Date.now(),
      params,
    });
    
    // Warn on slow queries
    if (duration > 100) {
      console.warn(
        `Slow query (${duration.toFixed(2)}ms): ${sql}`
      );
    }
  }
  
  /**
   * Get all recorded queries
   */
  getQueries() {
    return [...this.queries];
  }
  
  /**
   * Get query statistics
   */
  getStats() {
    if (this.queries.length === 0) {
      return {
        count: 0,
        totalTime: 0,
        avgTime: 0,
        slowest: null,
        slowQueryCount: 0,
      };
    }
    
    const durations = this.queries.map(q => q.duration);
    const totalTime = durations.reduce((a, b) => a + b, 0);
    const slowest = this.queries.reduce((max, q) =>
      q.duration > max.duration ? q : max
    );
    const slowQueryCount = durations.filter(d => d > 100).length;
    
    return {
      count: this.queries.length,
      totalTime: totalTime.toFixed(2),
      avgTime: (totalTime / this.queries.length).toFixed(2),
      slowest,
      slowQueryCount,
    };
  }
  
  /**
   * Clear recorded queries
   */
  clear(): void {
    this.queries = [];
  }
}

/**
 * Memory usage tracker
 */
export function getMemoryUsage() {
  if (typeof process === 'undefined') {
    return null;
  }
  
  const usage = process.memoryUsage();
  return {
    rss: `${(usage.rss / 1024 / 1024).toFixed(2)} MB`,
    heapUsed: `${(usage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
    heapTotal: `${(usage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
    external: `${(usage.external / 1024 / 1024).toFixed(2)} MB`,
    raw: usage,
  };
}

export default {
  PerformanceProfiler,
  globalProfiler,
  timeAsync,
  timeSync,
  RequestTimer,
  QueryProfiler,
  getMemoryUsage,
};
