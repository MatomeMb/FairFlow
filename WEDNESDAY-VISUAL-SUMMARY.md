# WEDNESDAY ANALYSIS — VISUAL SUMMARY

## Current Architecture (End of Tuesday)

```
┌─────────────────────────────────────────────────────────────────┐
│                    LENS EXTENSION SERVICE WORKER                 │
│                                                                   │
│  Message Handler (resolve type)                                 │
│  ├─ Input: { type: 'resolve', hash: 'abc123' }                │
│  │                                                               │
│  ├─ [1] Read Cache                                             │
│  │   ├─ Check IndexedDB                                        │
│  │   ├─ Verify TTL (< 24 hours)                                │
│  │   └─ Return cached data OR proceed to API                  │
│  │                                                               │
│  ├─ [2] Fetch API (if cache miss)                             │
│  │   ├─ GET /resolve/abc123                                   │
│  │   └─ Return API response                                   │
│  │                                                               │
│  └─ [MISSING] [3] Cache Write ⚠️                               │
│      └─ (Deferred to Wednesday)                               │
│                                                                   │
│  └─ Output: { ok: true, data: {...} }                         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

Legend: ✓ = Complete | ⚠️ = Deferred | ❌ = Not Done
```

---

## Target Architecture (Wednesday End)

```
┌─────────────────────────────────────────────────────────────────┐
│                    LENS EXTENSION SERVICE WORKER                 │
│                                                                   │
│  Message Handler (resolve type)                                 │
│  ├─ Input: { type: 'resolve', hash: 'abc123' }                │
│  │                                                               │
│  ├─ [1] Read Cache ✓                                           │
│  │   ├─ Check IndexedDB                                        │
│  │   ├─ Verify TTL (< 24 hours)                                │
│  │   └─ Return cached data OR proceed to API                  │
│  │                                                               │
│  ├─ [2] Fetch API (if cache miss) ✓                           │
│  │   ├─ GET /resolve/abc123                                   │
│  │   ├─ Handle errors (no cache on failure)                  │
│  │   └─ Return API response                                   │
│  │                                                               │
│  ├─ [3] Cache Write ✓ (NEW)                                    │
│  │   ├─ After successful API response                         │
│  │   ├─ Call cacheSet(hash, data)                            │
│  │   ├─ Add fetchedAt timestamp                               │
│  │   └─ Error boundary (write fail ≠ API fail)               │
│  │                                                               │
│  └─ Output: { ok: true, data: {...} }                         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

Legend: ✓ = Complete | NEW = Wednesday scope
```

---

## Test Coverage Comparison

### Before Wednesday (End of Tuesday)

```
CACHE OPERATIONS TESTED
┌─────────────────────────┐
│   Read Operations (✓)   │
├─────────────────────────┤
│ ✓ Cache hit             │
│ ✓ Cache miss            │
│ ✓ TTL enforcement       │
│ ✓ Entry not found       │
│ ✓ Error handling        │
│ ─────────────────────── │
│ Total: 19 tests         │
└─────────────────────────┘

┌─────────────────────────┐
│  Write Operations (❌)  │
├─────────────────────────┤
│ ❌ Cache storage        │
│ ❌ Write on success     │
│ ❌ Error on write       │
│ ❌ Quota exceeded       │
│ ─────────────────────── │
│ Total: 0 tests          │
└─────────────────────────┘

SUMMARY: 33/33 ✓ (19 read, 0 write)
```

### After Wednesday (Target)

```
CACHE OPERATIONS TESTED
┌─────────────────────────┐
│   Read Operations (✓)   │
├─────────────────────────┤
│ ✓ Cache hit (3)         │
│ ✓ Cache miss (3)        │
│ ✓ TTL enforcement (3)   │
│ ✓ Edge cases (3)        │
│ ✓ Lifecycle (2)         │
│ ✓ Data integrity (3)    │
│ ─────────────────────── │
│ Total: 17 tests         │
└─────────────────────────┘

┌─────────────────────────┐
│  Write Operations (✓)   │
├─────────────────────────┤
│ ✓ Store on success (3)  │
│ ✓ Skip on error (2)     │
│ ✓ Error boundary (2)    │
│ ✓ TTL injection (1)     │
│ ✓ Overwrite (1)         │
│ ✓ Quota handling (2)    │
│ ✓ Performance (1)       │
│ ─────────────────────── │
│ Total: 12+ tests        │
└─────────────────────────┘

SUMMARY: 45+/45+ ✓ (17 read, 12+ write)
```

---

## Code Changes Required

### Change 1: Extend Logging (Lines 17-21)

```javascript
// BEFORE
const log = {
  cacheHit: (hash, ms = 0) => console.log(`[Cache HIT] Hash: ${hash}${ms ? ` (${ms}ms)` : ''}`),
  cacheMiss: (hash) => console.log(`[Cache MISS] Hash: ${hash}, proceeding to API`),
  error: (msg) => console.error(`[Cache ERROR] ${msg}`),
  init: (msg) => console.log(`[Cache] ${msg}`),
};

// AFTER
const log = {
  cacheHit: (hash, ms = 0) => console.log(`[Cache HIT] Hash: ${hash}${ms ? ` (${ms}ms)` : ''}`),
  cacheMiss: (hash) => console.log(`[Cache MISS] Hash: ${hash}, proceeding to API`),
  cacheWrite: (hash, bytes, ms) => console.log(`[Cache WRITE] Hash: ${hash} (${bytes} bytes, ${ms}ms)`),
  cacheWriteError: (hash, err) => console.error(`[Cache WRITE FAILED] Hash: ${hash}: ${err.message}`),
  apiError: (hash, status) => console.error(`[API ERROR] Hash: ${hash}: ${status}`),
  error: (msg) => console.error(`[Cache ERROR] ${msg}`),
  init: (msg) => console.log(`[Cache] ${msg}`),
};
```

**Lines changed:** +4  
**Complexity:** Trivial  

---

### Change 2: Integrate cacheSet (Lines 140-150)

```javascript
// BEFORE
const data = await fetchResolve(baseUrl, hash);
// Note: cacheSet() NOT called yet (Wednesday sprint)
sendResponse({ ok: true, data });

// AFTER
const data = await fetchResolve(baseUrl, hash);

// Wednesday: Cache write with error boundary
const payloadSize = JSON.stringify(data).length;
try {
  const writeStart = performance.now();
  await cacheSet(hash, data);
  const writeMs = Math.round(performance.now() - writeStart);
  log.cacheWrite(hash, payloadSize, writeMs);
} catch (cacheErr) {
  log.cacheWriteError(hash, cacheErr);
  // Continue — API succeeded, cache write failed
}

sendResponse({ ok: true, data });
```

**Lines added:** +11  
**Complexity:** Low  
**Key point:** Error boundary prevents cache failure from blocking API response  

---

### Change 3: Enhance Error Handling (Lines 150-160)

```javascript
// BEFORE
} catch (e) {
  const error = e instanceof Error ? e.message : String(e);
  log.error(error);
  sendResponse({ ok: false, error });
}

// AFTER
} catch (e) {
  const error = e instanceof Error ? e.message : String(e);
  
  // Categorize error type
  if (e instanceof TypeError || e.message.includes('fetch')) {
    log.apiError(hash, e.statusCode || 'NETWORK');
  } else {
    log.error(error);
  }
  
  sendResponse({ ok: false, error });
}
```

**Lines changed:** +5  
**Complexity:** Low  
**Key point:** Distinguish API errors from cache/other errors  

---

## Time Allocation Breakdown

```
9:00-9:30 AM   ▓░░░░░░░░░░  Logging extension (30 min)
9:30-10:45 AM  ▓▓▓░░░░░░░░  cacheSet integration (75 min)
10:45-11:15 AM ▓░░░░░░░░░░  Error handling (30 min)
11:15-12:00 PM ▓▓▓▓░░░░░░░  First unit tests (45 min)
│
12:00-1:00 PM  ░░░░░░░░░░░  Lunch/Break
│
1:00-2:00 PM   ▓▓░░░░░░░░░  Integration tests (60 min)
2:00-2:30 PM   ▓░░░░░░░░░░  E2E manual testing (30 min)
2:30-3:15 PM   ▓▓░░░░░░░░░  Documentation (45 min)
3:15-3:45 PM   ▓░░░░░░░░░░  Final verification (30 min)

Legend: ▓ = Scheduled work | ░ = Buffer/Flexibility
Total Work: 5.5 hours
Total Available: 8 hours (9 AM - 5 PM)
Buffer: 2.5 hours (30%)
```

---

## Logging Output Examples

### Cache Hit (Read Path — Already Working)

```
[Cache HIT] Hash: abc123def456 (23ms)
```

### Cache Miss + Write (Wednesday)

```
[Cache MISS] Hash: xyz789abc123, proceeding to API
[Cache WRITE] Hash: xyz789abc123 (2847 bytes, 12ms)
```

### API Error (Wednesday)

```
[API ERROR] Hash: unknown999: 404
```

### Cache Write Error (Wednesday)

```
[Cache WRITE FAILED] Hash: abc123: QuotaExceededError
```

### Initialization (Already Working)

```
[Cache] IndexedDB initialized successfully
```

---

## Risk Matrix

```
RISK LEVEL vs EFFORT

High Risk  │
           │ ░░░░░░░░░░░░░░░░░░
Medium     │ ░░░░░░░░░░░░░░░░░░
Risk       │ ░░░░░░░░░░░░░░░░░░
           │ ░░░░░░░░░░░░░░░░░░
Low Risk   │ ████████████████░░  (Wednesday scope)
           └──────────────────────
             Low Effort  Medium  High
             
WEDNESDAY: Low Risk + Medium Effort = Safe Delivery
```

---

## Success Indicators (Green Light Checks)

```
✓ All 45+ tests passing
✓ No console errors on extension load
✓ IndexedDB database creates without errors
✓ Cache write completes in <50ms
✓ API error never creates cache entry
✓ Manual E2E: overlay appears from cache on second click
✓ Manual E2E: overlay appears from API on first click
✓ Git commit created with clear message
✓ No regressions in existing functionality
✓ README updated with write path documentation
```

---

## Rollback Plan (If Needed)

```
If critical blocker discovered:

Option A (Preferred): Fix same day
- Root cause analysis
- Targeted fix
- Re-test affected component
- Commit with note

Option B (If time insufficient): Partial rollback
- Keep read path (proven, 16+ tests)
- Remove write path changes
- Document why deferred
- Plan for next sprint

Option C (Emergency): Full rollback
- git revert fe536b9 (executive brief)
- Back to last known good (a7da0f2)
- Escalate and reassess scope
```

---

## Definition of "DONE" (Acceptance Criteria)

| Category | Criteria | Status |
|----------|----------|--------|
| **Code** | cacheSet() called on API success | [ ] |
| | Error boundary prevents propagation | [ ] |
| | API errors never cached | [ ] |
| | Write latency < 50ms | [ ] |
| **Tests** | 45+ total tests passing | [ ] |
| | Write path 95%+ coverage | [ ] |
| | No regressions in read path | [ ] |
| | Manual E2E validation complete | [ ] |
| **Docs** | README updated | [ ] |
| | Completion summary created | [ ] |
| | All changes committed | [ ] |
| **Quality** | No console errors | [ ] |
| | ESLint clean | [ ] |
| | Performance metrics captured | [ ] |

---

## Quick Decisions Needed Before Wednesday Morning

**Decision 1: E2E Testing Scope**
- [ ] Full 6 scenarios (recommended, 30 min)
- [ ] Quick smoke test only (20 min)
- [ ] Skip if tight on time (risky)

**Decision 2: Cross-Browser Testing**
- [ ] Include on Wednesday (adds 60 min)
- [ ] Defer to Thursday (recommended)
- [ ] Skip entirely (not recommended)

**Decision 3: Performance Optimization**
- [ ] Profile and optimize if found slow
- [ ] Accept current performance (< 50ms target)
- [ ] Defer optimization to Thursday

**Default Approach:** Recommended options (full E2E, defer cross-browser, accept perf)

---

**Created:** February 10, 2026  
**Purpose:** Visual reference for Wednesday sprint  
**Status:** Ready for review and sprint kickoff  

