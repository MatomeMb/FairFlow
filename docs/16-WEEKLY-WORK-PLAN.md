# .things that Matter
## Weekly Work Plan — Day-by-Day Schedule & Realistic Estimates

---

| **Document Information** | |
|--------------------------|---|
| **Company Name** | .things that Matter |
| **Document Type** | Weekly Work Plan (Day-by-Day) |
| **Version** | 1.0 |
| **Date** | March 2026 |
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

## 3. Current Status (As of March 2026)

**Full current status:** [PROGRESS-AND-VERSION.md](./PROGRESS-AND-VERSION.md). Summary: MVP path live (v0.4.0); next Sprint 5 (MVP-13 extension caching); no blockers.

---

## 4. Completed Sprints — Weekly Summary (Actuals)

### Sprint 1 (Feb 3 – Feb 16, 2026) — MVP vertical slice
- **Week 1:** API design and compile/resolve/thing endpoints; extension shell and matter:// handling; basic overlay.
- **Week 2:** E2E wiring; Vitest and Playwright tests; demo runbook; sprint review and release.

### Sprint 2 (Feb 17 – Mar 2, 2026) — P1 hardening
- **Week 1:** XMP beacon detection in extension; platform test harness JSON output; auth middleware and rate limit.
- **Week 2:** Error response shape; overlay error display; Vitest auth tests; documentation.

### Sprint 3 (Mar 3 – Mar 16, 2026) — R2 + Rust compiler
- **Week 1:** R2 storage module; STORAGE_MODE; uploadThing/getThing; API wired to R2.
- **Week 2:** Rust Compiler::compile(), matter CLI; hash alignment with API; tests and runbook.

### Sprint 4 (Mar 17 – Mar 30, 2026) — Batch & merchant lite
- **Week 1:** compileAndPersistProduct helper; POST /batch with validation and 207; Vitest batch tests.
- **Week 2:** POST /catalog/import (JSON + CSV); catalog-upload.html; matter-demo paste-URI; v0.4.0 tag.

---

## 5. Sprint 5 (Mar 31 – Apr 13, 2026) — Extension Caching & Polish

**Goal:** MVP-13 IndexedDB caching; overlay performance; cross-browser check.  
**Capacity:** ~56h deliverable.

### Week 1 (Mar 31 – Apr 4)

| Day | Date | Planned work | Est. (h) | Deliverable |
|-----|------|----------------|----------|-------------|
| **Mon** | Mar 31 | Sprint planning; refine MVP-13 acceptance criteria; design IndexedDB schema (store: hash → { gist, thing_url, fetchedAt }) | 6 | Plan + schema doc |
| **Tue** | Apr 1 | Implement IndexedDB wrapper in extension (open DB, get/set/delete by hash); unit test in isolation | 6 | cache.js + tests |
| **Wed** | Apr 2 | Integrate cache into resolve flow: check cache before API; on API success write cache; optional TTL (e.g. 24h) | 6 | Cache-on-read path |
| **Thu** | Apr 3 | Cache invalidation (version key or clear); handle API errors (don’t cache); overlay uses cached gist when available | 6 | Robust cache behaviour |
| **Fri** | Apr 4 | Mid-sprint refinement; fix overlay flicker when loading from cache; manual test matter:// → overlay with cache | 5 | Cache E2E working |

### Week 2 (Apr 7 – Apr 11)

| Day | Date | Planned work | Est. (h) | Deliverable |
|-----|------|----------------|----------|-------------|
| **Mon** | Apr 7 | Cross-browser smoke test (Chrome, Edge); fix any compatibility issues; document supported browsers | 6 | Compatibility note |
| **Tue** | Apr 8 | Overlay performance: reduce reflows; lazy-load image; measure and log slow paths | 5 | Performance improvements |
| **Wed** | Apr 9 | Extension tests (manual or automated) for cache hit/miss; update README and runbook | 5 | Tests + docs |
| **Thu** | Apr 10 | Integration test full flow; regression pass; fix bugs from testing | 6 | Stable build |
| **Fri** | Apr 11 | Sprint review, demo to CEO; retrospective; release checklist; tag (e.g. lens v0.3.0) and update PROGRESS | 5 | Sprint 5 closed |

**Sprint 5 total:** ~56h.

---

## 6. Sprint 6 (Apr 14 – Apr 27, 2026) — Analytics & Observability

**Goal:** MVP-14 view/click events; API logging; minimal export or dashboard.  
**Capacity:** ~56h deliverable.

### Week 1 (Apr 14 – Apr 18)

| Day | Date | Planned work | Est. (h) | Deliverable |
|-----|------|----------------|----------|-------------|
| **Mon** | Apr 14 | Sprint planning; define event schema (view: hash, timestamp, source; click: hash, target e.g. checkout); decide storage (API log vs local file vs Supabase) | 6 | Event spec + storage choice |
| **Tue** | Apr 15 | API: POST /events or internal log; middleware to record resolve/compile with timestamp; optional batch event endpoint | 6 | Event ingestion path |
| **Wed** | Apr 16 | Extension: fire “view” when overlay shown; fire “click” on Buy Now; send to API or local buffer | 5 | Extension events |
| **Thu** | Apr 17 | Persist events (file or DB); avoid PII; retention policy (e.g. 90 days); simple query by date range | 6 | Event storage |
| **Fri** | Apr 18 | Export endpoint or script: CSV/JSON of events for date range; or minimal dashboard page (counts by day) | 5 | Export or dashboard |

### Week 2 (Apr 21 – Apr 25)

| Day | Date | Planned work | Est. (h) | Deliverable |
|-----|------|----------------|----------|-------------|
| **Mon** | Apr 21 | API request logging (method, path, status, duration); rotate or size-bound log; no sensitive data | 5 | Request logs |
| **Tue** | Apr 22 | Error logging and alerting path (e.g. log to file; optional webhook); document runbook for ops | 5 | Error observability |
| **Wed** | Apr 23 | Vitest tests for event endpoints; manual test event flow end-to-end | 5 | Tests |
| **Thu** | Apr 24 | Docs: analytics runbook, event schema, privacy note; update PROGRESS and roadmap | 5 | Documentation |
| **Fri** | Apr 25 | Sprint review, retro; release; tag (e.g. shadow-index v0.5.0 if API changes) | 4 | Sprint 6 closed |

**Sprint 6 total:** ~52h.

---

## 7. Sprint 7 (Apr 28 – May 11, 2026) — Beta Readiness

**Goal:** Merchant onboarding doc; support process; 5–10 beta targets; stability fixes.  
**Capacity:** ~56h deliverable.

### Week 1 (Apr 28 – May 2)

| Day | Date | Planned work | Est. (h) | Deliverable |
|-----|------|----------------|----------|-------------|
| **Mon** | Apr 28 | Sprint planning; list beta readiness checklist (env, API key, CSV format, limits, support channel) | 4 | Checklist |
| **Tue** | Apr 29 | Write merchant onboarding doc: how to get API key, POST /batch and /catalog/import, CSV template, matter:// usage | 6 | Onboarding doc |
| **Wed** | Apr 30 | Support process: where to report issues (email/GitHub); SLA (e.g. 48h response); FAQ draft | 4 | Support process |
| **Thu** | May 1 | Identify 5–10 beta targets (companies or contacts); draft outreach message; CEO alignment | 4 | Beta list + message |
| **Fri** | May 2 | Stability: run full test suite; fix flaky tests; address known open bugs; performance smoke test | 6 | Stability pass |

### Week 2 (May 5 – May 9)

| Day | Date | Planned work | Est. (h) | Deliverable |
|-----|------|----------------|----------|-------------|
| **Mon** | May 5 | Demo environment checklist: API, demo server, sample data; one-page “how to run demo” for stakeholders | 4 | Demo runbook |
| **Tue** | May 6 | Security pass: no secrets in logs; rate limit and auth documented; CORS and API key best practices | 4 | Security checklist |
| **Wed** | May 7 | Beta outreach: send first 3–5 emails/messages; track responses; iterate on message if needed | 4 | Outreach started |
| **Thu** | May 8 | Integration test with real R2 and sample catalog; document any env gotchas | 5 | Integration validated |
| **Fri** | May 9 | Sprint review, retro; release; update PROGRESS; handoff to Sprint 8 (beta launch prep) | 4 | Sprint 7 closed |

**Sprint 7 total:** ~45h (more stakeholder/CEO time; adjust if CTO capacity allows more dev).

---

## 8. Sprint 8 (May 12 – May 25, 2026) — Beta Launch Prep

**Goal:** Chrome Web Store assets; landing/demo pages; support workflow; soft beta start.  
**Capacity:** ~56h deliverable.

### Week 1 (May 12 – May 16)

| Day | Date | Planned work | Est. (h) | Deliverable |
|-----|------|----------------|----------|-------------|
| **Mon** | May 12 | Sprint planning; Chrome Web Store requirements: icons, description, screenshots, privacy policy URL | 4 | Store checklist |
| **Tue** | May 13 | Extension: icons 128/48/16; store description and short tagline; draft privacy policy (data we collect) | 5 | Store assets draft |
| **Wed** | May 14 | Landing page (single page): value prop, how it works, “Get Extension” link, “For developers” (API/docs) | 6 | Landing page |
| **Thu** | May 15 | Demo page polish: ensure catalog-upload and matter-demo work from landing; mobile-friendly where relevant | 4 | Demo polish |
| **Fri** | May 16 | Support workflow: triage process; template responses for common questions; document in onboarding | 4 | Support workflow |

### Week 2 (May 19 – May 23)

| Day | Date | Planned work | Est. (h) | Deliverable |
|-----|------|----------------|----------|-------------|
| **Mon** | May 19 | Chrome Web Store listing finalise; screenshots; submit for review (or prepare for unlisted/beta) | 5 | Store submission prep |
| **Tue** | May 20 | First beta merchants: onboard 1–2; compile their catalog; collect feedback | 6 | First beta users |
| **Wed** | May 21 | Fix any blockers from beta feedback; small improvements to onboarding doc | 5 | Iteration |
| **Thu** | May 22 | 75% milestone review with CEO; roadmap alignment for Jun–Dec; document decisions | 4 | Stakeholder alignment |
| **Fri** | May 23 | Sprint review, retro; release; tag (e.g. v0.6.0); update PROGRESS and 15-DELIVERY-TIMELINE | 4 | Sprint 8 closed |

**Sprint 8 total:** ~47h.

---

## 9. Post–May 2026 (High-Level Weekly Focus)

| Period | Focus | Notes |
|--------|--------|------|
| **Jun (Weeks 1–4)** | Full merchant dashboard (optional) or tooling polish | 2–3 weeks if dashboard; else extension 1.0 polish |
| **Jul (Weeks 1–4)** | Extension 1.0; Chrome Web Store public or unlisted | Store approval; docs; support |
| **Aug – Sep** | Beta program | 5–10 merchants; 1,000+ products; feedback loop |
| **Oct – Dec** | Public launch | Store listing; marketing; v1.0; Phase 2 prep |

Day-level plans for Jun–Dec will be created at the start of Sprint 8 or when Sprint 8 is closed.

---

## 10. How to Use This Document

- **Daily:** Start the day with the planned task and estimated hours; log any deviation (blocker, scope change).
- **Weekly:** Every Monday, confirm the week’s plan with CEO if needed; every Friday, note what was completed and what slipped.
- **Sprint boundary:** Align with [15-DELIVERY-TIMELINE.md](./15-DELIVERY-TIMELINE.md) and [PROGRESS-AND-VERSION.md](./PROGRESS-AND-VERSION.md); update this doc if scope or capacity changes.
- **Stakeholder reporting:** Use §3 (Current status) and the relevant sprint’s week/day table for “what’s being worked on.”

---

**Document Version:** 1.0  
**Last Updated:** March 2026  
**Next Review:** Start of Sprint 5 (Mar 31, 2026)
