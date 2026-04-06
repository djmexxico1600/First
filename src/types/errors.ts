export type ErrorCode = 
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'BAD_REQUEST'
  | 'CONFLICT'
  | 'UNPROCESSABLE_ENTITY'
  | 'RATE_LIMITED'
  | 'INTERNAL_SERVER_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'INVALID_ARGUMENTS'
  | 'DATABASE_ERROR'
  | 'EXTERNAL_SERVICE_ERROR'
  | 'AUTHENTICATION_FAILED'
  | 'PAYMENT_REQUIRED'
  | 'SUBSCRIPTION_REQUIRED';

export interface ErrorDetails {
  code: ErrorCode;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
  timestamp?: string;
}
