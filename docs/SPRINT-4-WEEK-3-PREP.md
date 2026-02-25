# Sprint 4 Week 3 — Preparation Document

**Sprint:** Sprint 4 (February 10–March 10, 2026)  
**Week:** Week 3 (Feb 24–Mar 2, 2026)  
**Focus:** Performance Optimization — Caching, Pre-Aggregation, Stream I/O  
**Document Type:** Preparation & Implementation Guide  
**Status:** Ready for execution

---

## Executive Summary

Week 3 accelerates the analytics reporting pipeline through three targeted optimizations: query result caching, nightly pre-aggregation, and streaming JSONL parse. Together these changes target sub-250ms p95 for 90-day queries (from ~387ms baseline) and a cache hit rate exceeding 60%.

---

## Prerequisites

Before starting Week 3 tasks, ensure:

| Prerequisite | Status | Reference |
|--------------|--------|-----------|
| Analytics reporting engine operational | Required | `lib/analytics-report.ts`, `GET /v1/analytics/report` |
| Dashboard and metrics collection live | Required | `lib/dashboard-metrics.ts`, `api/dashboard.ts` |
| Retention policy implemented | Required | `lib/retention-policy.ts`, `POST /v1/admin/retention/run` |
| Storage monitoring integrated | Required | `lib/storage-monitor.ts` |
| Week 2 optimization prep complete | Recommended | Bottleneck analysis, caching design documented |
| All 69+ tests passing | Required | `npx vitest run` |

**Environment variables in use:**
- `ANALYTICS_EVENTS_DIR` — Events directory (default: `data/events`)
- `RETENTION_DAYS` — Retention window (default: 90)

---

## Performance Targets

| Metric | Current Baseline | Week 3 Target |
|--------|------------------|---------------|
| 90-day query p95 | ~387ms | < 250ms |
| Cache hit rate | N/A | > 60% |
| Cache memory | N/A | < 50MB (configurable) |
| Concurrent queries | 20+ | 50+ |
| Memory usage (peak) | ~287MB | < 320MB (with cache) |

---

## Task 3.1 — Query Result Caching (6h)

### Objective

Implement an in-memory cache for `GET /v1/analytics/report` responses to reduce repeat-query latency and system load.

### Implementation Notes

**Cache key construction:**
- Combine `from`, `to`, `groupBy`, `sortBy`, `limit`, `offset` into a deterministic string.
- Use stable serialization (e.g. `JSON.stringify` of sorted keys) to avoid false misses.
- Example: `cacheKey = sha256(JSON.stringify({ from, to, groupBy, sortBy, limit, offset }))` or simpler: `from|to|groupBy|sortBy|limit|offset`.

**TTL (Time To Live):**
- Default: 1 hour (3600 seconds).
- Configurable via `CACHE_TTL_SECONDS`.
- Evict entries on TTL expiry; no proactive refresh.

**Eviction:**
- LRU (Least Recently Used) when max size exceeded.
- Max entries or max bytes; recommend `CACHE_MAX_ENTRIES` (default 512) or `CACHE_MAX_MBYTES` (default 50).

**Cache invalidation:**
- On new event ingestion (`POST /v1/analytics/event`): invalidate entire cache or date-specific keys.
- Optional: manual invalidation via `POST /v1/admin/cache/clear` (admin only).

**Integration:**
- Wrap `getReport()` in the API layer: check cache before call, store result on miss.
- Do not cache error responses (4xx/5xx).

### Acceptance Criteria

- [ ] Cache key derived from `from`, `to`, `groupBy`, `sortBy`, `limit`, `offset`
- [ ] TTL configurable; default 1 hour
- [ ] LRU eviction when max size (50MB or 512 entries) reached
- [ ] Cache hit rate > 60% under typical workload (verify with load test)
- [ ] Cache invalidated on event ingestion
- [ ] Cache stats exposed via dashboard (hit rate, size, evictions)

### Deliverables

| Artifact | Location | Description |
|----------|-----------|-------------|
| `lib/query-cache.ts` | `packages/shadow-index/lib/` | LRU cache implementation (~150 lines) |
| `lib/cache-config.ts` | `packages/shadow-index/lib/` | Config (TTL, max size) (~40 lines) |
| `api/index.ts` | Modify | Cache check/store around `getReport` |
| `api/dashboard.ts` | Modify | Cache stats section |
| `api/analytics.test.ts` | Modify | Cache hit/miss tests |

### Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `CACHE_TTL_SECONDS` | 3600 | Cache entry TTL |
| `CACHE_MAX_ENTRIES` | 512 | Max cached reports |
| `CACHE_MAX_MBYTES` | 50 | Max memory (approx) |
| `CACHE_ENABLED` | true | Toggle cache on/off |

---

## Task 3.2 — Daily Pre-Aggregation (4h)

### Objective

Run a nightly rollup job that pre-aggregates event data by day, reducing query-time I/O for long date ranges.

### Implementation Notes

**Nightly rollup:**
- Schedule: 00:00 UTC daily (cron or first-query-of-day trigger).
- For each completed day (e.g. yesterday): read `YYYY-MM-DD.jsonl`, compute `{ byDate, byHash, byBoth }`, write to `data/aggregates/YYYY-MM-DD.json`.
- Reuse `aggregateFile()` logic from `lib/analytics-report.ts`.

**Pre-aggregation schema:**
- Store per-day summaries: `{ date, byHash: { [hash]: { views, clicks } }, totals: { views, clicks } }`.
- One file per day: `data/aggregates/YYYY-MM-DD.json`.
- Or single append-only file: `data/aggregates/daily.jsonl` with one line per day.

**Query engine integration:**
- In `getReport()`: for date ranges fully covered by aggregates, read pre-aggregated files instead of raw JSONL.
- For ranges spanning today (incomplete): use raw JSONL for today, aggregates for past days.
- Transparent fallback: if aggregate missing, use raw JSONL.

**Job execution:**
- Option A: Cron/scheduled task (if available).
- Option B: On first report query of the day, check if yesterday’s aggregate exists; if not, run rollup.
- Option C: Standalone script `scripts/run-pre-aggregation.mjs` invoked by external scheduler.

### Acceptance Criteria

- [ ] Nightly rollup runs at 00:00 UTC (or equivalent trigger)
- [ ] Pre-aggregated data stored in `data/aggregates/` (per-day JSON or JSONL)
- [ ] Query engine uses aggregates when beneficial (e.g. ranges > 7 days)
- [ ] Queries using aggregates achieve measurable speedup (e.g. 10x for 90-day)
- [ ] Pre-aggregation job logging and metrics exposed
- [ ] Graceful fallback to raw JSONL if aggregate missing

### Deliverables

| Artifact | Location | Description |
|----------|-----------|-------------|
| `lib/pre-aggregation.ts` | `packages/shadow-index/lib/` | Rollup logic (~180 lines) |
| `scripts/run-pre-aggregation.mjs` | `packages/shadow-index/scripts/` | CLI for external scheduler |
| `lib/analytics-report.ts` | Modify | Read aggregates when available |
| `api/dashboard.ts` | Modify | Pre-aggregation status (last run, file count) |
| `tests/pre-aggregation.test.ts` | New | Unit tests for rollup |

### Prerequisites for Pre-Aggregation

- `data/aggregates/` directory created
- Events directory readable
- No retention policy moving files before rollup (or rollup runs before retention)

---

## Task 3.3 — Stream I/O Optimization (2h)

### Objective

Replace full-file buffered read with streaming JSONL parse to reduce memory and improve scalability for large event files.

### Implementation Notes

**Current behavior (in `aggregateFile()`):**
- `fs.readFile(filePath, 'utf8')` loads entire file into memory.
- `content.split(/\r?\n/).filter(Boolean)` creates full array of lines.
- For large files (e.g. 50k+ events/day), this spikes memory.

**Streaming approach:**
- Use `fs.createReadStream(filePath, { encoding: 'utf8' })`.
- Use `readline` (Node built-in) or `stream.Readable` with line-by-line parsing.
- Parse each line as JSON; reject malformed lines.
- Aggregate incrementally (same `incMap` logic). No full-content buffer.

**Concurrency:**
- Keep `Promise.all(files.map(aggregateFile))` for parallel file processing.
- Streaming reduces per-file memory; more concurrent reads possible without OOM.

**Fallback:**
- Retain buffered path for very small files if desired; streaming is preferred for consistency.

### Acceptance Criteria

- [ ] `aggregateFile()` uses `createReadStream` + line-by-line parse (no full `readFile`)
- [ ] Memory footprint per file reduced (no full content in memory)
- [ ] All existing tests pass (results unchanged)
- [ ] Performance test: 90-day query time ≤ current baseline or better
- [ ] Malformed lines skipped without crashing

### Deliverables

| Artifact | Location | Description |
|----------|-----------|-------------|
| `lib/analytics-report.ts` | Modify | `aggregateFile()` refactor (~20 line changes) |
| `api/analytics-report-performance.test.ts` | Verify | Performance regression check |

### Code Reference

**Current snippet (lines 108–116 in `lib/analytics-report.ts`):**
```typescript
let content: string;
try {
  content = await fs.readFile(filePath, 'utf8');
} catch { ... }
const lines = content.split(/\r?\n/).filter(Boolean);
for (const line of lines) { ... }
```

**Target:** Replace with `createReadStream` + `readline` or equivalent streaming parser.

---

## Execution Order

Recommended sequence:

1. **T3.3 first (2h)** — Stream I/O optimization. Low risk, validates pipeline before caching.
2. **T3.1 second (6h)** — Query caching. Highest impact; depends on stable `getReport()` behavior.
3. **T3.2 last (4h)** — Pre-aggregation. Depends on correct streaming/aggregation; rollup reuses same logic.

**Total estimated effort:** 12 hours

---

## Verification Commands

```bash
# Run full test suite
cd packages/shadow-index && npx vitest run

# Performance baseline (90-day)
npx vitest run api/analytics-report-performance.test.ts

# Load test (concurrent queries)
npx vitest run api/analytics-report-load.test.ts

# Manual cache hit rate check (after T3.1)
# Repeated identical queries should hit cache; verify via dashboard stats
```

---

## References

- [14-SPRINT-4-PLAN.md](./14-SPRINT-4-PLAN.md) — Full Sprint 4 scope
- [SPRINT-4-WEEK-2-REVIEW.md](../packages/shadow-index/docs/SPRINT-4-WEEK-2-REVIEW.md) — Week 2 completion
- [ANALYTICS-PERFORMANCE-BASELINE.md](../../asu/docs/ANALYTICS-PERFORMANCE-BASELINE.md) — Current performance metrics
- [PHASE-4-OPTIMIZATION-PLAN.md](../../pfa/docs/PHASE-4-OPTIMIZATION-PLAN.md) — Phase 4 context

---

**Document Version:** 1.0  
**Last Updated:** February 10, 2026  
**Next Review:** End of Week 3 (Mar 2, 2026)
