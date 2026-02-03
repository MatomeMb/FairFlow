import { defineConfig, devices } from '@playwright/test';

/**
 * E2E tests for Matter MVP.
 * Prerequisites: Shadow Index API on localhost:3000, demo server on localhost:5177.
 */
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5177',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
