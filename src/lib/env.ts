/**
 * Environment Variable Validator
 * Ensures all required environment variables are set at startup
 * Provides clear error messages if configuration is incomplete
 */

const requiredEnvVars = {
  DATABASE_URL: process.env.DATABASE_URL,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
} as const;

const optionalEnvVars = {
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
  NEXT_PUBLIC_R2_ACCOUNT_ID: process.env.NEXT_PUBLIC_R2_ACCOUNT_ID,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  NEXT_PUBLIC_LOG_ENDPOINT: process.env.NEXT_PUBLIC_LOG_ENDPOINT,
} as const;

/**
 * Validate environment configuration
 * Throws detailed error if required variables are missing
 */
export function validateEnvironment(): void {
  const missing: string[] = [];
  const warning: string[] = [];

  // Check required variables
  Object.entries(requiredEnvVars).forEach(([key, value]) => {
    if (!value) {
      missing.push(key);
    }
  });

  // Check optional variables (warn if missing in production)
  if (process.env.NODE_ENV === 'production') {
    Object.entries(optionalEnvVars).forEach(([key, value]) => {
      if (!value) {
        warning.push(key);
      }
    });
  }

  // Throw if required variables missing
  if (missing.length > 0) {
    const message = `
❌ Missing required environment variables:
${missing.map((v) => `  - ${v}`).join('\n')}

Please set these variables in your .env.local or deployment environment.
See .env.example for the complete list.
    `;
    throw new Error(message);
  }

  // Warn if optional variables missing in production
  if (warning.length > 0) {
    console.warn(
      `⚠️  Missing optional environment variables in production:\n${warning.map((v) => `  - ${v}`).join('\n')}`
    );
  }
}

/**
 * Get environment variable with type safety
 * Returns undefined if not set (unlike process.env which returns string | undefined)
 */
export function getEnv(key: string): string | undefined {
  return process.env[key];
}

/**
 * Get required environment variable
 * Throws if not set
 */
export function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Required environment variable ${key} is not set. See .env.example for setup instructions.`
    );
  }
  return value;
}

/**
 * Type-safe environment config with lazy initialization
 * Environment variables are only validated when accessed, not at import time.
 * This allows the build process to complete without requiring all env vars.
 */
export const env = new Proxy({} as Record<string, any>, {
  get(_target, prop: string | symbol) {
    if (typeof prop !== 'string') return undefined;

    switch (prop) {
      // Database
      case 'databaseUrl':
        return getRequiredEnv('DATABASE_URL');
      // Clerk Auth
      case 'clerkSecretKey':
        return getRequiredEnv('CLERK_SECRET_KEY');
      case 'clerkPublishableKey':
        return getRequiredEnv('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
      case 'clerkWebhookSecret':
        return getEnv('CLERK_WEBHOOK_SECRET');
      // Stripe Payments
      case 'stripeSecretKey':
        return getRequiredEnv('STRIPE_SECRET_KEY');
      case 'stripePublishableKey':
        return getRequiredEnv('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
      case 'stripeWebhookSecret':
        return getEnv('STRIPE_WEBHOOK_SECRET');
      // Cloudflare R2
      case 'r2AccessKeyId':
        return getEnv('R2_ACCESS_KEY_ID');
      case 'r2SecretAccessKey':
        return getEnv('R2_SECRET_ACCESS_KEY');
      case 'r2AccountId':
        return getEnv('NEXT_PUBLIC_R2_ACCOUNT_ID');
      // Resend Email
      case 'resendApiKey':
        return getEnv('RESEND_API_KEY');
      // App Config
      case 'appUrl':
        return getRequiredEnv('NEXT_PUBLIC_APP_URL');
      case 'logEndpoint':
        return getEnv('NEXT_PUBLIC_LOG_ENDPOINT');
      // Environment flags
      case 'isDev':
        return process.env.NODE_ENV === 'development';
      case 'isProd':
        return process.env.NODE_ENV === 'production';
      case 'isTest':
        return process.env.NODE_ENV === 'test';
      default:
        return undefined;
    }
  },
});

// Validate on module load in production (but catch errors gracefully during build)
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  // Only validate if not in the Next.js build process
  if (process.env.NEXT_PHASE !== 'phase-production-build') {
    try {
      validateEnvironment();
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  }
}
