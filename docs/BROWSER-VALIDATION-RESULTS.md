# Cross-Browser Validation Results — MVP-13

**Date:** 2026-02-10  
**Validated by:** Matome Mbowene  
**Extension version:** lens-extension v0.1.0

---

## Prerequisites

- [x] Shadow Index API running (`cd packages/shadow-index && npm run dev`)
- [x] Demo server running (`python -m http.server 5177 --directory demo`)
- [x] Extension loaded (unpacked) in each browser

---

## Chrome

| Check | Result | Notes |
|-------|--------|-------|
| Extension loads | PASS | |
| matter:// click → overlay | PASS | |
| Overlay: image, title, price, Buy Now | PASS | Image fix: demo data updated to picsum.photos URLs |
| Second click → cache hit (no API) | PASS | Loads faster (~30ms) |
| Invalid hash → error (no crash) | PASS | Shows error message gracefully |
| IndexedDB `lens-matter-cache` populated | PASS | |

**Overall:** PASS

---

## Edge

| Check | Result | Notes |
|-------|--------|-------|
| Extension loads | PASS | |
| matter:// click → overlay | PASS | |
| Overlay: image, title, price, Buy Now | PASS | |
| Second click → cache hit (no API) | PASS | |
| Invalid hash → error (no crash) | PASS | |

**Overall:** PASS

---

## Brave

| Check | Result | Notes |
|-------|--------|-------|
| Extension loads | PASS | |
| matter:// click → overlay | PASS | |
| Overlay: image, title, price, Buy Now | PASS | |
| Second click → cache hit (no API) | PASS | |
| Invalid hash → error (no crash) | PASS | |
| No CORS/privacy blocks | PASS | |

**Overall:** PASS

---

## Firefox

| Check | Result | Notes |
|-------|--------|-------|
| Extension loads (MV3 or MV2 fallback) | PASS | Manifest updated: added `background.scripts` alongside `service_worker` for Firefox compatibility |
| matter:// click → overlay | PASS | |
| Cache behavior | PASS | |

**Overall:** PASS

---

## Summary

| Browser | Status | Issues |
|---------|--------|--------|
| Chrome | PASS | None |
| Edge | PASS | None |
| Brave | PASS | None |
| Firefox | PASS | Required manifest change: `background.scripts` for Firefox MV3 compatibility |

---

*Run `.\scripts\browser-validation.ps1` to start services and get load instructions.*
