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
      provider: 'coverage',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/__tests__',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.config.ts',
      ],
      // Target: 85% on profit-critical paths
      lines: 85,
      functions: 85,
      branches: 80,
      statements: 85,
      // Fail if coverage drops below target
      failOnLowCoverage: true,
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
