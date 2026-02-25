import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');

async function copyRequiredAssets() {
  const entries = [
    'manifest.json',
    'src',
    'icons',
  ];

  for (const entry of entries) {
    const from = path.join(root, entry);
    const to = path.join(dist, entry);
    await fs.cp(from, to, { recursive: true });
  }
}

async function main() {
  await fs.rm(dist, { recursive: true, force: true });
  await fs.mkdir(dist, { recursive: true });
  await copyRequiredAssets();
  console.log(`Build complete: ${dist}`);
}

main().catch((error) => {
  console.error('Build failed:', error);
  process.exit(1);
});
