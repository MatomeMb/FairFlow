# .things that Matter
## Weekly Work Plan — Day-by-Day Schedule & Realistic Estimates

---

| **Document Information** | |
|--------------------------|---|
| **Company Name** | .things that Matter |
| **Document Type** | Weekly Work Plan (Day-by-Day) |
| **Version** | 2.1 |
| **Date** | February 12, 2026 |
| **Author** | Matome Mboweni, CTO |
| **Status** | Active — use for daily discipline and stakeholder alignment |

---

## 1. Purpose & Scope

This document provides **day-level work breakdown** and **realistic time estimates** for the Phase 1 delivery of **.things that Matter** — the infrastructure for Object-Oriented Commerce and portable, viral product distribution. It is intended for:

- **CTO:** Daily focus and sprint commitment.
- **CEO / stakeholders:** Visibility into what is being worked on each week and each day.
- **Project control:** Basis for re-planning if scope or capacity changes.

**Principle:** Treat this as a real product driving innovation; estimates are based on a single full-time developer (CTO) with 6 hours of productive development per day and 2-week sprints (~60 hours per sprint), with buffer for meetings, support, and unplanned work.

---

## 2. Work Estimate Assumptions

| Assumption | Value | Notes |
|------------|--------|------|
| **Working days per week** | 5 | Mon–Fri |
| **Productive dev hours per day** | 6 | Excludes standups, email, admin, context switch |
| **Hours per week (planned)** | 28–30 | ~5 days × 6h; 2–4h reserved for meetings/buffer |
| **Hours per 2-week sprint** | 56–60 | 10 working days; ~10% buffer for unplanned |
| **Sprint ceremonies** | ~4h per sprint | Planning 1.5h, refinement 0.5h, review/retro 1.5h, release 0.5h |
| **Capacity per sprint (deliverable)** | ~52–56h | After ceremonies and buffer |

All task estimates below are in **hours (h)** and are intended to be realistic for an experienced developer working in a known codebase.

---

## 3. Current Status (As of Feb 12, 2026)

**Full current status:** [PROGRESS-AND-VERSION.md](./PROGRESS-AND-VERSION.md). Summary: Sprints 1–5 complete (`v0.6.2`), 88/88 tests passing, core MVP delivered. Next focus is Sprint 6 execution (extension 1.0 release readiness and launch hardening).

---

## 4. Completed Sprints — Summary (Actuals)

### Sprint 1 (Jan 20 – Feb 5, 2026) — Full MVP through batch & catalog

All work delivered **by Feb 5, 2026** (current sprint):

- **API:** compile, resolve, thing, gist, health; CORS; auth (MVP-09); rate limit; error shape (MVP-10); R2 storage (MVP-03); POST /batch (MVP-11); POST /catalog/import (MVP-12).
- **Extension:** matter:// intercept, overlay; XMP beacon detection (MVP-07).
- **Rust:** Compiler::compile(), matter CLI; hash aligned with API.
- **P1:** Platform test harness JSON (MVP-08); auth and rate limit (MVP-09); error handling (MVP-10).
- **Demo:** catalog-upload.html, matter-demo.html, demo server, sample-catalog.csv.
- **Tests:** Vitest (API, auth, batch, catalog); Playwright (E2E); cargo test (steg).
- **Release:** v0.4.0 tagged.

---

## 5. Sprint 2 (Feb 6 – Feb 19, 2026) — Extension Caching & Polish

**Goal:** MVP-13 IndexedDB caching; overlay performance; cross-browser check.  
**Capacity:** ~56h deliverable.

### Week 1 (Feb 6 – Feb 12)

| Day | Date | Planned work | Est. (h) | Deliverable |
|-----|------|----------------|----------|-------------|
| **Fri** | Feb 6 | Sprint planning; refine MVP-13 acceptance criteria; design IndexedDB schema (store: hash → { gist, thing_url, fetchedAt }) | 6 | Plan + schema doc |
| **Mon** | Feb 9 | Implement IndexedDB wrapper in extension (open DB, get/set/delete by hash); unit test in isolation | 6 | cache.js + tests |
| **Tue** | Feb 10 | Integrate cache into resolve flow: check cache before API; on API success write cache; optional TTL (e.g. 24h) | 6 | Cache-on-read path |
| **Wed** | Feb 11 | Cache invalidation (version key or clear); handle API errors (don’t cache); overlay uses cached gist when available | 6 | Robust cache behaviour |
| **Thu** | Feb 12 | Mid-sprint refinement; fix overlay flicker when loading from cache; manual test matter:// → overlay with cache | 5 | Cache E2E working |

### Week 2 (Feb 13 – Feb 19)

| Day | Date | Planned work | Est. (h) | Deliverable |
|-----|------|----------------|----------|-------------|
| **Fri** | Feb 13 | Cross-browser smoke test (Chrome, Edge); fix any compatibility issues; document supported browsers | 6 | Compatibility note |
| **Tue** | Apr 8 | Overlay performance: reduce reflows; lazy-load image; measure and log slow paths | 5 | Performance improvements |
| **Tue** | Feb 17 | Extension tests (manual or automated) for cache hit/miss; update README and runbook | 5 | Tests + docs |
| **Thu** | Apr 10 | Integration test full flow; regression pass; fix bugs from testing | 6 | Stable build |
| **Thu** | Feb 19 | Sprint review, demo to CEO; retrospective; release checklist; tag (e.g. lens v0.3.0) and update PROGRESS | 5 | Sprint 2 closed |

**Sprint 2 total:** ~56h.

---

## 6. Sprint 3 (Feb 20 – Mar 5, 2026) — Analytics & Observability

**Goal:** MVP-14 view/click events; API logging; minimal export or dashboard.  
**Capacity:** ~56h deliverable.

### Week 1 (Feb 20 – Feb 26)

| Day | Date | Planned work | Est. (h) | Deliverable |
|-----|------|----------------|----------|-------------|
| **Fri** | Feb 20 | Sprint 3 Planning Meeting; Design event schema; choose storage strategy (Postgres/D1 vs JSON logs) | 6 | Plan + Schema |
| **Mon** | Feb 23 | Extension: Background script hooks for "overlay:open" event. Unique user ID generation (anon). | 6 | Event dispatch logic |
| **Tue** | Feb 24 | Content Script: Hook "Buy Now" click events; relay to background; add performance timing to payload. | 6 | Conversion tracking |
| **Wed** | Feb 25 | API: Implement `POST /v1/analytics/event`. Add Zod validation; CORS check; basic ingestion logic. | 6 | API Ingestion active |
| **Thu** | Feb 26 | Persistence: Local SQL or JSON-append storage implementation in `shadow-index`. High-volume safety. | 6 | Persistent event logs |

### Week 2 (Feb 27 – Mar 5)

| Day | Date | Planned work | Est. (h) | Deliverable |
|-----|------|----------------|----------|-------------|
| **Fri** | Feb 27 | Aggregation: Daily background job (or on-demand) to count views/clicks per hash. | 6 | Aggregated data |
| **Mon** | Mar 2 | Reporting: API endpoint `GET /v1/analytics/report?hash=...`; unit tests for aggregation correctess. | 6 | Report API endpoint |
| **Tue** | Mar 3 | Minimal Dashboard: Internal HTML page showing top products and API throughput metrics. | 6 | Internal Dashboard |
| **Wed** | Mar 4 | E2E Integration: Click product → Verify event in DB → Verify report count update. Buffer for bugs. | 6 | Verified end-to-end |
| **Thu** | Mar 5 | Sprint review; Demo to CEO; Retrospective; v0.6.0 release; update PROGRESS-AND-VERSION. | 6 | Sprint 3 closed |

**Sprint 3 total:** ~60h.

---

## 7. Sprint 4 (Mar 6 – Mar 19, 2026) — Merchant Platform Polish

---

| Day | Date | Planned work | Est. (h) | Deliverable |
|-----|------|----------------|----------|-------------|
| **Mon** | Feb 20 | Sprint planning; define event schema (view: hash, timestamp, source; click: hash, target e.g. checkout); decide storage (API log vs local file vs Supabase) | 6 | Event spec + storage choice |
| **Tue** | Apr 15 | API: POST /events or internal log; middleware to record resolve/compile with timestamp; optional batch event endpoint | 6 | Event ingestion path |
| **Wed** | Feb 22 | Extension: fire “view” when overlay shown; fire “click” on Buy Now; send to API or local buffer | 5 | Extension events |
| **Thu** | Feb 23 | Persist events (file or DB); avoid PII; retention policy (e.g. 90 days); simple query by date range | 6 | Event storage |
| **Fri** | Apr 18 | Export endpoint or script: CSV/JSON of events for date range; or minimal dashboard page (counts by day) | 5 | Export or dashboard |

### Week 2 (Feb 27 – Mar 5)

| Day | Date | Planned work | Est. (h) | Deliverable |
|-----|------|----------------|----------|-------------|
| **Mon** | Feb 27 | API request logging (method, path, status, duration); rotate or size-bound log; no sensitive data | 5 | Request logs |
| **Tue** | Feb 28 | Error logging and alerting path (e.g. log to file; optional webhook); document runbook for ops | 5 | Error observability |
| **Wed** | Apr 23 | Vitest tests for event endpoints; manual test event flow end-to-end | 5 | Tests |
| **Thu** | Mar 2 | Docs: analytics runbook, event schema, privacy note; update PROGRESS and roadmap | 5 | Documentation |
| **Fri** | Mar 3 | Sprint review, retro; release; tag (e.g. shadow-index v0.5.0 if API changes) | 4 | Sprint 3 closed |

**Sprint 3 total:** ~52h.

---

## 7. Sprint 4 (Mar 6 – Mar 19, 2026) — Beta Readiness

**Goal:** Merchant onboarding doc; support process; 5–10 beta targets; stability fixes.  
**Capacity:** ~56h deliverable.

### Week 1 (Mar 6 – Mar 10)

| Day | Date | Planned work | Est. (h) | Deliverable |
|-----|------|----------------|----------|-------------|
| **Mon** | Mar 6 | Sprint planning; list beta readiness checklist (env, API key, CSV format, limits, support channel) | 4 | Checklist |
| **Tue** | Apr 29 | Write merchant onboarding doc: how to get API key, POST /batch and /catalog/import, CSV template, matter:// usage | 6 | Onboarding doc |
| **Wed** | Mar 8 | Support process: where to report issues (email/GitHub); SLA (e.g. 48h response); FAQ draft | 4 | Support process |
| **Thu** | Mar 9 | Identify 5–10 beta targets (companies or contacts); draft outreach message; CEO alignment | 4 | Beta list + message |
| **Fri** | May 2 | Stability: run full test suite; fix flaky tests; address known open bugs; performance smoke test | 6 | Stability pass |

### Week 2 (Mar 13 – Mar 19)

| Day | Date | Planned work | Est. (h) | Deliverable |
|-----|------|----------------|----------|-------------|
| **Mon** | Mar 13 | Demo environment checklist: API, demo server, sample data; one-page “how to run demo” for stakeholders | 4 | Demo runbook |
| **Tue** | Mar 14 | Security pass: no secrets in logs; rate limit and auth documented; CORS and API key best practices | 4 | Security checklist |
| **Wed** | Mar 15 | Beta outreach: send first 3–5 emails/messages; track responses; iterate on message if needed | 4 | Outreach started |
| **Thu** | May 8 | Integration test with real R2 and sample catalog; document any env gotchas | 5 | Integration validated |
| **Fri** | Mar 17 | Sprint review, retro; release; update PROGRESS; handoff to Sprint 5 (beta launch prep) | 4 | Sprint 4 closed |

**Sprint 4 total:** ~45h (more stakeholder/CEO time; adjust if CTO capacity allows more dev).

---

## 8. Sprint 5 (Mar 20 – Apr 2, 2026) — Beta Launch Prep

**Goal:** Chrome Web Store assets; landing/demo pages; support workflow; soft beta start.  
**Capacity:** ~56h deliverable.

### Week 1 (Mar 20 – Mar 26)

| Day | Date | Planned work | Est. (h) | Deliverable |
|-----|------|----------------|----------|-------------|
| **Fri** | Mar 20 | Sprint planning; Chrome Web Store requirements: icons, description, screenshots, privacy policy URL | 4 | Store checklist |
| **Mon** | Mar 23 | Extension: icons 128/48/16; store description and short tagline; draft privacy policy (data we collect) | 5 | Store assets draft |
| **Tue** | Mar 24 | Landing page (single page): value prop, how it works, “Get Extension” link, “For developers” (API/docs) | 6 | Landing page |
| **Thu** | May 15 | Demo page polish: ensure catalog-upload and matter-demo work from landing; mobile-friendly where relevant | 4 | Demo polish |
| **Thu** | Mar 26 | Support workflow: triage process; template responses for common questions; document in onboarding | 4 | Support workflow |

### Week 2 (Mar 27 – Apr 2)

| Day | Date | Planned work | Est. (h) | Deliverable |
|-----|------|----------------|----------|-------------|
| **Mon** | May 19 | Chrome Web Store listing finalise; screenshots; submit for review (or prepare for unlisted/beta) | 5 | Store submission prep |
| **Mon** | Mar 30 | First beta merchants: onboard 1–2; compile their catalog; collect feedback | 6 | First beta users |
| **Tue** | Mar 31 | Fix any blockers from beta feedback; small improvements to onboarding doc | 5 | Iteration |
| **Thu** | May 22 | 75% milestone review with CEO; roadmap alignment for Jun–Dec; document decisions | 4 | Stakeholder alignment |
| **Thu** | Apr 2 | Sprint review, retro; release; tag (e.g. v0.6.0); update PROGRESS and 15-DELIVERY-TIMELINE | 4 | Sprint 5 closed |

**Sprint 5 total:** ~47h.

---

## 9. Sprint 6 (Feb 12 – Feb 26, 2026) — Release Readiness & Launch Hardening

**Goal:** Clear store blockers and complete extension 1.0 release readiness gate.  
**Capacity:** ~56h deliverable.

### Week 1 (Feb 12 – Feb 16)

| Day | Date | Planned work | Est. (h) | Owner | Deliverable |
|-----|------|----------------|----------|-------|-------------|
| **Mon** | Feb 12 | Immediate blocker triage: screenshot plan, privacy policy deployment option, outreach package handoff, store submission checklist audit | 6 | CTO | Blocker board with owners and due dates |
| **Tue** | Feb 13 | Capture store screenshots (matter overlay, product overlay, catalog upload, landing hero) and save to `packages/lens-extension/store/screenshots/` | 6 | CTO | 3-5 approved PNG screenshots |
| **Wed** | Feb 14 | Deploy privacy policy to public HTTPS URL and verify in browser/curl; update `CHROME-WEB-STORE-CHECKLIST.md` with final URL | 6 | CTO/DevOps | Public privacy policy URL validated |
| **Thu** | Feb 15 | Build extension production bundle, zip output, and complete Chrome Web Store listing form (unlisted beta target) | 6 | CTO | Submission-ready package and listing draft |
| **Fri** | Feb 16 | Hardening pass 1: install flow, permission review, regression of compile -> resolve -> overlay flow; log defects | 6 | CTO | Hardening report and prioritized bug list |

### Week 2 (Feb 19 – Feb 26)

| Day | Date | Planned work | Est. (h) | Owner | Deliverable |
|-----|------|----------------|----------|-------|-------------|
| **Mon** | Feb 19 | Address P0/P1 issues from hardening; verify fixes with focused regression tests | 6 | CTO | P0/P1 closure candidate |
| **Tue** | Feb 20 | Chrome Web Store submission execution (upload, metadata final, unlisted/public choice) | 5 | CTO | Submission confirmation + listing URL |
| **Wed** | Feb 21 | Release process formalization and dry run for Lens extension | 5 | CTO | `RELEASE-PROCESS-LENS.md` validated |
| **Thu** | Feb 22 | Release gate review: quality, onboarding path, support readiness, unresolved defects | 5 | CTO + Product | `RELEASE-GATE-SPRINT-6.md` decision record |
| **Fri** | Feb 23 | Sprint review with CEO; update progress docs, risks, and next sprint plan | 4 | CTO + CEO | Sprint 6 review pack |

## 10. Sprints 7–8 (Feb 27 – Mar 27, 2026) — High-Level Focus

| Sprint | Window | Focus | Acceptance Anchor |
|--------|--------|-------|-------------------|
| **Sprint 7** | Feb 27 – Mar 12 | Beta program execution | >=3 active merchants, feedback loop operating, SLA met |
| **Sprint 8** | Mar 13 – Mar 27 | Public launch readiness | Launch candidate tagged + stakeholder sign-off |

## 11. Post–Mar 2026 (High-Level Focus)

| Period | Focus | Notes |
|--------|--------|------|
| **Apr – May** | Stabilize live beta and tune onboarding | Merchant growth, support quality, issue burn-down |
| **Jun – Sep** | Expand beta footprint | 10+ merchants, stronger reporting, conversion insights |
| **Oct – Dec** | Phase 2 preparation | Agentic commerce roadmap and platform upgrades |

---

## 12. How to Use This Document

- **Daily:** Start the day with the planned task and estimated hours; log any deviation (blocker, scope change).
- **Weekly:** Every Monday, confirm the week’s plan with CEO if needed; every Friday, note what was completed and what slipped.
- **Sprint boundary:** Align with [15-DELIVERY-TIMELINE.md](./15-DELIVERY-TIMELINE.md) and [PROGRESS-AND-VERSION.md](./PROGRESS-AND-VERSION.md); update this doc if scope or capacity changes.
- **Stakeholder reporting:** Use §3 (Current status) and the relevant sprint’s week/day table for “what’s being worked on.”

---

**Document Version:** 2.1  
**Last Updated:** February 12, 2026  
**Next Review:** Sprint 6 midpoint (Feb 19, 2026)
