#!/usr/bin/env node
/**
 * Pre-Aggregation Runner — Sprint 4 Week 3 (T3.2)
 * Run via cron at 00:00 UTC or manually.
 * Usage: node scripts/run-pre-aggregation.mjs [from-date] [to-date]
 * Default: yesterday only. Dates in YYYY-MM-DD.
 */

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runAggregationForDateRange } from '../dist/lib/pre-aggregation.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const dataRoot = path.join(root, 'data');
const defaultEventsDir = path.join(dataRoot, 'events');

function loadEnv() {
  const envPath = path.join(root, '.env');
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) {
        const key = m[1].trim();
        const val = m[2].trim().replace(/^["']|["']$/g, '');
        process.env[key] = val;
      }
    }
  }
}

loadEnv();

const eventsDir = process.env.ANALYTICS_EVENTS_DIR || defaultEventsDir;
const aggregatesDir = path.join(path.dirname(eventsDir), 'aggregates');

function getYesterday() {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

const fromArg = process.argv[2];
const toArg = process.argv[3];
const from = fromArg || getYesterday();
const to = toArg || from;

async function main() {
  console.log(`[Pre-aggregation] Running for ${from} to ${to}`);
  console.log(`  Events: ${eventsDir}`);
  console.log(`  Aggregates: ${aggregatesDir}`);

  const { processed, errors } = await runAggregationForDateRange(eventsDir, aggregatesDir, from, to);

  console.log(`  Processed: ${processed} day(s)`);
  if (errors.length) {
    console.error('  Errors:', errors);
    process.exit(1);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
