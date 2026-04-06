import { NextResponse } from 'next/server';
import { logger, generateRequestId } from '@/lib/logger';
import { formatSuccessResponse } from '@/lib/error-handler';

/**
 * Health check endpoint
 * Returns application status and readiness for requests
 */
export async function GET() {
  const requestId = generateRequestId();
  const startTime = Date.now();

  try {
    logger.info('Health check requested', {}, requestId);

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: '0.1.0',
    };

    const duration = Date.now() - startTime;
    logger.logApiResponse('GET', '/api/health', 200, duration, requestId);

    const response = NextResponse.json(formatSuccessResponse(health), {
      status: 200,
      headers: {
        'X-Request-ID': requestId,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

    return response;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Health check failed', error as Error, {}, requestId);
    logger.logApiResponse('GET', '/api/health', 500, duration, requestId);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'HEALTH_CHECK_FAILED',
          message: 'Health check failed',
          requestId,
        },
      },
      { status: 503, headers: { 'X-Request-ID': requestId } }
    );
  }
}
