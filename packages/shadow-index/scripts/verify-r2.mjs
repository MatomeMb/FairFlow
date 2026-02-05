/**
 * Day 1 R2 verification script (Sprint 3 — MVP-03)
 *
 * Run after: npm run build. Loads .env from package root if present.
 * Usage: node scripts/verify-r2.mjs   (from packages/shadow-index)
 */

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env');
if (existsSync(envPath)) {
  const content = readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (m && !m[1].startsWith('#')) {
      const value = m[2].replace(/^["']|["']$/g, '').trim();
      if (process.env[m[1]] === undefined) process.env[m[1]] = value;
    }
  }
}

const { isR2Configured, uploadThing, getThing } = await import('../dist/lib/storage.js');

async function main() {
  if (!isR2Configured()) {
    console.log('R2 not configured. Set CLOUDFLARE_R2_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY_ID,');
    console.log('CLOUDFLARE_R2_SECRET_ACCESS_KEY, CLOUDFLARE_R2_BUCKET_NAME, CLOUDFLARE_R2_PUBLIC_URL');
    console.log('then run: node scripts/verify-r2.mjs');
    process.exit(0);
  }

  const key = 'day1-verify-' + Date.now();
  const payload = Buffer.from('Day 1 R2 verification');

  try {
    const url = await uploadThing(key, payload);
    console.log('Uploaded:', url);

    const retrieved = await getThing(key);
    if (retrieved && retrieved.equals(payload)) {
      console.log('Retrieved:', retrieved.length, 'bytes — OK');
    } else {
      console.error('Retrieved content did not match');
      process.exit(1);
    }
  } catch (err) {
    console.error('R2 verification failed:', err.message || err);
    process.exit(1);
  }
}

main();
