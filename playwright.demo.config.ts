import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for demo video recording.
 * Run: npm run demo:playwright  (records to demo-output/*.webm)
 * Run: npm run demo:record      (records then copies to fairflow-demo.webm)
 *
 * Uses Firefox to avoid Chromium ERR_ABORTED on Windows localhost.
 * If Firefox not installed: npx playwright install firefox
 *
 * Prerequisites:
 * - API: cd packages/shadow-index && npm run start (localhost:3000)
 * - Portal: cd packages/auth-portal && npm run dev (localhost:5178)
 *
 * Env vars (optional):
 * - DEMO_ADMIN_EMAIL: Admin login (default: matome@fairflow.dev)
 * - DEMO_MERCHANT_EMAIL: Merchant register/login
 * - DEMO_MERCHANT_PASSWORD: Merchant password
 * - DEMO_MERCHANT_BUSINESS: Business name for registration
 */
export default defineConfig({
  testDir: 'tests/e2e',
  testMatch: 'demo-video.spec.ts',
  outputDir: 'demo-output',
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  reporter: 'list',
  timeout: 120_000,
  use: {
    baseURL: 'http://127.0.0.1:5178',
    trace: 'on-first-retry',
    headless: false,
    video: 'on',
    actionTimeout: 15_000,
    navigationTimeout: 15_000,
    // Slow down actions for visibility during recording
    launchOptions: {
      slowMo: 150,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
      ],
      // For Firefox specifically
      firefoxUserPrefs: {
        'network.trr.mode': 5,
        'security.enterprise_roots.enabled': true,
      },
    },
  },
  // Use Firefox to avoid Chromium ERR_ABORTED on Windows localhost
  projects: [{ name: 'firefox', use: { ...devices['Desktop Firefox'] } }],
});
