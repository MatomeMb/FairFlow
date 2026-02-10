# Analytics Reporting Engine Specification (MVP-14 Phase 2)

**Status:** Planned (Sprint 3)  
**Target Completion:** Sprint 3, Week 2 (Feb 27, 2026)  
**Dependency:** MVP-14 Event Ingestion (✅ Feb 21)  
**Related:** MVP-14 Event Specification, Storage Strategy (JSONL)

---

## 1. Executive Summary

This specification defines the **Analytics Reporting Engine**, a queryable backend service for aggregating and reporting on engagement metrics from the Matter Protocol ecosystem. The engine will consume JSONL event logs stored in `data/events/` and expose a time-series reporting API capable of providing:

- **View/Click aggregation** by time period (day, week, month)
- **Engagement rates** (clicks / views)
- **Product-level metrics** (per-hash analytics)
- **Conversion funnel insights** (view → click progression)

The implementation prioritizes **low-latency read access** through in-memory aggregation of date-ranged logs and supports **flexible grouping strategies** for multi-dimensional analysis.

---

## 2. Technical Context

### 2.1 Event Source
- **Location:** `data/events/YYYY-MM-DD.jsonl`
- **Format:** JSON Lines (one event per line, no array wrapper)
- **Event Types:** `view` (product impression), `click` (CTA interaction)
- **Schema:**
  ```typescript
  view: { event: 'view', hash: string(64), timestamp: ISO-8601, source_url: URL, anon_id?: string }
  click: { event: 'click', hash: string(64), timestamp: ISO-8601, source_url: URL, target_action: enum, anon_id?: string }
  ```

### 2.2 Deployment Context
- **Framework:** Hono.js (REST API)
- **Runtime:** Node.js (local), Vercel Edge (production)
- **Storage:** Local filesystem (`data/events/`) or R2 (production)
- **Testing:** Vitest with mocked FS operations

### 2.3 Constraints
- No external analytics database (MVP: file-based storage only)
- Single-instance deployment for Feb (no distributed querying)
- Query performance: target **< 500ms** for date ranges up to 90 days
- Memory budget: aggregation state must fit in Node process (typical: 100–500 MB for large date ranges)

---

## 3. API Specification

### 3.1 Endpoint: `GET /v1/analytics/report`

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `from` | ISO-8601 date | ✅ Yes | — | Start date (inclusive), e.g., `2026-02-01` |
| `to` | ISO-8601 date | ✅ Yes | — | End date (inclusive), e.g., `2026-02-28` |
| `groupBy` | enum | ✗ No | `day` | Aggregation granularity: `day`, `week`, `month`, or `hash` |
| `sortBy` | enum | ✗ No | `timestamp` | Sort order: `timestamp`, `views`, `clicks`, `engagement_rate` |
| `limit` | integer | ✗ No | `1000` | Max results returned (hard cap: 10,000) |
| `offset` | integer | ✗ No | `0` | Pagination offset |

#### Request Examples

**Aggregate by day:**
```
GET /v1/analytics/report?from=2026-02-21&to=2026-02-28&groupBy=day
```

**Top products by engagement (week grouping):**
```
GET /v1/analytics/report?from=2026-02-01&to=2026-02-28&groupBy=hash&sortBy=engagement_rate&limit=50
```

**Weekly rollup sorted by views:**
```
GET /v1/analytics/report?from=2026-02-15&to=2026-02-28&groupBy=week&sortBy=views
```

#### Response Format (200 OK)

```json
{
  "period": {
    "from": "2026-02-21",
    "to": "2026-02-28",
    "groupBy": "day"
  },
  "summary": {
    "total_views": 1250,
    "total_clicks": 187,
    "engagement_rate": 0.1496,
    "unique_hashes": 45,
    "days_with_data": 7
  },
  "data": [
    {
      "period": "2026-02-21",
      "views": 150,
      "clicks": 22,
      "engagement_rate": 0.1467,
      "top_hash": "abc123...",
      "source_domains": ["example.com", "shop.com"]
    },
    {
      "period": "2026-02-22",
      "views": 180,
      "clicks": 28,
      "engagement_rate": 0.1556,
      "top_hash": "def456...",
      "source_domains": ["example.com"]
    }
  ],
  "pagination": {
    "offset": 0,
    "limit": 1000,
    "total": 7
  }
}
```

#### Response Format: Hash Grouping (200 OK)

```json
{
  "period": { "from": "2026-02-21", "to": "2026-02-28", "groupBy": "hash" },
  "summary": {
    "total_views": 1250,
    "total_clicks": 187,
    "engagement_rate": 0.1496,
    "unique_hashes": 45,
    "date_range_days": 8
  },
  "data": [
    {
      "hash": "abc1234567890123456789012345678901234567890123456789012345678901",
      "views": 240,
      "clicks": 45,
      "engagement_rate": 0.1875,
      "first_seen": "2026-02-21T08:30:00Z",
      "last_seen": "2026-02-28T15:45:00Z",
      "top_source": "example.com",
      "source_breakdown": {
        "example.com": { "views": 150, "clicks": 30 },
        "shop.com": { "views": 90, "clicks": 15 }
      }
    }
  ],
  "pagination": { "offset": 0, "limit": 50, "total": 45 }
}
```

#### Error Responses

**400 Bad Request** — Invalid parameters
```json
{
  "code": "invalid_query",
  "message": "Invalid date format or missing required parameter",
  "details": { "errors": ["from must be valid ISO-8601 date", "to must be after from"] }
}
```

**404 Not Found** — No data in range
```json
{
  "code": "no_data",
  "message": "No events found for the specified period",
  "period": { "from": "2026-01-01", "to": "2026-01-05" }
}
```

**500 Internal Server Error** — File I/O or aggregation failure
```json
{
  "code": "aggregation_error",
  "message": "Failed to aggregate analytics data",
  "details": { "reason": "File read error" }
}
```

---

## 4. Implementation Strategy

### 4.1 Core Algorithm

#### Phase 1: Log Discovery
1. **Date Range Calculation:** Parse `from` and `to` as ISO-8601 dates.
2. **File Enumeration:** List all `.jsonl` files in `data/events/` that fall within the range.
   - Filtering by filename prefix (YYYY-MM-DD) avoids scanning irrelevant logs.
3. **Parallel Read:** Stream each JSONL file concurrently (max 5 streams to avoid FS bottleneck).

#### Phase 2: Event Streaming & Filtering
1. **Line-by-line Parsing:** Read each JSONL file as a stream, parsing one JSON object per line.
2. **Timestamp Validation:** Filter events whose `timestamp` falls within `[from, to]` inclusive.
3. **Error Handling:** Log and skip malformed lines (avoid crash on corrupt data).

#### Phase 3: In-Memory Aggregation
Build aggregation map based on `groupBy` parameter:

**By Day:**
```typescript
aggregation: Map<YYYY-MM-DD, { views: number, clicks: number, hashes: Set<string>, sources: Map<domain, { views, clicks }> }>
```

**By Week:**
```typescript
aggregation: Map<YYYY-Www, { views, clicks, hashes, sources }>
```

**By Hash:**
```typescript
aggregation: Map<hash, { views, clicks, timestamps: string[], sources: Map<domain, { views, clicks }> }>
```

#### Phase 4: Metric Calculation
- **Engagement Rate:** `clicks / views` (or `0` if views = 0)
- **Top Hash/Domain:** Computed from aggregated counts during sort
- **Unique Hashes:** Cardinality of hash set per period
- **Date Coverage:** Count of unique dates with events

#### Phase 5: Sorting & Pagination
1. **Sort:** Apply `sortBy` parameter (default: chronological/natural order)
2. **Limit & Offset:** Slice result array; respect hard cap of 10,000 results
3. **Serialize:** Convert aggregation map to JSON response

### 4.2 Pseudocode

```pseudocode
function reportAggregateAnalytics(from, to, groupBy, sortBy, limit, offset):
  // Validate inputs
  validateDateRange(from, to)
  validateGroupBy(groupBy)
  validateSortBy(sortBy)
  
  // Discover relevant JSONL files
  files = listEventsFilesInRange(from, to)
  if files.isEmpty():
    return 404 NoData
  
  // Aggregate events
  aggregation = Map<groupKey, AggregateRow>()
  for each file in files in parallel:
    stream = openFileStream(file)
    for each line in stream:
      event = parseJSON(line)
      if isValidEvent(event) and isInRange(event.timestamp, from, to):
        key = computeGroupKey(event, groupBy)
        row = aggregation.getOrCreate(key, defaultRow)
        updateRow(row, event)
  
  // Compute metrics
  for each row in aggregation.values():
    row.engagement_rate = row.clicks / max(row.views, 1)
    row.top_hash = mostFrequentHash(row.hashes)
    row.source_breakdown = row.sources
  
  // Sort & paginate
  results = aggregation.values()
  sortResults(results, sortBy)
  paginated = results.slice(offset, offset + limit)
  total = results.length
  
  // Build summary
  summary = {
    total_views: sum(row.views for row in aggregation.values()),
    total_clicks: sum(row.clicks for row in aggregation.values()),
    engagement_rate: total_clicks / total_views,
    unique_hashes: cardinality(all hashes),
    days_with_data: countUniqueDates(aggregation.keys())
  }
  
  return {
    period: { from, to, groupBy },
    summary,
    data: paginated,
    pagination: { offset, limit, total }
  }
```

### 4.3 Performance Optimizations

1. **Lazy Evaluation:** Stream files instead of loading entire dataset into memory.
2. **Concurrent I/O:** Use `Promise.all()` for parallel file reads (bounded by FS concurrency limit).
3. **Early Filtering:** Filter by date filename prefix before opening file.
4. **Memoization:** Cache date range calculations (ISO-8601 parse/format is expensive).
5. **Index Files (Future):** In Sprint 4, introduce daily summary indices to skip full scans for frequently-queried ranges.

### 4.4 Error Boundaries

- **Malformed JSON:** Log with line number, skip event, continue.
- **File Not Found:** Return empty result set (not an error if date is future or no events exist).
- **Out of Memory:** Return 500 with message "Date range too large; please reduce query window."
- **Invalid Date:** Return 400 with validation error.

---

## 5. Implementation Checklist

### Phase 1: Core Logic
- [ ] Implement `validateDateRange()` (check ISO-8601 format, `to >= from`, no future dates)
- [ ] Implement `listEventsFilesInRange()` (FS scan with filename filtering)
- [ ] Implement `parseAndStreamJsonl()` (line-by-line streaming parser)
- [ ] Implement aggregation logic for each `groupBy` mode (day, week, month, hash)
- [ ] Implement metric calculations (engagement rate, top N, cardinality)

### Phase 2: API Routing
- [ ] Add `GET /v1/analytics/report` route to Hono app
- [ ] Implement query parameter parsing & validation with Zod
- [ ] Implement response serialization (handle date formatting, null values)
- [ ] Add error response handlers (400, 404, 500)

### Phase 3: Testing
- [ ] Unit tests: `validateDateRange()`, aggregation logic (by day, week, month, hash)
- [ ] Integration tests: 
  - [ ] Single day, multiple events, multiple hashes
  - [ ] Date range spanning multiple files
  - [ ] Hash grouping with source breakdown
  - [ ] Sorting by engagement_rate, views, clicks
  - [ ] Pagination (limit, offset, total)
  - [ ] Error cases (no data, invalid params, corrupt JSON)
- [ ] Performance tests: 10K+ events over 90-day range (target: < 500ms)

### Phase 4: Documentation
- [ ] Update API docs (README or OpenAPI spec)
- [ ] Add inline code comments for aggregation logic
- [ ] Document limitations (single-instance, no distributed queries)
- [ ] Document future enhancements (indexing, caching, Supabase integration)

### Phase 5: Deployment
- [ ] Update `run-with-env.mjs` if ENV vars needed (e.g., MAX_QUERY_WINDOW_DAYS)
- [ ] Test on staging/production-like environment
- [ ] Add monitoring/logging for slow queries

---

## 6. Testing Strategy

### 6.1 Unit Tests

**Test File:** `packages/shadow-index/api/analytics-report.test.ts`

```typescript
describe('GET /v1/analytics/report', () => {
  describe('Date Validation', () => {
    it('should reject invalid ISO-8601 dates', () => { ... });
    it('should reject if to < from', () => { ... });
    it('should reject future dates', () => { ... });
  });

  describe('Aggregation: groupBy=day', () => {
    it('should aggregate multiple events per day', () => { ... });
    it('should calculate engagement rate correctly', () => { ... });
    it('should count unique hashes per day', () => { ... });
  });

  describe('Aggregation: groupBy=hash', () => {
    it('should aggregate events by hash', () => { ... });
    it('should track first_seen and last_seen timestamps', () => { ... });
    it('should break down sources per hash', () => { ... });
  });

  describe('Sorting', () => {
    it('should sort by views (descending)', () => { ... });
    it('should sort by engagement_rate (descending)', () => { ... });
    it('should maintain chronological order for day grouping', () => { ... });
  });

  describe('Pagination', () => {
    it('should respect limit parameter', () => { ... });
    it('should apply offset correctly', () => { ... });
    it('should return total count', () => { ... });
  });

  describe('Error Handling', () => {
    it('should return 404 if no events in range', () => { ... });
    it('should skip malformed JSON lines and continue', () => { ... });
    it('should return 400 for invalid parameters', () => { ... });
  });
});
```

### 6.2 Integration Tests

Mock JSONL files with realistic event data; verify end-to-end report generation.

```typescript
describe('Analytics Report Integration', () => {
  it('should aggregate events from multiple JSONL files (multi-day range)', () => { ... });
  it('should handle sparse data (gaps between event dates)', () => { ... });
  it('should produce correct summary metrics', () => { ... });
});
```

### 6.3 Performance Benchmarks

```typescript
bench('Report query: 10K events, 90 days', () => {
  // Generate 10K events across 90-day range
  // Measure report generation time
  // Assert: < 500ms
});
```

---

## 7. Success Criteria

- ✅ **Functional:** All query parameter combinations (groupBy, sortBy, limit, offset) work as documented.
- ✅ **Accurate:** Engagement rates, totals, and unique counts match manual verification on small datasets.
- ✅ **Performant:** Report queries complete within 500ms for date ranges ≤ 90 days.
- ✅ **Reliable:** Malformed events are logged and skipped; service does not crash.
- ✅ **Tested:** Unit coverage ≥ 80%; integration tests verify multi-file aggregation.
- ✅ **Documented:** API spec, request/response examples, and error scenarios documented.

---

## 8. Future Enhancements (Sprint 4+)

1. **Daily Summary Index:** Pre-compute and cache daily aggregates in `data/events/.index/` to accelerate repeated queries.
2. **Distributed Querying:** Support multi-instance deployments via shared R2 log storage.
3. **Real-time Dashboard:** WebSocket stream for live engagement metrics (not MVP).
4. **Supabase Integration:** Migrate from JSONL to Postgres for richer query capabilities (not MVP).
5. **Export Formats:** CSV, Parquet download support.
6. **Advanced Filters:** Filter by source domain, target_action, anon_id patterns.
7. **Retention Policy:** Auto-archive/delete logs older than configurable window.

---

## 9. Acceptance Criteria

**Definition of Done:**
- All test cases pass (unit + integration + perf)
- API responds correctly to all documented parameter combinations
- Error handling verified for edge cases (empty date range, corrupt JSON, OOM)
- Documentation updated (README, OpenAPI, comments)
- Code reviewed and merged to main branch
- Tag `v0.6.0` created (shadow-index version bump)
- Demo: query a real analytics dataset from production-like JSONL files

**Sign-Off:**
- [ ] Engineering lead: Code review + test pass confirmation
- [ ] Product: Verify reporting meets business requirements
- [ ] QA: Cross-browser / production-like environment testing (if applicable)

