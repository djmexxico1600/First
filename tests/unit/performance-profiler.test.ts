import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  PerformanceProfiler,
  timeAsync,
  timeSync,
  RequestTimer,
  QueryProfiler,
} from '../../src/lib/performance-profiler';

describe('performance-profiler', () => {
  describe('PerformanceProfiler', () => {
    let profiler: PerformanceProfiler;
    
    beforeEach(() => {
      profiler = new PerformanceProfiler();
    });
    
    it('should track operation timing', () => {
      const timerId = profiler.startTimer('test-op');
      
      // Simulate some work
      const start = Date.now();
      while (Date.now() - start < 10) {
        // Busy wait for ~10ms
      }
      
      const duration = profiler.endTimer(timerId);
      
      expect(duration).toBeGreaterThanOrEqual(5);
      expect(duration).toBeLessThan(100);
    });
    
    it('should record multiple timings for same operation', () => {
      const id1 = profiler.startTimer('op');
      profiler.endTimer(id1);
      
      const id2 = profiler.startTimer('op');
      profiler.endTimer(id2);
      
      const timings = profiler.getTimings('op');
      expect(timings.length).toBe(2);
    });
    
    it('should calculate statistics', () => {
      // Simulate multiple timed operations
      for (let i = 0; i < 3; i++) {
        const timerId = profiler.startTimer('test');
        // Simulate varying durations
        const start = Date.now();
        while (Date.now() - start < (5 + i * 2)) {
          // Busy wait
        }
        profiler.endTimer(timerId);
      }
      
      const stats = profiler.getStats('test');
      
      expect(stats.count).toBe(3);
      expect(stats.min).toBeLessThanOrEqual(stats.avg);
      expect(stats.avg).toBeLessThanOrEqual(stats.max);
      expect(stats.total).toBeGreaterThan(0);
      expect(stats.p50).toBeGreaterThan(0);
    });
    
    it('should return zeros for non-existent operations', () => {
      const stats = profiler.getStats('nonexistent');
      
      expect(stats.count).toBe(0);
      expect(stats.min).toBe(0);
      expect(stats.avg).toBe(0);
    });
    
    it('should return summary of all operations', () => {
      const id1 = profiler.startTimer('op1');
      profiler.endTimer(id1);
      
      const id2 = profiler.startTimer('op2');
      profiler.endTimer(id2);
      
      const summary = profiler.getSummary();
      
      expect(summary.op1).toBeDefined();
      expect(summary.op2).toBeDefined();
      expect(summary.op1.count).toBe(1);
      expect(summary.op2.count).toBe(1);
    });
    
    it('should clear all timings', () => {
      const id = profiler.startTimer('op');
      profiler.endTimer(id);
      
      profiler.clear();
      
      expect(profiler.getTimings('op')).toHaveLength(0);
      expect(profiler.getSummary()).toEqual({});
    });
  });
  
  describe('timeAsync', () => {
    it('should time async function execution', async () => {
      const result = await timeAsync(
        async () => {
          await new Promise(resolve => setTimeout(resolve, 10));
          return 'done';
        },
        'async-op'
      );
      
      expect(result).toBe('done');
    });
    
    it('should handle async function errors', async () => {
      const profiler = new PerformanceProfiler();
      
      try {
        await timeAsync(
          async () => {
            throw new Error('test error');
          },
          'failing-op',
          profiler
        );
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
      
      // Timing should still be recorded
      const timings = profiler.getTimings('failing-op');
      expect(timings.length).toBe(1);
    });
  });
  
  describe('timeSync', () => {
    it('should time sync function execution', () => {
      const result = timeSync(
        () => 'result',
        'sync-op'
      );
      
      expect(result).toBe('result');
    });
    
    it('should handle sync function errors', () => {
      const profiler = new PerformanceProfiler();
      
      expect(() => {
        timeSync(
          () => {
            throw new Error('test');
          },
          'error-op',
          profiler
        );
      }).toThrow();
    });
  });
  
  describe('RequestTimer', () => {
    let timer: RequestTimer;
    
    beforeEach(() => {
      timer = new RequestTimer();
    });
    
    it('should track marks in request', () => {
      timer.mark('start-db');
      timer.mark('end-db');
      
      const marks = timer.getAllMarks();
      
      expect(marks['start-db']).toBeGreaterThanOrEqual(0);
      expect(marks['end-db']).toBeGreaterThanOrEqual(marks['start-db']);
    });
    
    it('should calculate time between marks', () => {
      timer.mark('mark1');
      
      // Wait a bit
      const start = Date.now();
      while (Date.now() - start < 5) {
        // Busy wait
      }
      
      timer.mark('mark2');
      
      const between = timer.between('mark1', 'mark2');
      
      expect(between).toBeGreaterThanOrEqual(0);
      expect(between).toBeLessThan(100);
    });
    
    it('should calculate time from start to mark', () => {
      const toMark = timer.to('some-mark');
      expect(toMark).toBeNull();
      
      timer.mark('some-mark');
      const toMarkAfter = timer.to('some-mark');
      
      expect(toMarkAfter).toBeGreaterThanOrEqual(0);
    });
    
    it('should export timing data', () => {
      timer.mark('op1');
      timer.mark('op2');
      
      const exported = timer.export();
      
      expect(exported.total).toBeGreaterThanOrEqual(0);
      expect(exported.marks.op1).toBeGreaterThanOrEqual(0);
      expect(exported.marks.op2).toBeGreaterThanOrEqual(exported.marks.op1);
    });
  });
  
  describe('QueryProfiler', () => {
    let profiler: QueryProfiler;
    
    beforeEach(() => {
      profiler = new QueryProfiler();
    });
    
    it('should record query executions', () => {
      profiler.recordQuery('SELECT * FROM beats', 45);
      
      const queries = profiler.getQueries();
      expect(queries).toHaveLength(1);
      expect(queries[0].sql).toBe('SELECT * FROM beats');
      expect(queries[0].duration).toBe(45);
    });
    
    it('should record query parameters', () => {
      profiler.recordQuery(
        'SELECT * FROM users WHERE id = ?',
        30,
        [123]
      );
      
      const queries = profiler.getQueries();
      expect(queries[0].params).toEqual([123]);
    });
    
    it('should calculate query statistics', () => {
      profiler.recordQuery('Q1', 50);
      profiler.recordQuery('Q2', 30);
      profiler.recordQuery('Q3', 40);
      
      const stats = profiler.getStats();
      
      expect(stats.count).toBe(3);
      expect(stats.totalTime).toBeDefined();
      expect(stats.avgTime).toBeDefined();
      expect(stats.slowest).toBeDefined();
    });
    
    it('should track slow queries', () => {
      profiler.recordQuery('Fast query', 50);
      profiler.recordQuery('Slow query', 150);
      profiler.recordQuery('Slower query', 200);
      
      const stats = profiler.getStats();
      expect(stats.slowQueryCount).toBe(2);
    });
    
    it('should handle empty query log', () => {
      const stats = profiler.getStats();
      
      expect(stats.count).toBe(0);
      expect(stats.slowQueryCount).toBe(0);
    });
    
    it('should clear recorded queries', () => {
      profiler.recordQuery('Query', 50);
      profiler.clear();
      
      expect(profiler.getQueries()).toHaveLength(0);
    });
  });
});
