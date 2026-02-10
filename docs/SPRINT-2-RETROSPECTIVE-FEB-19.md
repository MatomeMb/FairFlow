# Sprint 2 Retrospective — Feb 19, 2026

**Sprint:** Feb 6 – Feb 19, 2026  
**Goal:** MVP-13 IndexedDB caching; overlay polish; cross-browser validation.  
**Status:** Complete.

---

## 1. What Went Well

| Area | Notes |
|------|-------|
| **MVP-13 IndexedDB cache** | Integrated cleanly; cache-on-read path with TTL; graceful degradation on cache failure. |
| **Cross-browser** | Chrome, Edge, Brave, Firefox all validated. Firefox manifest compat (background.scripts) resolved. |
| **Performance instrumentation** | `[Lens Perf]` logs; lazy-load image; baselines documented in THURSDAY-PERFORMANCE-BASELINES.md. |
| **SHA-256 validation** | Invalid hash length blocked before API call; controlled `[Lens] Invalid hash` warning. |
| **Regression suite** | Vitest (lens-extension), cargo test (matter-core) passing. Console hygiene improved. |
| **Documentation** | MVP-13 implementation, cross-browser, performance baselines; demo script and recording guide. |

---

## 2. What Could Be Improved

| Area | Notes |
|------|-------|
| **Shadow-index Vitest** | ESM/Node 23 discovery issues on Windows; API verified via tsx run. Consider Vitest config alignment. |
| **Playwright E2E** | Smoke tests pass; full overlay verification requires manual browser check (by design). |
| **Version sync** | Ensure package.json versions (lens, shadow-index, matter-core) align with PROGRESS at release time. |

---

## 3. Lessons Learned

- **Firefox MV2:** Dual manifest approach (service_worker + background.scripts) needed for older Firefox.
- **IndexedDB in extensions:** Works well across browsers; `structuredClone` for cache values; async open/close.
- **Console hygiene:** Prefix logs (`[Lens Perf]`, `[Cache HIT]`) improve filtering; avoid spam on invalid hash.

---

## 4. Action Items / Tech Debt (for Sprint 3)

| Item | Owner | Priority |
|------|-------|----------|
| Vitest config for shadow-index (ESM/Node) | CTO | Low |
| Consider automated E2E with real extension load | CTO | Medium |
| Version bump automation at sprint closeout | CTO | Low |

---

## 5. Sprint 2 Deliverables (Summary)

- **MVP-13:** IndexedDB cache in Lens extension; cache hit/miss; TTL; invalid hash handling.
- **Cross-browser:** Chrome, Edge, Brave, Firefox validated.
- **Performance:** Instrumentation; lazy-load; baselines and 3G throttle documented.
- **Release:** Tag v0.5.0; lens v0.3.0; shadow-index v0.5.0; matter-core v0.3.0 (per PROGRESS).

---

*Retrospective completed Feb 19, 2026. Sprint 3 kickoff Feb 20. See [PROGRESS-AND-VERSION.md](./PROGRESS-AND-VERSION.md).*
