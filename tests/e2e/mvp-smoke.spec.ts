/**
 * MVP E2E smoke test.
 *
 * Prerequisites (start before running tests):
 * - Shadow Index API: cd packages/shadow-index && npm run start (localhost:3000)
 * - Demo server: powershell scripts/start-demo-server.ps1 (localhost:5177)
 *
 * Full overlay test (click matter:// and assert overlay) requires the Lens extension
 * to be loaded in the browser. Playwright does not reliably load unpacked extensions
 * in headless mode. So we have:
 * - Automated: demo page loads, matter:// link present, resolve API returns gist.
 * - Manual: Load extension, open demo page, click link, verify overlay (see docs/11-SPRINT-1-PLAN.md).
 */

import { test, expect } from '@playwright/test';

const DEMO_HASH = '212a521e392989d262488f62e7698717c8198be6dfe19fccfdb384fd8c2328e4';
const API_BASE = 'http://localhost:3000';
const EXPECTED_TITLE = 'Demo Product';
const EXPECTED_PRICE_CENTS = 14999;

test.describe('MVP smoke', () => {
  test('demo page loads and matter:// link is present', async ({ page }) => {
    await page.goto('/matter-demo.html');
    const link = page.getByRole('link', { name: new RegExp('matter://') });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', `matter://${DEMO_HASH}`);
  });

  test('resolve API returns gist for demo hash', async ({ request }) => {
    let apiAlive = false;
    try {
      const res = await fetch('http://localhost:3000/health');
      apiAlive = res.ok;
    } catch {
      // fetch threw — server is not running
    }
    test.skip(!apiAlive, 'Shadow Index API is not running on localhost:3000 — start it first');

    const res = await request.get(`${API_BASE}/resolve/${DEMO_HASH}`);
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body.gist?.title).toBe(EXPECTED_TITLE);
    expect(body.gist?.price).toBe(EXPECTED_PRICE_CENTS);
    expect(body.matter_uri).toMatch(/^matter:\/\//);
  });

  // Full E2E with overlay requires Chrome with Lens extension loaded.
  // Run manually: load packages/lens-extension as unpacked, open http://localhost:5177/matter-demo.html,
  // click the matter:// link, then verify .matter-overlay contains title "Demo Product", formatted price, and <img>.
  test.skip('matter:// link resolves and overlay displays product info (requires extension — run manually)', async ({
    page,
  }) => {
    await page.goto('/matter-demo.html');
    await page.getByRole('link', { name: new RegExp('matter://') }).click();
    const overlay = page.locator('.matter-overlay');
    await expect(overlay).toBeVisible({ timeout: 5000 });
    await expect(overlay).toContainText(EXPECTED_TITLE);
    await expect(overlay.locator('img.matter-overlay-image')).toBeVisible();
  });
});
