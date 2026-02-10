# Staging Deployment Notes — v0.6.0

**Document:** v0.6.0-specific staging deployment  
**Date:** February 2026  
**Release:** v0.6.0 (Analytics Reporting Engine)

---

## Overview

v0.6.0 adds the Analytics Reporting Engine (MVP-14). This document supplements [DEPLOYMENT-TO-STAGING.md](./DEPLOYMENT-TO-STAGING.md) with v0.6.0-specific steps.

---

## Pre-Deployment Checklist

### Tests

- [ ] `cd packages/shadow-index && npx vitest run` — 66 tests pass
- [ ] `cd packages/lens-extension && npm test` — all pass
- [ ] `cd packages/matter-core && cargo test` — all pass

### Analytics Endpoints

- [ ] `POST /v1/analytics/event` — accepts view and click events
- [ ] `GET /v1/analytics/report` — returns aggregated data with valid from/to

---

## v0.6.0-Specific Verification

### Analytics Ingestion

1. Load matter-demo or catalog-upload
2. Click a matter:// link — overlay appears
3. Click "Buy Now" — checkout opens
4. Verify events in `data/events/YYYY-MM-DD.jsonl` (or ANALYTICS_EVENTS_DIR)

### Analytics Report

```bash
# After POSTing events, or with fixture data in test_data/events/
curl "http://localhost:3000/v1/analytics/report?from=2026-02-21&to=2026-02-23&groupBy=day"
```

Expected: 200, JSON with `ok: true`, `rows` array, `summary` object.

---

## Environment

- **ANALYTICS_EVENTS_DIR:** Optional. Default: `data/events/`
- **Events retention:** 90 days (configurable)

---

## Reference

- [DEPLOYMENT-TO-STAGING.md](./DEPLOYMENT-TO-STAGING.md)
- [ANALYTICS-PRODUCTION-READINESS.md](./ANALYTICS-PRODUCTION-READINESS.md)
