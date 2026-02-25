/**
 * Dashboard Metrics — Query performance tracking
 * Sprint 4: Circular buffer for last 1000 queries, minimal overhead
 */

export type QueryParams = {
  from?: string;
  to?: string;
  groupBy?: string;
  sortBy?: string;
  limit?: number;
  offset?: number;
};

export type QueryMetric = {
  timestamp: string;
  durationMs: number;
  params: QueryParams;
  resultCount: number;
  error?: string;
};

const BUFFER_SIZE = 1000;

class MetricsCollector {
  private buffer: QueryMetric[] = [];
  private head = 0;
  private count = 0;
  private concurrentQueries = 0;

  record(params: QueryParams, durationMs: number, resultCount: number, error?: string): void {
    const entry: QueryMetric = {
      timestamp: new Date().toISOString(),
      durationMs,
      params: { ...params },
      resultCount,
      error,
    };
    if (this.count < BUFFER_SIZE) {
      this.buffer.push(entry);
      this.count++;
    } else {
      this.buffer[this.head] = entry;
      this.head = (this.head + 1) % BUFFER_SIZE;
    }
  }

  startQuery(): void {
    this.concurrentQueries++;
  }

  endQuery(): void {
    this.concurrentQueries = Math.max(0, this.concurrentQueries - 1);
  }

  getMetrics(): {
    queries: QueryMetric[];
    totalQueries: number;
    concurrentQueries: number;
    last100: QueryMetric[];
  } {
    const ordered = [...this.buffer].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return {
      queries: ordered,
      totalQueries: this.count,
      concurrentQueries: this.concurrentQueries,
      last100: ordered.slice(0, 100),
    };
  }

  /** Reset for tests */
  reset(): void {
    this.buffer = [];
    this.head = 0;
    this.count = 0;
    this.concurrentQueries = 0;
  }
}

const collector = new MetricsCollector();

/** Record a completed query. Call from API layer after getReport. */
export function recordQuery(
  params: QueryParams,
  durationMs: number,
  resultCount: number,
  error?: string
): void {
  collector.record(params, durationMs, resultCount, error);
}

/** Mark query start (for concurrent count). */
export function startQuery(): void {
  collector.startQuery();
}

/** Mark query end (for concurrent count). */
export function endQuery(): void {
  collector.endQuery();
}

/** Get metrics for dashboard. */
export function getMetrics(): ReturnType<MetricsCollector['getMetrics']> {
  return collector.getMetrics();
}

/** Reset metrics (for tests only). */
export function resetMetrics(): void {
  collector.reset();
}
