# Optional Tasks Status

Sprint 4 optional ("nice to have") items and their implementation status.

## Optional Tasks

| Task | Status | Location | Notes |
|------|--------|----------|-------|
| **Merchant dashboard (lite)** | ✅ Done | `demo/catalog-upload.html` | Single-page CSV/JSON upload, posts to `POST /catalog/import`, shows batch/catalog results |
| **Manual cache invalidation** | ✅ Done | `POST /v1/admin/cache/clear` | Admin endpoint; Clear Cache button in analytics dashboard |
| **Cache stats in dashboard** | ✅ Done | Dashboard Query Cache section | Hit rate, size, evictions exposed |
| **Sustained load test** | ✅ Done | `npm run load-test` | Duration and base URL configurable; supports 24h validation |

## Documentation

- **BETA-USER-ONBOARDING.md** — Catalog Upload section with demo server + API setup
- **OPERATIONS-MANUAL.md** — Section 4: Optional Tools (Catalog Upload, Load Test, Cache Clear)

## Quick Reference

- **Full demo:** `npm run demo` (API + demo server) or `npm run start:demo` → http://localhost:5177/catalog-upload.html
- **API:** `cd packages/shadow-index && npm run start` → http://localhost:3000
- **Load Test:** `cd packages/shadow-index && npm run load-test [duration_min] [base_url]`
- **Cache Clear:** `POST /v1/admin/cache/clear` or dashboard button
