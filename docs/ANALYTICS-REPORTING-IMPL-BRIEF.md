# Analytics Reporting Engine — Implementation Brief

**Document:** Implementation Brief  
**Date:** February 2026  
**Author:** CTO / Lead Engineer  
**Purpose:** Engineer-friendly roadmap for GET /v1/analytics/report

---

## Quick Reference

**Full spec:** [ANALYTICS-REPORTING-ENGINE-SPEC.md](./ANALYTICS-REPORTING-ENGINE-SPEC.md)

**Query parameters:** `from`, `to` (required), `groupBy` (day | hash | both), `sortBy`, `limit`, `offset`  
**Response:** `{ ok, groupBy, from, to, rows, summary }`  
**Event source:** `data/events/YYYY-MM-DD.jsonl`

---

## 4-Phase Execution Plan

### Day 1: Aggregation Logic

- [ ] Create `lib/analytics.ts` (or `api/analytics.ts`)
- [ ] `listEventFiles(from, to)` — return paths for date range
- [ ] `aggregateEvents(files, groupBy)` — parse JSONL, count views/clicks
- [ ] Unit test: empty range → `{ rows: [], summary: { totalViews: 0, totalClicks: 0 } }`
- [ ] Unit test: single file with 3 views, 1 click → correct counts

**Definition of Done:** Aggregation returns correct counts for day, hash, both modes.

### Day 2: API Route

- [ ] Add `GET /v1/analytics/report` to `api/index.ts`
- [ ] Zod schema for query params
- [ ] Call `getReport(from, to, groupBy, sortBy, limit, offset)`
- [ ] Return 400 on invalid params (missing from/to, from > to)
- [ ] Return 500 on file read failure

**Definition of Done:** Endpoint returns 200 with valid params; 400/500 on errors.

### Day 3: Pagination & Sorting

- [ ] Implement `sortBy` (date, views, clicks)
- [ ] Implement `limit` and `offset` for groupBy=hash
- [ ] Integration test: POST events → GET report → assert response shape

**Definition of Done:** All query params respected; integration test passes.

### Day 4: Tests & Performance

- [ ] Seed 1000 events across 30 days
- [ ] Benchmark: 90-day query < 500ms
- [ ] Add `analytics-report.test.ts` with 15+ scenarios from spec
- [ ] Malformed JSON line handling (skip, don't crash)

**Definition of Done:** All tests pass; performance target met.

### Day 5: Docs & Sign-off

- [ ] Update FEBRUARY-21-ANALYSIS.md with report endpoint
- [ ] Update Sprint 3 plan status
- [ ] Code review completed
- [ ] Tag v0.6.0 when Sprint 3 complete

---

## Testing Strategy

| Type | Scope |
|------|-------|
| **Unit** | `aggregateEvents` with mocked file contents |
| **Integration** | POST events → GET report → assert rows and summary |
| **Performance** | 90-day range, ~10k events, < 500ms |
| **Error** | Invalid params → 400; missing files → empty result |

---

## Sign-off Checklist

- [ ] GET /v1/analytics/report returns 200 with valid params
- [ ] groupBy=day, hash, both implemented
- [ ] Query params validated; 400 on invalid
- [ ] Vitest tests pass (unit + integration)
- [ ] Performance benchmark < 500ms
- [ ] Docs updated
- [ ] Code reviewed

---

**Reference:** [13-SPRINT-3-PLAN.md](./13-SPRINT-3-PLAN.md) Phase 3 (Feb 27 – Mar 2)
