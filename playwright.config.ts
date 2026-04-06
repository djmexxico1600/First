import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration
 * Tests critical business flows end-to-end across devices
 * Requires: dev server running (npm run dev)
 * Usage: npx playwright test
 */

export default defineConfig({
  testDir: './tests/e2e',
  
  // Parallel execution
  fullyParallel: true,
  
  // Fail CI on flaky tests (2+ failures)
  forbidOnly: !!process.env.CI,
  
  // Retry flaky tests in CI only
  retries: process.env.CI ? 2 : 0,
  
  // Workers (parallel browsers)
  workers: process.env.CI ? 1 : 4,
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'test-results/e2e' }],
    ['json', { outputFile: 'test-results/e2e/results.json' }],
    ['junit', { outputFile: 'test-results/e2e/junit.xml' }],
    ['list'],
  ],
  
  // Test timeout
  timeout: 30_000,
  
  // Global setup/teardown
  use: {
    // Base URL for all tests
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
    
    // Collect trace on failure
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'retain-on-failure',
  },
  
  // Projects: browsers to test
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  
  // Web Server configuration (auto-start dev server)
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
