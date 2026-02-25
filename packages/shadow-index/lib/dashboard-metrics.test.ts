/**
 * Dashboard metrics — unit tests
 */
import {
  recordQuery,
  startQuery,
  endQuery,
  getMetrics,
  resetMetrics,
} from './dashboard-metrics.js';

beforeEach(() => {
  resetMetrics();
});

describe('recordQuery', () => {
  it('records query and returns in getMetrics', () => {
    recordQuery({ from: '2026-02-21', to: '2026-02-23' }, 45, 3);
    const m = getMetrics();
    expect(m.totalQueries).toBe(1);
    expect(m.last100).toHaveLength(1);
    expect(m.last100[0].durationMs).toBe(45);
    expect(m.last100[0].resultCount).toBe(3);
    expect(m.last100[0].params.from).toBe('2026-02-21');
    expect(m.last100[0].error).toBeUndefined();
  });

  it('records error queries', () => {
    recordQuery({ from: 'invalid', to: '2026-02-23' }, 2, 0, 'invalid from');
    const m = getMetrics();
    expect(m.last100[0].error).toBe('invalid from');
    expect(m.last100[0].resultCount).toBe(0);
  });

  it('circular buffer caps at 1000', () => {
    for (let i = 0; i < 1005; i++) {
      recordQuery({ from: '2026-02-21', to: '2026-02-23' }, i, 1);
    }
    const m = getMetrics();
    expect(m.totalQueries).toBe(1000);
    expect(m.queries).toHaveLength(1000);
  });
});

describe('concurrent queries', () => {
  it('tracks concurrent query count', () => {
    expect(getMetrics().concurrentQueries).toBe(0);
    startQuery();
    startQuery();
    expect(getMetrics().concurrentQueries).toBe(2);
    endQuery();
    expect(getMetrics().concurrentQueries).toBe(1);
    endQuery();
    expect(getMetrics().concurrentQueries).toBe(0);
  });

  it('endQuery does not go below zero', () => {
    endQuery();
    endQuery();
    expect(getMetrics().concurrentQueries).toBe(0);
  });
});
