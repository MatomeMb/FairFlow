# Sprint 2 Daily Breakdown (Feb 6–19, 2026)

**Sprint Goal:** MVP-13 IndexedDB caching, overlay performance, cross-browser validation  
**Capacity:** 10 working days × 5 hours = 50 hours  
**Target Version:** lens-extension v0.3.0  

---

## Week 1: Feb 6–12 (Planning, Implementation, Testing)

### Friday, Feb 6 — Sprint Planning & Schema Design (5h)
**Theme:** Kick-off and technical foundation

- [ ] 1h: Morning standup + sprint planning meeting with CEO
- [ ] 1.5h: Review MVP-13 acceptance criteria (AC1–AC6) — ensure shared understanding
- [ ] 1.5h: Finalize IndexedDB schema (DB name, store, key path, entry shape)
- [ ] 1h: Set up test file structure (`tests/cache.test.js`) and document test plan

**Deliverable:** Sprint 2 plan document + schema finalized + test structure ready

**Blockers:** None

---

### Monday, Feb 9 — Cache Foundational Tests (5h)
**Theme:** Test-driven development; unit tests for cache operations

- [ ] 0.5h: Review cache.test.js template and test framework (Vitest/Jest)
- [ ] 1.5h: Write AC1 (cache-on-read) tests — cache hit and miss scenarios
- [ ] 1.5h: Write AC2 (cache-on-success) tests — storage validation with all fields
- [ ] 1h: Review and refine test cases; ensure all assertions are clear

**Deliverable:** AC1 + AC2 test suites passing

**Blockers:** None

---

### Tuesday, Feb 10 — Cache Error & TTL Tests (5h)
**Theme:** Complete unit test coverage

- [ ] 1.5h: Write AC3 (no cache on error) tests — error isolation, no persistence
- [ ] 1.5h: Write AC4 (TTL enforcement) tests — stale entry detection, 24h boundary
- [ ] 1h: Write message protocol tests — request/response shape validation
- [ ] 1h: Run full test suite; debug any failures

**Deliverable:** AC3 + AC4 + message protocol tests passing

**Blockers:** None

---

### Wednesday, Feb 11 — Background Service Worker Implementation (5h)
**Theme:** Implement cache functions in background.js

- [ ] 1h: Implement `cacheGet()` — IndexedDB read with TTL check
- [ ] 1h: Implement `cacheSet()` — IndexedDB write with fetchedAt timestamp
- [ ] 1h: Integrate cache into resolve message handler (check cache before API)
- [ ] 1h: Implement error handling — no cache write on API failure
- [ ] 1h: Manual test: open IndexedDB in DevTools; verify entry shape

**Deliverable:** Cache functions implemented and manual test passing

**Blockers:** None

---

### Thursday, Feb 12 — Content Script & Overlay Optimization (5h)
**Theme:** Wire content script; optimize overlay rendering

- [ ] 1h: Update content script to use `resolveHash()` (message-based) instead of direct fetch
- [ ] 0.5h: Remove unused `SHADOW_INDEX_BASE_URL` and `fetchResolve()` function
- [ ] 1h: Optimize `renderOverlay()` — DocumentFragment, lazy-load images, reduce reflows
- [ ] 1.5h: E2E manual test: first click → API call, second click → cache hit (no request)
- [ ] 1h: Verify IndexedDB cache entry exists; overlay renders identically on both clicks

**Deliverable:** Cache-to-content-script integration + overlay optimization complete; E2E manual test passing

**Blockers:** None

---

## Week 2: Feb 13–19 (Cross-Browser, Polish, Release)

### Friday, Feb 13 — Cross-Browser Smoke Test (5h)
**Theme:** Validation across supported browsers

- [ ] 1h: Test Chrome 110+: load extension, first click → API, second click → cache hit
- [ ] 1h: Test Edge 110+: verify identical behavior to Chrome (Chromium-based)
- [ ] 1h: Test Brave 1.62+: load extension, verify cache works, check CORS settings
- [ ] 1h: Document any browser-specific quirks or issues
- [ ] 1h: Update MVP-13-CROSS-BROWSER.md with test results

**Deliverable:** Cross-browser smoke test complete; compatibility doc updated

**Blockers:** Access to Edge and Brave browsers

---

### Monday, Feb 16 — Cache Tests & Documentation (5h)
**Theme:** Test automation and runbook documentation

- [ ] 1h: Review and finalize cache.test.js — ensure all AC tests pass
- [ ] 1h: Write integration test (manual): cache hit/miss + error path
- [ ] 1h: Update packages/lens-extension/README.md with cache configuration and troubleshooting
- [ ] 1h: Review and update VERIFY-MVP-13-CACHE.md with latest test results
- [ ] 1h: Update PROGRESS-AND-VERSION.md with Sprint 2 progress (70% → 90% complete)

**Deliverable:** Test suite finalized + docs updated

**Blockers:** None

---

### Tuesday, Feb 17 — Performance Validation (5h)
**Theme:** Measure and baseline overlay performance

- [ ] 1h: Profile `renderOverlay()` execution time (first vs. cached load)
- [ ] 1h: Verify lazy-load image implementation (check DevTools Performance tab)
- [ ] 1h: Baseline: cache hit latency should be <20ms, overlay render <50ms
- [ ] 1h: Document performance baseline in SPRINT-2-COMPLETION-CHECKLIST.md
- [ ] 1h: Test on slower network (throttle to 3G); verify UX acceptable

**Deliverable:** Performance baselines established and documented

**Blockers:** None

---

### Wednesday, Feb 18 — Bug Fixes & Polish (5h)
**Theme:** Quality assurance and final tweaks

- [ ] 1.5h: Run full regression test (all AC + cross-browser)
- [ ] 1.5h: Fix any bugs discovered during testing
- [ ] 1h: Review code for style, comments, and clarity
- [ ] 1h: Verify no console errors or warnings in any browser

**Deliverable:** All bugs fixed; code polished; regression test passing

**Blockers:** None

---

### Thursday, Feb 19 — Sprint Review & Release (5h)
**Theme:** Sprint closure and v0.3.0 tag

- [ ] 1h: Prepare demo flow (API, demo server, extension, Network tab, IndexedDB inspection)
- [ ] 1h: Record demo or run live demo for CEO sync
- [ ] 1h: Update git tags: tag as `lens-extension-v0.3.0`
- [ ] 1h: Update PROGRESS-AND-VERSION.md with v0.3.0 status and Sprint 2 summary
- [ ] 1h: Sprint retrospective notes; prepare for Sprint 3 kickoff (Feb 20)

**Deliverable:** Sprint 2 complete; v0.3.0 tagged; demo delivered to CEO; retrospective complete

**Blockers:** None

---

## Summary by Day

| Day | Date | Focus | Hours | Status |
|-----|------|-------|-------|--------|
| Fri | Feb 6 | Planning + schema | 5h | ⏳ Upcoming |
| Mon | Feb 9 | AC1 + AC2 tests | 5h | ⏳ Upcoming |
| Tue | Feb 10 | AC3 + AC4 + message tests | 5h | ⏳ Upcoming |
| Wed | Feb 11 | Background cache impl | 5h | ⏳ Upcoming |
| Thu | Feb 12 | Content script + overlay opt | 5h | ⏳ Upcoming |
| Fri | Feb 13 | Cross-browser test | 5h | ⏳ Upcoming |
| Mon | Feb 16 | Cache tests + docs | 5h | ⏳ Upcoming |
| Tue | Feb 17 | Performance validation | 5h | ⏳ Upcoming |
| Wed | Feb 18 | Bug fixes + polish | 5h | ⏳ Upcoming |
| Thu | Feb 19 | Demo + release | 5h | ⏳ Upcoming |

**Total:** 50 hours (10 working days × 5h)

---

## Acceptance Criteria Tracking

| AC | Day(s) | Status |
|----|--------|--------|
| AC1: Cache-on-read | Feb 9, Feb 12, Feb 13 | Implementation → Test |
| AC2: Cache-on-success | Feb 9, Feb 11, Feb 12 | Implementation → Test |
| AC3: No cache on error | Feb 10, Feb 11, Feb 12 | Implementation → Test |
| AC4: TTL enforcement | Feb 10, Feb 11, Feb 12 | Implementation → Test |
| AC5: Overlay unchanged | Feb 12, Feb 18 | Implementation → Polish |
| AC6: Cache isolation | Feb 11, Feb 13 | Implementation → Cross-browser test |

---

## Risk Mitigation

| Risk | Mitigation | Owner | Deadline |
|------|-----------|-------|----------|
| AC implementation delays | Start implementation early (Feb 11); prioritize AC1 + AC2 | CTO | Feb 12 |
| Cross-browser incompatibility | Test Edge and Brave early (Feb 13) | CTO | Feb 13 |
| Performance regression | Baseline performance (Feb 17); throttle test on 3G | CTO | Feb 17 |
| Documentation gaps | Update docs daily (in-line with feature delivery) | CTO | Feb 18 |

---

## Definition of Done (DoD) Checklist

- [ ] All 6 AC tests pass (Feb 10)
- [ ] Background and content script integration complete (Feb 12)
- [ ] E2E manual test passes (first click → API, second click → cache) (Feb 12)
- [ ] Cross-browser smoke test passes (Chrome, Edge, Brave) (Feb 13)
- [ ] Performance baselines measured (<20ms cache hit, <50ms overlay render) (Feb 17)
- [ ] All docs updated (README, cross-browser, verification, completion checklist) (Feb 18)
- [ ] No console errors or warnings (Feb 18)
- [ ] Git tag `lens-extension-v0.3.0` created (Feb 19)
- [ ] PROGRESS-AND-VERSION.md updated (Feb 19)
- [ ] Demo delivered to CEO (Feb 19)

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Feb 5, 2026 | CTO | Initial: Daily breakdown for Sprint 2 (Feb 6–19) with 5-hour work days. |

---

*Related: [16-WEEKLY-WORK-PLAN.md](./16-WEEKLY-WORK-PLAN.md) (hour estimates), [SPRINT-2-COMPLETION-CHECKLIST.md](./SPRINT-2-COMPLETION-CHECKLIST.md) (acceptance criteria and quality gates).*
