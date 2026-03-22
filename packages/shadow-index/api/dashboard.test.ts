/**
 * Dashboard route — integration tests
 */
import path from 'node:path';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import app from './index.js';
import { resetMetrics } from '../lib/dashboard-metrics.js';
import { resetErrorLogger } from '../lib/error-logger.js';

const BASE = 'http://localhost';

const adminAuthHeaders = (): Record<string, string> => ({
  Authorization: `Bearer ${process.env.ADMIN_SECRET_KEY ?? 'test-admin-secret'}`,
});

async function request(path: string, init?: RequestInit): Promise<Response> {
  return app.request(new Request(`${BASE}${path}`, init));
}

beforeEach(() => {
  resetMetrics();
  resetErrorLogger();
});

describe('GET /v1/analytics/dashboard', () => {
  it('returns 200 with HTML', async () => {
    const res = await request('/v1/analytics/dashboard');
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain('Analytics Dashboard');
    expect(text).toContain('Storage & Quota');
    expect(text).toContain('Run Retention Cleanup');
    expect(text).toContain('</html>');
  });

  it('includes system metrics section', async () => {
    const res = await request('/v1/analytics/dashboard');
    const text = await res.text();
    expect(text).toContain('System Metrics');
    expect(text).toContain('Memory');
    expect(text).toContain('Concurrent queries');
  });

  it('includes last 100 queries table', async () => {
    const res = await request('/v1/analytics/dashboard');
    const text = await res.text();
    expect(text).toContain('Last 100 Queries');
  });

  it('includes alert status section', async () => {
    const res = await request('/v1/analytics/dashboard');
    const text = await res.text();
    expect(text).toContain('Alert Status');
  });
});

describe('POST /v1/admin/retention/run', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'dashboard-test-'));
    process.env.ANALYTICS_EVENTS_DIR = tempDir;
  });

  afterEach(async () => {
    delete process.env.ANALYTICS_EVENTS_DIR;
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('runs retention and redirects if html', async () => {
    const res = await request('/v1/admin/retention/run', {
      method: 'POST',
      headers: {
        ...adminAuthHeaders(),
        'Accept': 'text/html',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    expect(res.status).toBe(302);
    expect(res.headers.get('Location')).toContain('/v1/analytics/dashboard?retention_processed=0&retention_archived=0');
  });

  it('runs retention and returns json if requested', async () => {
    const res = await request('/v1/admin/retention/run', {
      method: 'POST',
      headers: { ...adminAuthHeaders(), 'Accept': 'application/json' }
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok?: boolean; processed?: number; archived?: number };
    expect(body).toHaveProperty('ok', true);
    expect(body).toHaveProperty('processed', 0);
    expect(body).toHaveProperty('archived', 0);
  });
});
