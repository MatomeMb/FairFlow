/**
 * MVP-14: Analytics report load tests (Phase 3)
 * Concurrent GET requests; verifies no degradation under load.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'path';
import os from 'os';
import { promises as fs } from 'fs';
import app from './index.js';
import { getReport } from '../lib/analytics-report.js';

const BASE = 'http://localhost';

async function seedEvents(eventsDir: string, days: number, eventsPerDay: number): Promise<void> {
  const hash = 'a'.repeat(64);
  for (let d = 0; d < days; d++) {
    const date = new Date('2026-01-01');
    date.setDate(date.getDate() + d);
    const dateStr = date.toISOString().slice(0, 10);
    const filePath = path.join(eventsDir, `${dateStr}.jsonl`);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const lines: string[] = [];
    for (let i = 0; i < eventsPerDay; i++) {
      lines.push(
        JSON.stringify({
          event: i % 3 === 0 ? 'click' : 'view',
          hash,
          timestamp: `${dateStr}T12:00:00.000Z`,
          source_url: `https://example.com/${i}`,
          ...(i % 3 === 0 ? { target_action: 'checkout_initiated' } : {}),
        })
      );
    }
    await fs.writeFile(filePath, lines.join('\n') + '\n', 'utf8');
  }
}

describe('Analytics report load (MVP-14 Phase 3)', () => {
  let tmpDir: string;
  const originalEnv = process.env.ANALYTICS_EVENTS_DIR;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'analytics-load-'));
    process.env.ANALYTICS_EVENTS_DIR = tmpDir;
    await seedEvents(tmpDir, 7, 20);
  });

  afterEach(async () => {
    if (originalEnv !== undefined) {
      process.env.ANALYTICS_EVENTS_DIR = originalEnv;
    } else {
      delete process.env.ANALYTICS_EVENTS_DIR;
    }
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  });

  it('10 concurrent GET requests all succeed', async () => {
    const requests = Array.from({ length: 10 }, () =>
      app.request(
        new Request(
          `${BASE}/v1/analytics/report?from=2026-01-01&to=2026-01-07&groupBy=day`
        )
      )
    );
    const responses = await Promise.all(requests);
    for (const res of responses) {
      expect(res.status).toBe(200);
      const body = (await res.json()) as { ok?: boolean; summary?: { totalViews: number } };
      expect(body.ok).toBe(true);
      expect(body.summary).toBeDefined();
    }
  });

  it('20 concurrent lib getReport calls all succeed', async () => {
    const calls = Array.from({ length: 20 }, () =>
      getReport(tmpDir, '2026-01-01', '2026-01-07', 'day', 'date', 100, 0)
    );
    const results = await Promise.all(calls);
    for (const r of results) {
      expect(r.ok).toBe(true);
      expect(r.summary.totalViews).toBe(91); // 7 days × 13 views/day (i%3!==0)
      expect(r.summary.totalClicks).toBe(49); // 7 days × 7 clicks/day
    }
  });
});
