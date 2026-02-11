# Progress and Version — Sprint State

Single source of truth for **code version**, **sprint state**, and **next sprint**. Update this file at sprint boundaries and when shipping increments.

---

## Current status (as of Feb 2026)

| Area | Status | Notes |
|------|--------|-------|
| **Product** | **Sprint 5 COMPLETE** | Landing, store assets, support, demo polish, Week 2 docs. 88 tests passing. |
| **Releases** | **v0.6.2** | Sprint 5 closure. Privacy policy hosted; beta outreach/feedback templates; screenshot guide. |
| **Next** | **Beta launch** | First beta merchants; Chrome Web Store submission (screenshots, deploy); soft beta start. |
| **Risks** | **None** | 88/88 tests passing. |
| **Stakeholder** | **CTO** | Sprint 5 complete. |

**References:** Day-level work and estimates → [16-WEEKLY-WORK-PLAN.md](./16-WEEKLY-WORK-PLAN.md). Timeline and milestones → [15-DELIVERY-TIMELINE.md](./15-DELIVERY-TIMELINE.md).

---

## Code version (current)

| Package | Version | Notes |
|---------|---------|--------|
| **shadow-index** | **0.6.0** | Performance optimizations (caching, pre-aggregation, streaming I/O), retention policy, storage monitoring |
| **lens-extension** | **0.3.0** | MVP-13 cache, performance instrumentation, SHA-256 validation |
| **matter-core** | **0.3.0** | Rust Compiler, matter CLI binary |

**Release label:** `v0.6.2` (Sprint 5 complete — delivered Feb 2026).

**Reproducing this state:** Use git tag `v0.6.2`. Run full demo: `npm run demo` (API + demo server). Landing: http://localhost:5177/. Demo: http://localhost:5177/index.html. Privacy: http://localhost:5177/privacy-policy.html. Dashboard: http://localhost:3000/v1/analytics/dashboard.

---

## Sprint state

| Sprint | Window | Status | Goal |
|--------|--------|--------|------|
| **Sprint 0** | By Jan 19, 2026 | **Complete** | Setup and architecture |
| **Sprint 1** | Jan 20 – Feb 5, 2026 | **Complete** | Full MVP: compile → resolve → display; v0.4.0 |
| **Sprint 2** | Feb 6 – Feb 19, 2026 | **Complete** | MVP-13 extension caching (IndexedDB), performance polish, validation; v0.5.0 |
| **Sprint 3** | Feb 20 – Feb 9, 2026 | **Complete** | Analytics & Observability (MVP-14), API logging, reporting; v0.5.5 |
| **Sprint 4** | Feb 10 – Mar 10, 2026 | **Complete** | Optimization & Scaling (Weeks 3–4 COMPLETE); v0.6.0 |
| **Sprint 5** | Mar 20 – Apr 2, 2026 | **Complete** | Beta launch prep: landing, store assets, support, Week 2 docs |

**Next:** First beta merchants; Chrome Web Store submission. See [SPRINT-5-CLOSURE.md](./SPRINT-5-CLOSURE.md), [SPRINT-5-PLAN.md](./SPRINT-5-PLAN.md), [SUPPORT-WORKFLOW.md](./SUPPORT-WORKFLOW.md), [CHROME-WEB-STORE-CHECKLIST.md](./CHROME-WEB-STORE-CHECKLIST.md).

---

## Overall progress

| Area | State | Notes |
|------|--------|------|
| **Shadow Index API** | Done | Analysis reporting, Dashboard, Retention, Storage Monitor, Query Cache (T3.1), Pre-aggregation (T3.2), Stream I/O (T3.3) |
| **Lens extension** | Done | MV3, matter:// intercept, overlay; XMP beacon (MVP-07); IndexedDB cache (MVP-13); Firefox compat + manifest_v2 |
| **Platform test harness** | Done | JSON output (MVP-08); generate-report integration |
| **Demo flow** | Done | Landing page; demo server; catalog-upload.html; matter-demo.html; mobile-responsive; E2E validation |
| **Tests** | Done | 88/88 Vitest (API, auth, batch, catalog, cache, aggregation, retention, storage, api-key-registry); Playwright (E2E) |
| **Rust compiler** | Done | Compiler::compile(), matter CLI |
| **P1** | Done | MVP-07–MVP-10 complete and tested |
| **P2 (batch/catalog)** | Done | MVP-11, MVP-12; catalog-upload demo delivered |
| **P3 (analytics)** | Done | MVP-14 complete (Sprint 3); reporting engine and dashboard delivered |
| **P4 (optimization)** | Done | Week 3–4 complete; p95 < 250ms; hit rate > 60%; security hardening; production docs |

---

## P1 / P2 (complete — delivered in Sprint 1 by Feb 5, 2026)

| ID | Story | Status |
|----|--------|--------|
| **MVP-07** | XMP beacon detection | Done |
| **MVP-08** | Platform test harness results logging | Done |
| **MVP-09** | Basic auth and rate limits | Done |
| **MVP-10** | Error handling polish | Done |
| **MVP-11** | Batch compilation | Done |
| **MVP-12** | Merchant catalog import | Done |

**Backlog reference:** [10-MVP-BACKLOG.md](./10-MVP-BACKLOG.md).

---

## How to update this doc

- **After a sprint closeout:** Update "Sprint state", "Overall progress", and "Code version" if you bumped versions.
- **When tagging a release:** Set "Release label" and note the tag under "Reproducing this state."

---

*Last updated: Feb 2026. Sprint 5 complete. Privacy policy hosted, beta templates, screenshot guide. Next: Beta merchants, Chrome Web Store.*
