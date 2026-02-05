# Cross-Browser Compatibility — Lens Extension (MVP-13)

**Document:** Cross-browser support matrix and compatibility notes  
**Date:** February 5, 2026  
**Status:** MVP-13 (Extension caching, IndexedDB, message passing)

---

## 1. Supported Browsers

| Browser | Version | Status | Notes |
|---------|---------|--------|-------|
| **Chrome** | 110+ | ✅ Primary | Manifest v3, IndexedDB, Service Worker |
| **Edge** | 110+ | ✅ Full support | Chromium-based; identical API |
| **Brave** | 1.62+ | ✅ Full support | Chromium-based; privacy-first |
| **Opera** | 96+ | ✅ Full support | Chromium-based |
| **Firefox** | 121+ | ⚠️ Partial | MV3 support limited; IndexedDB OK; consider MV2 fallback |
| **Safari** | 17+ | ❌ Not supported | Uses web extensions (different API) |

---

## 2. API Coverage (Manifest v3 / Extension APIs)

| API | Chrome 110+ | Edge 110+ | Firefox 121+ | Notes |
|-----|-------------|----------|-------------|-------|
| `chrome.runtime.sendMessage()` | ✅ | ✅ | ✅ | Message passing for cache delegation |
| `chrome.storage.local.get()` | ✅ | ✅ | ✅ | Store API base URL config |
| `IndexedDB` | ✅ | ✅ | ✅ | Cache store (lens-matter-cache) |
| Service Worker | ✅ | ✅ | ⚠️ Limited | Background task runner; Firefox has constraints |
| Manifest v3 | ✅ | ✅ | ⚠️ Gradual rollout | Official support late 2024/early 2025 |

---

## 3. Known Issues & Workarounds

### Issue 1: Firefox MV2 vs. MV3 Transition

**Status:** Affects Firefox 121+

**Details:**
- Firefox is transitioning from MV2 to MV3; support is gradual.
- Current extension uses Manifest v3 (`manifest.json` version 3).
- MV3 in Firefox may not fully support all APIs yet (e.g., service worker lifecycle is different).

**Workaround:**
- Test extension on Firefox; if Service Worker doesn't start, fall back to MV2 manifest.
- Alternative: Maintain both `manifest.json` (v3) and `manifest_v2.json`; user selects on install.
- For MVP-13 (Feb 2026), **Chrome/Edge primary**; Firefox testing deferred to Sprint 3.

### Issue 2: IndexedDB Quota

**Status:** Not expected to affect MVP

**Details:**
- IndexedDB quota limits vary: Chrome ~20MB, Firefox ~50MB, Edge ~50MB.
- MVP-13 stores one entry per unique hash (~1KB per entry).
- 10,000 hashes = ~10MB; well within quota.

**No action needed for MVP.**

### Issue 3: Content Script Sandboxing

**Status:** No issue; expected behavior

**Details:**
- Content script runs in page context but can message the service worker.
- Service worker owns the IndexedDB; page cannot directly access.
- This is **correct** for MVP-13 (cache isolation, AC6).

**Verification:**
- Content script uses `chrome.runtime.sendMessage()` → background responds.
- IndexedDB is not directly accessible from page.

---

## 4. Testing Checklist (MVP-13 Cross-Browser Smoke Test)

### Chrome 110+ (Primary)

- [ ] Extension loads without errors (`chrome://extensions`).
- [ ] Content script logs on page load.
- [ ] First `matter://` link click → API request visible in Network tab.
- [ ] Second click → no new request; overlay renders instantly.
- [ ] IndexedDB → `lens-matter-cache` → `resolve` shows cached entry.
- [ ] Refresh page → cache persists.
- [ ] Error hash (`matter://000...`) → overlay shows error; no cache entry created.

### Edge 110+ (Secondary)

- [ ] Extension loads (same as Chrome; Chromium-based).
- [ ] Cache hit/miss behavior identical to Chrome.
- [ ] No edge cases specific to Edge.

**Note:** Edge uses same Blink engine; expect 100% parity with Chrome.

### Brave 1.62+ (Secondary)

- [ ] Extension loads in Brave (allow in brave://extensions).
- [ ] Cache works as expected.
- [ ] No CORS issues with Brave's privacy features.

**Note:** Brave may block some CORS requests by default; ensure `localhost:3000` is not restricted.

### Firefox 121+ (Deferred)

**Decision:** Test in Sprint 3 after MV3 support clarifies.

**Current status:** MV3 support is experimental in Firefox. If critical for launch, plan fallback to MV2 or web extension API.

---

## 5. Deployment Notes

### Browser-Specific Installation

**Chrome:**
```
chrome://extensions → Developer mode → Load unpacked → select packages/lens-extension/
```

**Edge:**
```
edge://extensions → Developer mode → Load unpacked → select packages/lens-extension/
```

**Brave:**
```
brave://extensions → Developer mode → Load unpacked → select packages/lens-extension/
```

### API Base URL Configuration

All browsers support `chrome.storage.local`:

```javascript
// Set custom API base URL (optional)
chrome.storage.local.set({ shadow_index_base_url: 'http://api.example.com:3000' });
```

Default: `http://localhost:3000`

---

## 6. Performance Profile (MVP-13)

| Metric | Chrome | Edge | Notes |
|--------|--------|------|-------|
| Cache hit latency | <10ms | <10ms | IndexedDB lookup time |
| Overlay render time | 20–50ms | 20–50ms | DOM construction + layout |
| Image lazy-load | Deferred | Deferred | `loading="lazy"` attribute |

**No performance regressions expected across supported browsers.**

---

## 7. Regression Prevention

### Automated Tests

- [ ] Unit tests for cache (get, set, TTL) — `tests/cache.test.js`
- [ ] Integration test: resolve flow with cache — Vitest or Playwright
- [ ] Cross-browser smoke test script — manual or WebDriver

### Manual Verification

- [ ] Daily test on Chrome dev environment.
- [ ] Weekly Edge/Brave test on Feb 13, 20, 27.
- [ ] Pre-release full smoke test before tag.

---

## 8. Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Feb 5, 2026 | CTO | Initial: MVP-13 cross-browser compatibility matrix and testing checklist. |

---

## Next Steps

1. **Feb 9–12:** Automated cache tests (unit + integration).
2. **Feb 13:** Chrome/Edge smoke test; document any failures.
3. **Feb 17:** Cache tests + docs review before Sprint 2 close.
4. **Sprint 3:** Firefox MV3 evaluation and fallback strategy.

---

*Related:* [17-MVP-13-ACCEPTANCE-AND-SCHEMA.md](./17-MVP-13-ACCEPTANCE-AND-SCHEMA.md) (schema), [VERIFY-MVP-13-CACHE.md](./VERIFY-MVP-13-CACHE.md) (manual verification steps).
