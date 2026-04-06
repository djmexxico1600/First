/**
 * Centralized Error Handler
 * Provides consistent error responses across the application
 */

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    requestId?: string;
    timestamp: string;
  };
}

export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  timestamp: string;
}

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public severity: ErrorSeverity = 'error',
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Format error response for API
 */
export function formatErrorResponse(
  error: Error | AppError,
  requestId?: string
): ErrorResponse {
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        requestId,
        timestamp: new Date().toISOString(),
      },
    };
  }

  // Unknown error
  return {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      requestId,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Format success response for API
 */
export function formatSuccessResponse<T>(data: T): SuccessResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Common error factory
 */
export const ErrorFactory = {
  // Authentication & Authorization
  unauthorized: (details?: any) =>
    new AppError('UNAUTHORIZED', 'Access denied. Please sign in.', 401, 'warning', details),
  forbidden: (details?: any) =>
    new AppError('FORBIDDEN', 'You do not have permission to access this resource.', 403, 'warning', details),
  
  // Validation
  invalidInput: (message: string, details?: any) =>
    new AppError('INVALID_INPUT', message, 400, 'warning', details),
  missingRequired: (field: string) =>
    new AppError('MISSING_REQUIRED', `Missing required field: ${field}`, 400, 'warning', { field }),
  
  // Resource
  notFound: (resource: string) =>
    new AppError('NOT_FOUND', `${resource} not found`, 404, 'info'),
  conflict: (message: string, details?: any) =>
    new AppError('CONFLICT', message, 409, 'warning', details),
  
  // Business Logic
  limitExceeded: (resource: string) =>
    new AppError('LIMIT_EXCEEDED', `${resource} limit exceeded`, 429, 'warning'),
  paymentFailed: (details?: any) =>
    new AppError('PAYMENT_FAILED', 'Payment processing failed', 402, 'error', details),
  subscriptionRequired: (tier: string) =>
    new AppError('SUBSCRIPTION_REQUIRED', `${tier} subscription required`, 402, 'warning', { tier }),
  
  // External Service
  externalServiceError: (service: string, details?: any) =>
    new AppError('EXTERNAL_SERVICE_ERROR', `${service} service error`, 503, 'error', details),
  
  // Database
  databaseError: (details?: any) =>
    new AppError('DATABASE_ERROR', 'Database operation failed', 500, 'critical', details),
  
  // Server
  internalError: (details?: any) =>
    new AppError('INTERNAL_ERROR', 'An unexpected error occurred', 500, 'critical', details),
};

/**
 * Safe error message - prevents leaking sensitive info
 */
export function getSafeErrorMessage(error: Error | AppError, isDevelopment = false): string {
  if (error instanceof AppError) {
    return error.message;
  }
  
  return isDevelopment ? error.message : 'An unexpected error occurred';
}
