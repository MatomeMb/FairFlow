import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['**/*.test.ts', '**/*.test.js', '**/*.spec.ts'],
    pool: 'forks',
    testTimeout: 10000,
    resolveTimeout: 10000,
    setupFiles: ['./tests/env.setup.ts'],
    globalSetup: ['./tests/setup.ts'],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
});
