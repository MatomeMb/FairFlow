# Friday Cross-Browser Test Report — [BROWSER NAME]

**Date:** Friday, February 13, 2026  
**Browser:** [Chrome | Edge | Brave | Firefox]  
**Version:** _____________  
**Tester:** _____________  
**Duration:** _____ min (allocated: 90/120 min)

---

## 1. Extension Loading

| Check | Pass | Fail | Notes |
|-------|------|------|-------|
| Extension loads without errors | ☐ | ☐ | |
| Content script loads on page | ☐ | ☐ | |
| Background/Service worker active | ☐ | ☐ | |
| Console errors observed | ☐ | ☐ | (list if any) |

**Screenshot:** [ ] Attached

---

## 2. Cache Operations

### 2.1 Cache Miss (First Click)

| Metric | Value | Target |
|--------|-------|--------|
| matter:// link clicked | _____________ | |
| API request visible (Network tab) | ☐ Yes ☐ No | Yes |
| Overlay renders | ☐ Yes ☐ No | Yes |
| Latency (ms) | _____ | <500 |

### 2.2 Cache Hit (Second Click)

| Metric | Value | Target |
|--------|-------|--------|
| Same link clicked again | | |
| No new API request | ☐ Yes ☐ No | Yes |
| Overlay renders instantly | ☐ Yes ☐ No | Yes |
| Latency (ms) | _____ | <50 |

### 2.3 IndexedDB Validation

| Check | Pass | Fail | Notes |
|-------|------|------|-------|
| lens-matter-cache DB exists | ☐ | ☐ | |
| resolve store has correct structure | ☐ | ☐ | |
| Cached entry contains hash, gist, fetchedAt | ☐ | ☐ | |
| TTL (24h) enforced | ☐ | ☐ | |

---

## 3. Performance (10 Cycles)

| Cycle | Cache Hit (ms) | Cache Miss (ms) | Notes |
|-------|----------------|-----------------|-------|
| 1 | | | |
| 2 | | | |
| 3 | | | |
| 4 | | | |
| 5 | | | |
| 6 | | | |
| 7 | | | |
| 8 | | | |
| 9 | | | |
| 10 | | | |
| **Avg** | _____ | _____ | |

---

## 4. Error Handling

| Scenario | Expected | Actual | Pass/Fail |
|----------|----------|--------|-----------|
| Invalid hash (matter://000...) | Error overlay, no cache | | ☐ ☐ |
| Network offline (cache hit) | Cached data served | | ☐ ☐ |
| Network offline (cache miss) | Error message | | ☐ ☐ |

---

## 5. Browser-Specific Checks

### Edge
- [ ] No manifest compatibility issues
- [ ] Same behavior as Chrome

### Brave
- [ ] Shield configuration: ON / OFF / _____________
- [ ] Shields block content scripts: ☐ Yes ☐ No
- [ ] Private window: [ ] Tested [ ] Skipped — _____________

### Firefox
- [ ] Manifest: MV3 ☐ | MV2 (manifest_v2.json) ☐
- [ ] Compatibility layer used: ☐ Yes ☐ No
- [ ] Message passing: ☐ Works ☐ Broken (document below)

---

## 6. Issues Identified

| # | Severity | Description | Resolution |
|---|----------|-------------|------------|
| 1 | | | |
| 2 | | | |
| 3 | | | |

---

## 7. Verdict

**Production Ready:** ☐ Yes ☐ No ☐ With workarounds

**Summary:**
_____________________________________________________________________________
_____________________________________________________________________________

---

## Evidence Attachments

- [ ] Screenshot: Extension loaded
- [ ] Screenshot: Cache working (Network tab)
- [ ] Screenshot: IndexedDB structure (DevTools)
