/**
 * Load .env from package root then run the API (so STORAGE_MODE and R2 vars are set).
 * Usage: node run-with-env.mjs   (from packages/shadow-index)
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '.env');
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

await import('./dist/api/index.js');
