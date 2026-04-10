import { NextResponse } from 'next/server';
import { logger, generateRequestId } from '@/lib/logger';

/**
 * Health check endpoint — verifies DB and R2 connectivity.
 * Used by post-deploy smoke tests and uptime monitors.
 */
export async function GET() {
  const requestId = generateRequestId();
  const startTime = Date.now();

  const checks: Record<string, { ok: boolean; latencyMs?: number; error?: string }> = {};

  // Database connectivity
  try {
    const dbStart = Date.now();
    // Lazy import avoids build-time DB initialisation
    const { getDb } = await import('@/lib/db/client');
    const { sql } = await import('drizzle-orm');
    const db = getDb();
    await db.execute(sql`SELECT 1`);
    checks.database = { ok: true, latencyMs: Date.now() - dbStart };
  } catch (err) {
    checks.database = { ok: false, error: err instanceof Error ? err.message : 'DB error' };
    logger.error('Health check DB failed', err as Error, {}, requestId);
  }

  // R2 / S3 connectivity (list-bucket-like ping via HeadObject on a known sentinel key)
  try {
    const r2Start = Date.now();
    const accountId = process.env.NEXT_PUBLIC_R2_ACCOUNT_ID;
    const bucket = process.env.NEXT_PUBLIC_R2_BUCKET_NAME;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

    if (accountId && bucket && accessKeyId && secretAccessKey) {
      const { S3Client, HeadBucketCommand } = await import('@aws-sdk/client-s3');
      const s3 = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: { accessKeyId, secretAccessKey },
      });
      await s3.send(new HeadBucketCommand({ Bucket: bucket }));
      checks.r2 = { ok: true, latencyMs: Date.now() - r2Start };
    } else {
      checks.r2 = { ok: false, error: 'R2 env vars not configured' };
    }
  } catch (err) {
    checks.r2 = { ok: false, error: err instanceof Error ? err.message : 'R2 error' };
    logger.error('Health check R2 failed', err as Error, {}, requestId);
  }

  const allOk = Object.values(checks).every((c) => c.ok);
  const totalMs = Date.now() - startTime;

  const body = {
    status: allOk ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? '0.1.0',
    environment: process.env.NODE_ENV,
    uptimeSeconds: Math.floor(process.uptime()),
    checks,
    totalLatencyMs: totalMs,
  };

  logger.info('Health check completed', { allOk, totalMs }, requestId);

  return NextResponse.json(body, {
    status: allOk ? 200 : 503,
    headers: {
      'X-Request-ID': requestId,
      'Cache-Control': 'no-store',
    },
  });
}

