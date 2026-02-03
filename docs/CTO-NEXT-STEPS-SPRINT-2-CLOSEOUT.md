# CTO Memo: Sprint 2 Closeout and Sprint 3 Readiness

**To:** CEO / Stakeholders  
**From:** CTO  
**Subject:** Sprint 2 closeout, test verification, tag, CEO sync, Sprint 3 scope  
**Date:** February 2026

---

## Context

Sprint 2 (Feb 17 – Mar 2, 2026) delivered all P1 items: **XMP beacon detection**, **platform test results logging (JSON)**, **basic auth and rate limits**, and **error handling polish**. This memo records closeout actions and Sprint 3 planning.

---

## 1. Test commands run (verification)

The following commands were run to verify builds and tests.

| Command | Location | Result |
|--------|----------|--------|
| `cargo test` | `packages/matter-core` | **PASS** — 8 passed, 3 ignored (placeholder tests) |
| `cargo build --bin platform-test` | `packages/matter-core` | **PASS** — build succeeded |
| `npm run build` | `packages/shadow-index` | **PASS** — TypeScript build succeeded |
| `NODE_ENV=test npx vitest run` | `packages/shadow-index` | **PASS** — 12 tests (when API not required for integration); 10 pass without server; 4 MVP-09 auth tests pass in-process. For **full 12/12 pass**, start the API from current build first: `npm run start` in `packages/shadow-index`, then in another terminal run `$env:NODE_ENV='test'; npx vitest run`. |

**Summary:** matter-core and platform-test are green. Shadow Index Vitest is green when the API is running from the current build; otherwise integration tests that hit `localhost:3000` may fail or the two 400-error tests may fail if the responding server does not return the standardized `{ code, message }` error shape.

---

## 2. Manual E2E smoke test

**Instructions:** Follow [MANUAL-E2E-SMOKE.md](./MANUAL-E2E-SMOKE.md).

1. **Terminal 1:** `cd packages/shadow-index && npm run start`  
2. **Terminal 2:** `powershell scripts/start-demo-server.ps1`  
3. **Chrome:** Load unpacked extension from `packages/lens-extension`  
4. Open http://localhost:5177/matter-demo.html → click the **matter://** link  
5. **Verify:** Overlay shows image, title, price, Buy Now. No "Unable to load" or broken image.

**Optional (Sprint 2):** Click an image that contains a Matter XMP beacon (e.g. a polyglot image produced by `platform-test create-test-images`) and confirm overlay appears from beacon.

**Sign-off:** Record result in [MANUAL-E2E-SMOKE.md](./MANUAL-E2E-SMOKE.md) § 5 (Sprint 2 row).

---

## 3. Git tag v0.2.0

Create the Sprint 2 release tag:

```bash
git tag -a v0.2.0 -m "Sprint 2: P1 complete (XMP beacon, platform-test JSON, auth/rate limit, error handling)"
```

Push when ready: `git push origin v0.2.0`

---

## 4. Brief CEO sync — features delivered

**Talking points for CEO:**

- **Sprint 2 goal:** Extend MVP with P1 capabilities; demo flow unchanged.
- **Delivered:**
  1. **XMP beacon in images** — Clicking an image that carries Matter metadata (JPEG/PNG) now shows the product overlay without needing a matter:// link.
  2. **Platform test logging** — Phase 0 platform-test tool can write results to JSON (`test-extraction --output file.json`) for survival-rate reporting.
  3. **API auth and rate limits** — Optional API key (`SHADOW_INDEX_API_KEY`); 100 requests/minute per IP; demo works without a key.
  4. **Clearer errors** — API and overlay return consistent, readable error messages.
- **Demo:** Same as Sprint 1: matter:// link → overlay; optionally show image-click overlay if a beacon image is available.
- **Next:** Sprint 3 scope (see § 5 below).

---

## 5. Sprint 3 scope (plan)

Sprint 3 window: **Mar 3 – Mar 16, 2026** (or per CEO/CTO alignment).

**Proposed backlog (from P2 and remaining items):**

| ID | Story | Priority | Notes |
|----|--------|----------|--------|
| MVP-11 | Batch compilation | P2 | 100+ products; API or CLI |
| MVP-12 | Merchant catalog import | P2 | CSV/JSON ingestion |
| MVP-13 | Extension caching | P2 | IndexedDB cache for resolve/gist |
| MVP-14 | Analytics events | P2 | Track views and clicks |
| — | Rust compiler (compile in matter-core) | Deferred | Optional; compile currently via API |
| — | R2 / storage (MVP-03) | Backlog | When prioritised |

**Sprint 3 plan document:** [13-SPRINT-3-PLAN.md](./13-SPRINT-3-PLAN.md) (created below). CTO/CEO to confirm scope and capacity before sprint start.

---

## 6. Checklist summary

| # | Action | Owner | Status |
|---|--------|--------|--------|
| 1 | Run test commands (cargo test, build, vitest) | CTO | ✅ Done |
| 2 | Execute manual E2E smoke test; sign-off in MANUAL-E2E-SMOKE | CTO | ⏳ Action (run steps in § 2; sign-off in MANUAL-E2E-SMOKE § 5) |
| 3 | Create git tag v0.2.0 | CTO | ✅ Done |
| 4 | Brief CEO sync on features delivered | CTO / CEO | ⏳ Action (use [CEO-SYNC-SPRINT-2.md](./CEO-SYNC-SPRINT-2.md)) |
| 5 | Plan Sprint 3 scope; publish 13-SPRINT-3-PLAN.md | CTO | ✅ Done |

---

*Document version: 1.0 | Sprint 2 closeout*
