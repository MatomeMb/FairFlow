# Sprint 4 Week 2 — Implementation Review

**Date:** February 10, 2026  
**Status:** Reviewed and completed  

---

## Summary

Sprint 4 Week 2 deliverables (retention policy, storage monitoring, dashboard integration) were partially implemented. This review identified gaps, completed the missing integrations, and verified all tests pass.

---

## Original Implementation (Pre-Review)

### Implemented
| Component | Status | Notes |
|-----------|--------|-------|
| `lib/retention-policy.ts` | Done | 90-day retention, moves files to archive |
| `lib/storage-monitor.ts` | Done | Recursive dir size, quota comparison |
| `tests/retention.test.ts` | Done | 1 test |
| `tests/storage.test.ts` | Done | 2 tests |

### Gaps Identified
| Component | Claimed | Actual |
|-----------|---------|--------|
| `POST /v1/admin/retention/run` | Yes | Not in index.ts |
| Storage & Quota in dashboard | Yes | Not in dashboard.ts |
| "Run Retention Cleanup" button | Yes | Not in dashboard.ts |
| mtime cache in analytics-report | Yes | Not implemented (Week 3 scope) |

---

## Corrections Applied

1. **Retention route** — Added `POST /v1/admin/retention/run` to `api/index.ts`
   - Uses `RetentionPolicy` with configurable `RETENTION_DAYS` (default 90)
   - Archives to `data/archive`
   - Redirects to dashboard when `Accept: text/html` (form submission)

2. **Dashboard integration** — Updated `api/dashboard.ts`
   - Added `StorageMonitor` for events + things directories
   - Storage & Quota section with progress bar and usage breakdown
   - "Run Retention Cleanup" button (form POST)
   - Config passed from index (eventsDir, dataRoot, quotaBytes)

3. **Retention date parsing** — Fixed timezone consistency in `retention-policy.ts`
   - Uses `dateStr + 'T00:00:00Z'` for UTC alignment

4. **Cleanup** — Removed `test.minimal.js`, `test.minimal.ts` (debug leftovers)

---

## Scope Note: Analytics Cache

The implementation summary claimed "mtime-based in-memory cache" in analytics-report. Per Sprint 4 plan:
- **Week 2** = Retention, storage monitoring, optimization *prep*
- **Week 3** = Query caching, pre-aggregation

The cache is deferred to Week 3 (T3.1). No cache was added in this review.

---

## Test Results

**69 tests passing** across 8 suites:
- lib/error-logger, dashboard-metrics
- lib tests: retention, storage
- api: analytics-report, analytics, dashboard, index

---

## Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `RETENTION_DAYS` | 90 | Days to retain before archiving |
| `STORAGE_QUOTA_BYTES` | 5GB | Quota for usage display |
| `ANALYTICS_EVENTS_DIR` | data/events | Override events path |

---

*Review completed: Feb 10, 2026*
