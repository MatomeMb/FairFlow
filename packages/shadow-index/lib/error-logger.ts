/**
 * Error Logger — Query errors with alert thresholds
 * Sprint 4: Error rate > 5%, query time > 1s
 */

export type ErrorLogEntry = {
  timestamp: string;
  params: Record<string, unknown>;
  message: string;
  stack?: string;
};

const MAX_ENTRIES = 1000;
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24h
const ALERT_ERROR_RATE = 0.05;
const ALERT_QUERY_TIME_MS = 1000;

const entries: ErrorLogEntry[] = [];

function pruneOld(): void {
  const cutoff = Date.now() - WINDOW_MS;
  while (entries.length > 0 && new Date(entries[0].timestamp).getTime() < cutoff) {
    entries.shift();
  }
  while (entries.length > MAX_ENTRIES) {
    entries.shift();
  }
}

/** Log a query error. */
export function logError(params: Record<string, unknown>, message: string, stack?: string): void {
  const entry: ErrorLogEntry = {
    timestamp: new Date().toISOString(),
    params: { ...params },
    message,
    stack,
  };
  entries.push(entry);
  pruneOld();
}

/** Get errors from last 24h. */
export function getErrors24h(): ErrorLogEntry[] {
  pruneOld();
  return [...entries];
}

export type AlertStatus = {
  errorRateAlert: boolean;
  slowQueryAlert: boolean;
  errorRate: number;
  slowQueryCount: number;
  totalQueries: number;
  errorCount: number;
};

/** Compute alert status from metrics. */
export function getAlertStatus(
  totalQueries: number,
  errorCount: number,
  slowQueryCount: number
): AlertStatus {
  const errorRate = totalQueries > 0 ? errorCount / totalQueries : 0;
  return {
    errorRateAlert: errorRate > ALERT_ERROR_RATE,
    slowQueryAlert: slowQueryCount > 0,
    errorRate,
    slowQueryCount,
    totalQueries,
    errorCount,
  };
}

/** Alert thresholds (for dashboard display). */
export const ALERT_THRESHOLDS = {
  errorRate: ALERT_ERROR_RATE,
  queryTimeMs: ALERT_QUERY_TIME_MS,
};

/** Reset for tests. */
export function resetErrorLogger(): void {
  entries.length = 0;
}
