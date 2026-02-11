/**
 * Analytics Dashboard — GET /v1/analytics/dashboard
 * Sprint 4: Internal monitoring UI
 */

import type { Context } from 'hono';
import path from 'node:path';
import { getMetrics } from '../lib/dashboard-metrics.js';
import { getErrors24h, getAlertStatus, ALERT_THRESHOLDS } from '../lib/error-logger.js';
import { StorageMonitor } from '../lib/storage-monitor.js';
import { getCacheStats } from '../lib/query-cache.js';
import { getPreAggregationStatus } from '../lib/pre-aggregation.js';

export type DashboardConfig = {
  eventsDir: string;
  dataRoot: string;
  quotaBytes: number;
};

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

function buildHistogram(durations: number[], buckets = 10): string {
  if (durations.length === 0) return 'No data';
  const max = Math.max(...durations);
  const min = Math.min(...durations);
  const span = max - min || 1;
  const bucketSize = span / buckets;
  const counts = new Array(buckets).fill(0);
  for (const d of durations) {
    const idx = Math.min(Math.floor((d - min) / bucketSize), buckets - 1);
    counts[idx]++;
  }
  const maxCount = Math.max(...counts, 1);
  return counts
    .map((c, i) => {
      const lo = (min + i * bucketSize).toFixed(0);
      const hi = (min + (i + 1) * bucketSize).toFixed(0);
      const bar = '#'.repeat(Math.ceil((c / maxCount) * 20)) || '|';
      return `  ${lo.padStart(5)}-${hi.padEnd(5)} ms | ${bar} ${c}`;
    })
    .join('\n');
}

export async function dashboardHandler(c: Context, config?: DashboardConfig): Promise<Response> {
  const { last100, totalQueries, concurrentQueries } = getMetrics();
  const cacheStats = getCacheStats();
  const aggregatesDir = config?.dataRoot
    ? path.join(config.dataRoot, 'aggregates')
    : path.join(process.env.ANALYTICS_EVENTS_DIR ?? './data/events', '..', 'aggregates');
  const preAggStatus = await getPreAggregationStatus(aggregatesDir);
  const errors24h = getErrors24h();
  const durations = last100.map((q) => q.durationMs).filter((d) => d >= 0);
  const slowCount = last100.filter((q) => q.durationMs >= ALERT_THRESHOLDS.queryTimeMs).length;
  const errorCountInWindow = last100.filter((q) => q.error).length;
  const windowSize = Math.max(last100.length, 1);
  const alertStatus = getAlertStatus(windowSize, errorCountInWindow, slowCount);

  const mem = process.memoryUsage();
  const histogram = buildHistogram(durations);

  const retentionProcessed = c.req.query('retention_processed');
  const retentionArchived = c.req.query('retention_archived');
  const cacheCleared = c.req.query('cache_cleared');

  const eventsDir = config?.eventsDir ?? process.env.ANALYTICS_EVENTS_DIR ?? './data/events';
  const dataRoot = config?.dataRoot ?? process.env.ANALYTICS_DATA_ROOT ?? './data';
  const defaultQuota = 5 * 1024 * 1024 * 1024;
  const quotaBytes = config?.quotaBytes ?? (parseInt(process.env.STORAGE_QUOTA_BYTES ?? String(defaultQuota), 10) || defaultQuota);
  const storageMonitor = new StorageMonitor([eventsDir, path.join(dataRoot, 'things')], quotaBytes);
  const storageStats = await storageMonitor.getUsageStats();
  const storagePercent = Math.min(storageStats.usagePercent, 100);
  const storageClass = storageStats.isOverQuota ? 'over' : storagePercent >= 90 ? 'critical' : storagePercent >= 70 ? 'warning' : 'ok';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Analytics Dashboard — .things that Matter">
  <title>Analytics Dashboard — .things that Matter</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; margin: 0; padding: 0; background: #0f172a; color: #e2e8f0; }
    .header { background: #020617; padding: 1rem 1.5rem; display: flex; align-items: center; gap: 1rem; }
    .header-brand { font-size: 1.1rem; font-weight: 700; }
    .header-sub { font-size: 0.8rem; color: #94a3b8; }
    .body { padding: 1rem 1.5rem; }
    h1 { font-size: 1.25rem; margin: 0 0 1rem; }
    h2 { font-size: 0.95rem; margin: 1rem 0 0.5rem; color: #94a3b8; }
    .grid { display: grid; gap: 1rem; max-width: 1200px; }
    .card { background: #1e293b; border-radius: 8px; padding: 1rem; }
    .alert { background: #7f1d1d; color: #fecaca; padding: 0.5rem; border-radius: 4px; margin-bottom: 0.5rem; }
    .ok { color: #86efac; }
    table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
    th, td { padding: 0.35rem 0.5rem; text-align: left; border-bottom: 1px solid #334155; }
    th { color: #94a3b8; }
    pre { font-family: 'Consolas', monospace; font-size: 0.75rem; margin: 0; overflow-x: auto; }
    .badge { display: inline-block; padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.7rem; }
    .badge-error { background: #dc2626; }
    .badge-slow { background: #ea580c; }
    .badge-ok { background: #16a34a; }
  </style>
</head>
<body>
  <header class="header" role="banner">
    <span class="header-brand">.things that Matter</span>
    <span class="header-sub">Analytics Dashboard</span>
  </header>
  <div class="body">
  <h1>Dashboard</h1>
  <p style="color:#94a3b8;font-size:0.85rem;">Last updated: ${new Date().toISOString()}</p>

  ${retentionProcessed ? `<div class="card" style="border-left: 4px solid #16a34a; margin-bottom: 1rem;">
    <p style="margin:0;color:#86efac;font-size:0.9rem;">[OK] Retention cleanup complete: ${retentionArchived} files archived (out of ${retentionProcessed} processed).</p>
  </div>` : ''}
  ${cacheCleared ? `<div class="card" style="border-left: 4px solid #16a34a; margin-bottom: 1rem;">
    <p style="margin:0;color:#86efac;font-size:0.9rem;">[OK] Query cache cleared.</p>
  </div>` : ''}

  <div class="grid">
    <div class="card">
      <h2>Alert Status</h2>
      ${alertStatus.errorRateAlert ? '<div class="alert">[WARN] Error rate &gt; 5%</div>' : ''}
      ${alertStatus.slowQueryAlert ? '<div class="alert">[WARN] Slow queries detected (&gt; 1s)</div>' : ''}
      ${!alertStatus.errorRateAlert && !alertStatus.slowQueryAlert ? '<span class="ok">[OK] All systems nominal</span>' : ''}
      <p>Error rate: ${(alertStatus.errorRate * 100).toFixed(2)}% (threshold: 5%) | Slow: ${alertStatus.slowQueryCount}</p>
    </div>

    <div class="card">
      <h2>Storage & Quota</h2>
      <p>Usage: ${formatBytes(storageStats.totalSizeBytes)} / ${formatBytes(storageStats.quotaBytes)} (${storageStats.usagePercent.toFixed(1)}%)</p>
      <div style="background:#334155;border-radius:4px;height:8px;overflow:hidden;">
        <div style="height:100%;width:${storagePercent}%;background:${storageClass === 'over' ? '#dc2626' : storageClass === 'critical' ? '#ea580c' : storageClass === 'warning' ? '#eab308' : '#16a34a'};"></div>
      </div>
      <p style="font-size:0.75rem;color:#94a3b8;">${storageStats.directories.map((d) => `${d.path}: ${formatBytes(d.sizeBytes)}`).join(' | ')}</p>
      <form method="post" action="/v1/admin/retention/run" style="margin-top:0.5rem;">
        <button type="submit" style="padding:0.35rem 0.75rem;background:#1e40af;color:#fff;border:none;border-radius:4px;cursor:pointer;">Run Retention Cleanup</button>
      </form>
    </div>

    <div class="card">
      <h2>Query Cache</h2>
      <p>Status: ${cacheStats.enabled ? 'enabled' : 'disabled'}</p>
      <p>Hit rate: ${(cacheStats.hitRate * 100).toFixed(1)}% (hits: ${cacheStats.hits}, misses: ${cacheStats.misses})</p>
      <p>Entries: ${cacheStats.entries} | Size: ${formatBytes(cacheStats.sizeBytes)} | Evictions: ${cacheStats.evictions}</p>
      <form method="post" action="/v1/admin/cache/clear" style="margin-top:0.5rem;">
        <button type="submit" style="padding:0.35rem 0.75rem;background:#6b7280;color:#fff;border:none;border-radius:4px;cursor:pointer;">Clear Cache</button>
      </form>
    </div>

    <div class="card">
      <h2>Pre-Aggregation</h2>
      <p>Status: ${preAggStatus.enabled ? 'enabled' : 'disabled'}</p>
      <p>Aggregate files: ${preAggStatus.fileCount} | Last run: ${preAggStatus.lastRun ?? 'never'}</p>
      <p style="font-size:0.75rem;color:#94a3b8;">Run: npm run pre-aggregate (or cron at 00:00 UTC)</p>
    </div>

    <div class="card">
      <h2>System Metrics</h2>
      <table>
        <tr><td>Memory (heap)</td><td>${formatBytes(mem.heapUsed)}</td></tr>
        <tr><td>Memory (rss)</td><td>${formatBytes(mem.rss)}</td></tr>
        <tr><td>Concurrent queries</td><td>${concurrentQueries}</td></tr>
        <tr><td>Total queries (buffer)</td><td>${totalQueries}</td></tr>
      </table>
    </div>

    <div class="card">
      <h2>Query Time Histogram (last 100)</h2>
      <pre>${histogram}</pre>
    </div>

    <div class="card">
      <h2>Error Summary (24h)</h2>
      <p>${errors24h.length} errors in last 24 hours</p>
      ${errors24h.length > 0 ? `<table><tr><th>Time</th><th>Message</th></tr>${
        errors24h.slice(-5).reverse().map((e) =>
          `<tr><td>${e.timestamp}</td><td>${escapeHtml(e.message)}</td></tr>`
        ).join('')
      }</table>` : ''}
    </div>

    <div class="card">
      <h2>Last 100 Queries</h2>
      <table>
        <tr><th>Time</th><th>Duration</th><th>Params</th><th>Results</th><th>Status</th></tr>
        ${last100.slice(0, 100).map((q) => {
          const status = q.error ? '<span class="badge badge-error">error</span>' : (q.durationMs >= 1000 ? '<span class="badge badge-slow">slow</span>' : '<span class="badge badge-ok">ok</span>');
          const params = `${q.params.from ?? '-'} to ${q.params.to ?? '-'}`;
          return `<tr><td>${q.timestamp.slice(11, 19)}</td><td>${q.durationMs} ms</td><td>${escapeHtml(params)}</td><td>${q.resultCount}</td><td>${status}</td></tr>`;
        }).join('')}
      </table>
    </div>
  </div>
  </div>
  <footer style="padding:1rem 1.5rem;border-top:1px solid #1e293b;font-size:0.75rem;color:#64748b;">Copyright 2026 .things that Matter</footer>
</body>
</html>`;

  return c.html(html);
}
