# .things that Matter
## 8-Sprint Delivery Timeline (Feb – May 2026) & Revised Project Schedule

---

| **Document Information** | |
|--------------------------|---|
| **Company Name** | .things that Matter |
| **Document Type** | Delivery Timeline & Schedule (Revised) |
| **Version** | 1.1 |
| **Date** | March 2026 |
| **Author** | Matome Mboweni, CTO |
| **Status** | Active — single source of truth for delivery dates |

---

## 1. Executive Summary

**.things that Matter** is building the infrastructure for **Object-Oriented Commerce**: products as portable, self-sovereign digital objects that can be compiled, resolved, and distributed via `matter://` URIs and a browser extension. This is a **real product** intended to drive innovation in how commerce is shared and consumed across the internet.

This document is the **single source of truth** for:

- **Actual delivery:** What was completed in Sprints 1–4 (Feb–Mar 2026), with real dates and deliverables.
- **Realistic remaining scope:** Sprints 5–8 (Mar 31 – May 25, 2026) with 2-week cadence and **realistic work estimates** (see [16-WEEKLY-WORK-PLAN.md](./16-WEEKLY-WORK-PLAN.md) for day-by-day breakdown and hour estimates).
- **Revised milestones:** Phase 1 through Dec 2026, with dates adjusted for what was over- or under-estimated in the original plan.

**Key revisions from original planning:**
- **Delivered earlier than original plan:** MVP vertical slice, R2 storage, Rust compiler, batch/catalog API, and lite merchant demo were delivered in 4 × 2-week sprints (by end of Sprint 4, Mar 30, 2026).
- **Original plan overestimated:** Foundation/Core phases (e.g. 8–12 weeks) were compressed into focused MVP scope with clear acceptance criteria.
- **Original plan underestimated:** Extension polish, caching (MVP-13), analytics (MVP-14), and beta onboarding are now allocated full 2-week sprints with day-level plans and ~56h deliverable capacity per sprint.
- **Cadence:** 2-week Scrum sprints; one shippable increment per sprint; daily work plan in [16-WEEKLY-WORK-PLAN.md](./16-WEEKLY-WORK-PLAN.md).

---

## 2. Current Status (As of March 2026)

| Dimension | Status | Detail |
|-----------|--------|--------|
| **Production readiness** | **MVP path live** | Shadow Index API (v0.4.0) runs with R2 or local storage; compile, batch, catalog/import, resolve, thing, gist endpoints operational; auth and rate limit enabled when configured. |
| **Browser extension** | **Functional** | Lens extension (v0.2.0): matter:// interception, overlay (title, price, image, Buy Now), XMP beacon detection. No client-side cache yet (MVP-13 planned Sprint 5). |
| **Rust compiler** | **Production-ready** | matter-core v0.3.0: `Compiler::compile()`, matter CLI; hash algorithm aligned with API; .thing output compatible with Shadow Index. |
| **Demo & merchant UX** | **Usable** | catalog-upload.html (CSV/JSON upload → matter URIs); matter-demo.html (paste matter://, click to trigger overlay); Node demo server; sample catalog. |
| **Tests** | **Passing** | Vitest (API, auth, batch, catalog import); Playwright (E2E); cargo test (steg). All green for committed scope. |
| **Next sprint** | **Sprint 5** | MVP-13 extension caching (IndexedDB), overlay performance, cross-browser check. Day-by-day plan: [16-WEEKLY-WORK-PLAN.md §5](./16-WEEKLY-WORK-PLAN.md#5-sprint-5-mar-31--apr-13-2026--extension-caching--polish). |
| **Risks / blockers** | **None** | R2 and API keys configured; toolchains (Node, Rust) operational; no known critical bugs. |

**Stakeholder takeaway:** The core innovation — compile product → store in R2 → resolve via matter:// → display in extension — is **delivered and working**. Remaining work (Sprints 5–8) focuses on performance (caching), observability (analytics), and beta launch (onboarding, store assets, first merchants).

---

## 3. 8-Sprint Window: Feb – May 2026

Sprints are **2 weeks** each. Calendar boundaries are fixed; adjust sprint start day if your team uses a different anchor.

| Sprint | Window | Status | Focus | Deliverables (actual or planned) |
|--------|--------|--------|-------|-----------------------------------|
| **Sprint 1** | Feb 3 – Feb 16, 2026 | **Done** | MVP vertical slice | compile → resolve → matter:// → overlay; Vitest + Playwright |
| **Sprint 2** | Feb 17 – Mar 2, 2026 | **Done** | P1 hardening | XMP beacon (MVP-07), platform test logging (MVP-08), auth/rate limit (MVP-09), error shape (MVP-10) |
| **Sprint 3** | Mar 3 – Mar 16, 2026 | **Done** | R2 + Rust compiler | R2 storage (MVP-03), Rust `Compiler::compile()`, matter CLI, hash-aligned API |
| **Sprint 4** | Mar 17 – Mar 30, 2026 | **Done** | Bulk & merchant lite | POST /batch (MVP-11), POST /catalog/import (MVP-12), catalog-upload.html, matter-demo paste-URI |
| **Sprint 5** | Mar 31 – Apr 13, 2026 | Planned | Extension caching & polish | MVP-13: IndexedDB caching; overlay performance; cross-browser checks. See [16-WEEKLY-WORK-PLAN §5](./16-WEEKLY-WORK-PLAN.md#5-sprint-5-mar-31--apr-13-2026--extension-caching--polish). |
| **Sprint 6** | Apr 14 – Apr 27, 2026 | Planned | Analytics & observability | MVP-14: view/click events; API logging; export or minimal dashboard. See [16-WEEKLY-WORK-PLAN §6](./16-WEEKLY-WORK-PLAN.md#6-sprint-6-apr-14--apr-27-2026--analytics--observability). |
| **Sprint 7** | Apr 28 – May 11, 2026 | Planned | Beta readiness | Merchant onboarding doc; support process; 5–10 beta targets; stability. See [16-WEEKLY-WORK-PLAN §7](./16-WEEKLY-WORK-PLAN.md#7-sprint-7-apr-28--may-11-2026--beta-readiness). |
| **Sprint 8** | May 12 – May 25, 2026 | Planned | Beta launch prep | Chrome Web Store assets; landing/demo pages; support workflow; soft beta start. See [16-WEEKLY-WORK-PLAN §8](./16-WEEKLY-WORK-PLAN.md#8-sprint-8-may-12--may-25-2026--beta-launch-prep). |

**Feb–May 2026 summary:**
- **Sprints 1–4 (done):** MVP through batch/catalog and lite merchant demo; v0.4.0 released.
- **Sprints 5–8 (planned):** Caching, analytics, beta readiness, beta launch prep; each sprint has a day-by-day plan and realistic hour estimates in [16-WEEKLY-WORK-PLAN.md](./16-WEEKLY-WORK-PLAN.md).

---

## 4. What Was Delivered (Actuals)

### 4.1 By end of Sprint 1 (Feb 16, 2026)
- Shadow Index API: POST /compile, GET /resolve, GET /thing, GET /gist, health.
- Lens extension: matter:// intercept, overlay (title, price, image, Buy Now).
- End-to-end: product JSON → compile → matter:// link → overlay.
- Tests: Vitest (API), Playwright (E2E), manual smoke.

### 4.2 By end of Sprint 2 (Mar 2, 2026)
- XMP beacon detection in extension (MVP-07).
- Platform test harness with JSON results (MVP-08).
- Optional API key auth and 100 req/min rate limit (MVP-09).
- Consistent API error shape and overlay error display (MVP-10).

### 4.3 By end of Sprint 3 (Mar 16, 2026)
- R2 storage for .thing artifacts (MVP-03); STORAGE_MODE=r2.
- Rust compiler: `Compiler::compile()`, matter CLI; hash matches API.
- Single-product compile path production-ready.

### 4.4 By end of Sprint 4 (Mar 30, 2026)
- POST /batch: array of products, max 100/request, results + errors, 207 partial (MVP-11).
- POST /catalog/import: JSON or CSV, same persistence, imported/failed summary (MVP-12).
- demo/catalog-upload.html: upload CSV/JSON, show matter URIs and errors.
- matter-demo.html: paste matter:// URI, click to trigger overlay.
- Node demo server (scripts/demo-server.mjs); sample-catalog.csv.
- Release: v0.4.0 tagged.

---

## 5. What Remains (Realistic Scope & Duration)

### 5.1 Sprints 5–8 (Mar 31 – May 25, 2026)

| Sprint | Scope | Duration | Rationale |
|--------|--------|----------|-----------|
| **Sprint 5** | MVP-13 (extension caching), overlay polish | 2 weeks | IndexedDB cache for resolved products; reduces API calls; 2 weeks sufficient for MVP cache + basic polish. |
| **Sprint 6** | MVP-14 (analytics/events), API observability | 2 weeks | View/click events; logging; 2 weeks for minimal pipeline and export or dashboard. |
| **Sprint 7** | Beta readiness | 2 weeks | Merchant onboarding doc, support process, target list; stability and known-issue triage. |
| **Sprint 8** | Beta launch prep | 2 weeks | Store assets, landing/demo pages, support workflow; begin first beta merchants. |

### 5.2 Post–May 2026 (Revised Phase 1 to Dec 2026)

| Period | Focus | Duration | Key deliverables |
|--------|--------|----------|------------------|
| **Jun – Jul 2026** | Full merchant dashboard (optional), extension 1.0 polish | 4–6 weeks | Multi-page dashboard or confirm script/tooling sufficient; Chrome extension release-ready. |
| **Aug – Sep 2026** | Beta program | 6–8 weeks | 5–10 merchants; 1,000+ products compiled; feedback loop. |
| **Oct – Dec 2026** | Public launch | 8–10 weeks | Chrome Web Store submission; landing; docs; support; v1.0. |

Durations above are **realistic** for a 2-person team (CEO + CTO) and allow buffer for support and iteration.

---

## 6. Revised Milestone Summary

| Milestone | Original (pre-revision) | Revised (realistic) | Status |
|-----------|-------------------------|---------------------|--------|
| Contract signed | Jan 21, 2026 | Jan 21, 2026 | Done |
| Phase 0 / MVP slice | Mar 2, 2026 | Feb 16, 2026 | Done (Sprint 1) |
| P1 hardening (XMP, auth, errors) | — | Mar 2, 2026 | Done (Sprint 2) |
| R2 + Rust compiler (30%) | Apr 27, 2026 | Mar 16, 2026 | Done (Sprint 3) |
| Batch + catalog (50%) | Jul 20, 2026 | Mar 30, 2026 | Done (Sprint 4) |
| Extension caching + analytics (75%) | Aug 17, 2026 | May 25, 2026 | Planned (Sprint 8) |
| Beta launch (90%) | Oct 26, 2026 | Sep 30, 2026 | Planned |
| Public launch (100%) | Dec 15, 2026 | Dec 15, 2026 | Unchanged |

---

## 7. Dependencies & Critical Path (Updated)

```
Contract → Sprint 1 (MVP slice) → Sprint 2 (P1) → Sprint 3 (R2 + Rust) → Sprint 4 (batch/catalog)
                                                                              ↓
Sprint 5 (caching) → Sprint 6 (analytics) → Sprint 7 (beta readiness) → Sprint 8 (beta prep)
                                                                              ↓
                    Merchant dashboard (optional) → Beta program → Public launch
```

---

## 8. Work Estimate Assumptions

Capacity and hour assumptions (6h/day, 56–60h per sprint, ceremonies) are defined in [16-WEEKLY-WORK-PLAN.md §2](./16-WEEKLY-WORK-PLAN.md#2-work-estimate-assumptions). Day-by-day plans and task estimates for Sprints 5–8 are in that document.

---

## 9. How to Use This Document

- **Sprint planning:** Use Sprints 5–8 as the baseline for scope; adjust in sprint plans (e.g. 15-SPRINT-5-PLAN.md when created). Day-level detail: [16-WEEKLY-WORK-PLAN.md](./16-WEEKLY-WORK-PLAN.md).
- **Stakeholder reporting:** Use §2 (Current status) and §3 (8-Sprint window); §6 (Milestone summary) for dates.
- **Budget & roadmap:** Align [04-DEVELOPMENT-ROADMAP.md](./04-DEVELOPMENT-ROADMAP.md) and [06-BUDGET-FINANCIAL-PROJECTIONS.md](./06-BUDGET-FINANCIAL-PROJECTIONS.md) with the revised dates in §6.

---

**Document Version:** 1.1  
**Last Updated:** March 2026  
**Next Review:** End of Sprint 5 (Apr 13, 2026)
