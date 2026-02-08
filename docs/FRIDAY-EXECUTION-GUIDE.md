# Friday Cross-Browser Sprint — Execution Guide

**Date:** Friday, February 13, 2026  
**Duration:** 7 hours (420 min)  
**Status:** Pre-sprint ready

---

## IMPLEMENTATION VALIDATION

### 1. Firefox Compatibility Layer ✓

**Approach:** Polyfill-based (`firefox-compat.js`) instead of code refactoring

**Pattern:**
- Chrome's sendMessage accepts both callback and Promise
- Firefox's browser.runtime.sendMessage returns Promise
- Wrapper converts promise → callback interface
- Result: No changes needed to background.js or content.js ✓

**Strengths:**
- Minimal changes to existing code
- No manifest manipulation during sprint
- Easy to test (add script tag before other scripts)
- Can be added/removed without touching core logic

**Potential Risk:** If `chrome.runtime.lastError` isn't properly set, error handling might fail  
**Mitigation:** Test error scenarios specifically (network down, invalid hash)

---

### 2. Firefox MV2 Manifest ✓

**Critical Differences Implemented:**
- `manifest_version: 2`
- `background: { scripts: [...] }` (not service worker)
- `browser_action` (not action)
- `browser_specific_settings.gecko` (Firefox 121+)
- `firefox-compat.js` loaded FIRST in all scripts

**Permissions Parity:** storage, activeTab, scripting, http(s) — matches manifest.json ✓

---

### 3. Test Report Template ✓

Sections: Environment → Test results → Performance metrics → Issues → Verdict  
Format allows real-time note-taking during execution.

---

## SPRINT EXECUTION FLOW

### Minute 0–5: Chrome Regression Check

- **Task:** Verify Thursday's work still passing
- **Action:** Click 2–3 matter:// links, verify cache hit latency < 20ms
- **Time:** 5 min max
- **If FAIL:** Stop, investigate (Thursday regression is blocking)

### Minute 5–95: Edge Testing (HARD STOP at 95)

- **Time box:** 90 min
- **Sections:** Loading (15) → Cache Ops (20) → Performance (25) → Errors (15) → IndexedDB (15)
- **Decision:** Working? Document PASS. Minor issues? Document workaround. Broken? Document and proceed (max 20 min debugging)

### Minute 95–185: Brave Testing (HARD STOP at 185)

- **Time box:** 90 min
- **Key:** Test WITH shields enabled (default)
- **Decision:** Shields block? Document workaround. Max 15 min shields debugging.

### Minute 185–245: LUNCH BREAK (60 min)

- Rest, review notes, mentally prepare for Firefox

### Minute 245–365: Firefox Testing (HARD STOP at 365)

- **Time box:** 120 min
- **CRITICAL DECISION at minute 270 (Message Passing):**
  - Message passing works? Continue normally
  - Message passing fails? Max 15 min investigation
  - If unsolvable: Document "Firefox requires MCP sprint", skip to Chrome profiling

### Minute 365–485: Chrome DevTools Profiling (120 min)

**Priority order:**
1. Cache hit profile (30 min) — MUST HAVE
2. Cache miss profile (30 min) — MUST HAVE
3. Overlay rendering (20 min) — SHOULD HAVE
4. IndexedDB profiling (20 min) — NICE TO HAVE
5. Memory profiling (20 min) — NICE TO HAVE

**Minimum viable:** Scenarios 1–2 (60 min) if time short

### Minute 485+: Documentation & Commit

- Consolidate notes into final reports
- Create FRIDAY-CROSS-BROWSER-REPORT.md
- Create FRIDAY-PERFORMANCE-ANALYSIS.md
- Prepare git commit

---

## FIREFOX DECISION TREE

**At 25-minute mark of Firefox testing (message passing check):**

```
Does message passing work?
│
├─ YES → CONTINUE: Full Firefox testing path
│
└─ NO → Time to debug: 15 minutes MAX
   │
   ├─ Issue clear and solvable in 5–10 min?
   │  └─ YES: Fix + re-test + continue
   │
   └─ Issue unclear or complex?
      └─ NO: Stop debugging
         - Document: "Firefox requires API compatibility debugging"
         - Mark Firefox as "Future Work - Sprint N"
         - SKIP Firefox cache operations tests
         - Jump to Chrome profiling
```

---

## KNOWN GOOD BASELINES (Chrome)

| Metric | Value |
|--------|-------|
| Cache hit latency | 16ms (±2ms) |
| Cache miss latency | 185ms (±10ms) |
| Overlay render | 17ms (±3ms) |
| Speedup factor | 11.5x |

### Target Performance per Browser

| Browser | Cache Hit | Cache Miss | Verdict |
|---------|-----------|------------|---------|
| Edge | <18ms | <200ms | ✓ within 10% of Chrome |
| Brave | <20ms | <210ms | ✓ shields overhead <10% |
| Firefox | <60ms | <400ms | ✓ 2.5x slower acceptable |

---

## CONTINGENCY SUMMARY

| Scenario | Action |
|----------|--------|
| Edge fails | Max 15 min investigate → document → proceed |
| Brave shields block | Document config → proceed |
| Firefox message passing broken | 15 min limit → mark future work → Chrome profiling |
| Chrome profiling short on time | Minimum: cache hit + cache miss (60 min) |

---

## FINAL PRE-FLIGHT (Thursday Evening)

```
□ Edge loads extension without errors
□ Brave loads extension without errors
□ Firefox loads manifest_v2.json without errors
□ Test pages with matter:// links accessible
□ Chrome cache operations working
□ DevTools Console + Storage work in all browsers
□ Screenshot tool ready (Win+Shift+S)
□ Calendar blocked 9 AM – 5 PM Friday
□ This guide available during sprint
```

---

## PATH REFERENCE

**Firefox manifest_v2.json:**
```
C:\Users\matom\.cursor\worktrees\.Things-That-Matter\mcj\packages\lens-extension\manifest_v2.json
```

---

*Related: [FRIDAY-CROSS-BROWSER-SPRINT-ANALYSIS.md](./FRIDAY-CROSS-BROWSER-SPRINT-ANALYSIS.md) | [FRIDAY-TEST-REPORT-TEMPLATE.md](./FRIDAY-TEST-REPORT-TEMPLATE.md)*
