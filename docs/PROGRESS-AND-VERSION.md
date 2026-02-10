# Progress and Version — Sprint State

Single source of truth for **code version**, **sprint state**, and **next sprint**. Update this file at sprint boundaries and when shipping increments.

---

## Current status (as of Feb 16, 2026)

| Area | Status | Notes |
|------|--------|-------|
| **Product** | **MVP path live** | End-to-end flow works: compile → store (R2/local) → resolve → matter:// → extension overlay. Batch and catalog import operational. MVP-13 IndexedDB cache integrated. |
| **Releases** | **v0.4.0** | shadow-index 0.4.0 (batch, catalog); lens-extension 0.1.0 (MVP-13 cache integrated, Firefox compat); matter-core 0.3.0. Tag `v0.4.0` created and pushed. |
| **Next** | **Sprint 2 closeout** | Feb 6 – Feb 19, 2026. MVP-13 complete. Cross-browser validation complete (Chrome, Edge, Brave, Firefox) — Feb 10, 2026. Day-by-day plan: [16-WEEKLY-WORK-PLAN.md](./16-WEEKLY-WORK-PLAN.md). |
| **Risks** | **None** | No known blockers. R2 and API keys configured; tests passing; cross-browser validation complete. |
| **Stakeholder** | **CEO** | Weekly sync; demo available via catalog-upload and matter-demo pages. |

**References:** Day-level work and estimates → [16-WEEKLY-WORK-PLAN.md](./16-WEEKLY-WORK-PLAN.md). Timeline and milestones → [15-DELIVERY-TIMELINE.md](./15-DELIVERY-TIMELINE.md). Cross-browser results → [BROWSER-VALIDATION-RESULTS.md](./BROWSER-VALIDATION-RESULTS.md).

---

## Code version (current)

| Package | Version | Notes |
|---------|---------|--------|
| **shadow-index** | **0.4.0** | R2 storage (MVP-03), auth, rate limit; batch + catalog import (MVP-11, MVP-12) |
| **lens-extension** | 0.1.0 | XMP beacon (MVP-07), IndexedDB cache (MVP-13); Firefox compat + manifest_v2 |
| **matter-core** | 0.3.0 | Rust Compiler::compile(), matter CLI, hash matches API |

**Release label:** `v0.4.0` (Sprint 1 complete — delivered by Feb 5, 2026). Sprint 2 MVP-13 cache integrated; lens v0.3.0 target Feb 19.

**Reproducing this state:** Use git tag `v0.4.0`. Run API: `cd packages/shadow-index && npm run start`. Demo: `node scripts/demo-server.mjs 5178` then open http://localhost:5178/catalog-upload.html. R2: set STORAGE_MODE=r2 and CLOUDFLARE_R2_* in packages/shadow-index/.env.

---

## Sprint state

| Sprint | Window | Status | Goal |
|--------|--------|--------|------|
| **Sprint 0** | By Jan 19, 2026 | **Complete** | Setup and architecture |
| **Sprint 1** | Jan 20 – Feb 5, 2026 | **Complete** | Full MVP: compile → resolve → display; P1 (XMP, auth, errors); R2 storage; Rust compiler; batch & catalog import; catalog-upload & matter-demo; v0.4.0 |
| **Sprint 2** | Feb 6 – Feb 19, 2026 | **In Progress** | MVP-13 extension caching (IndexedDB) — cache integrated; cross-browser validation complete (Chrome, Edge, Brave, Firefox) Feb 10 |

**Next:** Sprint 2 closeout; release lens v0.3.0 Feb 19. Cross-browser validation complete — see [BROWSER-VALIDATION-RESULTS.md](./BROWSER-VALIDATION-RESULTS.md).

---

## Overall progress

| Area | State | Notes |
|------|--------|------|
| **Shadow Index API** | Done | Compile, resolve, health, thing, gist; CORS; auth (MVP-09); rate limit; error shape (MVP-10); batch (MVP-11); catalog import (MVP-12) |
| **Lens extension** | Done | MV3, matter:// intercept, overlay; XMP beacon (MVP-07); IndexedDB cache (MVP-13); Firefox compat (background.scripts); cross-browser validated (Chrome, Edge, Brave, Firefox) |
| **Platform test harness** | Done | JSON output (MVP-08); generate-report integration |
| **Demo flow** | Done | Demo server; catalog-upload.html; matter-demo.html; E2E and manual validation |
| **Tests** | Done | Vitest (API, auth, batch, catalog; lens-extension 48 tests including full resolve flow); Playwright (E2E); cargo test (steg) |
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

*Last updated: Feb 16, 2026. Sprint 2 in progress; MVP-13 cache integrated; cross-browser validation complete; tests & docs finalized (48 lens-extension tests, full resolve flow integration test, README updates). Validated by: Matome Mbowene.*
