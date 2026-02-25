/**
 * Analytics Reporting Engine — Phase 1 tests
 */
import path from 'path';
import { promises as fs } from 'fs';
import {
  parseDate,
  validateDateRange,
  listEventFiles,
  aggregateFile,
  mergeAggregates,
  getReport,
} from '../lib/analytics-report.js';

const FIXTURES_DIR = path.join(__dirname, '../../..', 'test_data', 'events');

describe('parseDate', () => {
  it('valid YYYY-MM-DD returns {y,m,d}', () => {
    const r = parseDate('2026-02-21');
    expect(r).toEqual({ y: 2026, m: 2, d: 21 });
  });

  it('invalid format returns null', () => {
    expect(parseDate('2026/02/21')).toBeNull();
    expect(parseDate('02-21-2026')).toBeNull();
    expect(parseDate('2026-2-21')).toBeNull();
    expect(parseDate('')).toBeNull();
  });

  it('invalid date (e.g. 2026-02-30) returns null', () => {
    expect(parseDate('2026-02-30')).toBeNull();
    expect(parseDate('2026-13-01')).toBeNull();
    expect(parseDate('2026-00-01')).toBeNull();
  });
});

describe('validateDateRange', () => {
  it('valid range returns null', () => {
    expect(validateDateRange('2026-02-21', '2026-02-23')).toBeNull();
    expect(validateDateRange('2026-02-21', '2026-02-21')).toBeNull();
  });

  it('from > to returns error', () => {
    expect(validateDateRange('2026-02-23', '2026-02-21')).toBe('from > to');
  });

  it('invalid from returns error', () => {
    expect(validateDateRange('invalid', '2026-02-23')).toBe('invalid from');
  });

  it('invalid to returns error', () => {
    expect(validateDateRange('2026-02-21', 'bad')).toBe('invalid to');
  });
});

describe('listEventFiles', () => {
  it('returns paths for files in range', async () => {
    const files = await listEventFiles(FIXTURES_DIR, '2026-02-21', '2026-02-23');
    expect(files.length).toBe(3);
    expect(files.some((f) => f.includes('2026-02-21.jsonl'))).toBe(true);
    expect(files.some((f) => f.includes('2026-02-22.jsonl'))).toBe(true);
    expect(files.some((f) => f.includes('2026-02-23.jsonl'))).toBe(true);
  });

  it('empty range returns []', async () => {
    const files = await listEventFiles(FIXTURES_DIR, '2026-02-23', '2026-02-21');
    expect(files).toEqual([]);
  });

  it('missing dir returns []', async () => {
    const files = await listEventFiles('/nonexistent/path/events', '2026-02-21', '2026-02-23');
    expect(files).toEqual([]);
  });
});

describe('aggregateFile', () => {
  it('parses valid JSONL and counts views/clicks', async () => {
    const filePath = path.join(FIXTURES_DIR, '2026-02-21.jsonl');
    const agg = await aggregateFile(filePath);
    expect(agg.byDate.get('2026-02-21')).toEqual({ views: 5, clicks: 2 });
    const a64 = 'a'.repeat(64);
    const b64 = 'b'.repeat(64);
    expect(agg.byHash.get(a64)).toEqual({ views: 3, clicks: 1 });
    expect(agg.byHash.get(b64)).toEqual({ views: 2, clicks: 1 });
  });

  it('skips malformed lines', async () => {
    const tmpDir = path.join(__dirname, '../../..', 'test_data', 'events');
    const tmpPath = path.join(tmpDir, '2026-02-99.jsonl');
    await fs.writeFile(
      tmpPath,
      '{"event":"view","hash":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","timestamp":"2026-02-99T10:00:00.000Z"}\n' +
        'not json\n' +
        '{"event":"click","hash":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","timestamp":"2026-02-99T10:01:00.000Z"}'
    );
    try {
      const agg = await aggregateFile(tmpPath);
      expect(agg.byDate.get('2026-02-99')).toEqual({ views: 1, clicks: 1 });
    } finally {
      await fs.unlink(tmpPath).catch(() => {});
    }
  });

  it('empty file returns empty maps', async () => {
    const tmpDir = path.join(__dirname, '../../..', 'test_data', 'events');
    const tmpPath = path.join(tmpDir, '2026-02-98.jsonl');
    await fs.writeFile(tmpPath, '');
    try {
      const agg = await aggregateFile(tmpPath);
      expect(agg.byDate.size).toBe(0);
      expect(agg.byHash.size).toBe(0);
      expect(agg.byBoth.size).toBe(0);
    } finally {
      await fs.unlink(tmpPath).catch(() => {});
    }
  });
});

describe('mergeAggregates', () => {
  it('merges multiple file aggregates', () => {
    const agg1 = {
      byDate: new Map([['2026-02-21', { views: 5, clicks: 2 }]]),
      byHash: new Map([['a'.repeat(64), { views: 3, clicks: 1 }]]),
      byBoth: new Map([['a'.repeat(64) + '|2026-02-21', { views: 3, clicks: 1 }]]),
    };
    const agg2 = {
      byDate: new Map([['2026-02-22', { views: 3, clicks: 2 }]]),
      byHash: new Map([['a'.repeat(64), { views: 2, clicks: 2 }]]),
      byBoth: new Map([['a'.repeat(64) + '|2026-02-22', { views: 2, clicks: 2 }]]),
    };
    const merged = mergeAggregates([agg1, agg2]);
    expect(merged.byDate.get('2026-02-21')).toEqual({ views: 5, clicks: 2 });
    expect(merged.byDate.get('2026-02-22')).toEqual({ views: 3, clicks: 2 });
    expect(merged.byHash.get('a'.repeat(64))).toEqual({ views: 5, clicks: 3 });
  });

  it('sums views and clicks correctly', async () => {
    const files = await Promise.all([
      aggregateFile(path.join(FIXTURES_DIR, '2026-02-21.jsonl')),
      aggregateFile(path.join(FIXTURES_DIR, '2026-02-22.jsonl')),
      aggregateFile(path.join(FIXTURES_DIR, '2026-02-23.jsonl')),
    ]);
    const merged = mergeAggregates(files);
    let totalViews = 0;
    let totalClicks = 0;
    for (const v of merged.byDate.values()) {
      totalViews += v.views;
      totalClicks += v.clicks;
    }
    expect(totalViews).toBe(11);
    expect(totalClicks).toBe(6);
  });
});

describe('getReport', () => {
  it('groupBy=day returns daily rows', async () => {
    const r = await getReport(FIXTURES_DIR, '2026-02-21', '2026-02-23', 'day', 'date', 100, 0);
    expect(r.ok).toBe(true);
    expect(r.rows).toHaveLength(3);
    const rows = r.rows as { date: string; views: number; clicks: number }[];
    expect(rows[0]).toEqual({ date: '2026-02-21', views: 5, clicks: 2 });
    expect(rows[1]).toEqual({ date: '2026-02-22', views: 3, clicks: 2 });
    expect(rows[2]).toEqual({ date: '2026-02-23', views: 3, clicks: 2 });
    expect(r.summary).toEqual({ totalViews: 11, totalClicks: 6 });
  });

  it('groupBy=hash returns hash rows', async () => {
    const r = await getReport(FIXTURES_DIR, '2026-02-21', '2026-02-23', 'hash', 'views', 100, 0);
    expect(r.ok).toBe(true);
    expect(r.rows).toHaveLength(3);
    const rows = r.rows as { hash: string; views: number; clicks: number }[];
    expect(rows[0].hash).toBe('a'.repeat(64));
    expect(rows[0].views).toBe(6);
    expect(rows[0].clicks).toBe(4);
    expect(rows[1].hash).toBe('b'.repeat(64));
    expect(rows[1].views).toBe(3);
    expect(r.summary).toEqual({ totalViews: 11, totalClicks: 6 });
  });

  it('groupBy=both returns hash+date rows', async () => {
    const r = await getReport(FIXTURES_DIR, '2026-02-21', '2026-02-23', 'both', 'date', 100, 0);
    expect(r.ok).toBe(true);
    expect(r.rows.length).toBeGreaterThan(0);
    const first = r.rows[0] as { hash: string; date: string; views: number; clicks: number };
    expect(first).toHaveProperty('hash');
    expect(first).toHaveProperty('date');
    expect(first).toHaveProperty('views');
    expect(first).toHaveProperty('clicks');
    expect(r.summary).toEqual({ totalViews: 11, totalClicks: 6 });
  });

  it('summary totals match rows', async () => {
    const r = await getReport(FIXTURES_DIR, '2026-02-21', '2026-02-23', 'day', 'date', 100, 0);
    expect(r.ok).toBe(true);
    const rows = r.rows as { views: number; clicks: number }[];
    const sumViews = rows.reduce((a, x) => a + x.views, 0);
    const sumClicks = rows.reduce((a, x) => a + x.clicks, 0);
    expect(sumViews).toBe(r.summary.totalViews);
    expect(sumClicks).toBe(r.summary.totalClicks);
  });

  it('invalid from returns error', async () => {
    const r = await getReport(FIXTURES_DIR, 'invalid', '2026-02-23', 'day', 'date', 100, 0);
    expect(r.ok).toBe(false);
    expect(r.error).toBe('invalid from');
    expect(r.rows).toEqual([]);
    expect(r.summary).toEqual({ totalViews: 0, totalClicks: 0 });
  });

  it('empty range returns empty rows, summary 0,0', async () => {
    const r = await getReport(FIXTURES_DIR, '2026-01-01', '2026-01-02', 'day', 'date', 100, 0);
    expect(r.ok).toBe(true);
    expect(r.rows).toEqual([]);
    expect(r.summary).toEqual({ totalViews: 0, totalClicks: 0 });
  });

  it('limit and offset work for groupBy=hash', async () => {
    const r = await getReport(FIXTURES_DIR, '2026-02-21', '2026-02-23', 'hash', 'views', 2, 1);
    expect(r.ok).toBe(true);
    expect(r.rows).toHaveLength(2);
    expect(r.summary.totalViews).toBe(11);
  });
});
