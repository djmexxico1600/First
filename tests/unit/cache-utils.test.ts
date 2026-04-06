import { describe, it, expect, beforeEach } from 'vitest';
import {
  getCacheControl,
  CACHE_PRESETS,
  setCacheControl,
  getETag,
  isFresh,
  getCacheAge,
  CacheKeyBuilder,
  MemoryCache,
  getOrCreate,
} from '../../src/lib/cache-utils';

describe('cache-utils', () => {
  describe('getCacheControl', () => {
    it('should build basic cache control header', () => {
      const result = getCacheControl({ maxAge: 3600 });
      expect(result).toBe('public, max-age=3600');
    });
    
    it('should add stale-while-revalidate directive', () => {
      const result = getCacheControl({
        maxAge: 3600,
        staleWhileRevalidate: 86400,
      });
      expect(result).toContain('stale-while-revalidate=86400');
    });
    
    it('should add stale-if-error directive', () => {
      const result = getCacheControl({
        maxAge: 3600,
        staleIfError: 604800,
      });
      expect(result).toContain('stale-if-error=604800');
    });
    
    it('should support private cache', () => {
      const result = getCacheControl({
        maxAge: 3600,
        isPrivate: true,
      });
      expect(result).toMatch(/^private/);
    });
  });
  
  describe('CACHE_PRESETS', () => {
    it('should have predefined cache configurations', () => {
      expect(CACHE_PRESETS.NO_CACHE).toBeTruthy();
      expect(CACHE_PRESETS.SHORT).toBeTruthy();
      expect(CACHE_PRESETS.MEDIUM).toBeTruthy();
      expect(CACHE_PRESETS.LONG).toBeTruthy();
    });
    
    it('should provide SWR variants', () => {
      expect(CACHE_PRESETS.SHORT_SWR).toContain('stale-while-revalidate');
      expect(CACHE_PRESETS.MEDIUM_SWR).toContain('stale-while-revalidate');
      expect(CACHE_PRESETS.LONG_SWR).toContain('stale-while-revalidate');
    });
    
    it('should provide private cache variants', () => {
      expect(CACHE_PRESETS.PRIVATE_SHORT).toMatch(/^private/);
      expect(CACHE_PRESETS.PRIVATE_MEDIUM).toMatch(/^private/);
    });
  });
  
  describe('setCacheControl', () => {
    it('should set Cache-Control header on response', () => {
      const response = new Response('test');
      const cacheControl = CACHE_PRESETS.MEDIUM;
      
      setCacheControl(response, cacheControl);
      
      expect(response.headers.get('Cache-Control')).toBe(cacheControl);
    });
    
    it('should return response for chaining', () => {
      const response = new Response('test');
      const result = setCacheControl(response, CACHE_PRESETS.SHORT);
      
      expect(result).toBe(response);
    });
  });
  
  describe('getETag', () => {
    it('should generate consistent etags', () => {
      const content = 'test content';
      const etag1 = getETag(content);
      const etag2 = getETag(content);
      
      expect(etag1).toBe(etag2);
    });
    
    it('should generate different etags for different content', () => {
      const etag1 = getETag('content1');
      const etag2 = getETag('content2');
      
      expect(etag1).not.toBe(etag2);
    });
    
    it('should format etag with quotes', () => {
      const etag = getETag('test');
      expect(etag).toMatch(/^".*"$/);
    });
  });
  
  describe('isFresh', () => {
    it('should return true if cache age less than max age', () => {
      expect(isFresh(30, 60)).toBe(true);
    });
    
    it('should return false if cache age greater than max age', () => {
      expect(isFresh(100, 60)).toBe(false);
    });
    
    it('should return false if cache age equals max age', () => {
      expect(isFresh(60, 60)).toBe(false);
    });
  });
  
  describe('getCacheAge', () => {
    it('should calculate cache age in seconds', () => {
      const cacheTime = Date.now() - 5000; // 5 seconds ago
      const age = getCacheAge(cacheTime);
      
      expect(age).toBeLessThanOrEqual(5);
      expect(age).toBeGreaterThan(4);
    });
  });
  
  describe('CacheKeyBuilder', () => {
    let builder: CacheKeyBuilder;
    
    beforeEach(() => {
      builder = new CacheKeyBuilder('test');
    });
    
    it('should build namespaced cache keys', () => {
      const key = builder.key('user', '123');
      expect(key).toBe('test:user:123');
    });
    
    it('should support numeric parts', () => {
      const key = builder.key('beat', 456);
      expect(key).toContain('456');
    });
    
    it('should generate keys from URLs', () => {
      const key = builder.fromUrl('https://example.com/api/beats');
      expect(key).toContain('api');
      expect(key).toContain('beats');
    });
    
    it('should generate keys from params', () => {
      const key = builder.fromParams('search', { genre: 'trap', limit: 10 });
      expect(key).toContain('genre=trap');
      expect(key).toContain('limit=10');
    });
    
    it('should sort params for consistent keys', () => {
      const key1 = builder.fromParams('search', { b: '2', a: '1' });
      const key2 = builder.fromParams('search', { a: '1', b: '2' });
      
      expect(key1).toBe(key2);
    });
  });
  
  describe('MemoryCache', () => {
    let cache: MemoryCache<any>;
    
    beforeEach(() => {
      cache = new MemoryCache();
    });
    
    it('should store and retrieve values', () => {
      cache.set('key1', { value: 'test' }, 3600);
      
      const result = cache.get('key1');
      expect(result).toEqual({ value: 'test' });
    });
    
    it('should return undefined for missing keys', () => {
      const result = cache.get('nonexistent');
      expect(result).toBeUndefined();
    });
    
    it('should expire values based on TTL', async () => {
      cache.set('key', 'value', 0.001); // 1ms TTL
      
      expect(cache.get('key')).toBe('value');
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(cache.get('key')).toBeUndefined();
    });
    
    it('should check existence with has', () => {
      cache.set('exists', 'value', 3600);
      
      expect(cache.has('exists')).toBe(true);
      expect(cache.has('missing')).toBe(false);
    });
    
    it('should delete entries', () => {
      cache.set('key', 'value', 3600);
      
      const deleted = cache.delete('key');
      
      expect(deleted).toBe(true);
      expect(cache.get('key')).toBeUndefined();
    });
    
    it('should clear all entries', () => {
      cache.set('key1', 'value1', 3600);
      cache.set('key2', 'value2', 3600);
      
      cache.clear();
      
      expect(cache.size()).toBe(0);
      expect(cache.get('key1')).toBeUndefined();
    });
  });
  
  describe('getOrCreate', () => {
    it('should return cached value if available', async () => {
      let fetchCount = 0;
      
      const cache = new MemoryCache<string>();
      cache.set('key', 'cached', 3600);
      
      const result = await getOrCreate(
        'key',
        async () => {
          fetchCount++;
          return 'fresh';
        },
        3600,
        cache
      );
      
      expect(result).toBe('cached');
      expect(fetchCount).toBe(0);
    });
    
    it('should fetch and cache if not available', async () => {
      let fetchCount = 0;
      
      const cache = new MemoryCache<string>();
      
      const result = await getOrCreate(
        'key',
        async () => {
          fetchCount++;
          return 'fetched';
        },
        3600,
        cache
      );
      
      expect(result).toBe('fetched');
      expect(fetchCount).toBe(1);
      expect(cache.get('key')).toBe('fetched');
    });
    
    it('should use global cache by default', async () => {
      const cache = new MemoryCache<number>();
      
      const result = await getOrCreate(
        'counter',
        async () => 42,
        3600,
        cache
      );
      
      expect(result).toBe(42);
    });
  });
});
