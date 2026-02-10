# .things that Matter
## Sprint 3 Plan — MVP-14 Analytics & Observability

---

| **Document Information** | |
|--------------------------|---|
| **Company Name** | .things that Matter |
| **Document Type** | Sprint Plan |
| **Version** | 3.0 |
| **Date** | February 19, 2026 |
| **Sprint Window** | Feb 20 – Mar 5, 2026 |
| **Author** | Matome Mboweni, CTO |
| **Status** | Approved for execution |

---

## EXECUTIVE SUMMARY

**Sprint Goal:** Quantify engagement and ensure system health by implementing view/click event tracking, API ingestion, merchant reporting, and an internal observability dashboard.

**Strategic Rationale:**
- Merchants need visibility into matter:// engagement (views, clicks to checkout)
- System health (request logs, errors) required for production support
- Bridges functional delivery (Sprint 1–2) and production-ready merchant insights

**Key Deliverables:**
1. **Extension:** Fire "view" when overlay shown; fire "click" on Buy Now; send to API
2. **API:** POST /v1/analytics/event; persistent storage for high-volume logs
3. **Reporting:** GET /v1/analytics/report (daily counts, date range)
4. **Observability:** Internal HTML status dashboard; E2E integration tests
5. **Release:** Tag v0.6.0

**Expected Outcome:** Verified conversion tracking; merchant reporting API; internal performance dashboard.

---

## 1. EVENT SCHEMA (Technical Specification)

### 1.1 Event Types

| Event | Fields | Trigger |
|-------|--------|---------|
| **view** | hash, timestamp, source_url | Overlay shown to user |
| **click** | hash, timestamp, source_url, target_action | User clicks "Buy Now" or expands image |

**Full spec:** [MVP-14-EVENT-SPEC-AND-STORAGE.md](./MVP-14-EVENT-SPEC-AND-STORAGE.md)

### 1.2 Schema (JSON)

```json
{
  "event": "view",
  "hash": "bfefe5574ca167f98378ef37a123ed07bf00f6bd622c2283e19ac3fbd598ba96",
  "timestamp": "2026-02-20T10:15:00.000Z",
  "source_url": "https://example.com/catalog"
}
```

```json
{
  "event": "click",
  "hash": "bfefe5574ca167f98378ef37a123ed07bf00f6bd622c2283e19ac3fbd598ba96",
  "timestamp": "2026-02-20T10:16:00.000Z",
  "source_url": "https://example.com/catalog",
  "target_action": "checkout_initiated"
}
```

### 1.3 Privacy & Retention

- No PII; hash only (no user ID, IP stored in event payload for analytics)
- Retention: 90 days (configurable)
- Optional: IP hashed or excluded for privacy

---

## 2. PHASE BREAKDOWN

### Phase 1: Infrastructure (Feb 20 – 24)

| Day | Date | Focus | Tasks | Est. (h) |
|-----|------|-------|-------|----------|
| Mon | Feb 20 | Sprint planning; event schema | Define schema; decide storage (file vs Supabase vs SQLite); doc spec | 6 |
| Tue | Feb 21 | Extension: sendEvent | Implement `sendEvent(event, hash, target?)` in background.js; configurable API base | 6 |
| Wed | Feb 22 | Extension: hook overlay | Fire "view" when overlay shown; fire "click" on Buy Now; send to API or local buffer | 5 |
| Thu | Feb 23 | Storage layer | Persist events (file or DB); avoid PII; retention policy (e.g. 90 days); simple query by date range | 6 |
| Fri | Feb 24 | API ingestion | POST /v1/analytics/event (or /events); validate payload; write to storage; optional batch endpoint | 5 |

### Phase 2: API Ingestion (Feb 25 – 26)

| Day | Date | Focus | Tasks | Est. (h) |
|-----|------|-------|-------|----------|
| Mon | Feb 25 | Event endpoint | Finalize POST /v1/analytics/event; rate limit; auth optional; high-volume log handling | 6 |
| Tue | Feb 26 | Validation & tests | Vitest for event endpoint; schema validation (Zod); error handling | 5 |

### Phase 3: Reporting (Feb 27 – Mar 2)

| Day | Date | Focus | Tasks | Est. (h) |
|-----|------|-------|-------|----------|
| Mon | Feb 27 | Aggregation | Build aggregation engine for daily counts (views, clicks by hash, by date) | 6 |
| Tue | Feb 28 | Report endpoint | GET /v1/analytics/report?from=&to=&groupBy=day | 5 |
| Wed | Mar 2 | Docs & export | Analytics runbook; event schema; privacy note; optional CSV export | 5 |

### Phase 4: Observability (Mar 3 – 4)

| Day | Date | Focus | Tasks | Est. (h) |
|-----|------|-------|-------|----------|
| Thu | Mar 3 | Status dashboard | Internal HTML page: API health, event counts, recent errors | 6 |
| Fri | Mar 4 | E2E integration | View → DB → Report flow; request logging (method, path, status, duration) | 5 |

### Phase 5: Release (Mar 5)

| Day | Date | Focus | Tasks | Est. (h) |
|-----|------|-------|-------|----------|
| Fri | Mar 5 | Sprint Review | Demo conversion tracking to CEO; retrospective; tag v0.6.0; update PROGRESS | 5 |

**Total:** ~60h (6h/day × 10 days)

---

## 3. IMPLEMENTATION DETAILS

### 3.1 Extension: sendEvent

**File:** `packages/lens-extension/src/background.js` (or new `analytics.js`)

- `sendEvent({ event, hash, source_url, target_action? })` — POST to `${apiBase}/v1/analytics/event`
- Fire-and-forget; no blocking overlay
- Optional: retry queue if offline
- Use existing `shadow_index_base_url` from storage for API base

### 3.2 Overlay Hooks

**File:** `packages/lens-extension/src/content.js`

- When overlay shown (gist received): `sendEvent({ event: 'view', hash, source_url: document.location.href })`
- When "Buy Now" clicked: `sendEvent({ event: 'click', hash, source_url: document.location.href, target_action: 'checkout_initiated' })`

### 3.3 API: POST /v1/analytics/event

**File:** `packages/shadow-index/api/index.ts`

- Route: POST /v1/analytics/event
- Body: { event, hash, timestamp?, source_url, target_action? }
- Validate: event in ['view','click'], hash is 64-char hex
- Write to storage (JSONL file or DB table)
- Optional: x-api-key for write auth

### 3.4 Storage Decision

**Choice:** JSONL file (append-only, daily rotation). See [MVP-14-EVENT-SPEC-AND-STORAGE.md](./MVP-14-EVENT-SPEC-AND-STORAGE.md) for rationale.

- Path: `data/events/YYYY-MM-DD.jsonl`
- Retention: 90 days (configurable)
- Aggregation: Batch job by date range; migrate to Supabase or managed DB at 1,000+ gists

### 3.5 GET /v1/analytics/report

- Query params: from, to (ISO date), groupBy=day
- Response: { views: number, clicks: number, byHash?: [...], byDate?: [...] }
- Aggregation: scan events in range; group by date/hash

---

## 4. DEFINITION OF DONE

- Extension fires view on overlay show; click on Buy Now
- POST /v1/analytics/event accepts and persists events
- GET /v1/analytics/report returns aggregated counts
- Internal status dashboard (HTML) shows API health and event summary
- E2E: View → DB → Report validated
- Vitest tests for event endpoints
- Docs: analytics runbook, event schema, privacy note
- PROGRESS-AND-VERSION.md updated; tag v0.6.0

---

## 5. RISKS & MITIGATIONS

| Risk | Mitigation |
|------|------------|
| High event volume | JSONL rotation; optional sampling |
| CORS / extension origin | Ensure API allows extension origin |
| PII leakage | No IP/user in event payload; hash only |
| Report performance | Pre-aggregate nightly; limit date range |

---

## 6. DEMO SCRIPT (End of Sprint 3)

1. Show matter-demo; click link → overlay appears
2. Open report: views incremented
3. Click "Buy Now" → clicks incremented
4. Show GET /v1/analytics/report response
5. Show internal status dashboard

**Message:** "We can track matter:// engagement and provide merchant reporting — ready for beta insights."

---

## 7. NEXT SPRINT PREVIEW (Sprint 4)

**Mar 6 – 19, 2026:** Beta readiness — merchant onboarding doc; support process; 5–10 beta targets; stability fixes.

---

**Document Version:** 3.0  
**Last Updated:** February 19, 2026  
**Status:** Ready for execution
