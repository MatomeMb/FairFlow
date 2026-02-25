/**
 * Query Cache — Sprint 4 Week 3 (T3.1) unit tests
 */
import {
  buildCacheKey,
  getCached,
  setCached,
  invalidateCache,
  getCacheStats,
  resetCacheForTesting,
} from './query-cache.js';
import type { ReportResult } from './analytics-report.js';

describe('query-cache', () => {
  const sampleResult: ReportResult = {
    ok: true,
    groupBy: 'day',
    from: '2026-02-21',
    to: '2026-02-23',
    rows: [{ date: '2026-02-21', views: 5, clicks: 2 }],
    summary: { totalViews: 10, totalClicks: 4 },
  };

  beforeEach(() => {
    resetCacheForTesting();
  });

  describe('buildCacheKey', () => {
    it('produces deterministic key from params', () => {
      const key1 = buildCacheKey({
        from: '2026-02-21',
        to: '2026-02-23',
        groupBy: 'day',
        sortBy: 'date',
        limit: 100,
        offset: 0,
      });
      const key2 = buildCacheKey({
        from: '2026-02-21',
        to: '2026-02-23',
        groupBy: 'day',
        sortBy: 'date',
        limit: 100,
        offset: 0,
      });
      expect(key1).toBe(key2);
    });

    it('different params produce different keys', () => {
      const key1 = buildCacheKey({
        from: '2026-02-21',
        to: '2026-02-23',
        groupBy: 'day',
        sortBy: 'date',
        limit: 100,
        offset: 0,
      });
      const key2 = buildCacheKey({
        from: '2026-02-21',
        to: '2026-02-24',
        groupBy: 'day',
        sortBy: 'date',
        limit: 100,
        offset: 0,
      });
      expect(key1).not.toBe(key2);
    });
  });

  describe('getCached / setCached', () => {
    it('returns null on miss', () => {
      const key = buildCacheKey({
        from: '2026-02-21',
        to: '2026-02-23',
        groupBy: 'day',
        sortBy: 'date',
        limit: 100,
        offset: 0,
      });
      expect(getCached(key)).toBeNull();
    });

    it('returns cached result on hit', () => {
      const key = buildCacheKey({
        from: '2026-02-21',
        to: '2026-02-23',
        groupBy: 'day',
        sortBy: 'date',
        limit: 100,
        offset: 0,
      });
      setCached(key, sampleResult);
      const cached = getCached(key);
      expect(cached).not.toBeNull();
      expect(cached?.ok).toBe(true);
      expect(cached?.rows).toEqual(sampleResult.rows);
    });

    it('does not cache error results', () => {
      const key = 'error-key';
      const errResult: ReportResult = {
        ok: false,
        groupBy: 'day',
        from: '2026-02-21',
        to: '2026-02-23',
        rows: [],
        summary: { totalViews: 0, totalClicks: 0 },
        error: 'invalid from',
      };
      setCached(key, errResult);
      expect(getCached(key)).toBeNull();
    });
  });

  describe('invalidateCache', () => {
    it('clears cache', () => {
      const key = buildCacheKey({
        from: '2026-02-21',
        to: '2026-02-23',
        groupBy: 'day',
        sortBy: 'date',
        limit: 100,
        offset: 0,
      });
      setCached(key, sampleResult);
      expect(getCached(key)).not.toBeNull();
      invalidateCache();
      expect(getCached(key)).toBeNull();
    });
  });

  describe('getCacheStats', () => {
    it('tracks hits and misses', () => {
      const key = buildCacheKey({
        from: '2026-02-21',
        to: '2026-02-23',
        groupBy: 'day',
        sortBy: 'date',
        limit: 100,
        offset: 0,
      });
      getCached(key);
      getCached(key);
      setCached(key, sampleResult);
      getCached(key);
      getCached(key);
      const stats = getCacheStats();
      expect(stats.misses).toBe(2);
      expect(stats.hits).toBe(2);
      expect(stats.hitRate).toBe(0.5);
    });
  });
});
