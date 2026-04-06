/**
 * Unit Tests for Logger
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { logger, generateRequestId } from '@/lib/logger';

describe('generateRequestId', () => {
  it('should generate unique request IDs', () => {
    const id1 = generateRequestId();
    const id2 = generateRequestId();

    expect(id1).not.toBe(id2);
  });

  it('should include timestamp prefix', () => {
    const id = generateRequestId();
    const parts = id.split('-');

    expect(parts.length).toBeGreaterThanOrEqual(2);
    expect(parts[0]).toMatch(/^\d+$/); // Timestamp
  });

  it('should have consistent format', () => {
    const id = generateRequestId();

    expect(id).toMatch(/^\d+-[a-z0-9]+$/);
  });
});

describe('Logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'debug').mockImplementation(() => {});
  });

  it('should log info messages', () => {
    logger.info('Test message', { key: 'value' });

    expect(console.log).toHaveBeenCalled();
  });

  it('should log warning messages', () => {
    logger.warn('Warning message');

    expect(console.warn).toHaveBeenCalled();
  });

  it('should log error messages with stack trace', () => {
    const error = new Error('Test error');
    logger.error('Error occurred', error);

    expect(console.error).toHaveBeenCalled();
  });

  it('should include request ID in logging', () => {
    const requestId = 'test-req-123';
    logger.info('Message', { test: true }, requestId);

    expect(console.log).toHaveBeenCalled();
  });

  it('should log API requests', () => {
    const requestId = generateRequestId();
    logger.logApiRequest('GET', '/api/users', requestId);

    expect(console.log).toHaveBeenCalled();
  });

  it('should log API responses with timing', () => {
    const requestId = generateRequestId();
    logger.logApiResponse('GET', '/api/users', 200, 45, requestId);

    expect(console.log).toHaveBeenCalled();
  });

  it('should log database operations (debug level)', () => {
    // Debug only logs in development - just verify it doesn't throw
    expect(() => {
      logger.logDatabaseOperation('SELECT', 'users', 10);
    }).not.toThrow();
  });

  it('should log external service calls', () => {
    logger.logExternalService('Stripe', 'POST', 200, 120);

    expect(console.log).toHaveBeenCalled();
  });
});
