/**
 * API Route Middleware
 * Wraps API route handlers with error handling, logging, and request tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger, generateRequestId } from './logger';
import { ErrorResponse, formatErrorResponse, formatSuccessResponse } from './error-handler';

export type ApiHandler = (
  req: NextRequest,
  requestId: string
) => Promise<NextResponse>;

/**
 * Wraps API handler with error handling and logging
 */
export function apiHandler(handler: ApiHandler) {
  return async (req: NextRequest) => {
    const requestId = generateRequestId();
    const startTime = Date.now();
    const method = req.method;
    const pathname = new URL(req.url).pathname;

    try {
      logger.logApiRequest(method, pathname, requestId);

      const response = await handler(req, requestId);
      const duration = Date.now() - startTime;
      const statusCode = response.status;

      logger.logApiResponse(method, pathname, statusCode, duration, requestId);

      // Add request ID to response headers for tracing
      response.headers.set('X-Request-ID', requestId);

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.logApiResponse(method, pathname, 500, duration, requestId);

      if (error instanceof Error) {
        logger.error(error.message, error, {}, requestId);
      }

      const errorResponse = formatErrorResponse(error as Error, requestId) as ErrorResponse;
      return NextResponse.json(errorResponse, { status: errorResponse.error.code === 'INTERNAL_ERROR' ? 500 : 400 });
    }
  };
}

/**
 * Create standardized API response
 */
export function apiResponse<T>(data: T, status = 200) {
  return NextResponse.json(formatSuccessResponse(data), { status });
}

/**
 * Create standardized error response
 */
export function apiError(error: Error, status = 500) {
  const errorResponse = formatErrorResponse(error);
  return NextResponse.json(errorResponse, { status });
}

/**
 * Parse and validate JSON body
 */
export async function parseJson(req: NextRequest) {
  try {
    return await req.json();
  } catch {
    throw new Error('Invalid JSON in request body');
  }
}
