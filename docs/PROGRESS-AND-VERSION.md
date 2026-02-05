# Progress and Version — Sprint State

Single source of truth for **code version**, **sprint state**, and **P1 (next sprint) stage**. Update this file at sprint boundaries and when shipping increments.

---

## Code version (current)

| Package | Version | Notes |
|---------|---------|--------|
| **shadow-index** | 0.2.0 | Auth (MVP-09), rate limit, error shape (MVP-10) |
| **lens-extension** | 0.2.0 | XMP beacon detection (MVP-07) |
| **matter-core** | 0.2.0 | Platform-test JSON logging (MVP-08) |

**Release label:** `v0.2.0` / Sprint 2 P1 complete

**Reproducing this state:** Use git tag `v0.2.0` (Sprint 2 P1 complete). See [Sprint 2 Closeout](./CTO-NEXT-STEPS-SPRINT-2-CLOSEOUT.md) or [How to Run the MVP Demo](./11-SPRINT-1-PLAN.md#how-to-run-the-mvp-demo) to run the full flow (Sprint 1 + Sprint 2 features).

---

## Sprint state

| Sprint | Window | Status | Goal |
|--------|--------|--------|------|
| **Sprint 1** | Feb 3 – Feb 16, 2026 | **Complete** | MVP vertical slice: compile → resolve → display with `matter://` |
| **Sprint 2** | Feb 17 – Mar 2, 2026 | **Complete** | P1: XMP beacon, platform results logging, auth/rate limits, error handling |

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
| **Rust compiler** | Deferred | Stub only; compile currently via API. Planned for Sprint 3 |
| **P1 (Sprint 2)** | Done | MVP-07–MVP-10 complete and tested |

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

**Sprint 3 scope:** To be planned. Recommended next items: Rust compiler (MVP-11) and R2 storage (MVP-03).

---

## How to update this doc

- **After a sprint closeout:** Update "Sprint state", "Overall progress", and "Code version" if you bumped versions; add or adjust "P1 stage" if scope changed.
- **When starting P1 work:** Change the relevant P1 row from "Not started" to "In progress" and add a short note.
- **When tagging a release:** Set "Release label" and note the tag (e.g. `v0.1.0`) under "Reproducing this state."

---

*Last updated: Sprint 2 closeout (Mar 2026). Sprint 2 P1 items complete; tag `v0.2.0` = Sprint 2 P1 complete; Sprint 1 demo flow remains stable and integrated.*
