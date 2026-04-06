export class AppError extends Error {
  constructor(
    message: string,
    public code: string = 'ERR_INTERNAL',
    public status: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, string>) {
    super(message, 'ERR_VALIDATION', 400, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 'ERR_NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 'ERR_UNAUTHORIZED', 401);
    this.name = 'UnauthorizedError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 'ERR_RATE_LIMIT', 429);
    this.name = 'RateLimitError';
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function createErrorResponse(error: unknown) {
  if (isAppError(error)) {
    return {
      error: {
        message: error.message,
        code: error.code,
        details: error.details,
      },
      status: error.status,
    };
  }

  console.error('Unhandled error:', error);
  return {
    error: {
      message: 'An unexpected error occurred',
      code: 'ERR_INTERNAL',
    },
    status: 500,
  };
}

export async function handleAsync<T>(
  fn: () => Promise<T>
): Promise<{ data?: T; error?: any }> {
  try {
    return { data: await fn() };
  } catch (error) {
    return { error };
  }
}
