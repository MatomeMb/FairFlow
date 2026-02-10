# February 21 Analysis — MVP-14 Analytics Pipeline

**Date:** February 21, 2026  
**Author:** CTO / Lead Engineer  
**Status:** Implementation complete

---

## Overview

The **Analytics & Observability (MVP-14)** pipeline provides a fire-and-forget mechanism for tracking user engagement across the Matter Protocol ecosystem. This document summarizes the technical architecture, schema design, and storage strategy delivered on Feb 21.

---

## Pipeline Architecture

```
[User] → matter:// link → [Lens Extension] → overlay shown
                              ↓
                    fireAnalyticsEvent({ event: 'view', hash, source_url })
                              ↓
                    chrome.runtime.sendMessage('analytics:event')
                              ↓
                    [Background Worker] → sendEvent() → POST /v1/analytics/event
                              ↓
                    [Shadow Index API] → validate (Zod) → append JSONL
                              ↓
                    data/events/YYYY-MM-DD.jsonl
```

**Click flow:** User clicks "Buy Now" → `target_action: 'checkout_initiated'` → same path.

---

## Schema Design

### View Events

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| event | string | yes | `"view"` |
| hash | string | yes | 64-char SHA-256 hex |
| timestamp | string | optional | ISO 8601 (server adds if missing) |
| source_url | string | yes | URL where matter:// interaction initiated |

### Click Events

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| event | string | yes | `"click"` |
| hash | string | yes | 64-char SHA-256 hex |
| timestamp | string | optional | ISO 8601 |
| source_url | string | yes | URL |
| target_action | string | yes | `checkout_initiated` \| `image_expanded` |

**Validation:** Zod discriminatedUnion on `event`; hash regex `^[a-f0-9]{64}$`; source_url must be valid URL.

---

## Storage Strategy

**Choice:** JSONL (append-only text files)

**Path:** `packages/shadow-index/data/events/YYYY-MM-DD.jsonl`

**Rationale:**
- High-performance append-only writes
- No DB setup or connection pooling
- Easy aggregation by date (one file per day)
- Future migration path to Supabase or managed DB at scale

**Retention:** 90 days (configurable). Rotation and cleanup to be implemented in later sprint.

---

## Extension Integration

### Background Script

- `sendEvent(baseUrl, payload)` — POSTs to `${baseUrl}/v1/analytics/event`
- Fire-and-forget: no blocking; errors silently ignored
- Message handler: `type: 'analytics:event'` → forwards to API

### Content Script

- `fireAnalyticsEvent(payload)` — sends message to background
- **View:** Fired when overlay renders with resolved data (`data.thing_url` present)
- **Click:** Fired on Buy Now click, before opening checkout URL

---

## Test Coverage

| Test | Status |
|------|--------|
| Valid view event → 201 | Pass |
| Valid click event → 201 | Pass |
| Invalid event type → 400 | Pass |
| Malformed hash → 400 | Pass |

---

## Next Steps (Sprint 3)

1. **Aggregation Engine:** Scan JSONL by date range; compute daily counts (views, clicks by hash)
2. **GET /v1/analytics/report:** Query params `from`, `to`, `groupBy=day`
3. **Internal HTML Dashboard:** API health, event counts, recent errors
4. **Retention Policy:** 90-day rotation; optional cleanup job

---

## Release State

| Package | Version |
|---------|---------|
| matter-core | 0.3.0 |
| lens-extension | 0.3.0 |
| shadow-index | 0.5.0 |
| Repository Tag | v0.5.0 |

---

*Document created Feb 21, 2026. Pipeline operational; aggregation phase scheduled for Feb 27–Mar 2.*
