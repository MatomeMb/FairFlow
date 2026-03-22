/**
 * Analytics: event ingest, aggregated report, HTML dashboard.
 */
import { Hono } from 'hono';
import { z } from 'zod';
import { appendEventJsonl, getReport, validateDateRange } from '../../lib/analytics-report.js';
import { recordQuery, startQuery, endQuery } from '../../lib/dashboard-metrics.js';
import { getCached, setCached, invalidateCache, buildCacheKey } from '../../lib/query-cache.js';
import { logError } from '../../lib/error-logger.js';
import { logger } from '../../lib/logger.js';
import { dashboardHandler } from '../dashboard.js';
import { db } from '../db.js';
import { err } from '../shared/errors.js';
import { dataRoot, getEventsDir } from '../shared/server-paths.js';

const viewEventSchema = z.object({
  event: z.literal('view'),
  hash: z.string().regex(/^[a-f0-9]{64}$/),
  timestamp: z.string().datetime().optional(),
  source_url: z.string().url(),
  anon_id: z.string().optional(),
});

const clickEventSchema = z.object({
  event: z.literal('click'),
  hash: z.string().regex(/^[a-f0-9]{64}$/),
  timestamp: z.string().datetime().optional(),
  source_url: z.string().url(),
  target_action: z.enum(['checkout_initiated', 'image_expanded', 'external_link']),
  anon_id: z.string().optional(),
});

const analyticsEventSchema = z.discriminatedUnion('event', [viewEventSchema, clickEventSchema]);

function useFileBackedAnalytics(): boolean {
  return process.env.NODE_ENV === 'test' || Boolean(process.env.ANALYTICS_EVENTS_DIR?.trim());
}

const ReportQuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  groupBy: z.enum(['day', 'hash', 'both']).optional().default('day'),
  sortBy: z.enum(['date', 'views', 'clicks']).optional().default('date'),
  limit: z.coerce.number().int().min(1).max(1000).optional().default(100),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

const STORAGE_QUOTA_BYTES = parseInt(process.env.STORAGE_QUOTA_BYTES ?? String(5 * 1024 * 1024 * 1024), 10) || 5 * 1024 * 1024 * 1024;

export const analyticsRouter = new Hono();

analyticsRouter.post('/event', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (body === null) {
    return c.json(err('invalid_json', 'Request body must be valid JSON'), 400);
  }

  const parsed = analyticsEventSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(err('invalid_event', 'Invalid event payload', parsed.error.flatten()), 400);
  }

  const event = {
    ...parsed.data,
    timestamp: parsed.data.timestamp ?? new Date().toISOString(),
  };

  try {
    if (useFileBackedAnalytics()) {
      const line: Record<string, unknown> = {
        event: event.event,
        hash: event.hash,
        timestamp: event.timestamp,
        source_url: parsed.data.source_url,
      };
      if (parsed.data.anon_id) line.anon_id = parsed.data.anon_id;
      if (parsed.data.event === 'click') {
        line.target_action = parsed.data.target_action;
      }
      await appendEventJsonl(getEventsDir(), line);
      invalidateCache();
      return c.json({ ok: true }, 201);
    }

    const metadata: Record<string, unknown> = { ...event };
    delete metadata.event;
    delete metadata.hash;
    delete metadata.timestamp;
    delete metadata.anon_id;

    const { error } = await db.from('analytics_events').insert({
      event_type: event.event,
      hash: event.hash,
      anon_id: event.anon_id ?? null,
      merchant_id: null,
      session_id: null,
      metadata,
      created_at: event.timestamp,
    });

    if (error) {
      throw new Error(error.message);
    }

    invalidateCache();
    return c.json({ ok: true }, 201);
  } catch (error) {
    logger.error('Analytics event storage failed', { error: String(error) });
    return c.json(err('storage_error', 'Failed to persist analytics event'), 500);
  }
});

analyticsRouter.get('/report', async (c) => {
  const raw = Object.fromEntries(c.req.url ? new URL(c.req.url).searchParams : []);
  const parsed = ReportQuerySchema.safeParse(raw);
  if (!parsed.success) {
    return c.json(err('invalid_params', 'Invalid query parameters', parsed.error.flatten()), 400);
  }
  const { from, to, groupBy, sortBy, limit, offset } = parsed.data;
  const rangeErr = validateDateRange(from, to);
  if (rangeErr) {
    return c.json(
      err('invalid_params', rangeErr === 'from > to' ? 'from must be ≤ to' : rangeErr),
      400
    );
  }
  const params = { from, to, groupBy, sortBy, limit, offset };
  const cacheKey = buildCacheKey({ from, to, groupBy, sortBy, limit, offset });

  startQuery();
  const t0 = performance.now();
  try {
    const cachedResult = getCached(cacheKey);
    if (cachedResult) {
      const durationMs = Math.round(performance.now() - t0);
      recordQuery(params, durationMs, cachedResult.rows.length);
      endQuery();
      return c.json(cachedResult, 200);
    }

    if (useFileBackedAnalytics()) {
      const fileResult = await getReport(getEventsDir(), from, to, groupBy, sortBy, limit, offset);
      if (!fileResult.ok) {
        const durationMs = Math.round(performance.now() - t0);
        recordQuery(params, durationMs, 0, fileResult.error);
        endQuery();
        return c.json(err('invalid_params', fileResult.error ?? 'report failed'), 400);
      }
      const durationMs = Math.round(performance.now() - t0);
      const resultCount = fileResult.rows.length;
      setCached(cacheKey, fileResult);
      recordQuery(params, durationMs, resultCount);
      endQuery();
      return c.json(fileResult, 200);
    }

    const fromIso = `${from}T00:00:00.000Z`;
    const toIso = `${to}T23:59:59.999Z`;

    const { data, error } = await db
      .from('analytics_events')
      .select('event_type, hash, created_at')
      .gte('created_at', fromIso)
      .lte('created_at', toIso)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    const byDate = new Map<string, { views: number; clicks: number }>();
    const byHash = new Map<string, { views: number; clicks: number }>();
    const byBoth = new Map<string, { views: number; clicks: number }>();

    const inc = (map: Map<string, { views: number; clicks: number }>, key: string, isView: boolean) => {
      const cur = map.get(key) ?? { views: 0, clicks: 0 };
      if (isView) cur.views += 1;
      else cur.clicks += 1;
      map.set(key, cur);
    };

    for (const row of data ?? []) {
      const createdAt = typeof row.created_at === 'string' ? row.created_at : '';
      const dateKey = createdAt.slice(0, 10);
      if (!dateKey) continue;

      const isView = row.event_type === 'view';
      const isClick = row.event_type === 'click';
      if (!isView && !isClick) continue;

      const hash = typeof row.hash === 'string' ? row.hash : '';
      inc(byDate, dateKey, isView);
      if (hash) {
        inc(byHash, hash, isView);
        inc(byBoth, `${hash}|${dateKey}`, isView);
      }
    }

    let totalViews = 0;
    let totalClicks = 0;
    for (const v of byDate.values()) {
      totalViews += v.views;
      totalClicks += v.clicks;
    }

    let rows:
      | { date: string; views: number; clicks: number }[]
      | { hash: string; views: number; clicks: number }[]
      | { hash: string; date: string; views: number; clicks: number }[] = [];
    if (groupBy === 'day') {
      const arr = Array.from(byDate.entries()).map(([date, v]) => ({ date, views: v.views, clicks: v.clicks }));
      if (sortBy === 'date') arr.sort((a, b) => a.date.localeCompare(b.date));
      else if (sortBy === 'views') arr.sort((a, b) => b.views - a.views);
      else arr.sort((a, b) => b.clicks - a.clicks);
      rows = arr.slice(offset, offset + limit);
    } else if (groupBy === 'hash') {
      const arr = Array.from(byHash.entries()).map(([hash, v]) => ({ hash, views: v.views, clicks: v.clicks }));
      if (sortBy === 'date') arr.sort((a, b) => a.hash.localeCompare(b.hash));
      else if (sortBy === 'views') arr.sort((a, b) => b.views - a.views);
      else arr.sort((a, b) => b.clicks - a.clicks);
      rows = arr.slice(offset, offset + limit);
    } else {
      const arr = Array.from(byBoth.entries()).map(([key, v]) => {
        const [hash, date] = key.split('|');
        return { hash, date, views: v.views, clicks: v.clicks };
      });
      if (sortBy === 'date') arr.sort((a, b) => a.date.localeCompare(b.date) || a.hash.localeCompare(b.hash));
      else if (sortBy === 'views') arr.sort((a, b) => b.views - a.views);
      else arr.sort((a, b) => b.clicks - a.clicks);
      rows = arr.slice(offset, offset + limit);
    }

    const result = {
      ok: true,
      groupBy,
      from,
      to,
      rows,
      summary: {
        totalViews,
        totalClicks,
      },
    };

    const durationMs = Math.round(performance.now() - t0);
    const resultCount = result.ok ? result.rows.length : 0;
    setCached(cacheKey, result);
    recordQuery(params, durationMs, resultCount);
    endQuery();
    return c.json(result, 200);
  } catch (e) {
    const durationMs = Math.round(performance.now() - t0);
    const message = e instanceof Error ? e.message : String(e);
    const stack = e instanceof Error ? e.stack : undefined;
    logError(params, message, stack);
    recordQuery(params, durationMs, 0, message);
    endQuery();
    return c.json(err('report_failed', message), 500);
  }
});

analyticsRouter.get('/dashboard', (c) =>
  dashboardHandler(c, {
    eventsDir: getEventsDir(),
    dataRoot,
    quotaBytes: STORAGE_QUOTA_BYTES,
  })
);
