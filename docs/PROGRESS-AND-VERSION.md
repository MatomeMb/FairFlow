# Progress and Version — Sprint State

Single source of truth for **code version**, **sprint state**, and **next sprint**. Update this file at sprint boundaries and when shipping increments.

---

## Current status (as of Feb 19, 2026)

| Area | Status | Notes |
|------|--------|-------|
| **Product** | **Sprint 2 COMPLETE** | MVP-13 IndexedDB cache integrated, validated across browsers. Performance logging and SHA-256 validation added. |
| **Releases** | **v0.3.0 / v0.5.0** | lens-extension 0.3.0; shadow-index 0.5.0; matter-core 0.3.0. |
| **Next** | **Sprint 3** | Feb 20 – Mar 5, 2026. Stability, UX polish, and further protocol enhancements. |
| **Risks** | **None** | 45/45 Lens tests passing. 15/17 Core tests passing (2 expected ignores). |
| **Stakeholder** | **CEO** | Sprint 2 Review and Release complete. |

**References:** Day-level work and estimates → [16-WEEKLY-WORK-PLAN.md](./16-WEEKLY-WORK-PLAN.md). Timeline and milestones → [15-DELIVERY-TIMELINE.md](./15-DELIVERY-TIMELINE.md).

---

## Code version (current)

| Package | Version | Notes |
|---------|---------|--------|
| **shadow-index** | **0.5.0** | R2 storage, catalog import, bug fixes & polish |
| **lens-extension** | **0.3.0** | MVP-13 cache, performance instrumentation, SHA-256 validation |
| **matter-core** | **0.3.0** | Rust Compiler, matter CLI binary |

**Release label:** `v0.5.0` (Sprint 2 complete — delivered Feb 19, 2026). lens v0.3.0.

**Reproducing this state:** Use git tag `v0.5.0`. Run API: `cd packages/shadow-index && npm run start`. Demo: `node scripts/demo-server.mjs 5178` then open http://localhost:5178/catalog-upload.html.

---

## Sprint state

| Sprint | Window | Status | Goal |
|--------|--------|--------|------|
| **Sprint 0** | By Jan 19, 2026 | **Complete** | Setup and architecture |
| **Sprint 1** | Jan 20 – Feb 5, 2026 | **Complete** | Full MVP: compile → resolve → display; v0.4.0 |
| **Sprint 2** | Feb 6 – Feb 19, 2026 | **Complete** | MVP-13 extension caching (IndexedDB), performance polish, validation; v0.5.0 |
| **Sprint 3** | Feb 20 – Mar 5, 2026 | **Next** | Future protocol enhancements |

**Next:** Sprint 3 Kickoff. See [13-SPRINT-3-PLAN.md](./13-SPRINT-3-PLAN.md).

---

## Overall progress

| Area | State | Notes |
|------|--------|------|
| **Shadow Index API** | Done | Compile, resolve, health, thing, gist; CORS; auth (MVP-09); rate limit; error shape (MVP-10); batch (MVP-11); catalog import (MVP-12) |
| **Lens extension** | Done | MV3, matter:// intercept, overlay; XMP beacon (MVP-07); IndexedDB cache (MVP-13); Firefox compat + manifest_v2 |
| **Platform test harness** | Done | JSON output (MVP-08); generate-report integration |
| **Demo flow** | Done | Demo server; catalog-upload.html; matter-demo.html; E2E and manual validation |
| **Tests** | Done | Vitest (API, auth, batch, catalog); Playwright (E2E); cargo test (steg) |
| **Rust compiler** | Done | Compiler::compile(), matter CLI |
| **P1** | Done | MVP-07–MVP-10 complete and tested |
| **P2 (batch/catalog)** | Done | MVP-11, MVP-12; catalog-upload demo delivered |

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

**Backlog reference:** [10-MVP-BACKLOG.md](./10-MVP-BACKLOG.md). **Planned next:** MVP-13 (Sprint 2), MVP-14 (Sprint 3).

---

## How to update this doc

- **After a sprint closeout:** Update "Sprint state", "Overall progress", and "Code version" if you bumped versions.
- **When tagging a release:** Set "Release label" and note the tag under "Reproducing this state."

---

*Last updated: Feb 8, 2026. Sprint 2 in progress; MVP-13 cache integrated (Thu Feb 12); Friday cross-browser prep complete. Next: Fri Feb 13 cross-browser sprint.*
