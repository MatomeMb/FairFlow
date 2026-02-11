/**
 * Daily Pre-Aggregation — Sprint 4 Week 3 (T3.2)
 * Nightly rollup of event JSONL into per-day aggregate JSON files
 */

import { promises as fs } from 'fs';
import path from 'path';
import { aggregateFile } from './analytics-report.js';

export type AggregateDay = {
  date: string;
  byHash: Record<string, { views: number; clicks: number }>;
  totals: { views: number; clicks: number };
};

const AGGREGATE_META_FILE = '.last-run.json';

/** Path to aggregate file for a date */
export function getAggregatePath(aggregatesDir: string, dateStr: string): string {
  return path.join(aggregatesDir, `${dateStr}.json`);
}

/** Check if aggregate exists for date */
export async function hasAggregate(aggregatesDir: string, dateStr: string): Promise<boolean> {
  try {
    await fs.access(getAggregatePath(aggregatesDir, dateStr));
    return true;
  } catch {
    return false;
  }
}

/** Run aggregation for a single date; write to aggregatesDir */
export async function runAggregationForDate(
  eventsDir: string,
  aggregatesDir: string,
  dateStr: string
): Promise<{ ok: boolean; error?: string }> {
  const eventPath = path.join(eventsDir, `${dateStr}.jsonl`);
  try {
    await fs.access(eventPath);
  } catch {
    return { ok: false, error: `Event file not found: ${dateStr}.jsonl` };
  }

  const { byDate, byHash, byBoth } = await aggregateFile(eventPath);
  const totals = byDate.get(dateStr) ?? { views: 0, clicks: 0 };

  const byHashObj: Record<string, { views: number; clicks: number }> = {};
  for (const [h, v] of byHash) byHashObj[h] = { ...v };

  const payload: AggregateDay = {
    date: dateStr,
    byHash: byHashObj,
    totals,
  };

  await fs.mkdir(aggregatesDir, { recursive: true });
  await fs.writeFile(
    getAggregatePath(aggregatesDir, dateStr),
    JSON.stringify(payload, null, 0),
    'utf8'
  );

  return { ok: true };
}

/** Run aggregation for date range; skip dates with no event file */
export async function runAggregationForDateRange(
  eventsDir: string,
  aggregatesDir: string,
  from: string,
  to: string
): Promise<{ processed: number; errors: string[] }> {
  const errors: string[] = [];
  let processed = 0;

  const fromDate = new Date(from + 'T00:00:00Z');
  const toDate = new Date(to + 'T00:00:00Z');
  const current = new Date(fromDate);

  while (current <= toDate) {
    const dateStr = current.toISOString().slice(0, 10);
    const eventPath = path.join(eventsDir, `${dateStr}.jsonl`);
    try {
      await fs.access(eventPath);
      const result = await runAggregationForDate(eventsDir, aggregatesDir, dateStr);
      if (result.ok) processed++;
      else if (result.error) errors.push(result.error);
    } catch {
      // No event file for this date, skip
    }
    current.setUTCDate(current.getUTCDate() + 1);
  }

  await writeLastRunMeta(aggregatesDir, new Date().toISOString(), processed);

  return { processed, errors };
}

async function writeLastRunMeta(
  aggregatesDir: string,
  timestamp: string,
  processed: number
): Promise<void> {
  const metaPath = path.join(aggregatesDir, AGGREGATE_META_FILE);
  try {
    await fs.mkdir(aggregatesDir, { recursive: true });
    await fs.writeFile(
      metaPath,
      JSON.stringify({ lastRun: timestamp, lastProcessed: processed }),
      'utf8'
    );
  } catch {
    // Non-fatal
  }
}

/** Load aggregate for date; returns null if missing or invalid */
export async function loadAggregate(
  aggregatesDir: string,
  dateStr: string
): Promise<{
  byDate: Map<string, { views: number; clicks: number }>;
  byHash: Map<string, { views: number; clicks: number }>;
  byBoth: Map<string, { views: number; clicks: number }>;
} | null> {
  const filePath = getAggregatePath(aggregatesDir, dateStr);
  let raw: string;
  try {
    raw = await fs.readFile(filePath, 'utf8');
  } catch {
    return null;
  }

  let payload: AggregateDay;
  try {
    payload = JSON.parse(raw) as AggregateDay;
  } catch {
    return null;
  }

  const byDate = new Map<string, { views: number; clicks: number }>();
  byDate.set(dateStr, payload.totals);

  const byHash = new Map<string, { views: number; clicks: number }>();
  for (const [h, v] of Object.entries(payload.byHash ?? {})) {
    byHash.set(h, { ...v });
  }

  const byBoth = new Map<string, { views: number; clicks: number }>();
  for (const [h, v] of Object.entries(payload.byHash ?? {})) {
    byBoth.set(`${h}|${dateStr}`, { ...v });
  }

  return { byDate, byHash, byBoth };
}

/** Get pre-aggregation status for dashboard */
export async function getPreAggregationStatus(aggregatesDir: string): Promise<{
  lastRun: string | null;
  fileCount: number;
  enabled: boolean;
}> {
  try {
    await fs.access(aggregatesDir);
  } catch {
    return { lastRun: null, fileCount: 0, enabled: false };
  }

  let lastRun: string | null = null;
  const metaPath = path.join(aggregatesDir, AGGREGATE_META_FILE);
  try {
    const meta = JSON.parse(await fs.readFile(metaPath, 'utf8')) as { lastRun?: string };
    lastRun = meta.lastRun ?? null;
  } catch {
    // No meta file
  }

  let fileCount = 0;
  const entries = await fs.readdir(aggregatesDir).catch(() => []);
  for (const name of entries) {
    if (name.match(/^\d{4}-\d{2}-\d{2}\.json$/)) fileCount++;
  }

  return {
    lastRun,
    fileCount,
    enabled: true,
  };
}
