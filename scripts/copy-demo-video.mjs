#!/usr/bin/env node
/**
 * Copies the Playwright demo video to fairflow-demo.webm.
 * Run after: npm run demo:playwright
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outputDir = path.join(root, 'demo-output');

function findWebm(dir) {
  if (!fs.existsSync(dir)) return null;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      const found = findWebm(p);
      if (found) return found;
    } else if (e.name.endsWith('.webm')) {
      return p;
    }
  }
  return null;
}

const src = findWebm(outputDir);
if (src) {
  const dest = path.join(root, 'fairflow-demo.webm');
  fs.copyFileSync(src, dest);
  console.log(`Copied to ${dest}`);
} else {
  console.warn('No .webm found in demo-output. Run: npm run demo:playwright');
  process.exit(1);
}
