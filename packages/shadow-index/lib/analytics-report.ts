/**
 * Analytics Reporting Engine — Aggregation logic
 * MVP-14: GET /v1/analytics/report
 * Sprint 4 Week 3: Streaming JSONL parse (T3.3)
 */
import { createReadStream } from 'fs';
import { promises as fs } from 'fs';
import path from 'path';
import { createInterface } from 'readline';
import { loadAggregate } from './pre-aggregation.js';

export type GroupBy = 'day' | 'hash' | 'both';
export type SortBy = 'date' | 'views' | 'clicks';

export type ReportRowDay = { date: string; views: number; clicks: number };
export type ReportRowHash = { hash: string; views: number; clicks: number };
export type ReportRowBoth = { hash: string; date: string; views: number; clicks: number };

export type ReportResult = {
  ok: boolean;
  groupBy: GroupBy;
  from: string;
  to: string;
  rows: ReportRowDay[] | ReportRowHash[] | ReportRowBoth[];
  summary: { totalViews: number; totalClicks: number };
  error?: string;
};

/** Parse YYYY-MM-DD; return null if invalid */
export function parseDate(s: string): { y: number; m: number; d: number } | null {
  if (typeof s !== 'string') return null;
  const match = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, y, m, d] = match;
  const yi = parseInt(y, 10);
  const mi = parseInt(m, 10);
  const di = parseInt(d, 10);
  const date = new Date(yi, mi - 1, di);
  if (date.getFullYear() !== yi || date.getMonth() !== mi - 1 || date.getDate() !== di) {
    return null;
  }
  return { y: yi, m: mi, d: di };
}

/** Validate from/to; return error message or null */
export function validateDateRange(from: string, to: string): string | null {
  const fromParsed = parseDate(from);
  if (!fromParsed) return 'invalid from';
  const toParsed = parseDate(to);
  if (!toParsed) return 'invalid to';
  const fromDate = new Date(from + 'T00:00:00Z');
  const toDate = new Date(to + 'T00:00:00Z');
  if (fromDate > toDate) return 'from > to';
  return null;
}

/** List event file paths for date range. eventsDir = path to data/events */
export async function listEventFiles(
  eventsDir: string,
  from: string,
  to: string
): Promise<string[]> {
  const err = validateDateRange(from, to);
  if (err) return [];

  let entries: string[];
  try {
    entries = await fs.readdir(eventsDir);
  } catch {
    return [];
  }

  const fromDate = new Date(from + 'T00:00:00Z');
  const toDate = new Date(to + 'T00:00:00Z');
  const files: string[] = [];

  for (const name of entries) {
    const match = name.match(/^(\d{4}-\d{2}-\d{2})\.jsonl$/);
    if (!match) continue;
    const dateStr = match[1];
    const fileDate = new Date(dateStr + 'T00:00:00Z');
    if (fileDate >= fromDate && fileDate <= toDate) {
      files.push(path.join(eventsDir, name));
    }
  }

  files.sort();
  return files;
}

function incMap(
  map: Map<string, { views: number; clicks: number }>,
  key: string,
  isView: boolean
): void {
  const cur = map.get(key) ?? { views: 0, clicks: 0 };
  if (isView) cur.views += 1;
  else cur.clicks += 1;
  map.set(key, cur);
}

/** Parse single JSONL file via streaming; return { byDate, byHash, byBoth } aggregates */
export async function aggregateFile(filePath: string): Promise<{
  byDate: Map<string, { views: number; clicks: number }>;
  byHash: Map<string, { views: number; clicks: number }>;
  byBoth: Map<string, { views: number; clicks: number }>; // key: `${hash}|${date}`
}> {
  const byDate = new Map<string, { views: number; clicks: number }>();
  const byHash = new Map<string, { views: number; clicks: number }>();
  const byBoth = new Map<string, { views: number; clicks: number }>();

  const dateStr = path.basename(filePath, '.jsonl');

  return new Promise((resolve) => {
    const stream = createReadStream(filePath, { encoding: 'utf8' });
    const rl = createInterface({ input: stream, crlfDelay: Infinity });

    rl.on('line', (line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      try {
        const obj = JSON.parse(trimmed) as { event?: string; hash?: string };
        const event = obj?.event;
        const hash = typeof obj?.hash === 'string' ? obj.hash : '';

        if (event === 'view') {
          incMap(byDate, dateStr, true);
          if (hash) incMap(byHash, hash, true);
          if (hash) incMap(byBoth, `${hash}|${dateStr}`, true);
        } else if (event === 'click') {
          incMap(byDate, dateStr, false);
          if (hash) incMap(byHash, hash, false);
          if (hash) incMap(byBoth, `${hash}|${dateStr}`, false);
        }
      } catch {
        // skip malformed line
      }
    });

    rl.on('close', () => resolve({ byDate, byHash, byBoth }));
    stream.on('error', () => resolve({ byDate, byHash, byBoth }));
  });
}

/** Merge multiple file aggregates into one */
export function mergeAggregates(
  aggregates: Array<{
    byDate: Map<string, { views: number; clicks: number }>;
    byHash: Map<string, { views: number; clicks: number }>;
    byBoth: Map<string, { views: number; clicks: number }>;
  }>
): {
  byDate: Map<string, { views: number; clicks: number }>;
  byHash: Map<string, { views: number; clicks: number }>;
  byBoth: Map<string, { views: number; clicks: number }>;
} {
  const byDate = new Map<string, { views: number; clicks: number }>();
  const byHash = new Map<string, { views: number; clicks: number }>();
  const byBoth = new Map<string, { views: number; clicks: number }>();

  for (const agg of aggregates) {
    for (const [k, v] of agg.byDate) {
      const cur = byDate.get(k) ?? { views: 0, clicks: 0 };
      cur.views += v.views;
      cur.clicks += v.clicks;
      byDate.set(k, cur);
    }
    for (const [k, v] of agg.byHash) {
      const cur = byHash.get(k) ?? { views: 0, clicks: 0 };
      cur.views += v.views;
      cur.clicks += v.clicks;
      byHash.set(k, cur);
    }
    for (const [k, v] of agg.byBoth) {
      const cur = byBoth.get(k) ?? { views: 0, clicks: 0 };
      cur.views += v.views;
      cur.clicks += v.clicks;
      byBoth.set(k, cur);
    }
  }

  return { byDate, byHash, byBoth };
}

/** Derive aggregates dir from events dir (sibling dir) */
function getAggregatesDir(eventsDir: string): string {
  return path.join(path.dirname(eventsDir), 'aggregates');
}

/** Build report result from aggregates. Uses pre-aggregated data when available (T3.2). */
export async function getReport(
  eventsDir: string,
  from: string,
  to: string,
  groupBy: GroupBy,
  sortBy: SortBy,
  limit: number,
  offset: number
): Promise<ReportResult> {
  const err = validateDateRange(from, to);
  if (err) {
    return {
      ok: false,
      groupBy,
      from,
      to,
      rows: [],
      summary: { totalViews: 0, totalClicks: 0 },
      error: err,
    };
  }

  const files = await listEventFiles(eventsDir, from, to);
  const aggregatesDir = getAggregatesDir(eventsDir);

  const aggregates = await Promise.all(
    files.map(async (fp) => {
      const dateStr = path.basename(fp, '.jsonl');
      const preAgg = await loadAggregate(aggregatesDir, dateStr);
      if (preAgg) return preAgg;
      return aggregateFile(fp);
    })
  );
  const merged = mergeAggregates(aggregates);

  let totalViews = 0;
  let totalClicks = 0;

  for (const v of merged.byDate.values()) {
    totalViews += v.views;
    totalClicks += v.clicks;
  }

  let rows: ReportRowDay[] | ReportRowHash[] | ReportRowBoth[] = [];

  if (groupBy === 'day') {
    const arr: ReportRowDay[] = [];
    for (const [date, v] of merged.byDate) arr.push({ date, views: v.views, clicks: v.clicks });
    if (sortBy === 'date') arr.sort((a, b) => a.date.localeCompare(b.date));
    else if (sortBy === 'views') arr.sort((a, b) => b.views - a.views);
    else arr.sort((a, b) => b.clicks - a.clicks);
    rows = arr.slice(offset, offset + limit);
  } else if (groupBy === 'hash') {
    const arr: ReportRowHash[] = [];
    for (const [hash, v] of merged.byHash) arr.push({ hash, views: v.views, clicks: v.clicks });
    if (sortBy === 'date') arr.sort((a, b) => a.hash.localeCompare(b.hash));
    else if (sortBy === 'views') arr.sort((a, b) => b.views - a.views);
    else arr.sort((a, b) => b.clicks - a.clicks);
    rows = arr.slice(offset, offset + limit);
  } else {
    const arr: ReportRowBoth[] = [];
    for (const [key, v] of merged.byBoth) {
      const [hash, date] = key.split('|');
      arr.push({ hash, date, views: v.views, clicks: v.clicks });
    }
    if (sortBy === 'date') arr.sort((a, b) => a.date.localeCompare(b.date) || a.hash.localeCompare(b.hash));
    else if (sortBy === 'views') arr.sort((a, b) => b.views - a.views);
    else arr.sort((a, b) => b.clicks - a.clicks);
    rows = arr.slice(offset, offset + limit);
  }

  return {
    ok: true,
    groupBy,
    from,
    to,
    rows,
    summary: { totalViews, totalClicks },
  };
}

/** Append one analytics event as a JSONL line (local disk or Vitest; matches aggregateFile shape). */
export async function appendEventJsonl(
  eventsDir: string,
  payload: Record<string, unknown>
): Promise<void> {
  await fs.mkdir(eventsDir, { recursive: true });
  const ts =
    typeof payload.timestamp === 'string' && payload.timestamp.length >= 10
      ? payload.timestamp
      : new Date().toISOString();
  const dateStr = ts.slice(0, 10);
  const filePath = path.join(eventsDir, `${dateStr}.jsonl`);
  await fs.appendFile(filePath, `${JSON.stringify({ ...payload, timestamp: ts })}\n`, 'utf8');
}
