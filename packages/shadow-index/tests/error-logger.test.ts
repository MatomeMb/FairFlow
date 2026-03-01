import { describe, it, expect, beforeEach } from 'vitest';
import {
  logError,
  getErrors24h,
  getAlertStatus,
  resetErrorLogger,
  ALERT_THRESHOLDS,
} from '../lib/error-logger.js';

describe('error-logger', () => {
  beforeEach(() => {
    resetErrorLogger();
  });

  it('logs an error entry with correct fields', () => {
    logError({ from: '2024-01-01', to: '2024-01-02' }, 'test error');
    const entries = getErrors24h();
    expect(entries).toHaveLength(1);
    expect(entries[0].message).toBe('test error');
    expect(entries[0].params).toEqual({ from: '2024-01-01', to: '2024-01-02' });
    expect(entries[0].timestamp).toBeDefined();
  });

  it('includes optional stack trace', () => {
    logError({}, 'with stack', 'Error: stack trace here');
    const entries = getErrors24h();
    expect(entries[0].stack).toBe('Error: stack trace here');
  });

  it('prunes entries beyond max', () => {
    for (let i = 0; i < 1050; i++) {
      logError({}, `error ${i}`);
    }
    const entries = getErrors24h();
    expect(entries.length).toBeLessThanOrEqual(1000);
  });

  it('getAlertStatus reports no alerts when error rate is low', () => {
    const status = getAlertStatus(1000, 10, 0);
    expect(status.errorRateAlert).toBe(false);
    expect(status.slowQueryAlert).toBe(false);
    expect(status.errorRate).toBeCloseTo(0.01);
  });

  it('getAlertStatus triggers error rate alert above threshold', () => {
    const status = getAlertStatus(100, 10, 0);
    expect(status.errorRateAlert).toBe(true);
    expect(status.errorRate).toBeCloseTo(0.1);
  });

  it('getAlertStatus triggers slow query alert when count > 0', () => {
    const status = getAlertStatus(100, 0, 5);
    expect(status.slowQueryAlert).toBe(true);
    expect(status.slowQueryCount).toBe(5);
  });

  it('exposes alert thresholds', () => {
    expect(ALERT_THRESHOLDS.errorRate).toBe(0.05);
    expect(ALERT_THRESHOLDS.queryTimeMs).toBe(1000);
  });
});
