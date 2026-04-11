import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Use happy-dom for faster unit tests (lighter than jsdom)
    environment: 'happy-dom',
    
    // Test files pattern
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    exclude: ['node_modules', 'dist', '.next'],
    
    // Setup files (runs before all tests)
    setupFiles: ['tests/setup.ts'],
    
    // Global test timeout (milliseconds)
    testTimeout: 10000,
    
    // Hook timeout (for beforeAll/afterAll)
    hookTimeout: 10000,
    
    // Coverage config
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/__tests__',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.config.ts',
        // Server-side files that require live credentials (DB, Stripe, Clerk, R2)
        // These are covered by integration tests only, not unit tests
        'src/lib/db/**',
        'src/lib/stripe/**',
        'src/lib/clerk/**',
        'src/lib/r2/**',
        'src/lib/email/**',
        'src/lib/beats/actions.ts',
        'src/lib/car/actions.ts',
        'src/lib/management/actions.ts',
        'src/app/api/**',
        'src/middleware.ts',
        'src/types/**',
      ],
      // Thresholds apply only to unit-testable files listed above
      lines: 70,
      functions: 70,
      branches: 65,
      statements: 70,
      // Do not fail CI on coverage gaps — report only
      thresholdAutoReset: false,
    },
    
    // Global test utilities (Vitest globals)
    globals: true,
    
    // Reporter (compact output)
    reporters: ['default', 'html'],
    
    // Parallel tests
    threads: true,
    maxThreads: 4,
    minThreads: 1,
    
    // Isolate tests (each test in own process)
    isolate: true,
  },
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
