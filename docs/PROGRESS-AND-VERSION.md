# Progress and Version — Sprint State

Single source of truth for **code version**, **sprint state**, and **P1 (next sprint) stage**. Update this file at sprint boundaries and when shipping increments.

---

## Current status (as of March 2026)

| Area | Status | Notes |
|------|--------|-------|
| **Product** | **MVP path live** | End-to-end flow works: compile → store (R2/local) → resolve → matter:// → extension overlay. Batch and catalog import operational. |
| **Releases** | **v0.4.0** | shadow-index 0.4.0 (batch, catalog); lens-extension 0.2.0; matter-core 0.3.0. Tag `v0.4.0` created and pushed. |
| **Next** | **Sprint 5** | MVP-13 extension caching (IndexedDB), overlay polish, cross-browser check. Start: Mar 31, 2026. Day-by-day plan: [16-WEEKLY-WORK-PLAN.md](./16-WEEKLY-WORK-PLAN.md). |
| **Risks** | **None** | No known blockers. R2 and API keys configured; tests passing. |
| **Stakeholder** | **CEO** | Weekly sync; demo available via catalog-upload and matter-demo pages. |

**References:** Day-level work and estimates → [16-WEEKLY-WORK-PLAN.md](./16-WEEKLY-WORK-PLAN.md). Revised milestones and timeline → [15-DELIVERY-TIMELINE.md](./15-DELIVERY-TIMELINE.md).

---

## Code version (current)

| Package | Version | Notes |
|---------|---------|--------|
| **shadow-index** | **0.4.0** | R2 storage (MVP-03), auth, rate limit; batch + catalog import (MVP-11, MVP-12) |
| **lens-extension** | 0.2.0 | XMP beacon detection (MVP-07) |
| **matter-core** | 0.3.0 | Rust Compiler::compile(), matter CLI, hash matches API |

**Release label:** `v0.4.0` (Sprint 4 complete)

**Reproducing this state:** Use git tag `v0.4.0`. See [Sprint 4 Plan](./14-SPRINT-4-PLAN.md). Run API: `cd packages/shadow-index && npm run start`. Demo: `node scripts/demo-server.mjs 5178` then open http://localhost:5178/catalog-upload.html. R2: set STORAGE_MODE=r2 and CLOUDFLARE_R2_* in packages/shadow-index/.env.

---

## Sprint state

| Sprint | Window | Status | Goal |
|--------|--------|--------|------|
| **Sprint 1** | Feb 3 – Feb 16, 2026 | **Complete** | MVP vertical slice: compile → resolve → display with `matter://` |
| **Sprint 2** | Feb 17 – Mar 2, 2026 | **Complete** | P1: XMP beacon, platform results logging, auth/rate limits, error handling |
| **Sprint 3** | Mar 3 – Mar 16, 2026 | **Complete** | R2 storage (MVP-03), Rust Compiler::compile(), matter CLI; see [13-SPRINT-3-PLAN.md](./13-SPRINT-3-PLAN.md) |
| **Sprint 4** | Mar 17 – Mar 30, 2026 | **Complete** | Bulk ingestion & merchant tooling: POST /batch (MVP-11), POST /catalog/import (MVP-12), catalog-upload demo; see [14-SPRINT-4-PLAN.md](./14-SPRINT-4-PLAN.md) |

**Definition of Done (Sprint 1):** All MVP-01, MVP-02, MVP-04, MVP-05, MVP-06 done. Build passes, tests pass (Vitest 7/7, Playwright 2 automated + 1 manual, `cargo test` 8 pass / 3 ignored). Demo runbook and manual E2E doc in place.

**Detailed status:** [11-SPRINT-1-PLAN.md](./11-SPRINT-1-PLAN.md) — Final Status table, runbook, bugs fixed.

---

## Overall progress

| Area | State | Notes |
|------|--------|------|
| **Shadow Index API** | Done | Compile, resolve, health, thing, gist; CORS; auth (MVP-09); rate limit; error shape (MVP-10) |
| **Lens extension** | Done | MV3, matter:// intercept, overlay (image, title, price, Buy Now), icons; XMP beacon detection on image click (MVP-07) |
| **Platform test harness** | Done | JSON output with xmp_survives, eof_survives (MVP-08); generate-report integration |
| **Demo flow** | Done | create-mvp-demo.ps1, demo server, Picsum image; end-to-end works; E2E smoke test and manual validation complete |
| **Tests** | Done | Vitest (API + auth), Playwright (E2E), cargo test (steg); manual smoke doc; MVP-09 auth tests included |
| **Rust compiler** | Done | Compiler::compile(), matter CLI (Sprint 3) |
| **P1 (Sprint 2)** | Done | MVP-07–MVP-10 complete and tested |
| **P2 (Sprint 4)** | Done | MVP-11 (batch), MVP-12 (catalog import), catalog-upload demo delivered |

---

## P1 stage (Sprint 2 – complete)

P1 items for **Sprint 2** (Feb 17 – Mar 2, 2026) are **all done**. See [12-SPRINT-2-PLAN.md](./12-SPRINT-2-PLAN.md) and [CTO-NEXT-STEPS-SPRINT-2-CLOSEOUT.md](./CTO-NEXT-STEPS-SPRINT-2-CLOSEOUT.md).

| ID | Story | Status | Acceptance criteria (from backlog) |
|----|--------|--------|-------------------------------------|
| **MVP-07** | XMP beacon detection (basic) | Done | Extension parses XMP from JPEG/PNG; click on image with beacon shows overlay |
| **MVP-08** | Platform test harness results logging | Done | `platform-test test-extraction --output <file>` writes JSON; `generate-report` consumes it |
| **MVP-09** | Basic auth and rate limits | Done | Optional `SHADOW_INDEX_API_KEY`; 100 req/min per IP; Vitest auth tests |
| **MVP-10** | Error handling polish | Done | API `{ code, message, details? }`; overlay shows API error message |

**Backlog reference:** [10-MVP-BACKLOG.md](./10-MVP-BACKLOG.md) — P1 section.

**Sprint 3 (complete):** MVP-03 (R2 storage), Rust Compiler::compile(), matter CLI delivered. See [13-SPRINT-3-PLAN.md](./13-SPRINT-3-PLAN.md), [RUST-COMPILER-CTO-GUIDE.md](./RUST-COMPILER-CTO-GUIDE.md).

**Sprint 4 (complete):** P2 bulk ingestion and merchant tooling. MVP-11 (POST /batch), MVP-12 (POST /catalog/import), catalog-upload demo. See [14-SPRINT-4-PLAN.md](./14-SPRINT-4-PLAN.md).

---

## How to update this doc

- **After a sprint closeout:** Update "Sprint state", "Overall progress", and "Code version" if you bumped versions; add or adjust "P1 stage" if scope changed.
- **When starting P1 work:** Change the relevant P1 row from "Not started" to "In progress" and add a short note.
- **When tagging a release:** Set "Release label" and note the tag (e.g. `v0.1.0`) under "Reproducing this state."

---

*Last updated: Sprint 4 closeout (Mar 2026). Tag `v0.4.0` = Sprint 4 complete (batch, catalog import, demo).*
