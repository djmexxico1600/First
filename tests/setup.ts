/**
 * Vitest Global Setup
 * Runs before all tests
 * Used for: environment validation, mock initialization, test DB setup
 */

import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';

/**
 * Validate test environment variables before any test runs
 */
beforeAll(async () => {
  // Check required env vars for testing
  const requiredEnv = [
    'DATABASE_URL',
    'CLERK_SECRET_KEY',
    'STRIPE_SECRET_KEY',
  ];

  const missing = requiredEnv.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required test environment variables: ${missing.join(', ')}\n` +
        `Please copy .env.test and fill in test credentials.`
    );
  }

  console.log('✅ Test environment validated');
});

/**
 * Cleanup after all tests
 */
afterAll(async () => {
  // Clean up any test data or connections here
  console.log('✅ Test cleanup complete');
});

/**
 * Reset mocks before each test
 */
beforeEach(() => {
  // Clear all mocks between tests (if using vitest.mock)
  // vi.clearAllMocks();
});

/**
 * Per-test cleanup
 */
afterEach(() => {
  // Reset state, clear timers, etc.
});

/**
 * Global test utilities
 */
export const testUtils = {
  /**
   * Wait for async operations to settle
   */
  async waitForAsync() {
    await new Promise((resolve) => setTimeout(resolve, 0));
  },

  /**
   * Create a mock Stripe event
   */
  createStripeEvent(type: string, data: Record<string, any>) {
    return {
      id: `evt_test_${Date.now()}`,
      object: 'event',
      api_version: '2024-03-01',
      created: Math.floor(Date.now() / 1000),
      type,
      data: {
        object: data,
      },
      livemode: false,
      pending_webhooks: 0,
      request: { id: null, idempotency_key: null },
      account: 'acct_test',
    };
  },

  /**
   * Create a mock Clerk event
   */
  createClerkEvent(type: string, data: Record<string, any>) {
    return {
      data,
      object: 'event',
      type,
      timestamp: Date.now(),
    };
  },
};

/**
 * Make testUtils globally available in all tests (if using globals: true)
 */
declare global {
  var testUtils: typeof testUtils;
}

globalThis.testUtils = testUtils;
