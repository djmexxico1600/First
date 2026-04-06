// App instrumentation for monitoring, errors, and analytics
// This file is automatically executed by Next.js

import { logger } from '@/lib/logger';

export function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    logger.info('DJMEXXICO Platform loaded', {
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version,
    });

    // Initialize error tracking, monitoring integrations here
    // e.g., Sentry.init(), PostHog.init(), etc.
  }
}
