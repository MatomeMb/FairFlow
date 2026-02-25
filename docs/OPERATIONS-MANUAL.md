# Operations Manual — Shadow Index API

**Version:** v0.6.0  
**Date:** February 10, 2026  
**Sprint 4 Week 4**

---

## 1. Overview

The Shadow Index API provides product compilation, hash resolution, and analytics reporting. This manual covers deployment, monitoring, and troubleshooting.

---

## 2. Deployment

### Prerequisites

- Node.js 18+
- Optional: Cloudflare R2 (for `STORAGE_MODE=r2`)

### Local / Self-Hosted

```bash
cd packages/shadow-index
npm install
cp .env.example .env  # Edit with your values
npm run build
npm run start
```

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 3000 | HTTP port |
| `STORAGE_MODE` | No | local | `local` or `r2` |
| `SHADOW_INDEX_API_KEY` | No | — | Primary API key (enables auth) |
| `SHADOW_INDEX_API_KEYS` | No | — | Additional keys (comma-separated) |
| `SHADOW_INDEX_REVOKED_KEYS` | No | — | Revoked keys (comma-separated) |
| `RATE_LIMIT_MAX` | No | 100 | Requests per window |
| `RATE_LIMIT_WINDOW_MS` | No | 60000 | Rate limit window (ms) |
| `ANALYTICS_EVENTS_DIR` | No | data/events | Events directory |
| `RETENTION_DAYS` | No | 90 | Days before archiving |
| `CACHE_TTL_SECONDS` | No | 3600 | Query cache TTL |
| `CACHE_MAX_ENTRIES` | No | 512 | Max cached reports |

### R2 Storage

Set `STORAGE_MODE=r2` and configure:

- `CLOUDFLARE_R2_ACCOUNT_ID`
- `CLOUDFLARE_R2_ACCESS_KEY_ID`
- `CLOUDFLARE_R2_SECRET_ACCESS_KEY`
- `CLOUDFLARE_R2_BUCKET_NAME`

---

## 3. Scheduled Jobs

### Pre-Aggregation (Nightly)

Run at 00:00 UTC for optimal query performance:

```bash
cd packages/shadow-index
npm run pre-aggregate
```

Cron example:

```
0 0 * * * cd /path/to/shadow-index && npm run pre-aggregate
```

### Retention Cleanup

Trigger manually via dashboard or API:

```
POST /v1/admin/retention/run
```

Or schedule weekly:

```
0 2 * * 0 curl -X POST https://your-api/v1/admin/retention/run
```

---

## 4. Optional Tools

### Catalog Upload (Merchant Lite)

A static web page for batch catalog import is available at `demo/catalog-upload.html`. It accepts CSV or JSON, posts to `POST /catalog/import`, and displays matter URIs and errors.

**To serve:** Run `npm run demo` (starts API + demo server) or `npm run start:demo` (demo only). Access at `http://localhost:5177/catalog-upload.html`. The page posts to the API (default: http://localhost:3000).

### Sustained Load Test

For extended validation, run the load test script:

```bash
cd packages/shadow-index
npm run load-test [duration_min] [base_url]
```

Default: 5 minutes, http://localhost:3000. For 24h validation, use `1440` as duration.

### Manual Cache Invalidation

Admin endpoint `POST /v1/admin/cache/clear` flushes the query cache. Accessible from the analytics dashboard or via curl. Redirects to dashboard when submitted via form.

---

## 5. Monitoring

### Dashboard

`GET /v1/analytics/dashboard` — HTML status page with:

- Alert status
- Storage & quota
- Query cache stats
- Pre-aggregation status
- Query time histogram
- Error summary

### Health Check

`GET /health` — Returns `{ status: "ok" }`. Use for load balancer probes.

### Key Metrics

| Metric | Target | Alert if |
|--------|--------|----------|
| 90-day query p95 | < 250ms | > 500ms |
| Cache hit rate | > 60% | < 50% |
| Error rate | < 5% | > 5% |
| Storage usage | < 90% | > 95% |

---

## 6. Troubleshooting

### High Memory

- Check dashboard for concurrent queries.
- Reduce `CACHE_MAX_ENTRIES` or `CACHE_MAX_MBYTES`.
- Run `POST /v1/admin/cache/clear` to empty cache.

### Slow Queries

- Ensure pre-aggregation is running nightly.
- Verify cache hit rate; low hits may indicate unique query patterns.
- Check event file count; consider increasing retention or archiving.

### 429 Rate Limit

- Increase `RATE_LIMIT_MAX` or reduce request frequency.
- Client should implement exponential backoff.

### API Key Revoked

1. Add key to `SHADOW_INDEX_REVOKED_KEYS`.
2. Redeploy or restart.
3. Issue new key via `SHADOW_INDEX_API_KEY` or `SHADOW_INDEX_API_KEYS`.

### Event Ingestion Failures

- Verify `ANALYTICS_EVENTS_DIR` is writable.
- Check disk quota.
- Review error log (dashboard or `lib/error-logger`).

---

## 7. Backup & Recovery

### Data to Backup

- `data/things/` — .thing files
- `data/index.json` — Hash index
- `data/events/` — Analytics events (JSONL)
- `data/aggregates/` — Pre-aggregated reports (optional)

### Recovery

1. Restore `data/` directory.
2. Restart API.
3. Run `npm run pre-aggregate` to regenerate aggregates if needed.

---

## 8. Security

- Never commit `.env` or API keys.
- Rotate keys periodically.
- Use `SHADOW_INDEX_REVOKED_KEYS` for compromised keys.
- Restrict admin endpoints in production (firewall or auth).

See [SECURITY-VERIFICATION-REPORT.md](./SECURITY-VERIFICATION-REPORT.md).

---

*Last updated: Feb 10, 2026. Sprint 4 Week 4.*
