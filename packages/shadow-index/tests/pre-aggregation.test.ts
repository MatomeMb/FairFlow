/**
 * Pre-Aggregation — Sprint 4 Week 3 (T3.2) unit tests
 */
import path from 'path';
import { promises as fs } from 'fs';
import {
  runAggregationForDate,
  runAggregationForDateRange,
  loadAggregate,
  hasAggregate,
  getAggregatePath,
  getPreAggregationStatus,
} from '../lib/pre-aggregation.js';

const FIXTURES_DIR = path.join(__dirname, '../../..', 'test_data', 'events');

describe('pre-aggregation', () => {
  const tmpDir = path.join(__dirname, '../../..', 'test_data', 'events');
  const aggregatesDir = path.join(tmpDir, '..', 'aggregates-tmp');

  beforeEach(async () => {
    await fs.mkdir(aggregatesDir, { recursive: true }).catch(() => {});
  });

  afterEach(async () => {
    try {
      const entries = await fs.readdir(aggregatesDir);
      for (const name of entries) {
        await fs.unlink(path.join(aggregatesDir, name)).catch(() => {});
      }
      await fs.rmdir(aggregatesDir).catch(() => {});
    } catch {
      // ignore
    }
  });

  describe('runAggregationForDate', () => {
    it('aggregates events and writes JSON', async () => {
      const result = await runAggregationForDate(FIXTURES_DIR, aggregatesDir, '2026-02-21');
      expect(result.ok).toBe(true);

      const exists = await hasAggregate(aggregatesDir, '2026-02-21');
      expect(exists).toBe(true);

      const loaded = await loadAggregate(aggregatesDir, '2026-02-21');
      expect(loaded).not.toBeNull();
      expect(loaded!.byDate.get('2026-02-21')).toEqual({ views: 5, clicks: 2 });
    });

    it('returns error for missing event file', async () => {
      const result = await runAggregationForDate(FIXTURES_DIR, aggregatesDir, '1999-01-01');
      expect(result.ok).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('runAggregationForDateRange', () => {
    it('processes multiple days', async () => {
      const { processed, errors } = await runAggregationForDateRange(
        FIXTURES_DIR,
        aggregatesDir,
        '2026-02-21',
        '2026-02-23'
      );
      expect(processed).toBe(3);
      expect(errors).toHaveLength(0);
    });
  });

  describe('loadAggregate', () => {
    it('returns null for missing aggregate', async () => {
      const loaded = await loadAggregate(aggregatesDir, '2099-12-31');
      expect(loaded).toBeNull();
    });
  });

  describe('getPreAggregationStatus', () => {
    it('returns disabled when dir does not exist', async () => {
      const status = await getPreAggregationStatus('/nonexistent/aggregates');
      expect(status.enabled).toBe(false);
    });

    it('returns file count when aggregates exist', async () => {
      await runAggregationForDate(FIXTURES_DIR, aggregatesDir, '2026-02-21');
      const status = await getPreAggregationStatus(aggregatesDir);
      expect(status.enabled).toBe(true);
      expect(status.fileCount).toBeGreaterThanOrEqual(1);
    });
  });
});
