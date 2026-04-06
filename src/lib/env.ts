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
 * Type-safe environment config
 * Use this for accessing environment variables with proper types
 */
export const env = {
  // Database
  databaseUrl: getRequiredEnv('DATABASE_URL'),

  // Clerk Auth
  clerkSecretKey: getRequiredEnv('CLERK_SECRET_KEY'),
  clerkPublishableKey: getRequiredEnv('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY'),
  clerkWebhookSecret: getEnv('CLERK_WEBHOOK_SECRET'),

  // Stripe Payments
  stripeSecretKey: getRequiredEnv('STRIPE_SECRET_KEY'),
  stripePublishableKey: getRequiredEnv('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'),
  stripeWebhookSecret: getEnv('STRIPE_WEBHOOK_SECRET'),

  // Cloudflare R2
  r2AccessKeyId: getEnv('R2_ACCESS_KEY_ID'),
  r2SecretAccessKey: getEnv('R2_SECRET_ACCESS_KEY'),
  r2AccountId: getEnv('NEXT_PUBLIC_R2_ACCOUNT_ID'),

  // Resend Email
  resendApiKey: getEnv('RESEND_API_KEY'),

  // App Config
  appUrl: getRequiredEnv('NEXT_PUBLIC_APP_URL'),
  logEndpoint: getEnv('NEXT_PUBLIC_LOG_ENDPOINT'),

  // Environment
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
} as const;

// Validate on module load in production
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  try {
    validateEnvironment();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
