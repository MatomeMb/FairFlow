# Sprint 3 Analytics Reporting Engine — Implementation Brief

**Status:** Specification Complete ✅  
**Spec Document:** [ANALYTICS-REPORTING-ENGINE-SPEC.md](./ANALYTICS-REPORTING-ENGINE-SPEC.md)  
**Date:** February 21, 2026  
**Target Sprint:** Sprint 3, Week 2 (Feb 27 – Mar 6)

---

## Quick Summary

The **Analytics Reporting Engine** is the second phase of MVP-14 (Conversion Tracking). It transforms raw JSONL event logs (created by the Feb 21 ingestion pipeline) into queryable, time-series analytics reports via a REST API.

### What You Can Query

```bash
# Daily engagement summary
GET /v1/analytics/report?from=2026-02-21&to=2026-02-28&groupBy=day

# Top products by engagement rate
GET /v1/analytics/report?from=2026-02-01&to=2026-02-28&groupBy=hash&sortBy=engagement_rate&limit=50

# Weekly rollup
GET /v1/analytics/report?from=2026-02-01&to=2026-02-28&groupBy=week&sortBy=views
```

### What You Get Back

```json
{
  "period": { "from": "2026-02-21", "to": "2026-02-28", "groupBy": "day" },
  "summary": {
    "total_views": 1250,
    "total_clicks": 187,
    "engagement_rate": 0.1496,
    "unique_hashes": 45
  },
  "data": [
    {
      "period": "2026-02-21",
      "views": 150,
      "clicks": 22,
      "engagement_rate": 0.1467,
      "top_hash": "abc123...",
      "source_domains": ["example.com", "shop.com"]
    }
  ]
}
```

---

## Implementation Roadmap

### Phase 1: Core Logic (Days 1–2)
**Deliverable:** Working aggregation engine  
**Tasks:**
- [ ] Implement date range validation (ISO-8601 parsing)
- [ ] Build JSONL file discovery & streaming (line-by-line parser)
- [ ] Implement aggregation for `groupBy=day`
- [ ] Implement aggregation for `groupBy=hash`
- [ ] Add engagement rate calculation
- [ ] Write 8 unit tests (validation, aggregation logic)

**Definition of Done:**
- `npm test` passes all unit tests in `analytics-report.test.ts`
- Aggregation logic produces correct totals on sample 100-event JSONL files

### Phase 2: API Routing & Serialization (Days 2–3)
**Deliverable:** Hono route with request/response handling  
**Tasks:**
- [ ] Add `GET /v1/analytics/report` route to `api/index.ts`
- [ ] Implement Zod schema for query parameter validation
- [ ] Serialize response JSON (handle nulls, date formatting)
- [ ] Implement error responses (400, 404, 500)
- [ ] Add sorting logic (by views, clicks, engagement_rate, timestamp)
- [ ] Add pagination (limit, offset, total)
- [ ] Write 4 integration tests (sorting, pagination, error cases)

**Definition of Done:**
- Manual curl/Postman tests confirm request/response format
- Error cases (invalid dates, no data, corrupt JSON) handled gracefully

### Phase 3: Testing & Performance (Day 3–4)
**Deliverable:** Comprehensive test suite + benchmarks  
**Tasks:**
- [ ] Add integration tests (multi-file spanning, sparse data, summary accuracy)
- [ ] Write performance benchmarks (10K+ events, 90-day range)
- [ ] Profile aggregation for memory usage (target: < 500 MB)
- [ ] Validate response times (target: < 500ms for 90-day range)
- [ ] Document performance characteristics & limitations

**Definition of Done:**
- `npm test` passes all 15+ test cases
- Benchmark reports show sub-500ms latency
- Memory profiling complete

### Phase 4: Integration & Docs (Day 4–5)
**Deliverable:** Production-ready, fully documented  
**Tasks:**
- [ ] Integration test against real analytics data from `data/events/`
- [ ] Update `README.md` with new reporting API section
- [ ] Add inline code comments (algorithm explanation in pseudocode)
- [ ] Write deployment checklist (ENV vars, monitoring, logging)
- [ ] Tag `v0.6.0` (shadow-index version bump)

**Definition of Done:**
- All docs updated
- Changes merged to `main` branch
- Tag created and pushed to remote

---

## Key Specifications

### Query Parameters

| Param | Type | Required | Default | Constraints |
|-------|------|----------|---------|-------------|
| `from` | ISO date | ✅ | — | Must be ≤ `to` |
| `to` | ISO date | ✅ | — | Must be ≥ `from` |
| `groupBy` | enum | ✗ | `day` | `day`, `week`, `month`, `hash` |
| `sortBy` | enum | ✗ | `timestamp` | `timestamp`, `views`, `clicks`, `engagement_rate` |
| `limit` | int | ✗ | 1000 | Max 10,000 |
| `offset` | int | ✗ | 0 | For pagination |

### Response Structure

**By Day (default):**
```json
{
  "data": [
    { "period": "2026-02-21", "views": 150, "clicks": 22, ... },
    { "period": "2026-02-22", "views": 180, "clicks": 28, ... }
  ]
}
```

**By Hash:**
```json
{
  "data": [
    {
      "hash": "abc123...",
      "views": 240,
      "clicks": 45,
      "engagement_rate": 0.1875,
      "source_breakdown": { "example.com": { "views": 150, "clicks": 30 } }
    }
  ]
}
```

### Performance Targets
- **Sub-500ms** for queries up to 90 days
- **Memory:** < 500 MB for large aggregations
- **Concurrency:** Max 5 parallel file reads (FS limit)

---

## Testing Strategy

### Unit Tests (8+)
- ✅ Date validation (invalid format, `to < from`, future dates)
- ✅ Aggregation by day (multiple events, unique hashes)
- ✅ Aggregation by hash (timestamps, source breakdown)
- ✅ Metric calculation (engagement rate, top N)
- ✅ Sorting (by views, clicks, engagement_rate)
- ✅ Pagination (limit, offset, total)
- ✅ Error handling (no data, corrupt JSON, OOM)

### Integration Tests (4+)
- ✅ Multi-file spanning (events across multiple JSONL files)
- ✅ Sparse data (gaps between event dates)
- ✅ Summary accuracy (manual verification on known datasets)
- ✅ Real-world simulation (1K+ events across realistic timespan)

### Performance Tests (3+)
- ✅ Benchmark: 10K events, 90 days → < 500ms
- ✅ Memory profiling: Peak usage < 500 MB
- ✅ Concurrent requests: No degradation with 10+ parallel queries

---

## Success Criteria

✅ **Functional**
- All query parameters work as documented
- Response format matches spec for each `groupBy` mode
- Sorting produces correct ordering
- Pagination slices correctly

✅ **Accurate**
- Engagement rates = clicks / views (or 0 if views = 0)
- Totals in summary match sum of data rows
- Unique hashes counted correctly

✅ **Performant**
- Queries ≤ 90 days: < 500ms
- Queries ≤ 365 days: < 2 seconds
- Memory footprint: < 500 MB for large aggregations

✅ **Reliable**
- Malformed JSON lines logged and skipped (no crash)
- Empty date ranges return 404 with meaningful message
- File I/O errors handled gracefully (return 500)

✅ **Tested**
- Unit coverage ≥ 80%
- Integration tests verify end-to-end workflows
- Performance benchmarks meet targets

✅ **Documented**
- API spec complete (this document + ANALYTICS-REPORTING-ENGINE-SPEC.md)
- Code comments explain aggregation algorithm
- Deployment checklist covers ENV vars, monitoring, scaling notes
- README updated with examples and limitations

---

## Acceptance Criteria (Definition of Done)

- [ ] All 15+ test cases pass (`npm test`)
- [ ] Performance benchmarks show < 500ms for 90-day range
- [ ] No console errors; malformed events logged with line numbers
- [ ] API responds correctly to all documented parameter combos
- [ ] Error responses return correct HTTP status (400, 404, 500)
- [ ] Documentation updated (README, inline code, deployment guide)
- [ ] Code review approved
- [ ] Changes merged to `main`
- [ ] Tag `v0.6.0` created and pushed
- [ ] Demo with production-like JSONL data confirms correctness

---

## Engineering Notes

### Algorithm Overview
1. **Discover:** List JSONL files in `data/events/` within date range (filename filter)
2. **Stream:** Read each file line-by-line; parse JSON; filter by timestamp
3. **Aggregate:** Build in-memory map by grouping key (day, week, month, or hash)
4. **Compute:** Calculate engagement rates, cardinality, top values
5. **Sort:** Apply `sortBy` parameter (default: chronological)
6. **Serialize:** Convert to JSON response with pagination

### Optimizations
- **Lazy Evaluation:** Stream instead of loading full dataset
- **Concurrent I/O:** Parallel file reads (max 5 concurrent)
- **Early Filtering:** Filename prefix check before opening
- **Memoization:** Cache date calculations

### Constraints & Limitations (MVP)
- Single-instance deployment (no distributed queries)
- No external DB (file-based storage only)
- No real-time updates (batch daily aggregation)
- Date ranges > 1 year may exceed memory (future: indexing/caching)

---

## Future Enhancements (Sprint 4+)

1. **Daily Summary Index:** Pre-compute daily aggregates in `.index/` subdirectory
2. **Caching:** Redis or in-memory LRU for frequently-queried ranges
3. **Export Formats:** CSV, Parquet downloads
4. **Advanced Filters:** By source domain, target_action, anon_id patterns
5. **Supabase Migration:** Move to Postgres for richer queries (not MVP)
6. **Retention Policy:** Auto-archive/delete logs older than configurable window

---

## Sign-Off Checklist

**Engineering Lead:**
- [ ] Code review complete
- [ ] All tests passing
- [ ] Performance benchmarks verified
- [ ] Approved for merge

**Product/PM:**
- [ ] Reporting meets business requirements
- [ ] Query parameters sufficient for analytics dashboard
- [ ] Error handling acceptable

**QA:**
- [ ] Test scenarios verified in staging
- [ ] Edge cases (empty ranges, corrupt data) handled
- [ ] Cross-browser API testing (if applicable)

**CTO/Release Manager:**
- [ ] Documentation complete
- [ ] Version bumped to 0.6.0
- [ ] Tag created and pushed
- [ ] Deployment runbook prepared

---

## Reference Links

- **Spec:** [ANALYTICS-REPORTING-ENGINE-SPEC.md](./ANALYTICS-REPORTING-ENGINE-SPEC.md)
- **Event Schema:** [MVP-14-EVENT-SPEC-AND-STORAGE.md](./MVP-14-EVENT-SPEC-AND-STORAGE.md)
- **Ingestion (Feb 21):** [FEBRUARY-21-ANALYSIS.md](../FEBRUARY-21-ANALYSIS.md)
- **Sprint 3 Plan:** [13-SPRINT-3-PLAN.md](./13-SPRINT-3-PLAN.md)
- **Test File:** `packages/shadow-index/api/analytics-report.test.ts` (to be created)
- **API File:** `packages/shadow-index/api/index.ts` (add new route)

