import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const styles = [
  'luxury',
  'geo-tech',
  'soft-premium',
  'executive',
  'precision',
  'aero',
  'bold-minimal',
  'derivative',
];

const rootDir = '/workspace';
const videoDir = path.join(rootDir, 'demo', 'videos');
const finalVideoPath = path.join(videoDir, 'beta-logo-upload-demo.webm');
const tempImagePath = path.join(videoDir, 'upload-demo-image.png');

const onePxPngBase64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO5N7d8AAAAASUVORK5CYII=';

await fs.mkdir(videoDir, { recursive: true });
await fs.writeFile(tempImagePath, Buffer.from(onePxPngBase64, 'base64'));

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1366, height: 768 },
  recordVideo: { dir: videoDir, size: { width: 1366, height: 768 } },
});
const page = await context.newPage();

const setBadge = async (text) => {
  await page.evaluate((badgeText) => {
    const existing = document.getElementById('ff-demo-badge');
    if (existing) existing.remove();
    const el = document.createElement('div');
    el.id = 'ff-demo-badge';
    el.textContent = badgeText;
    el.style.position = 'fixed';
    el.style.top = '16px';
    el.style.right = '16px';
    el.style.zIndex = '99999';
    el.style.background = 'rgba(12,10,9,0.9)';
    el.style.color = '#F5F5F0';
    el.style.border = '1px solid #44403C';
    el.style.borderRadius = '10px';
    el.style.padding = '8px 12px';
    el.style.fontFamily = 'Inter, system-ui, sans-serif';
    el.style.fontSize = '12px';
    el.style.fontWeight = '600';
    el.style.letterSpacing = '0.04em';
    document.body.appendChild(el);
  }, text);
};

for (const style of styles) {
  await page.goto(`http://localhost:5178/merchant/login?logoStyle=${style}`, {
    waitUntil: 'networkidle',
  });
  await setBadge(`Logo style: ${style}`);
  await page.waitForTimeout(1000);
}

await page.goto('http://localhost:5178/dashboard/merchant?token=demo&logoStyle=derivative', {
  waitUntil: 'networkidle',
});
await setBadge('Product creation + disk image upload');
await page.waitForTimeout(1200);

await page.getByRole('button', { name: '+ Create Product' }).click();
await page.waitForTimeout(600);

await page.locator('input[placeholder="Product title"]').fill('Beta Launch Demo Product');
await page.locator('textarea[placeholder="Describe your product"]').fill(
  'Demo product for beta launch showcasing image upload and polished logo system.',
);
await page.locator('input[placeholder="125.00"]').fill('199.00');
await page.locator('input[type="number"]').first().fill('25');
await page.locator('select').first().selectOption('crafts');
await page.locator('input[type="file"]').setInputFiles(tempImagePath);

await page.waitForSelector('text=Uploaded from disk', { timeout: 15000 });
await page.waitForTimeout(800);
await page.locator('button[form="create-product-form"]').click();
await Promise.race([
  page.waitForSelector('text=Product created', { timeout: 20000 }),
  page.waitForSelector('text=Product published', { timeout: 20000 }),
]);
await page.waitForTimeout(2000);

const recorded = page.video();
await context.close();
await browser.close();

if (!recorded) {
  throw new Error('Video recording was not created.');
}

const sourcePath = await recorded.path();
await fs.copyFile(sourcePath, finalVideoPath);
console.log(`Created demo video: ${finalVideoPath}`);
