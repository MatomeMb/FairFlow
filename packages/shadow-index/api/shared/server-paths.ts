import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

/** packages/shadow-index/data (api/shared -> .. -> api -> .. -> package root) */
export const dataRoot = process.env.VERCEL
  ? path.join('/tmp', 'data')
  : path.join(here, '..', '..', 'data');

export function getEventsDir(): string {
  return process.env.ANALYTICS_EVENTS_DIR || path.join(dataRoot, 'events');
}

export const slipsDir = path.join(dataRoot, 'slips');
export const thingsDir = path.join(dataRoot, 'things');
export const uploadsDir = path.join(dataRoot, 'uploads');
export const indexFile = path.join(dataRoot, 'index.json');
