import { NextResponse, type NextRequest } from 'next/server';
import { createErrorResponse } from './errors';
import { logger } from './logger';

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: any;
  };
  timestamp: string;
};

export function createSuccessResponse<T>(data: T, statusCode = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    } as ApiResponse<T>,
    { status: statusCode }
  );
}

export function createErrorApiResponse(error: unknown) {
  const { error: errorData, status } = createErrorResponse(error);

  logger.error('API error occurred', error instanceof Error ? error : new Error(String(error)));

  return NextResponse.json(
    {
      success: false,
      error: errorData,
      timestamp: new Date().toISOString(),
    } as ApiResponse,
    { status }
  );
}

export async function withErrorHandling<T>(
  handler: (req: NextRequest) => Promise<NextResponse<T>>
): Promise<(req: NextRequest) => Promise<NextResponse>> {
  return async (req: NextRequest) => {
    try {
      return await handler(req);
    } catch (error) {
      return createErrorApiResponse(error);
    }
  };
}
