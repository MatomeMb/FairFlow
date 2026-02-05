# Project State Clarification

**Date:** February 2026  
**Purpose:** Resolve the "Sprint 1 vs Sprint 2 complete" paradox and record verification.

---

## 1. Verification results (actual code state)

| Check | Result | Evidence |
|-------|--------|----------|
| Shadow Index API | **Present** | `packages/shadow-index/api/index.ts`: POST /compile, GET /resolve/:hash, /gist/:hash, /thing/:hash, /health; Zod; stable hash from `parsed.data`; CORS; optional auth (MVP-09); rate limit (MVP-09); error shape `{ code, message, details? }` (MVP-10). |
| Lens extension | **Present** | `packages/lens-extension/`: manifest.json (MV3), src/content.js (matter:// intercept, overlay, XMP beacon MVP-07), content.css, icons (16/48/128), popup.html. |
| Vitest tests | **Present** | `packages/shadow-index/api/index.test.ts` — compile, resolve, health, auth (MVP-09). |
| Playwright E2E | **Present** | `tests/e2e/mvp-smoke.spec.ts` — demo page, resolve API, overlay (skip when extension required). |
| Demo + scripts | **Present** | `demo/matter-demo.html`, `scripts/create-mvp-demo.ps1`, `scripts/start-demo-server.ps1`. |
| Manual E2E doc | **Present** | `docs/MANUAL-E2E-SMOKE.md` with Sprint 1 and Sprint 2 sign-off rows. |
| Sprint 1 plan | **Present** | `docs/11-SPRINT-1-PLAN.md` — final status table, runbook, bugs fixed. |
| Sprint 2 / P1 | **In code** | API: auth, rate limit, error shape. Extension: XMP beacon. matter-core: platform-test `--output` JSON (MVP-08). |

**Conclusion:** The codebase contains both Sprint 1 (MVP-01–06) and Sprint 2 P1 (MVP-07–10) implementations. **Scenario B applies: code matches the docs.**

---

## 2. Resolving the date paradox

**Paradox:** Docs say Sprint 1 (Feb 3–16) and Sprint 2 (Feb 17–Mar 2) are both **Complete**, while "today" might be Feb 5 (only day 3 of Sprint 1).

**Resolution:**

- **Sprint windows** (Feb 3–16, Feb 17–Mar 2) are **planning boundaries**, not the only time work can be done.
- **Sign-off dates** in MANUAL-E2E-SMOKE.md (e.g. 2026-02-03) record when the manual E2E was run and signed off.
- **Completion** means: scope implemented, tests passing, docs updated, and (where applicable) manual E2E signed off. It does not require the calendar to reach the end of the sprint window.
- So both Sprint 1 and Sprint 2 can correctly be marked **Complete** if their scope was delivered and closed out (e.g. in a burst of work or ahead of the window).

**Implication:** No need to "do Sprint 1 again" for Feb 3–16. The work is done. Use the acceptance checklist below only to **verify** locally; the next planning step is **Sprint 3** (Mar 3–16, 2026).

---

## 3. Sprint 1 acceptance checklist (verify locally)

Use this to confirm everything works on your machine:

### Code
- [ ] `cd packages/shadow-index` → `npm run build` → succeeds
- [ ] `npm run start` → API runs on localhost:3000
- [ ] `Invoke-RestMethod http://localhost:3000/health` → returns status ok
- [ ] Lens extension loads in Chrome (chrome://extensions, Load unpacked → `packages/lens-extension`) with no errors
- [ ] Demo server: `powershell scripts/start-demo-server.ps1` → demo on localhost:5177
- [ ] Open http://localhost:5177/matter-demo.html → click matter:// link → overlay shows **image**, title, price, Buy Now (no "Unable to load" or broken image)

### Tests
- [ ] `cd packages/shadow-index` → `$env:NODE_ENV='test'; npx vitest run` → all pass (with API running for full 12/12)
- [ ] `cd packages/matter-core` → `cargo test` → 8 passed, 3 ignored

### Docs
- [ ] `docs/11-SPRINT-1-PLAN.md` has final status table and demo runbook
- [ ] `docs/MANUAL-E2E-SMOKE.md` has Sprint 1 (and Sprint 2) sign-off filled in

### Release
- [ ] Git tag `v0.1.0` exists (Sprint 1 MVP)
- [ ] Git tag `v0.2.0` exists (Sprint 2 P1); push when ready: `git push origin v0.2.0`

---

## 4. Recommended next steps

1. **Run the checklist above** on your machine. If any item fails, fix that item only.
2. **Treat Sprint 1 and Sprint 2 as closed** — no extra "Sprint 1 work" is required for Feb 3–16.
3. **Sprint 3:** Use `docs/13-SPRINT-3-PLAN.md` and align with CEO on scope (Mar 3–16, 2026). Suggested focus: P2 items (batch, catalog import, extension caching, analytics) or Rust compiler / R2 as prioritised.

---

*This document clarifies project state as of Feb 2026. Update PROGRESS-AND-VERSION.md at sprint boundaries.*
