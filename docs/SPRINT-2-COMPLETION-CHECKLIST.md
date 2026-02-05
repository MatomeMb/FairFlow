# Sprint 2 Completion Checklist (MVP-13: Extension Caching & Overlay Polish)

**Sprint Window:** Feb 6 – Feb 19, 2026  
**Goal:** MVP-13 IndexedDB caching, overlay performance, cross-browser validation  
**Status:** Ready for implementation (Feb 5, 2026)

---

## 1. Acceptance Criteria (MVP-13)

All criteria from [docs/17-MVP-13-ACCEPTANCE-AND-SCHEMA.md](./17-MVP-13-ACCEPTANCE-AND-SCHEMA.md):

- [ ] **AC1: Cache-on-read** — Second `matter://` click uses cache; no new API request.
  - **Verification:** DevTools Network tab shows single `/resolve/` request for same hash.
  - **Owner:** CTO | **Deadline:** Feb 12 | **Status:** In progress
  
- [ ] **AC2: Cache-on-success** — After successful resolve, response stored in IndexedDB with hash, gist, thing_url, fetchedAt.
  - **Verification:** DevTools Application → IndexedDB → `lens-matter-cache` → `resolve` → inspect entry shape.
  - **Owner:** CTO | **Deadline:** Feb 12 | **Status:** In progress
  
- [ ] **AC3: No cache on error** — Failed API requests (4xx, 5xx) are NOT cached; overlay shows error.
  - **Verification:** Resolve invalid hash; confirm no IndexedDB entry; overlay shows error message.
  - **Owner:** CTO | **Deadline:** Feb 12 | **Status:** In progress
  
- [ ] **AC4: TTL enforcement** — Cache entries older than 24h treated as miss; API called and cache updated.
  - **Verification:** Manually set `fetchedAt` to >24h ago; next resolve triggers API call.
  - **Owner:** CTO | **Deadline:** Feb 12 | **Status:** In progress
  
- [ ] **AC5: Overlay unchanged** — Cached and fresh data produce identical overlay (title, price, image, Buy Now).
  - **Verification:** Visual parity: first load vs. second load (cache). Same title, price, image, button.
  - **Owner:** CTO | **Deadline:** Feb 12 | **Status:** In progress
  
- [ ] **AC6: Cache isolation** — IndexedDB owned by extension (service worker context), not page; survives reload.
  - **Verification:** Close tab → reopen → cache persists. Page scripts cannot access cache.
  - **Owner:** CTO | **Deadline:** Feb 12 | **Status:** In progress

---

## 2. Implementation Tasks

### Week 1 (Feb 6 – Feb 12)

| Task | Deliverable | Deadline | Owner | Status |
|------|-------------|----------|-------|--------|
| **Sprint planning** | Refined acceptance criteria + IndexedDB schema doc | Feb 6 | CTO | ✅ Complete |
| **Automated tests** | Unit + integration tests for all AC (cache.test.js) | Feb 9 | CTO | ✅ Complete |
| **Cache integration** | Check cache before API; write on success; TTL logic | Feb 10 | CTO | ⏳ In progress |
| **Overlay optimization** | DocumentFragment, lazy-load image, reduce reflows | Feb 11 | CTO | ✅ Complete |
| **E2E manual test** | matter:// → overlay, cache hit/miss, IndexedDB inspection | Feb 12 | CTO | ⏳ In progress |

### Week 2 (Feb 13 – Feb 19)

| Task | Deliverable | Deadline | Owner | Status |
|------|-------------|----------|-------|--------|
| **Cross-browser test** | Chrome, Edge, Brave smoke test; document compatibility | Feb 13 | CTO | ⏳ Planned |
| **Cache tests review** | Run test suite; fix any failures | Feb 17 | CTO | ⏳ Planned |
| **Documentation update** | README (cache, API config, troubleshooting) + cross-browser doc | Feb 17 | CTO | ✅ Complete |
| **Performance measurement** | Baseline overlay render time; image lazy-load verification | Feb 18 | CTO | ⏳ Planned |
| **Sprint review & close** | Demo to CEO; retrospective; tag v0.3.0; update PROGRESS | Feb 19 | CTO | ⏳ Planned |

---

## 3. Quality Gates

### Code Quality

- [ ] No console errors in extension (DevTools → Service Worker inspect).
- [ ] All AC tests pass (unit + integration).
- [ ] No DOM mutations on every render (use DocumentFragment).
- [ ] Cache functions have no memory leaks (proper cleanup on removeOverlay).
- [ ] Message passing protocol validated (type, hash, ok, data/error fields).

### Test Coverage

- [ ] Cache hit/miss behavior (test file: `tests/cache.test.js`).
- [ ] TTL enforcement (stale entry treated as miss).
- [ ] Error handling (no cache write on failure).
- [ ] Message protocol (request/response shape).
- [ ] Overlay rendering (DOM parity cached vs. fresh).

### Performance

- [ ] Cache hit latency: <20ms (IndexedDB lookup).
- [ ] Overlay render time: <50ms (from DOM creation to display).
- [ ] No flicker on second click (cache hit).
- [ ] Image lazy-load reduces initial paint latency.

### Cross-Browser

- [ ] Chrome 110+: all tests pass.
- [ ] Edge 110+: all tests pass (expect 100% parity with Chrome).
- [ ] Brave 1.62+: cache works, no CORS issues with privacy settings.
- [ ] Firefox 121+: note MV3 support status; defer if not ready.

### Documentation

- [ ] README updated with cache behavior, API config, troubleshooting.
- [ ] Cross-browser compatibility matrix (MVP-13-CROSS-BROWSER.md).
- [ ] Acceptance criteria traced to code (comments in content.js, background.js).
- [ ] Runbook for manual testing (VERIFY-MVP-13-CACHE.md already created).

---

## 4. Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|-----------|
| **IndexedDB quota exceeded** | Low | Medium | MVP stores ~1KB per hash; 10K hashes = ~10MB (within quota). Monitor in Sprint 3. |
| **Cache invalidation edge case** | Medium | Low | TTL enforced uniformly; no manual clear path needed for MVP. Add clear UI in Sprint 3 if requested. |
| **Firefox MV3 not ready** | High | Low | Chromium browsers (Chrome, Edge, Brave) primary. Firefox deferred to Sprint 3. Document as "experimental" if shipped. |
| **Performance regression on slow networks** | Low | Low | Lazy-load image + DocumentFragment minimize reflows. Test on 3G throttle. |
| **Message passing race condition** | Very low | High | Use `return true` in listener to keep channel open; sendResponse is async-safe. No known issues. |

---

## 5. Definition of Done (DoD)

- [ ] All AC tests pass (unit + integration).
- [ ] Manual verification on Chrome/Edge complete (first click → API, second click → cache).
- [ ] IndexedDB inspection confirms entry shape (hash, gist, thing_url, fetchedAt).
- [ ] Cross-browser smoke test pass (Chrome, Edge, Brave).
- [ ] README and cross-browser docs updated.
- [ ] No console errors or warnings.
- [ ] Git branch merged to main; code review approved.
- [ ] Tag created: `lens-v0.3.0` (or shadow-index/matter-core if API changes).
- [ ] PROGRESS-AND-VERSION.md updated with Sprint 2 completion.

---

## 6. Demo Checklist (Feb 19 for CEO sync)

**Setup (10 min):**
1. Start Shadow Index API: `cd packages/shadow-index && npm run start`
2. Start demo server: `node scripts/demo-server.mjs 5177`
3. Reload Lens extension in Chrome.

**Demo Flow (10–15 min):**
1. Open http://localhost:5177/matter-demo.html
2. DevTools (F12) → Network tab (show to CEO).
3. Click "Click here" → overlay appears. **Show:** Network tab has one `/resolve/` request.
4. Click again → overlay again instantly. **Show:** No new request in Network tab (cache hit! 🎉).
5. DevTools → Application → IndexedDB → `lens-matter-cache` → `resolve`. **Show:** One entry with product data.
6. Change URI to invalid hash. Click → error overlay. **Show:** No cache entry for invalid hash.

**Key talking points:**
- "Caching reduces API load and improves UX."
- "Repeated product views are instant (cache hit)."
- "Failed requests aren't cached; users see errors."
- "Cache survives page reloads; survives 24 hours."

---

## 7. Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Feb 5, 2026 | CTO | Initial: Sprint 2 completion checklist with AC gates, QA checklist, and demo prep. |

---

## 8. Related Documents

- [17-MVP-13-ACCEPTANCE-AND-SCHEMA.md](./17-MVP-13-ACCEPTANCE-AND-SCHEMA.md) — Acceptance criteria and IndexedDB schema.
- [VERIFY-MVP-13-CACHE.md](./VERIFY-MVP-13-CACHE.md) — Manual verification steps (for QA/demo).
- [MVP-13-CROSS-BROWSER.md](./MVP-13-CROSS-BROWSER.md) — Cross-browser compatibility and testing matrix.
- [packages/lens-extension/README.md](../packages/lens-extension/README.md) — Extension setup, configuration, troubleshooting.
- [16-WEEKLY-WORK-PLAN.md](./16-WEEKLY-WORK-PLAN.md) — Day-by-day Sprint 2 plan with hour estimates.

---

**Status:** ✅ Ready for sprint execution (Feb 6 start).  
**Next:** Daily standup + task tracking via git branches + Friday demo to CEO (Feb 19).
