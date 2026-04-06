/**
 * Vitest Global Setup
 * Runs before all tests
 * Used for: environment validation, mock initialization, test DB setup
 */

import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';

/**
 * Validate test environment variables before any test runs
 * Note: For unit tests (no external services), we provide mock defaults
 * For integration/e2e tests, these must be set in .env.test
 */
beforeAll(async () => {
  // Provide mock defaults for unit tests (can be overridden in .env.test)
  process.env.DATABASE_URL ??= 'postgresql://test:test@localhost:5432/djmexxico_test';
  process.env.CLERK_SECRET_KEY ??= 'sk_test_mock_key';
  process.env.STRIPE_SECRET_KEY ??= 'sk_test_mock_key';
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ??= 'pk_test_mock_key';
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ??= 'pk_test_mock_key';
  process.env.NEXT_PUBLIC_APP_URL ??= 'http://localhost:3000';
  process.env.NODE_ENV ??= 'test';

  console.log('✅ Test environment initialized (using mocks for unit tests)');
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
