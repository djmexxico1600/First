/**
 * Unit Tests for Error Handler
 */

import { describe, it, expect } from 'vitest';
import {
  AppError,
  ErrorFactory,
  formatErrorResponse,
  formatSuccessResponse,
} from '@/lib/error-handler';

describe('AppError', () => {
  it('should create error with all properties', () => {
    const error = new AppError('TEST_ERROR', 'Test message', 400, 'warning', { detail: 'test' });

    expect(error.code).toBe('TEST_ERROR');
    expect(error.message).toBe('Test message');
    expect(error.statusCode).toBe(400);
    expect(error.severity).toBe('warning');
    expect(error.details).toEqual({ detail: 'test' });
    expect(error.name).toBe('AppError');
  });

  it('should have default values', () => {
    const error = new AppError('TEST', 'message');

    expect(error.statusCode).toBe(500);
    expect(error.severity).toBe('error');
    expect(error.details).toBeUndefined();
  });
});

describe('ErrorFactory', () => {
  it('should create unauthorized error', () => {
    const error = ErrorFactory.unauthorized({ reason: 'expired' });

    expect(error.code).toBe('UNAUTHORIZED');
    expect(error.statusCode).toBe(401);
    expect(error.severity).toBe('warning');
    expect(error.details).toEqual({ reason: 'expired' });
  });

  it('should create forbidden error', () => {
    const error = ErrorFactory.forbidden();

    expect(error.code).toBe('FORBIDDEN');
    expect(error.statusCode).toBe(403);
  });

  it('should create invalid input error', () => {
    const error = ErrorFactory.invalidInput('Email invalid', { field: 'email' });

    expect(error.code).toBe('INVALID_INPUT');
    expect(error.message).toBe('Email invalid');
    expect(error.statusCode).toBe(400);
  });

  it('should create not found error', () => {
    const error = ErrorFactory.notFound('User');

    expect(error.code).toBe('NOT_FOUND');
    expect(error.message).toBe('User not found');
    expect(error.statusCode).toBe(404);
  });

  it('should create payment failed error', () => {
    const error = ErrorFactory.paymentFailed({ gateway: 'stripe' });

    expect(error.code).toBe('PAYMENT_FAILED');
    expect(error.statusCode).toBe(402);
    expect(error.severity).toBe('error');
  });

  it('should create subscription required error', () => {
    const error = ErrorFactory.subscriptionRequired('pro');

    expect(error.code).toBe('SUBSCRIPTION_REQUIRED');
    expect(error.statusCode).toBe(402);
    expect(error.details).toEqual({ tier: 'pro' });
  });

  it('should create database error', () => {
    const error = ErrorFactory.databaseError({ table: 'users' });

    expect(error.code).toBe('DATABASE_ERROR');
    expect(error.statusCode).toBe(500);
    expect(error.severity).toBe('critical');
  });

  it('should create internal error', () => {
    const error = ErrorFactory.internalError();

    expect(error.code).toBe('INTERNAL_ERROR');
    expect(error.statusCode).toBe(500);
    expect(error.severity).toBe('critical');
  });
});

describe('formatErrorResponse', () => {
  it('should format AppError correctly', () => {
    const error = ErrorFactory.unauthorized();
    const response = formatErrorResponse(error, 'req-123');

    expect(response.success).toBe(false);
    expect(response.error.code).toBe('UNAUTHORIZED');
    expect(response.error.message).toBe(error.message);
    expect(response.error.requestId).toBe('req-123');
    expect(response.error.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('should handle unknown errors', () => {
    const error = new Error('Unknown error');
    const response = formatErrorResponse(error);

    expect(response.success).toBe(false);
    expect(response.error.code).toBe('INTERNAL_ERROR');
    expect(response.error.message).toBe('An unexpected error occurred');
  });

  it('should include details when present', () => {
    const error = ErrorFactory.invalidInput('Validation failed', { field: 'email' });
    const response = formatErrorResponse(error);

    expect(response.error.details).toEqual({ field: 'email' });
  });

  it('should include request ID in response', () => {
    const error = ErrorFactory.notFound('User');
    const response = formatErrorResponse(error, 'trace-456');

    expect(response.error.requestId).toBe('trace-456');
  });
});

describe('formatSuccessResponse', () => {
  it('should format success response with data', () => {
    const data = { id: 'user-1', name: 'John' };
    const response = formatSuccessResponse(data);

    expect(response.success).toBe(true);
    expect(response.data).toEqual(data);
    expect(response.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('should work with different data types', () => {
    const testCases = [
      { id: 1, name: 'test' },
      [1, 2, 3],
      'string data',
      123,
      true,
    ];

    testCases.forEach(data => {
      const response = formatSuccessResponse(data);
      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
    });
  });

  it('should always include timestamp', () => {
    const response = formatSuccessResponse(null);

    expect(response).toHaveProperty('timestamp');
    expect(new Date(response.timestamp)).toBeInstanceOf(Date);
  });
});
