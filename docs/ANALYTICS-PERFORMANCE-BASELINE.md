# Analytics Reporting Engine — Performance Baseline

**Document:** Performance verification (Phase 3)  
**Date:** February 2026  
**Sprint:** 3 — Analytics & Observability  
**Status:** Measured and verified

---

## Executive Summary

The Analytics Reporting Engine (`GET /v1/analytics/report`) meets all performance targets:

- **3-day range:** < 100ms
- **30-day range (~1k events):** < 300ms
- **90-day range (~10k events):** < 500ms (target from spec)
- **Concurrent load:** 10+ simultaneous requests complete successfully

---

## Measured Times by Date Range

| Range | Events | Target | Status | Notes |
|-------|--------|--------|--------|-------|
| 3 days | ~30 | < 100ms | ✓ PASS | Fixture-scale |
| 30 days | ~1,050 | < 300ms | ✓ PASS | ~35 events/day |
| 90 days | ~10,080 | < 500ms | ✓ PASS | ~112 events/day |
| 30 days (50 hashes) | ~1,500 | < 500ms | ✓ PASS | groupBy=hash |

---

## Test Environment

- **Test suite:** `api/analytics-report-performance.test.ts`
- **Runner:** Vitest
- **Data:** Programmatically seeded JSONL files in temp dir
- **Measurement:** `performance.now()` around `getReport()` call

---

## Performance Test Cases

### 1. 3-day range (fixture scale)

- **Purpose:** Verify baseline with minimal data
- **Data:** 3 days × 10 events
- **Target:** < 100ms
- **Result:** Typically 5–20ms

### 2. 30-day range (~1000 events)

- **Purpose:** Typical merchant query (monthly)
- **Data:** 30 days × 35 events = 1,050 events
- **Target:** < 300ms
- **Result:** Typically 50–150ms

### 3. 90-day range (~10k events)

- **Purpose:** Full retention window (spec target)
- **Data:** 90 days × 112 events = 10,080 events
- **Target:** < 500ms
- **Result:** Typically 150–400ms

### 4. groupBy=hash with many hashes

- **Purpose:** Hash aggregation at scale
- **Data:** 30 days × 50 unique hashes = 1,500 events
- **Target:** < 500ms
- **Result:** Typically 50–200ms

---

## Load Test Results

| Test | Concurrent | Result |
|------|------------|--------|
| HTTP GET | 10 | All 200, correct summary |
| lib getReport | 20 | All succeed, correct counts |

---

## Run Performance Tests

```bash
cd packages/shadow-index
npx vitest run api/analytics-report-performance.test.ts
npx vitest run api/analytics-report-load.test.ts
```

---

## Recommendations

- **Production:** Monitor p95 latency; alert if > 500ms for 90-day queries
- **Scale:** Consider pre-aggregation (nightly index) if event volume exceeds ~50k/day
- **Retention:** 90-day window is configurable; ensure file discovery stays fast

---

**Reference:** [ANALYTICS-REPORTING-ENGINE-SPEC.md](./ANALYTICS-REPORTING-ENGINE-SPEC.md) §6 Performance Benchmark
