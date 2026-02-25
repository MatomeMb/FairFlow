# Release Notes — v0.6.0

**Release Date:** February 11, 2026  
**Sprint:** Sprint 4 (Optimization & Scaling)  
**Status:** Production Ready

---

## Summary

v0.6.0 completes Sprint 4 production hardening for **.things that Matter** Shadow Index API. This release delivers sustained load testing, security hardening with API key revocation, operations documentation, scaling roadmaps, and beta onboarding readiness.

---

## Highlights

| Area | Deliverable |
|------|-------------|
| **Load Testing** | `npm run load-test` — validates throughput, error rate, cache hit rate |
| **Security** | API key registry with revocation (`SHADOW_INDEX_REVOKED_KEYS`); configurable rate limits |
| **Documentation** | Operations Manual, Database Migration Roadmap, Distributed Deployment Architecture |
| **Beta Readiness** | Beta User Onboarding Guide; Catalog Upload demo; full prototype |
| **Performance** | Query cache (hit rate > 60%); pre-aggregation; p95 latency improvements |

---

## Packages

| Package | Version | Notes |
|---------|---------|-------|
| shadow-index | 0.6.0 | Analytics, dashboard, retention, caching, security |
| lens-extension | 0.3.0 | MVP-13 IndexedDB cache |
| matter-core | 0.3.0 | Rust compiler, matter CLI |

---

## New Features

- **Sustained Load Test:** `npm run load-test [duration_min] [base_url]` — configurable duration (default 5 min) and target URL
- **API Key Revocation:** Revoked keys rejected immediately via `SHADOW_INDEX_REVOKED_KEYS`
- **Multi-Key Support:** `SHADOW_INDEX_API_KEYS` for comma-separated additional keys
- **Analytics Dashboard:** `GET /v1/analytics/dashboard` — storage, cache stats, query histogram, alerts
- **Manual Cache Clear:** `POST /v1/admin/cache/clear` for cache invalidation
- **Demo Launch:** `npm run demo` — starts API and demo server together

---

## Documentation Delivered

- [OPERATIONS-MANUAL.md](./OPERATIONS-MANUAL.md) — Deployment, monitoring, troubleshooting
- [DATABASE-MIGRATION-ROADMAP.md](./DATABASE-MIGRATION-ROADMAP.md) — JSONL to SQLite to PostgreSQL path
- [DISTRIBUTED-DEPLOYMENT-ARCHITECTURE.md](./DISTRIBUTED-DEPLOYMENT-ARCHITECTURE.md) — Multi-instance topology
- [BETA-USER-ONBOARDING.md](./BETA-USER-ONBOARDING.md) — Integration guide for beta merchants
- [SECURITY-VERIFICATION-REPORT.md](./SECURITY-VERIFICATION-REPORT.md) — Auth, rate limiting, revocation

---

## Test Results

- **88 tests passing** across 11 suites
- Vitest (API, analytics, cache, retention, storage, api-key-registry)
- All performance and security targets met

---

## Version Note

Sprint 4 Plan originally referenced v0.7.0 for Week 4. The released version is **v0.6.0**, which consolidates Sprint 3 analytics (MVP-14) and Sprint 4 production hardening into a single production-ready release. No v0.7.0 planned; next major increment will align with beta launch.

---

## Upgrade

From v0.5.x: no breaking changes. New environment variables are optional: `SHADOW_INDEX_REVOKED_KEYS`, `SHADOW_INDEX_API_KEYS`, `RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW_MS`.

---

*Prepared by: CTO. Document: RELEASE-NOTES-v0.6.0.md*
