# .things that Matter
## Delivery Timeline — Realistic Dates (As of Feb 12, 2026)

---

| **Document Information** | |
|--------------------------|---|
| **Company Name** | .things that Matter |
| **Document Type** | Delivery Timeline & Schedule |
| **Version** | 2.1 |
| **Date** | February 12, 2026 |
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

## 2. Current Status (As of Feb 12, 2026)

| Dimension | Status | Detail |
|-----------|--------|--------|
| **Product baseline** | **Sprints 1–5 complete** | MVP core delivered; beta launch prep complete; release `v0.6.2` tagged and pushed. |
| **Quality** | **Stable** | 88/88 tests passing; core compile → resolve → overlay flow validated. |
| **Immediate blockers** | **Open (critical)** | Store screenshots, public privacy policy URL, initial beta outreach, Chrome Web Store submission. |
| **Current sprint** | **Sprint 6 in progress** | Feb 12 – Feb 26, 2026. Focus: extension 1.0 release readiness and launch hardening. |
| **Next milestone** | **Sprint 8 launch candidate** | Public launch candidate target by Mar 27, 2026; launch target Mar 28, 2026. |
| **Risks / blockers** | **Execution risk** | Store review lead time and beta onboarding cadence are now on the critical path. |

**Stakeholder takeaway:** The core innovation — compile → store (R2/local) → resolve → matter:// → extension overlay — is delivered and working. Remaining work is execution and launch hardening across Sprints 6–8.

---

## 3. Sprint Window: Planned vs Actual (Jan 20 – Mar 27, 2026)

Sprints are tracked with baseline plan and execution updates. Sprints 1–5 are complete. Sprint 6 is active.

| Sprint | Planned Window | Actual Window | Status | Focus | Key Deliverable |
|--------|----------------|---------------|--------|-------|-----------------|
| **Sprint 0** | By Jan 19, 2026 | By Jan 19, 2026 | **Complete** | Setup and architecture | Environment, contracts, monorepo, planning |
| **Sprint 1** | Jan 20 – Feb 5, 2026 | Jan 20 – Feb 5, 2026 | **Complete** | Full MVP through batch/catalog | Core compile → resolve → overlay + batch/catalog; `v0.4.0` |
| **Sprint 2** | Feb 6 – Feb 19, 2026 | Feb 6 – Feb 19, 2026 | **Complete** | Extension caching & polish | MVP-13 IndexedDB cache + validation; `v0.5.0` |
| **Sprint 3** | Feb 20 – Mar 5, 2026 | Feb 20 – Mar 9, 2026 | **Complete** | Analytics & observability | MVP-14 events, reporting, dashboard; `v0.5.5` |
| **Sprint 4** | Mar 6 – Mar 19, 2026 | Feb 10 – Mar 10, 2026 | **Complete** | Optimization & scaling | Performance hardening + operations/security docs; `v0.6.0` |
| **Sprint 5** | Mar 20 – Apr 2, 2026 | Mar 20 – Apr 2, 2026 | **Complete** | Beta launch prep | Landing/store assets/support + closure docs; `v0.6.2` |
| **Sprint 6** | Feb 12 – Feb 26, 2026 | TBD | **In Progress** | Extension 1.0 release readiness | Store submission + hardening + release gate |
| **Sprint 7** | Feb 27 – Mar 12, 2026 | TBD | **Planned** | Active beta program | 5–10 merchant onboarding + feedback loop |
| **Sprint 8** | Mar 13 – Mar 27, 2026 | TBD | **Planned** | Public launch readiness | Launch candidate + sign-off + `v1.0` readiness |

**Summary:**
- **Sprints 1–5:** complete and released through `v0.6.2`.
- **Sprints 6–8:** execution window for store release, beta scale-up, and launch candidate.

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

## 5. What Remains (Execution Scope: Sprints 6–8)

### 5.1 Sprints 6–8 (Feb 12 – Mar 27, 2026)

| Sprint | Window | Scope | Output |
|--------|--------|-------|--------|
| **Sprint 6** | Feb 12 – Feb 26 | Immediate blockers + extension 1.0 hardening | Store submission package, release gate, release process docs |
| **Sprint 7** | Feb 27 – Mar 12 | Beta merchant onboarding and support loop | >=3 active merchants, feedback cadence, triage SLA operating |
| **Sprint 8** | Mar 13 – Mar 27 | Public launch readiness | Launch playbooks, sign-off review, launch candidate tag |

### 5.2 Immediate Blockers (Due by Feb 14, 2026)

| Blocker | Owner | Status | Exit Criteria |
|---------|-------|--------|---------------|
| Chrome store screenshots (3–5) | CTO | Open | PNG assets in `packages/lens-extension/store/screenshots/` |
| Public privacy policy URL (HTTPS) | CTO/DevOps | Open | Live URL validated and recorded in checklist |
| First outreach to Acme + Globex | CEO | Open | Merchant status updated to `Invited` |
| Chrome Web Store submission | CTO | Open | Submission confirmation and listing URL |

---

## 6. Revised Milestone Summary

| Milestone | Revised date | Status |
|-----------|--------------|--------|
| Contract signed | Jan 21, 2026 | Done |
| MVP through beta prep (`v0.6.2`) | **Feb 11, 2026** | Done (Sprints 1–5) |
| Sprint 6 release readiness gate | **Feb 26, 2026** | In Progress |
| Beta program activation | **Mar 12, 2026** | Planned (Sprint 7) |
| Public launch candidate | **Mar 27, 2026** | Planned (Sprint 8) |
| Target public launch (`v1.0`) | **Mar 28, 2026** | Planned |

---

## 7. Dependencies & Critical Path

```
Setup (Sprint 0) → Sprint 1-5 (MVP + hardening + beta prep) [DONE through v0.6.2]
                                 ↓
Immediate blockers (screenshots/privacy/outreach/submission) [DUE Feb 14]
                                 ↓
Sprint 6 (release readiness) → Sprint 7 (active beta) → Sprint 8 (launch readiness)
                                 ↓
                    Chrome Web Store published → Public launch target (Mar 28, 2026)
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

**Document Version:** 2.1  
**Last Updated:** February 12, 2026  
**Next Review:** Sprint 6 midpoint (Feb 19, 2026)
