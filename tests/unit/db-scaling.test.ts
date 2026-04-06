import { describe, it, expect, beforeEach } from 'vitest';
import {
  PoolMonitor,
  DatabaseRouter,
  ShardKeyGenerator,
  QueryAnalyzer,
  withTransaction,
} from '../../src/lib/db-scaling';

describe('db-scaling', () => {
  describe('PoolMonitor', () => {
    let monitor: PoolMonitor;

    beforeEach(() => {
      monitor = new PoolMonitor(100);
    });

    it('should track connection creation', () => {
      monitor.recordConnectionCreated();
      monitor.recordConnectionCreated();

      const stats = monitor.getStats();
      expect(stats.connections.created).toBe(2);
    });

    it('should track connection closures', () => {
      monitor.recordConnectionClosed();
      monitor.recordConnectionClosed();

      const stats = monitor.getStats();
      expect(stats.connections.closed).toBe(2);
    });

    it('should track connection reuse', () => {
      monitor.recordConnectionCreated();
      monitor.recordConnectionReused();
      monitor.recordConnectionReused();

      const stats = monitor.getStats();
      expect(stats.connections.reused).toBe(2);
      expect(stats.connections.reuseRatio).toBe(2);
    });

    it('should track query execution', () => {
      monitor.recordQuery({
        sql: 'SELECT * FROM users',
        startTime: Date.now(),
        duration: 50,
      });

      const stats = monitor.getStats();
      expect(stats.queries.total).toBe(1);
      expect(stats.queries.avgDuration).toBe(50);
    });

    it('should identify slow queries', () => {
      monitor.recordQuery({
        sql: 'SELECT * FROM users',
        startTime: Date.now(),
        duration: 50,
      });

      monitor.recordQuery({
        sql: 'SELECT * FROM orders',
        startTime: Date.now(),
        duration: 150,
      });

      const stats = monitor.getStats();
      expect(stats.queries.slow).toBe(1);
    });

    it('should track cached queries', () => {
      monitor.recordQuery({
        sql: 'SELECT * FROM beats',
        startTime: Date.now(),
        duration: 5,
        cached: true,
      });

      const stats = monitor.getStats();
      expect(stats.queries.cached).toBe(1);
    });

    it('should track query errors', () => {
      monitor.recordQuery({
        sql: 'SELECT * FROM invalid_table',
        startTime: Date.now(),
        error: new Error('Table not found'),
      });

      const stats = monitor.getStats();
      expect(stats.queries.errors).toBe(1);
    });

    it('should retrieve slow queries', () => {
      monitor.recordQuery({
        sql: 'SELECT * FROM users',
        startTime: Date.now(),
        duration: 150,
      });

      monitor.recordQuery({
        sql: 'SELECT * FROM orders',
        startTime: Date.now(),
        duration: 200,
      });

      const slowQueries = monitor.getSlowQueries(10);
      expect(slowQueries.length).toBe(2);
      expect(slowQueries[0].sql).toBe('SELECT * FROM orders');
    });

    it('should reset statistics', () => {
      monitor.recordConnectionCreated();
      monitor.recordQuery({
        sql: 'SELECT * FROM users',
        startTime: Date.now(),
        duration: 50,
      });

      monitor.reset();

      const stats = monitor.getStats();
      expect(stats.connections.created).toBe(0);
      expect(stats.queries.total).toBe(0);
    });
  });

  describe('DatabaseRouter', () => {
    let router: DatabaseRouter;

    beforeEach(() => {
      router = new DatabaseRouter(
        'db-primary.example.com',
        ['db-replica1.example.com', 'db-replica2.example.com'],
        'round-robin'
      );
    });

    it('should return primary for write operations', () => {
      const writeConn = router.getWriteConnection();
      expect(writeConn).toBe('db-primary.example.com');
    });

    it('should return replica for read operations', () => {
      const readConn = router.getReadConnection();
      expect(readConn).toMatch(/replica/);
    });

    it('should use round-robin routing', () => {
      const conn1 = router.getReadConnection();
      const conn2 = router.getReadConnection();

      expect(conn1).not.toBe(conn2);
    });

    it('should return primary when no replicas configured', () => {
      const router = new DatabaseRouter('db-primary.example.com', []);

      const readConn = router.getReadConnection();
      expect(readConn).toBe('db-primary.example.com');
    });

    it('should support random routing strategy', () => {
      const router = new DatabaseRouter(
        'db-primary.example.com',
        ['db-replica1.example.com', 'db-replica2.example.com'],
        'random'
      );

      const conn = router.getReadConnection();
      expect(conn).toMatch(/replica/);
    });
  });

  describe('ShardKeyGenerator', () => {
    let generator: ShardKeyGenerator;

    beforeEach(() => {
      generator = new ShardKeyGenerator(10);
    });

    it('should generate consistent shard IDs from user IDs', () => {
      const shard1 = generator.fromUserId('user123');
      const shard2 = generator.fromUserId('user123');

      expect(shard1).toBe(shard2);
      expect(shard1).toBeGreaterThanOrEqual(0);
      expect(shard1).toBeLessThan(10);
    });

    it('should distribute different users across shards', () => {
      const shards = new Set();

      for (let i = 0; i < 100; i++) {
        const shard = generator.fromUserId(`user${i}`);
        shards.add(shard);
      }

      // Should use multiple shards
      expect(shards.size).toBeGreaterThan(1);
    });

    it('should work with numeric IDs', () => {
      const shard = generator.fromNumericId(12345);

      expect(shard).toBeGreaterThanOrEqual(0);
      expect(shard).toBeLessThan(10);
    });

    it('should work with arbitrary keys', () => {
      const shard = generator.fromKey('some-key-value');

      expect(shard).toBeGreaterThanOrEqual(0);
      expect(shard).toBeLessThan(10);
    });

    it('should return all shard IDs', () => {
      const shardIds = generator.getAllShardIds();

      expect(shardIds).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });
  });

  describe('QueryAnalyzer', () => {
    it('should identify SELECT queries', () => {
      expect(QueryAnalyzer.isReadQuery('SELECT * FROM users')).toBe(true);
      expect(QueryAnalyzer.isReadQuery('select id from beats')).toBe(true);
      expect(QueryAnalyzer.isReadQuery('INSERT INTO users')).toBe(false);
    });

    it('should identify write queries', () => {
      expect(QueryAnalyzer.isWriteQuery('INSERT INTO users')).toBe(true);
      expect(QueryAnalyzer.isWriteQuery('UPDATE users SET name')).toBe(true);
      expect(QueryAnalyzer.isWriteQuery('DELETE FROM users')).toBe(true);
      expect(QueryAnalyzer.isWriteQuery('SELECT * FROM users')).toBe(false);
    });

    it('should detect JOINs', () => {
      expect(
        QueryAnalyzer.hasJoin('SELECT * FROM users JOIN orders')
      ).toBe(true);
      expect(QueryAnalyzer.hasJoin('SELECT * FROM users')).toBe(false);
    });

    it('should detect subqueries', () => {
      expect(
        QueryAnalyzer.hasSubquery('SELECT * FROM (SELECT * FROM users)')
      ).toBe(true);
      expect(QueryAnalyzer.hasSubquery('SELECT * FROM users')).toBe(false);
    });

    it('should estimate query complexity', () => {
      expect(QueryAnalyzer.getComplexity('SELECT * FROM users')).toBe('simple');

      expect(
        QueryAnalyzer.getComplexity('SELECT * FROM users WHERE id = 1 AND status = 1')
      ).toBe('moderate');

      expect(
        QueryAnalyzer.getComplexity(
          'SELECT * FROM users JOIN orders WHERE status = 1 GROUP BY user_id ORDER BY created_at'
        )
      ).toBe('complex');
    });

    it('should extract table names', () => {
      const tables = QueryAnalyzer.getTableNames(
        'SELECT * FROM users JOIN orders ON users.id = orders.user_id'
      );

      expect(tables).toContain('users');
      expect(tables).toContain('orders');
    });
  });

  describe('withTransaction', () => {
    it('should execute transaction successfully', async () => {
      let executed = false;

      const result = await withTransaction(async () => {
        executed = true;
        return 'success';
      });

      expect(executed).toBe(true);
      expect(result).toBe('success');
    });

    it('should retry on failure', async () => {
      let attempts = 0;

      const result = await withTransaction(
        async () => {
          attempts++;
          if (attempts < 2) {
            throw new Error('Temporary failure');
          }
          return 'success';
        },
        3
      );

      expect(attempts).toBe(2);
      expect(result).toBe('success');
    });

    it('should fail after max retries', async () => {
      let attempts = 0;

      try {
        await withTransaction(
          async () => {
            attempts++;
            throw new Error('Permanent failure');
          },
          2
        );
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }

      expect(attempts).toBe(2);
    });
  });
});
