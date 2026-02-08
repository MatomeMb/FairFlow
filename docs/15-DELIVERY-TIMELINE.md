# .things that Matter
## Delivery Timeline — Realistic Dates (As of Feb 8, 2026)

---

| **Document Information** | |
|--------------------------|---|
| **Company Name** | .things that Matter |
| **Document Type** | Delivery Timeline & Schedule |
| **Version** | 2.0 |
| **Date** | February 8, 2026 |
| **Author** | Matome Mboweni, CTO |
| **Status** | Active — single source of truth for delivery dates |

---

## 1. Executive Summary

**.things that Matter** is building the infrastructure for **Object-Oriented Commerce**: products as portable, self-sovereign digital objects that can be compiled, resolved, and distributed via `matter://` URIs and a browser extension.

This document is the **single source of truth** for:

- **Actual delivery:** All work completed **by Feb 5, 2026** is recorded under **Sprint 1** (Jan 20 – Feb 5, 2026). This includes MVP vertical slice, P1 hardening, R2 storage, Rust compiler, batch/catalog API, and lite merchant demo.
- **Remaining scope:** Sprints 2–8 (Feb 6 – May 14, 2026) with 2-week cadence. Day-by-day breakdown and hour estimates: [16-WEEKLY-WORK-PLAN.md](./16-WEEKLY-WORK-PLAN.md).
- **Revised milestones:** Phase 1 through Dec 2026, with dates aligned to actual progress as of Feb 5, 2026.

**Timeline principle:** Dates reflect reality. Today is **Feb 5, 2026**. Everything shipped to date is attributed to the current sprint (Sprint 1) ending today. Future sprints start Feb 6, 2026.

---

## 2. Current Status (As of Feb 5, 2026)

| Dimension | Status | Detail |
|-----------|--------|--------|
| **Production readiness** | **MVP path live** | Shadow Index API (v0.4.0): compile, batch, catalog/import, resolve, thing, gist; R2 or local storage; auth and rate limit when configured. |
| **Browser extension** | **Functional** | Lens extension (v0.2.0): matter:// interception, overlay, XMP beacon detection. No client-side cache yet (MVP-13 planned Sprint 2). |
| **Rust compiler** | **Production-ready** | matter-core v0.3.0: `Compiler::compile()`, matter CLI; hash aligned with API. |
| **Demo & merchant UX** | **Usable** | catalog-upload.html (CSV/JSON → matter URIs); matter-demo.html (paste matter://); Node demo server; sample catalog. |
| **Tests** | **Passing** | Vitest (API, auth, batch, catalog); Playwright (E2E); cargo test (steg). |
| **Next sprint** | **Sprint 2** | Feb 6 – Feb 19, 2026. MVP-13 extension caching (IndexedDB), overlay polish. See [16-WEEKLY-WORK-PLAN.md §5](./16-WEEKLY-WORK-PLAN.md#5-sprint-2-feb-6--feb-19-2026--extension-caching--polish). |
| **Risks / blockers** | **None** | R2 and API keys configured; toolchains operational; no known critical bugs. |

**Stakeholder takeaway:** The core innovation — compile → store (R2/local) → resolve → matter:// → extension overlay — is **delivered and working**. Remaining work (Sprints 2–8) focuses on caching, analytics, beta readiness, and launch prep.

---

## 3. Sprint Window: Completed + Planned (Feb 5 – May 14, 2026)

Sprints are **2 weeks** each. **Sprint 1** ended Feb 5, 2026. **Sprint 2** starts Feb 6, 2026.

| Sprint | Window | Status | Focus | Deliverables (actual or planned) |
|--------|--------|--------|-------|-----------------------------------|
| **Sprint 0** | By Jan 19, 2026 | **Done** | Setup and architecture | Environment, contracts, monorepo, planning |
| **Sprint 1** | Jan 20 – Feb 5, 2026 | **Done** | Full MVP through batch/catalog | compile → resolve → matter:// → overlay; XMP beacon; auth/rate limit/errors; R2 storage; Rust compiler; POST /batch, POST /catalog/import; catalog-upload & matter-demo; v0.4.0 |
| **Sprint 2** | Feb 6 – Feb 19, 2026 | **In Progress** | Extension caching & polish | MVP-13: IndexedDB cache integrated (Thu Feb 12); cross-browser Fri Feb 13; Firefox prep complete. [FRIDAY-EXECUTION-GUIDE](./FRIDAY-EXECUTION-GUIDE.md). |
| **Sprint 3** | Feb 20 – Mar 5, 2026 | Planned | Analytics & observability | MVP-14: view/click events; API logging; export or minimal dashboard. [16-WEEKLY-WORK-PLAN §6](./16-WEEKLY-WORK-PLAN.md#6-sprint-3-feb-20--mar-5-2026--analytics--observability). |
| **Sprint 4** | Mar 6 – Mar 19, 2026 | Planned | Beta readiness | Merchant onboarding doc; support process; 5–10 beta targets; stability. [16-WEEKLY-WORK-PLAN §7](./16-WEEKLY-WORK-PLAN.md#7-sprint-4-mar-6--mar-19-2026--beta-readiness). |
| **Sprint 5** | Mar 20 – Apr 2, 2026 | Planned | Beta launch prep | Chrome Web Store assets; landing/demo pages; support workflow; soft beta start. [16-WEEKLY-WORK-PLAN §8](./16-WEEKLY-WORK-PLAN.md#8-sprint-5-mar-20--apr-2-2026--beta-launch-prep). |
| **Sprint 6** | Apr 3 – Apr 16, 2026 | Planned | Extension 1.0 / merchant tooling | Full merchant dashboard (optional) or extension 1.0 polish; Chrome release-ready. |
| **Sprint 7** | Apr 17 – Apr 30, 2026 | Planned | Beta program | 5–10 merchants; 1,000+ products; feedback loop. |
| **Sprint 8** | May 1 – May 14, 2026 | Planned | Public launch prep | Store submission; landing; docs; support; v1.0 readiness. |

**Summary:**
- **Sprint 1 (done):** All deliverables through Feb 5, 2026; v0.4.0 released.
- **Sprints 2–8 (planned):** Caching, analytics, beta readiness, launch prep; day-by-day plan in [16-WEEKLY-WORK-PLAN.md](./16-WEEKLY-WORK-PLAN.md).

---

## 4. What Was Delivered (Actuals — By Feb 5, 2026)

All of the following was completed **within Sprint 1 (Jan 20 – Feb 5, 2026)**:

- **Shadow Index API:** POST /compile, GET /resolve, GET /thing, GET /gist, health; CORS; optional API key auth (MVP-09); 100 req/min rate limit; consistent error shape (MVP-10).
- **R2 storage (MVP-03):** STORAGE_MODE=r2; .thing and image stored and retrievable.
- **Rust compiler:** `Compiler::compile()`, matter CLI; hash algorithm aligned with API.
- **Lens extension:** matter:// intercept, overlay (title, price, image, Buy Now); XMP beacon detection (MVP-07).
- **P1 hardening:** Platform test harness with JSON results (MVP-08); auth and rate limit (MVP-09); error handling (MVP-10).
- **Bulk & merchant lite:** POST /batch (MVP-11), POST /catalog/import (MVP-12); catalog-upload.html; matter-demo.html (paste matter://); Node demo server; sample-catalog.csv.
- **Tests:** Vitest (API, auth, batch, catalog); Playwright (E2E); cargo test (steg).
- **Release:** v0.4.0 tagged.

---

## 5. What Remains (Realistic Scope & Duration)

### 5.1 Sprints 2–8 (Feb 6 – May 14, 2026)

| Sprint | Window | Scope | Rationale |
|--------|--------|--------|-----------|
| **Sprint 2** | Feb 6 – Feb 19 | MVP-13 (extension caching), overlay polish | IndexedDB cache; 2 weeks for MVP cache + polish. |
| **Sprint 3** | Feb 20 – Mar 5 | MVP-14 (analytics/events), API observability | View/click events; logging; 2 weeks for minimal pipeline. |
| **Sprint 4** | Mar 6 – Mar 19 | Beta readiness | Onboarding doc, support process, target list, stability. |
| **Sprint 5** | Mar 20 – Apr 2 | Beta launch prep | Store assets, landing, support workflow, first beta merchants. |
| **Sprint 6** | Apr 3 – Apr 16 | Merchant dashboard (optional) / extension 1.0 | Polish and Chrome release-ready. |
| **Sprint 7** | Apr 17 – Apr 30 | Beta program | 5–10 merchants; 1,000+ products; feedback. |
| **Sprint 8** | May 1 – May 14 | Public launch prep | Store submission; landing; docs; v1.0. |

### 5.2 Post–May 2026 (Phase 1 to Dec 2026)

| Period | Focus | Key deliverables |
|--------|--------|-------------------|
| **May – Jun 2026** | Extension 1.0 polish, Chrome Web Store | Release-ready extension; store listing. |
| **Jul – Sep 2026** | Beta program | 5–10 merchants; feedback loop. |
| **Oct – Dec 2026** | Public launch | Chrome Web Store; landing; docs; support; v1.0. |

---

## 6. Revised Milestone Summary

| Milestone | Revised date | Status |
|-----------|--------------|--------|
| Contract signed | Jan 21, 2026 | Done |
| Phase 0 / MVP through batch & catalog | **Feb 5, 2026** | Done (Sprint 1) |
| Extension caching + analytics (75%) | **Mar 5, 2026** | Planned (Sprint 3) |
| Beta readiness | **Mar 19, 2026** | Planned (Sprint 4) |
| Beta launch prep | **Apr 2, 2026** | Planned (Sprint 5) |
| Beta program | **Apr 30, 2026** | Planned (Sprint 7) |
| Public launch (100%) | **Dec 15, 2026** | Unchanged |

---

## 7. Dependencies & Critical Path

```
Setup (Sprint 0) → Sprint 1 (MVP + P1 + R2 + Rust + batch/catalog) [DONE by Feb 5]
                                 ↓
Sprint 2 (caching) → Sprint 3 (analytics) → Sprint 4 (beta readiness) → Sprint 5 (beta prep)
                                 ↓
Sprint 6 (extension 1.0) → Sprint 7 (beta program) → Sprint 8 (launch prep)
                                 ↓
                    Chrome Web Store → Public launch (Dec 2026)
```

---

## 8. Work Estimate Assumptions

Capacity: 6h/day productive dev, ~56–60h per 2-week sprint. Ceremonies ~4h/sprint. See [16-WEEKLY-WORK-PLAN.md §2](./16-WEEKLY-WORK-PLAN.md#2-work-estimate-assumptions).

---

## 9. How to Use This Document

- **Sprint planning:** Use Sprints 2–8 as baseline; day-level detail in [16-WEEKLY-WORK-PLAN.md](./16-WEEKLY-WORK-PLAN.md).
- **Stakeholder reporting:** §2 (Current status) and §3 (Sprint window); §6 (Milestone summary).
- **Budget & roadmap:** Align [04-DEVELOPMENT-ROADMAP.md](./04-DEVELOPMENT-ROADMAP.md) and [06-BUDGET-FINANCIAL-PROJECTIONS.md](./06-BUDGET-FINANCIAL-PROJECTIONS.md) with dates in §6.

---

**Document Version:** 2.0  
**Last Updated:** February 8, 2026  
**Next Review:** End of Sprint 2 (Feb 19, 2026)
