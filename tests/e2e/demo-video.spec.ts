/**
 * fairflow Demo — Admin workflows (incl. KYC approval) then complete merchant workflows.
 *
 * Flow:
 * 1. Merchant registers + submits KYC (creates pending for admin)
 * 2. Admin login → Dashboard → KYC Approvals (approve) → Merchants → Users → Platform Health
 * 3. Merchant login → Products → Analytics → Orders → Notifications → KYC & Payouts → My Account
 * 4. Consumer product page
 *
 * Run: npm run demo:playwright
 * Prerequisites: API on 3000, Portal on 5178
 */

import { test, expect } from '@playwright/test';

const DEMO_DELAY = 2000;
const API_BASE = 'http://localhost:3000';

const MERCHANT_EMAIL = process.env.DEMO_MERCHANT_EMAIL || 'demo@demo.test';
const MERCHANT_PASSWORD = process.env.DEMO_MERCHANT_PASSWORD || 'DemoPass123';
const MERCHANT_BUSINESS = process.env.DEMO_MERCHANT_BUSINESS || 'Demo Store';
const ADMIN_EMAIL = process.env.DEMO_ADMIN_EMAIL || 'admin@example.com';

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

test.describe('fairflow Demo Video', () => {
  test('admin then merchant workflows', async ({ page }) => {
    // --- API Health ---
    test.step('API health check', async () => {
      const res = await fetch(`${API_BASE}/health`);
      if (!res.ok) {
        test.skip(true, 'API not running on localhost:3000');
      }
      const body = await res.json();
      expect(body.status).toBe('ok');
      await delay(DEMO_DELAY);
    });

    // --- Phase 1: Merchant registers ---
    test.step('Merchant registration', async () => {
      await page.goto('/merchant/register', { waitUntil: 'domcontentloaded', timeout: 60000 });
      await expect(page.getByText('Create your merchant account')).toBeVisible();

      await page.getByPlaceholder('Your business name').fill(MERCHANT_BUSINESS);
      await page.getByPlaceholder('your@email.com').first().fill(MERCHANT_EMAIL);
      await page.getByPlaceholder('••••••••').first().fill(MERCHANT_PASSWORD);
      await page.getByPlaceholder('••••••••').nth(1).fill(MERCHANT_PASSWORD);
      await page.getByLabel('I accept the terms and conditions').check();
      await page.getByRole('button', { name: 'Create Account' }).click();

      await expect(page).toHaveURL(/\/dashboard\/merchant/, { timeout: 15000 });
      await delay(DEMO_DELAY);
    });

    // --- Phase 1: Merchant submits KYC (pending for admin) ---
    test.step('Merchant submits KYC', async () => {
      await page.getByRole('button', { name: 'KYC & Payouts' }).click();
      await expect(page.getByText('KYC Verification', { exact: false })).toBeVisible({ timeout: 5000 });

      await page.getByLabel('Business Name').fill(MERCHANT_BUSINESS);
      await page.getByLabel('ID Number').fill('9001015001087');
      await page.locator('#kyc-dob').fill('1990-01-01');
      await page.getByLabel('Residential Address').fill('123 Demo St, Cape Town');
      await page.getByLabel('Phone').fill('0821234567');
      await page.getByLabel('Account Holder Name').fill('Demo Account Holder');
      await page.getByLabel('Bank Name').selectOption('ABSA');
      await page.getByLabel('Account Number').fill('123456789');
      await page.getByLabel('Branch Code').fill('632005');

      await page.getByRole('button', { name: 'Submit KYC' }).click();
      await expect(page.getByText('Pending Review', { exact: false })).toBeVisible({ timeout: 10000 });
      await delay(DEMO_DELAY);
    });

    // --- Phase 2: Admin workflows ---
    test.step('Admin login', async () => {
      await page.getByRole('button', { name: 'Sign Out' }).click();
      await delay(1000);

      await page.goto('/login');
      await page.getByPlaceholder('Email').fill(ADMIN_EMAIL);
      await page.getByPlaceholder('Password').fill('any');
      await page.getByRole('button', { name: 'Sign in' }).click();

      await expect(page).toHaveURL(/\/dashboard\/admin/, { timeout: 15000 });
      await expect(page.locator('[data-testid="admin-portal"]')).toBeVisible({ timeout: 15000 });
      await delay(DEMO_DELAY);
    });

    test.step('Admin KYC Approvals - approve merchant', async () => {
      await page.getByRole('button', { name: 'KYC Approvals' }).click();
      await expect(page.getByText('KYC', { exact: false })).toBeVisible({ timeout: 5000 });

      const refreshBtn = page.getByRole('button', { name: 'Refresh' });
      if (await refreshBtn.isVisible()) {
        await refreshBtn.click();
        await delay(1500);
      }

      const approveBtn = page.getByRole('button', { name: 'Approve' }).first();
      if (await approveBtn.isVisible()) {
        await approveBtn.click();
        await expect(page.getByText('Approve KYC')).toBeVisible({ timeout: 3000 });
        await delay(300);
        await page.getByRole('button', { name: 'Approve' }).last().click();
        await delay(1000);
      }
      await delay(DEMO_DELAY);
    });

    test.step('Admin Merchants', async () => {
      await page.getByRole('button', { name: 'Merchants' }).click();
      await expect(page.getByText('Merchant', { exact: false })).toBeVisible({ timeout: 5000 });
      await delay(DEMO_DELAY);
    });

    test.step('Admin Users & Roles', async () => {
      await page.getByRole('button', { name: 'Users & Roles' }).click();
      await expect(page.getByText('Users', { exact: false })).toBeVisible({ timeout: 5000 });
      await delay(DEMO_DELAY);
    });

    test.step('Admin Platform Health', async () => {
      await page.getByRole('button', { name: 'Platform Health' }).click();
      await expect(page.getByText('Platform', { exact: false })).toBeVisible({ timeout: 5000 });
      await delay(DEMO_DELAY);
    });

    // --- Phase 3: Merchant complete workflows (post-KYC approval) ---
    test.step('Merchant login', async () => {
      await page.getByRole('button', { name: 'Settings' }).click();
      await page.getByRole('button', { name: 'Sign Out' }).click();
      await delay(1000);

      await page.goto('/merchant/login');
      await page.getByPlaceholder('your@email.com').fill(MERCHANT_EMAIL);
      await page.getByPlaceholder('••••••••').first().fill(MERCHANT_PASSWORD);
      await page.getByRole('button', { name: 'Sign In' }).click();

      await expect(page).toHaveURL(/\/dashboard\/merchant/, { timeout: 15000 });
      await delay(DEMO_DELAY);
    });

    test.step('Merchant Products - create product', async () => {
      await page.goto('/dashboard/merchant');
      await expect(page).toHaveURL(/\/dashboard\/merchant/, { timeout: 10000 });
      await page.getByRole('button', { name: 'My Products' }).click();
      await expect(page.getByRole('button', { name: /Create Product/ })).toBeVisible({ timeout: 10000 });
      await page.getByRole('button', { name: /Create Product/ }).click();

      await expect(page.getByRole('heading', { name: 'Create Product' })).toBeVisible();
      await page.getByPlaceholder('Product title').fill('Demo Product');
      await page.getByPlaceholder('Describe your product').fill('A demo product for the fairflow platform');
      await page.getByPlaceholder('125.00').fill('99.99');
      await page.getByLabel('Stock Count *').fill('10');
      await page.getByLabel('Category *').selectOption('coffee');
      await page.getByRole('button', { name: 'Create Product' }).click();

      await expect(page.getByText('Product published')).toBeVisible({ timeout: 10000 });
      await delay(DEMO_DELAY);
      await page.getByRole('button', { name: 'Close' }).click();
      await delay(DEMO_DELAY);
    });

    test.step('Merchant Analytics', async () => {
      await page.getByRole('button', { name: 'Analytics' }).click();
      await expect(page.getByText('Engagement', { exact: false })).toBeVisible({ timeout: 5000 });
      await delay(DEMO_DELAY);
    });

    test.step('Merchant Orders', async () => {
      await page.getByRole('button', { name: 'Orders' }).click();
      await expect(page.getByText('Orders', { exact: false })).toBeVisible({ timeout: 5000 });
      await delay(DEMO_DELAY);
    });

    test.step('Merchant Notifications', async () => {
      await page.getByRole('button', { name: 'Notifications' }).click();
      await expect(page.getByText('Notifications', { exact: false })).toBeVisible({ timeout: 5000 });
      await delay(DEMO_DELAY);
    });

    test.step('Merchant KYC & Payouts (post-approval)', async () => {
      await page.getByRole('button', { name: 'KYC & Payouts' }).click();
      await expect(page.getByText('KYC', { exact: false })).toBeVisible({ timeout: 5000 });
      await expect(page.getByText(/Approved|Bank Account|Pending payout/)).toBeVisible({ timeout: 5000 });
      await delay(DEMO_DELAY);
    });

    test.step('Merchant My Account', async () => {
      await page.getByRole('button', { name: 'My Account' }).click();
      await expect(page.getByText('My Account', { exact: false })).toBeVisible({ timeout: 5000 });
      await delay(DEMO_DELAY);
    });

    test.step('Consumer product page', async () => {
      const DEMO_HASH = 'bfefe5574ca167f98378ef37a123ed07bf00f6bd622c2283e19ac3fbd598ba96';
      await page.goto(`/product/${DEMO_HASH}`);
      await expect(page.getByRole('button', { name: /Buy|Checkout/ })).toBeVisible({ timeout: 10000 });
      await delay(DEMO_DELAY);
    });
  });
});
