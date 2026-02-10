# .things that Matter
## Sprint 2 Plan (P1 scope)

---

| **Document Information** | |
|--------------------------|---|
| **Company Name** | .things that Matter |
| **Document Type** | Sprint Plan |
| **Version** | 1.0 |
| **Date** | February 2026 |
| **Sprint Window** | Feb 17 – Mar 2, 2026 |
| **Author** | Matome Mboweni, CTO |

---

## 1. Sprint goal

Extend the MVP with P1 capabilities: **XMP beacon detection**, **platform test results logging**, **basic auth and rate limits**, and **error handling polish**. Sprint 1 demo flow remains stable and demoable.

---

## 2. Sprint backlog (from P1)

| ID | Item | Owner | Status |
|----|------|-------|--------|
| MVP-07 | XMP beacon detection (basic) | CTO | Done |
| MVP-08 | Platform test harness results logging | CTO | Done |
| MVP-09 | Basic auth and rate limits | CTO | Done |
| MVP-10 | Error handling polish | CTO | Done |

**Source:** [10-MVP-BACKLOG.md](./10-MVP-BACKLOG.md) — P1 section.

### Implementation summary

- **MVP-10:** Shadow Index returns consistent `{ code, message, details? }` on errors; extension overlay shows API `message` on resolve failure; Vitest asserts error shape.
- **MVP-09:** Optional `SHADOW_INDEX_API_KEY` (env); `x-api-key` or `Authorization: Bearer`; in-memory rate limit 100 req/min per IP; auth tests in Vitest (401/200); server not started when `NODE_ENV=test` for app.request() tests.
- **MVP-08:** `platform-test test-extraction <image> [--output results.json]` writes JSON with `platforms` array (`xmp_survives`, `eof_survives`); `generate-report` unchanged.
- **MVP-07:** Lens content script parses XMP from JPEG (APP1) and PNG (iTXt); on image click, fetches image bytes, extracts beacon; on hash resolves and shows overlay; fallback to gist from XMP if resolve fails.

---

## 3. Build → Evaluate → Test → Ship

### Build
- Implement XMP beacon detection in extension or API (per acceptance criteria).
- Add results logging to platform-test harness (JSON output).
- Add API key auth and rate limiting to Shadow Index.
- Improve error messages for compile/resolve/overlay flows.

### Evaluate
- Validate against P1 acceptance criteria in the backlog.
- CEO/CTO review of new behaviour.

### Test
- Tests for new behaviour; existing Vitest and cargo test suites remain green.

### Ship
- Tag Sprint 2 increment; update docs and progress tracking.

---

## 4. Definition of done

- Build succeeds locally.
- Existing tests pass; new tests for changed areas.
- P1 acceptance criteria met for items committed to this sprint.
- Docs and [PROGRESS-AND-VERSION.md](./PROGRESS-AND-VERSION.md) updated.
- Sprint 1 demo flow still works.

---

## 5. How to run the MVP demo (unchanged)

Same as Sprint 1. See [11-SPRINT-1-PLAN.md — How to Run the MVP Demo](./11-SPRINT-1-PLAN.md#how-to-run-the-mvp-demo).

---

## 6. Risks and mitigations

- **Risk:** P1 scope too large for one sprint.  
  **Mitigation:** Defer lowest-priority P1 item(s) to Sprint 3 if needed.
- **Risk:** Auth/rate limits break existing demo.  
  **Mitigation:** Use optional env or flag so local demo can run without keys until ready.

---

---

## 7. Status (Sprint 2 in progress)

**P1 items:** All implemented. Build and tests: `cargo build --bin platform-test`, Vitest (run with optional server for integration tests; MVP-09 auth tests use in-process app). Demo flow unchanged; auth optional (no key = no auth).

**MVP-13 (extension caching):** IndexedDB cache integrated. Cross-browser validation complete — Feb 10, 2026:
- **Chrome, Edge, Brave, Firefox:** PASS. Extension loads, overlay (image, title, price, Buy Now), cache hit, invalid hash handling all verified.
- **Firefox:** Manifest updated with `background.scripts` alongside `service_worker` for compatibility.
- Results recorded in [BROWSER-VALIDATION-RESULTS.md](./BROWSER-VALIDATION-RESULTS.md). Validated by Matome Mbowene.

See [PROGRESS-AND-VERSION.md](./PROGRESS-AND-VERSION.md) for current state.

*Sprint 2 plan v1.0 | Updated Feb 10, 2026 — cross-browser validation complete*
