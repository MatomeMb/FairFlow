/**
 * MVP-14: Analytics report performance tests (Phase 3)
 * Measures getReport timing for various date ranges and data volumes.
 * Target: < 500ms for 90-day range with ~10k events.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'path';
import os from 'os';
import { promises as fs } from 'fs';
import { getReport } from '../lib/analytics-report.js';

const HASH = 'a'.repeat(64);

async function seedEvents(
  eventsDir: string,
  fromDate: Date,
  days: number,
  eventsPerDay: number
): Promise<number> {
  let total = 0;
  for (let d = 0; d < days; d++) {
    const date = new Date(fromDate);
    date.setDate(date.getDate() + d);
    const dateStr = date.toISOString().slice(0, 10);
    const filePath = path.join(eventsDir, `${dateStr}.jsonl`);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const lines: string[] = [];
    for (let i = 0; i < eventsPerDay; i++) {
      const isView = i % 3 !== 0;
      lines.push(
        JSON.stringify({
          event: isView ? 'view' : 'click',
          hash: HASH,
          timestamp: `${dateStr}T12:00:00.000Z`,
          source_url: `https://example.com/${i}`,
          ...(isView ? {} : { target_action: 'checkout_initiated' }),
        })
      );
    }
    await fs.writeFile(filePath, lines.join('\n') + '\n', 'utf8');
    total += eventsPerDay;
  }
  return total;
}

function measureMs(fn: () => Promise<unknown>): Promise<number> {
  const start = performance.now();
  return fn().then(() => performance.now() - start);
}

describe('Analytics report performance (MVP-14 Phase 3)', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'analytics-perf-'));
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  });

  it('3-day range (fixture scale) completes in < 100ms', async () => {
    await seedEvents(tmpDir, new Date('2026-02-21'), 3, 10);
    const ms = await measureMs(() =>
      getReport(tmpDir, '2026-02-21', '2026-02-23', 'day', 'date', 100, 0)
    );
    expect(ms).toBeLessThan(100);
  });

  it('30-day range (~1000 events) completes in < 300ms', async () => {
    const total = await seedEvents(tmpDir, new Date('2026-01-01'), 30, 35);
    expect(total).toBe(1050);
    const ms = await measureMs(() =>
      getReport(tmpDir, '2026-01-01', '2026-01-30', 'day', 'date', 100, 0)
    );
    expect(ms).toBeLessThan(300);
  });

  it('90-day range (~10k events) completes in < 500ms', async () => {
    const total = await seedEvents(tmpDir, new Date('2026-01-01'), 90, 112);
    expect(total).toBe(10080);
    const ms = await measureMs(() =>
      getReport(tmpDir, '2026-01-01', '2026-03-31', 'day', 'date', 100, 0)
    );
    expect(ms).toBeLessThan(500);
  });

  it('groupBy=hash with many hashes completes in < 500ms', async () => {
    const eventsDir = tmpDir;
    for (let d = 0; d < 30; d++) {
      const date = new Date('2026-01-01');
      date.setDate(date.getDate() + d);
      const dateStr = date.toISOString().slice(0, 10);
      const filePath = path.join(eventsDir, `${dateStr}.jsonl`);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      const lines: string[] = [];
      for (let h = 0; h < 50; h++) {
        const hash = h.toString(16).padStart(64, '0');
        lines.push(
          JSON.stringify({
            event: 'view',
            hash,
            timestamp: `${dateStr}T12:00:00.000Z`,
            source_url: 'https://example.com/1',
          })
        );
      }
      await fs.writeFile(filePath, lines.join('\n') + '\n', 'utf8');
    }
    const ms = await measureMs(() =>
      getReport(tmpDir, '2026-01-01', '2026-01-30', 'hash', 'views', 100, 0)
    );
    expect(ms).toBeLessThan(500);
  });
});
