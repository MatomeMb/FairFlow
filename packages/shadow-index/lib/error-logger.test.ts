/**
 * Error logger — unit tests
 */
import {
  logError,
  getErrors24h,
  getAlertStatus,
  resetErrorLogger,
  ALERT_THRESHOLDS,
} from './error-logger.js';

beforeEach(() => {
  resetErrorLogger();
});

describe('logError', () => {
  it('logs error and returns in getErrors24h', () => {
    logError({ from: 'invalid', to: '2026-02-23' }, 'invalid from');
    const errs = getErrors24h();
    expect(errs).toHaveLength(1);
    expect(errs[0].message).toBe('invalid from');
    expect(errs[0].params).toEqual({ from: 'invalid', to: '2026-02-23' });
    expect(errs[0].timestamp).toBeDefined();
  });

  it('includes stack when provided', () => {
    logError({}, 'oops', 'Error: oops\n  at fn (file.ts:1:1)');
    const errs = getErrors24h();
    expect(errs[0].stack).toContain('at fn');
  });
});

describe('getAlertStatus', () => {
  it('no alert when error rate below threshold', () => {
    const s = getAlertStatus(100, 2, 0);
    expect(s.errorRateAlert).toBe(false);
    expect(s.errorRate).toBe(0.02);
    expect(s.slowQueryAlert).toBe(false);
  });

  it('error rate alert when above 5%', () => {
    const s = getAlertStatus(100, 10, 0);
    expect(s.errorRateAlert).toBe(true);
    expect(s.errorRate).toBe(0.1);
  });

  it('slow query alert when slow count > 0', () => {
    const s = getAlertStatus(100, 0, 3);
    expect(s.slowQueryAlert).toBe(true);
    expect(s.slowQueryCount).toBe(3);
  });
});

describe('ALERT_THRESHOLDS', () => {
  it('defines expected thresholds', () => {
    expect(ALERT_THRESHOLDS.errorRate).toBe(0.05);
    expect(ALERT_THRESHOLDS.queryTimeMs).toBe(1000);
  });
});
