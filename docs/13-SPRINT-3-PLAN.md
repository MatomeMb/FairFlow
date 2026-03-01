# Sprint 3 Plan

**Period:** Feb 20 - Mar 5, 2026  
**Goal:** MVP-14 Analytics and Observability  
**Target Version:** v0.6.0  
**Status:** Complete

---

## Objectives

1. Event ingestion pipeline (view/click events)
2. Analytics reporting engine with aggregation
3. Internal observability dashboard
4. Query caching and performance instrumentation

---

## Phases

### Phase 1: Infrastructure (Done)

- `sendEvent` in lens extension and auth-portal
- View/click hooks in overlay
- POST /v1/analytics/event endpoint
- JSONL storage (partitioned by date)

### Phase 2: Reporting (Done)

- Aggregation engine (by day, hash, both)
- GET /v1/analytics/report with from, to, groupBy, sortBy
- Pre-aggregation for large datasets
- Query cache with configurable TTL

### Phase 3: Observability (Done)

- HTML status dashboard (GET /v1/analytics/dashboard)
- Error rate alerting (>5% threshold)
- Slow query detection (>1s threshold)
- Structured JSON logging (lib/logger.ts)

### Phase 4: Release (Done)

- Sprint review
- Demo conversion tracking
- Tag v0.6.0

---

## Acceptance Criteria

| Criterion | Status |
|-----------|--------|
| POST /v1/analytics/event accepts view and click events | Done |
| GET /v1/analytics/report returns aggregated data | Done |
| Dashboard displays metrics and alerts | Done |
| All tests pass (131 tests) | Done |
| Type-check and lint clean | Done |

---

## Deliverables

- Event schema (view, click with target_action)
- JSONL storage in data/events/
- Report endpoint with date range and grouping
- Dashboard at /v1/analytics/dashboard
- Error logger with 24h window
- OpenAPI spec for all endpoints
