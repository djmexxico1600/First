/**
 * Database scaling and optimization utilities
 * Connection pooling, read replicas, query analysis
 *
 * @module lib/db-scaling
 */

/**
 * Database connection pool configuration
 */
export interface PoolConfig {
  min: number;           // Minimum connections to maintain
  max: number;           // Maximum connections
  idleTimeout: number;   // Milliseconds before closing idle connection
  acquireTimeout: number; // Milliseconds to wait for available connection
  reapInterval: number;  // Interval to check for idle connections
}

/**
 * Default pool configurations for different scenarios
 */
export const POOL_CONFIGS = {
  // Development: Keep it lightweight
  DEVELOPMENT: {
    min: 2,
    max: 5,
    idleTimeout: 30000,
    acquireTimeout: 5000,
    reapInterval: 10000,
  },

  // Production API: Handle moderate load
  PRODUCTION_API: {
    min: 10,
    max: 30,
    idleTimeout: 15000,
    acquireTimeout: 10000,
    reapInterval: 5000,
  },

  // High Load: Heavy concurrent usage
  HIGH_LOAD: {
    min: 20,
    max: 100,
    idleTimeout: 10000,
    acquireTimeout: 5000,
    reapInterval: 3000,
  },
} as const;

/**
 * Query execution context for tracking and optimization
 */
export interface QueryContext {
  sql: string;
  params?: any[];
  startTime: number;
  endTime?: number;
  duration?: number;
  rows?: number;
  cached?: boolean;
  error?: Error;
}

/**
 * Database statistics for monitoring
 */
export interface DatabaseStats {
  connections: {
    total: number;
    active: number;
    idle: number;
    waiting: number;
  };
  queries: {
    total: number;
    slow: number;
    cached: number;
    errors: number;
    avgDuration: number;
  };
  poolMetrics: {
    reused: number;
    created: number;
    closed: number;
  };
}

/**
 * Connection pool monitor
 * Tracks pool health and statistics
 */
export class PoolMonitor {
  private stats = {
    connectionsCreated: 0,
    connectionsClosed: 0,
    connectionsReused: 0,
    queryCount: 0,
    slowQueryCount: 0,
    cachedQueryCount: 0,
    errorCount: 0,
    totalDuration: 0,
  };

  private slowQueryThreshold: number;
  private queryContexts: QueryContext[] = [];

  constructor(slowQueryThresholdMs: number = 100) {
    this.slowQueryThreshold = slowQueryThresholdMs;
  }

  /**
   * Record a new connection created
   */
  recordConnectionCreated(): void {
    this.stats.connectionsCreated++;
  }

  /**
   * Record a connection closed
   */
  recordConnectionClosed(): void {
    this.stats.connectionsClosed++;
  }

  /**
   * Record a connection reused
   */
  recordConnectionReused(): void {
    this.stats.connectionsReused++;
  }

  /**
   * Track query execution
   */
  recordQuery(context: QueryContext): void {
    this.stats.queryCount++;

    if (context.duration) {
      this.stats.totalDuration += context.duration;

      if (context.duration > this.slowQueryThreshold) {
        this.stats.slowQueryCount++;
      }
    }

    if (context.cached) {
      this.stats.cachedQueryCount++;
    }

    if (context.error) {
      this.stats.errorCount++;
    }

    this.queryContexts.push(context);

    // Keep only recent contexts (last 1000)
    if (this.queryContexts.length > 1000) {
      this.queryContexts.shift();
    }
  }

  /**
   * Get current statistics
   */
  getStats() {
    const avgDuration =
      this.stats.queryCount > 0
        ? this.stats.totalDuration / this.stats.queryCount
        : 0;

    return {
      connections: {
        created: this.stats.connectionsCreated,
        closed: this.stats.connectionsClosed,
        reused: this.stats.connectionsReused,
        reuseRatio:
          this.stats.connectionsCreated > 0
            ? this.stats.connectionsReused / this.stats.connectionsCreated
            : 0,
      },
      queries: {
        total: this.stats.queryCount,
        slow: this.stats.slowQueryCount,
        cached: this.stats.cachedQueryCount,
        errors: this.stats.errorCount,
        avgDuration: Math.round(avgDuration),
      },
    };
  }

  /**
   * Get slow queries for analysis
   */
  getSlowQueries(limit: number = 10) {
    return this.queryContexts
      .filter(
        (ctx) => ctx.duration && ctx.duration > this.slowQueryThreshold
      )
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
      .slice(0, limit);
  }

  /**
   * Clear statistics
   */
  reset(): void {
    this.stats = {
      connectionsCreated: 0,
      connectionsClosed: 0,
      connectionsReused: 0,
      queryCount: 0,
      slowQueryCount: 0,
      cachedQueryCount: 0,
      errorCount: 0,
      totalDuration: 0,
    };
    this.queryContexts = [];
  }
}

/**
 * Global pool monitor
 */
export const globalPoolMonitor = new PoolMonitor();

/**
 * Read replica routing strategy
 */
export type RoutingStrategy = 'round-robin' | 'least-connections' | 'random';

/**
 * Database read/write routing
 * Routes queries to appropriate database instance
 */
export class DatabaseRouter {
  private primary: string;
  private replicas: string[] = [];
  private replicaIndex: number = 0;
  private strategy: RoutingStrategy;

  constructor(primary: string, replicas: string[] = [], strategy: RoutingStrategy = 'round-robin') {
    this.primary = primary;
    this.replicas = replicas;
    this.strategy = strategy;
  }

  /**
   * Get connection string for read operation
   */
  getReadConnection(): string {
    if (this.replicas.length === 0) {
      return this.primary;
    }

    switch (this.strategy) {
      case 'round-robin':
        return this.roundRobin();
      case 'random':
        return this.randomReplica();
      case 'least-connections':
        // Would require actual connection tracking
        return this.roundRobin();
      default:
        return this.primary;
    }
  }

  /**
   * Get connection string for write operation
   */
  getWriteConnection(): string {
    return this.primary;
  }

  private roundRobin(): string {
    const replica = this.replicas[this.replicaIndex];
    this.replicaIndex = (this.replicaIndex + 1) % this.replicas.length;
    return replica;
  }

  private randomReplica(): string {
    const index = Math.floor(Math.random() * this.replicas.length);
    return this.replicas[index];
  }
}

/**
 * Shard key generator for database sharding
 * Distributes data across multiple databases
 */
export class ShardKeyGenerator {
  private shardCount: number;

  constructor(shardCount: number) {
    this.shardCount = shardCount;
  }

  /**
   * Generate shard ID from user ID
   */
  fromUserId(userId: string): number {
    return this.hashString(userId) % this.shardCount;
  }

  /**
   * Generate shard ID from string key
   */
  fromKey(key: string): number {
    return this.hashString(key) % this.shardCount;
  }

  /**
   * Generate shard ID from numeric ID
   */
  fromNumericId(id: number): number {
    return (id % Math.pow(2, 32)) % this.shardCount;
  }

  /**
   * Simple hash function for consistent distribution
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Get all shard IDs
   */
  getAllShardIds(): number[] {
    return Array.from({ length: this.shardCount }, (_, i) => i);
  }
}

/**
 * Query analyzer for identifying optimization opportunities
 */
export class QueryAnalyzer {
  /**
   * Check if query is a SELECT (read operation)
   */
  static isReadQuery(sql: string): boolean {
    return /^\s*SELECT\s+/i.test(sql);
  }

  /**
   * Check if query is a write operation
   */
  static isWriteQuery(sql: string): boolean {
    return /^\s*(INSERT|UPDATE|DELETE)\s+/i.test(sql);
  }

  /**
   * Check if query uses JOIN
   */
  static hasJoin(sql: string): boolean {
    return /\s+JOIN\s+/i.test(sql);
  }

  /**
   * Check if query uses subquery
   */
  static hasSubquery(sql: string): boolean {
    return /\(\s*SELECT\s+/i.test(sql);
  }

  /**
   * Estimate query complexity
   * Higher = more complex = might benefit from caching/optimization
   */
  static getComplexity(sql: string): 'simple' | 'moderate' | 'complex' {
    let complexity = 0;

    if (this.hasJoin(sql)) complexity += 2;
    if (this.hasSubquery(sql)) complexity += 2;
    if (/WHERE\s+.+\s+AND\s+/i.test(sql)) complexity += 1;
    if (/GROUP\s+BY/i.test(sql)) complexity += 1;
    if (/ORDER\s+BY/i.test(sql)) complexity += 1;

    if (complexity === 0) return 'simple';
    if (complexity <= 2) return 'moderate';
    return 'complex';
  }

  /**
   * Extract table names from query
   */
  static getTableNames(sql: string): string[] {
    const matches = sql.match(/FROM\s+(\w+)|JOIN\s+(\w+)/gi);
    if (!matches) return [];

    return matches
      .map((m) => m.replace(/FROM\s+|JOIN\s+/gi, '').trim())
      .filter((name) => name.length > 0);
  }
}

/**
 * Database transaction wrapper with retry logic
 */
export async function withTransaction<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Exponential backoff
      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 100; // 100ms, 200ms, 400ms
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

export default {
  POOL_CONFIGS,
  PoolMonitor,
  globalPoolMonitor,
  DatabaseRouter,
  ShardKeyGenerator,
  QueryAnalyzer,
  withTransaction,
};