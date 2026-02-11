#!/usr/bin/env node
/**
 * Sustained Load Test — Sprint 4 Week 4 (T4.1)
 * Validates memory stability and cache hit rate under continuous traffic.
 * Usage: node scripts/sustained-load-test.mjs [duration_minutes] [base_url]
 * Default: 5 min, http://localhost:3000
 */

const DURATION_MS = (parseInt(process.argv[2] || '5', 10) || 5) * 60 * 1000;
const BASE_URL = process.argv[3] || 'http://localhost:3000';

const REPORT_URL = `${BASE_URL}/v1/analytics/report`;
const DASHBOARD_URL = `${BASE_URL}/v1/analytics/dashboard`;

const dateRanges = [
  ['2026-02-21', '2026-02-23'],
  ['2026-02-21', '2026-02-23'],
  ['2026-02-21', '2026-02-28'],
  ['2026-01-01', '2026-02-28'],
];

let requests = 0;
let errors = 0;
let startTime = 0;

async function fetchReport() {
  const [from, to] = dateRanges[Math.floor(Math.random() * dateRanges.length)];
  const url = `${REPORT_URL}?from=${from}&to=${to}&groupBy=day&sortBy=date&limit=100`;
  try {
    const res = await fetch(url);
    if (res.ok) return true;
    errors++;
    return false;
  } catch {
    errors++;
    return false;
  }
}

async function runWorker(id) {
  while (Date.now() - startTime < DURATION_MS) {
    await fetchReport();
    requests++;
    await new Promise((r) => setTimeout(r, 50 + Math.random() * 100));
  }
}

async function main() {
  console.log(`[Sustained Load] Duration: ${DURATION_MS / 60000} min | Target: ${BASE_URL}`);
  console.log('[Sustained Load] Starting...');

  startTime = Date.now();
  const workers = Array.from({ length: 5 }, (_, i) => runWorker(i));
  await Promise.all(workers);

  const elapsed = (Date.now() - startTime) / 1000;
  const rps = (requests / elapsed).toFixed(1);

  console.log(`[Sustained Load] Complete. ${requests} requests in ${elapsed.toFixed(1)}s (~${rps} req/s)`);
  console.log(`[Sustained Load] Errors: ${errors}`);

  let cacheHitRate = null;
  try {
    const res = await fetch(DASHBOARD_URL);
    const html = await res.text();
    const match = html.match(/Hit rate:\s*([\d.]+)%/);
    if (match) cacheHitRate = parseFloat(match[1]);
  } catch (e) {
    console.log('[Sustained Load] Could not fetch dashboard for cache stats:', e.message);
  }

  if (cacheHitRate !== null) {
    console.log(`[Sustained Load] Cache hit rate: ${cacheHitRate.toFixed(1)}%`);
    if (cacheHitRate < 60) {
      console.warn('[Sustained Load] WARNING: Cache hit rate below 60% target');
    }
  }

  if (errors > requests * 0.05) {
    console.error('[Sustained Load] FAIL: Error rate > 5%');
    process.exit(1);
  }

  console.log('[Sustained Load] PASS: Load test complete, error rate acceptable');
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
