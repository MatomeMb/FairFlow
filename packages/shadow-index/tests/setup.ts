/**
 * Global test setup — runs once before all test suites.
 * Resets shared on-disk state so the test suite is idempotent regardless
 * of prior dev-server runs or interrupted writes.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataRoot = path.join(__dirname, '..', 'data');

export async function setup(): Promise<void> {
  const indexFile = path.join(dataRoot, 'index.json');
  try {
    const raw = await fs.readFile(indexFile, 'utf8');
    JSON.parse(raw);
  } catch {
    await fs.mkdir(dataRoot, { recursive: true });
    await fs.writeFile(indexFile, '{}', 'utf8');
  }
}
