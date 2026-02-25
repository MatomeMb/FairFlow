# Beta User Onboarding Guide

**Sprint 4 Week 4**  
**Date:** February 10, 2026  
**Audience:** Beta merchants and developers

---

## 1. Quick Start

### 1. Get API Access

1. Request an API key from the team.
2. Store it securely; never commit to git.
3. Use in requests: `x-api-key: <your-key>` or `Authorization: Bearer <your-key>`.

### 2. Compile Your First Product

```bash
curl -X POST https://your-api/compile \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_KEY" \
  -d '{
    "title": "Product Name",
    "price": 2999,
    "currency": "USD",
    "image_url": "https://example.com/image.jpg",
    "checkout_url": "https://merchant.com/buy"
  }'
```

Response includes `hash`, `matter_uri`, `thing_url`.

### 3. Batch Import

```bash
curl -X POST https://your-api/catalog/import \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_KEY" \
  -d '{
    "products": [
      { "title": "A", "price": 100, "currency": "USD" },
      { "title": "B", "price": 200, "currency": "USD" }
    ]
  }'
```

Or upload CSV with header: `title,price,currency,image_url,checkout_url`.

### 4. Catalog Upload (Web UI)

A minimal web interface is available for batch import without using curl:

1. Start both services: `npm run demo` (from project root), or separately: `npm run start:api` and `npm run start:demo`.
2. Open http://localhost:5177/catalog-upload.html (API at http://localhost:3000).
3. Set API base URL to `http://localhost:3000` (or your API URL) and optional API key.
4. Select a CSV or JSON file (CSV: `title,price,currency`; JSON: `{ "products": [ ... ] }`). Use the sample link for a ready-made CSV.
5. Click "Upload and compile" to receive matter URIs and error summary.

**Location:** `demo/catalog-upload.html`. Also linked from `demo/index.html`.

---

## 2. Analytics Integration

### Event Schema

**View event:**
```json
{
  "event": "view",
  "hash": "64-char-hex",
  "source_url": "https://your-site.com"
}
```

**Click event:**
```json
{
  "event": "click",
  "hash": "64-char-hex",
  "source_url": "https://your-site.com",
  "target_action": "checkout_initiated"
}
```

### Ingest Events

```bash
curl -X POST https://your-api/v1/analytics/event \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_KEY" \
  -d '{
    "event": "view",
    "hash": "abc123...",
    "source_url": "https://your-site.com"
  }'
```

### Fetch Reports

```bash
curl "https://your-api/v1/analytics/report?from=2026-02-01&to=2026-02-28&groupBy=day" \
  -H "x-api-key: YOUR_KEY"
```

---

## 3. Dashboard

### Access

`GET https://your-api/v1/analytics/dashboard` — HTML status page.

### Features

- **Alert status** — Error rate, slow queries
- **Storage & quota** — Usage vs limit
- **Query cache** — Hit rate, size, evictions
- **Pre-aggregation** — Last run, file count
- **Query histogram** — Latency distribution
- **Error summary** — Last 24h

### Alert Interpretation

| Alert | Meaning | Action |
|-------|---------|--------|
| Error rate > 5% | Many failed requests | Check logs; verify payloads |
| Slow queries | Some reports > 1s | Check date range; await pre-aggregation |

---

## 4. Common Issues

### 401 Unauthorized

- Ensure `x-api-key` or `Authorization: Bearer` is set.
- Verify key is valid and not revoked.
- Contact support if key was recently rotated.

### 429 Rate Limit

- Limit: 100 requests/minute per IP (configurable).
- Implement exponential backoff.
- Batch requests where possible.

### 400 Invalid Params

- For `POST /compile`: validate `title`, `price`, `currency` (required).
- For `GET /v1/analytics/report`: use `from` and `to` in `YYYY-MM-DD` format.

### Empty Report

- Check date range; events must exist for those dates.
- Verify events were ingested successfully.

---

## 5. Support

- **Documentation:** [OPERATIONS-MANUAL.md](./OPERATIONS-MANUAL.md)
- **Security:** [SECURITY-VERIFICATION-REPORT.md](./SECURITY-VERIFICATION-REPORT.md)
- **API:** Health check at `GET /health`
- **Triage and templates:** [SUPPORT-WORKFLOW.md](./SUPPORT-WORKFLOW.md)
- **Contact:** Request API keys and report issues via your designated beta coordinator or team contact.

---

## 6. Review Sign-Off

| Reviewer | Date | Status |
|----------|------|--------|
| CTO | 2026-02-10 | [OK] Reviewed |

**Checklist:** [SPRINT-4-GATE-4-CLOSURE.md](./SPRINT-4-GATE-4-CLOSURE.md#beta-onboarding-review-checklist)

---

*Document: BETA-USER-ONBOARDING.md. Sprint 4 Week 4. Ready for beta launch.*
