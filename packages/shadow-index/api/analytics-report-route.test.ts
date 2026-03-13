/**
 * MVP-14: Analytics report route tests (Phase 2)
 * GET /v1/analytics/report — HTTP API integration
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'path';
import os from 'os';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import app from './index.js';

const BASE = 'http://localhost';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FIXTURES_DIR = path.join(__dirname, '../../..', 'test_data', 'events');

async function request(path: string, init?: RequestInit): Promise<Response> {
  return app.request(new Request(`${BASE}${path}`, init));
}

type ErrorResponse = { code?: string; message?: string; details?: unknown; [k: string]: unknown };

type ReportResponse = {
  ok: boolean;
  groupBy: string;
  from: string;
  to: string;
  rows: Array<{ date?: string; hash?: string; views: number; clicks: number }>;
  summary: { totalViews: number; totalClicks: number };
};

describe('GET /v1/analytics/report (MVP-14 Phase 2)', () => {
  const originalEnv = process.env.ANALYTICS_EVENTS_DIR;

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.ANALYTICS_EVENTS_DIR = originalEnv;
    } else {
      delete process.env.ANALYTICS_EVENTS_DIR;
    }
  });

  describe('with fixtures (test_data/events)', () => {
    beforeEach(() => {
      process.env.ANALYTICS_EVENTS_DIR = FIXTURES_DIR;
    });

    it('groupBy=day returns 200 with daily rows', async () => {
      const res = await request(
        '/v1/analytics/report?from=2026-02-21&to=2026-02-23&groupBy=day'
      );
      expect(res.status).toBe(200);
      const body = (await res.json()) as ReportResponse;
      expect(body.ok).toBe(true);
      expect(body.groupBy).toBe('day');
      expect(body.rows).toHaveLength(3);
      expect(body.summary).toEqual({ totalViews: 11, totalClicks: 6 });
    });

    it('groupBy=hash returns 200 with hash rows', async () => {
      const res = await request(
        '/v1/analytics/report?from=2026-02-21&to=2026-02-23&groupBy=hash&sortBy=views'
      );
      expect(res.status).toBe(200);
      const body = (await res.json()) as ReportResponse;
      expect(body.ok).toBe(true);
      expect(body.groupBy).toBe('hash');
      expect(body.rows).toHaveLength(3);
      expect(body.summary).toEqual({ totalViews: 11, totalClicks: 6 });
    });

    it('groupBy=both returns 200 with hash+date rows', async () => {
      const res = await request(
        '/v1/analytics/report?from=2026-02-21&to=2026-02-23&groupBy=both'
      );
      expect(res.status).toBe(200);
      const body = (await res.json()) as ReportResponse;
      expect(body.ok).toBe(true);
      expect(body.groupBy).toBe('both');
      expect(body.rows.length).toBeGreaterThan(0);
      expect(body.summary).toEqual({ totalViews: 11, totalClicks: 6 });
    });

    it('limit and offset work', async () => {
      const res = await request(
        '/v1/analytics/report?from=2026-02-21&to=2026-02-23&groupBy=hash&limit=2&offset=1'
      );
      expect(res.status).toBe(200);
      const body = (await res.json()) as ReportResponse;
      expect(body.rows).toHaveLength(2);
      expect(body.summary.totalViews).toBe(11);
    });

    it('empty range returns 200 with empty rows', async () => {
      const res = await request(
        '/v1/analytics/report?from=2026-01-01&to=2026-01-02'
      );
      expect(res.status).toBe(200);
      const body = (await res.json()) as ReportResponse;
      expect(body.ok).toBe(true);
      expect(body.rows).toEqual([]);
      expect(body.summary).toEqual({ totalViews: 0, totalClicks: 0 });
    });
  });

  describe('invalid params → 400', () => {
    beforeEach(() => {
      process.env.ANALYTICS_EVENTS_DIR = FIXTURES_DIR;
    });

    it('missing from → 400', async () => {
      const res = await request('/v1/analytics/report?to=2026-02-23');
      expect(res.status).toBe(400);
      const body = (await res.json()) as ErrorResponse;
      expect(body.code).toBe('invalid_params');
    });

    it('missing to → 400', async () => {
      const res = await request('/v1/analytics/report?from=2026-02-21');
      expect(res.status).toBe(400);
      const body = (await res.json()) as ErrorResponse;
      expect(body.code).toBe('invalid_params');
    });

    it('from > to → 400', async () => {
      const res = await request(
        '/v1/analytics/report?from=2026-02-23&to=2026-02-21'
      );
      expect(res.status).toBe(400);
      const body = (await res.json()) as ErrorResponse;
      expect(body.code).toBe('invalid_params');
    });

    it('invalid date format → 400', async () => {
      const res = await request(
        '/v1/analytics/report?from=2026/02/21&to=2026-02-23'
      );
      expect(res.status).toBe(400);
      const body = (await res.json()) as ErrorResponse;
      expect(body.code).toBe('invalid_params');
    });

    it('invalid groupBy → 400', async () => {
      const res = await request(
        '/v1/analytics/report?from=2026-02-21&to=2026-02-23&groupBy=invalid'
      );
      expect(res.status).toBe(400);
      const body = (await res.json()) as ErrorResponse;
      expect(body.code).toBe('invalid_params');
    });
  });

  describe('POST → GET integration', () => {
    let tmpDir: string;

    beforeEach(async () => {
      tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'analytics-report-test-'));
      process.env.ANALYTICS_EVENTS_DIR = tmpDir;
    });

    afterEach(async () => {
      await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
    });

    it('POST 3 views, 1 click → GET report returns correct summary', async () => {
      const testHash = 'a'.repeat(64);
      const today = new Date().toISOString().slice(0, 10);

      await request('/v1/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'view',
          hash: testHash,
          source_url: 'https://example.com/1',
        }),
      });
      await request('/v1/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'view',
          hash: testHash,
          source_url: 'https://example.com/2',
        }),
      });
      await request('/v1/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'view',
          hash: testHash,
          source_url: 'https://example.com/3',
        }),
      });
      await request('/v1/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'click',
          hash: testHash,
          source_url: 'https://example.com/1',
          target_action: 'checkout_initiated',
        }),
      });

      const res = await request(
        `/v1/analytics/report?from=${today}&to=${today}&groupBy=hash`
      );
      expect(res.status).toBe(200);
      const body = (await res.json()) as ReportResponse;
      expect(body.ok).toBe(true);
      expect(body.summary.totalViews).toBe(3);
      expect(body.summary.totalClicks).toBe(1);
      const row = body.rows.find((r) => r.hash === testHash);
      expect(row).toBeDefined();
      expect(row?.views).toBe(3);
      expect(row?.clicks).toBe(1);
    });
  });
});
