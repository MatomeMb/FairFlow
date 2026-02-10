# Analytics Reporting Engine — Technical Specification

**Document:** Analytics Reporting Engine Spec  
**Version:** 1.0  
**Date:** February 2026  
**Author:** CTO / Lead Engineer  
**Status:** Approved for Sprint 3 Phase 3 (Feb 27 – Mar 2)

---

## 1. Executive Summary

### Business Context

The **Analytics Reporting Engine** enables merchants and stakeholders to quantify matter:// engagement. After capturing view and click events (MVP-14 ingestion layer, implemented Feb 21), we need a queryable API to aggregate and report on this data.

### Goals

- **Merchant visibility:** Daily counts of views and clicks by hash and by date
- **Conversion tracking:** Prove the conversion loop (view → click) before beta merchant onboarding
- **Lightweight:** Query JSONL files without a database; sub-500ms for 90-day ranges

---

## 2. Technical Context

### Event Source

- **Location:** `packages/shadow-index/data/events/YYYY-MM-DD.jsonl`
- **Format:** One JSON object per line (NDJSON)
- **Fields:** `event`, `hash`, `timestamp`, `source_url`, `target_action?` (for click)
- **Reference:** [MVP-14-EVENT-SPEC-AND-STORAGE.md](./MVP-14-EVENT-SPEC-AND-STORAGE.md)

### Framework

- **API:** Hono (Node.js)
- **Validation:** Zod
- **Storage:** File system (fs.promises)

### Constraints

- No external DB; JSONL only
- Memory budget: avoid loading entire file into memory for large ranges
- Retention: 90 days; ignore files outside date range

---

## 3. API Specification

### Endpoint

```
GET /v1/analytics/report
```

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `from` | string (YYYY-MM-DD) | yes | — | Start date (inclusive) |
| `to` | string (YYYY-MM-DD) | yes | — | End date (inclusive) |
| `groupBy` | string | no | `day` | `day` \| `hash` \| `both` |
| `sortBy` | string | no | `date` | `date` \| `views` \| `clicks` |
| `limit` | number | no | 100 | Max rows (hash mode) |
| `offset` | number | no | 0 | Pagination offset |

### Response Formats

#### groupBy=day (time-series)

```json
{
  "ok": true,
  "groupBy": "day",
  "from": "2026-02-20",
  "to": "2026-02-25",
  "rows": [
    { "date": "2026-02-20", "views": 42, "clicks": 8 },
    { "date": "2026-02-21", "views": 15, "clicks": 3 }
  ],
  "summary": { "totalViews": 57, "totalClicks": 11 }
}
```

#### groupBy=hash (top hashes)

```json
{
  "ok": true,
  "groupBy": "hash",
  "from": "2026-02-20",
  "to": "2026-02-25",
  "rows": [
    { "hash": "bfefe5574ca167f98378ef37a123ed07bf00f6bd622c2283e19ac3fbd598ba96", "views": 20, "clicks": 5 },
    { "hash": "1a5f3799684d79a1c78df5fe9a4647c6ee255475684e419fcc411790a8a735bc", "views": 12, "clicks": 2 }
  ],
  "summary": { "totalViews": 57, "totalClicks": 11 }
}
```

#### groupBy=both (hash + date breakdown)

```json
{
  "ok": true,
  "groupBy": "both",
  "from": "2026-02-20",
  "to": "2026-02-21",
  "rows": [
    { "hash": "bfefe55...", "date": "2026-02-20", "views": 10, "clicks": 2 },
    { "hash": "bfefe55...", "date": "2026-02-21", "views": 10, "clicks": 3 }
  ],
  "summary": { "totalViews": 20, "totalClicks": 5 }
}
```

### Error Responses

| Status | Code | When |
|--------|------|------|
| 400 | `invalid_params` | Missing/invalid from or to; from > to; invalid groupBy |
| 500 | `report_failed` | File read error; aggregation failure |

---

## 4. Implementation Strategy

### Phase 1: Log Discovery

- List `data/events/*.jsonl` files
- Filter by date range (parse filename YYYY-MM-DD)
- Sort filenames ascending

### Phase 2: Stream and Parse

- For each file in range: `fs.readFile` (or createReadStream for large files)
- Split by newline; parse each line as JSON
- Skip malformed lines; count `event === 'view'` and `event === 'click'`
- Aggregate into in-memory maps: `Map<date, {views, clicks}>` and `Map<hash, {views, clicks}>`

### Phase 3: Aggregation

- Merge per-file aggregates
- For `groupBy=day`: return sorted by date
- For `groupBy=hash`: sort by views or clicks; apply limit/offset
- For `groupBy=both`: return (hash, date) pairs with counts

### Phase 4: Serialization

- Build response object
- Add summary (totalViews, totalClicks)
- Return JSON

### Phase 5: Error Boundaries

- Validate query params with Zod
- Try/catch around file ops; return 500 on failure
- Date range max 90 days (configurable)

### Performance Optimizations

- **Lazy evaluation:** Process files sequentially; avoid loading all into memory
- **Concurrent I/O:** Optional parallel reads for multiple files (Promise.all with limit)
- **Memoization:** Not required for MVP; consider for repeated identical queries

---

## 5. Implementation Checklist

### Phase 1: Setup
- [ ] Create `packages/shadow-index/lib/analytics.ts` (or `api/analytics.ts`)
- [ ] Export `getReport(from, to, groupBy, sortBy, limit, offset)`
- [ ] Add Zod schema for query params

### Phase 2: File Discovery
- [ ] Implement `listEventFiles(from, to)` — returns paths for date range
- [ ] Handle missing files (empty result, not error)
- [ ] Validate date format (YYYY-MM-DD)

### Phase 3: Aggregation
- [ ] Implement `aggregateEvents(files, groupBy)` — returns raw aggregates
- [ ] Support day, hash, both modes
- [ ] Compute summary totals

### Phase 4: API Route
- [ ] Add `GET /v1/analytics/report` to `api/index.ts`
- [ ] Parse query params; validate with Zod
- [ ] Call getReport; return JSON

### Phase 5: Tests & Docs
- [ ] Unit tests for aggregation logic
- [ ] Integration test: seed events → query → assert response
- [ ] Update FEBRUARY-21-ANALYSIS.md and Sprint 3 plan

---

## 6. Testing Strategy

### Unit Tests

| Test | Assertion |
|------|-----------|
| Empty date range | Returns empty rows, summary {0, 0} |
| Single file, single event | Correct view/click count |
| Multiple files | Aggregates across files |
| Malformed JSON line | Skipped; other lines processed |
| Invalid groupBy | 400 invalid_params |

### Integration Tests

| Test | Assertion |
|------|-----------|
| POST 3 views, 1 click → GET report | summary.totalViews=3, totalClicks=1 |
| groupBy=hash, limit=2 | Returns max 2 rows |
| from > to | 400 invalid_params |

### Performance Benchmark

- Seed 1000 events across 30 days
- Query 90-day range; assert response time < 500ms

---

## 7. Success Criteria

| Criterion | Target |
|-----------|--------|
| Functional | All groupBy modes return correct counts |
| Performance | < 500ms for 90-day range, ~10k events |
| Reliability | No crash on malformed lines; graceful empty result |
| Documentation | API documented in FEBRUARY-21-ANALYSIS.md |

---

## 8. Future Enhancements (Sprint 4+)

- **Indexing:** Pre-aggregate nightly; serve from index file
- **Supabase migration:** Move events to Postgres; SQL aggregation
- **CSV export:** Optional `?format=csv` for merchant download
- **Authentication:** Require API key for report endpoint

---

## 9. Acceptance Criteria (Definition of Done)

- [ ] GET /v1/analytics/report returns 200 with valid params
- [ ] groupBy=day, hash, both all implemented
- [ ] Query params validated; invalid params return 400
- [ ] Vitest tests pass (unit + integration)
- [ ] Performance benchmark meets target
- [ ] Docs updated
- [ ] Code review completed

---

**Reference:** [13-SPRINT-3-PLAN.md](./13-SPRINT-3-PLAN.md) Phase 3 (Feb 27 – Mar 2)
