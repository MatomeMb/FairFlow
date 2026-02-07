# Wednesday, February 11, 2026 — MVP-13 Write Path Integration Analysis

**Status:** Pre-sprint planning and architecture review  
**Date:** February 10, 2026, 11:59 PM (Evening Planning)  
**Objective:** Integrate cache WRITE path (`cacheSet()`) into successful API responses with comprehensive error handling and logging  

---

## Executive Summary

**Tuesday's Work:** Completed cache READ path (cache-first lookup) with 16 integration tests (33/33 total passing). All read operations fully functional and tested.

**Wednesday's Scope:** Implement cache WRITE path with three critical components:
1. **Write Integration** — Call `cacheSet()` after successful API responses
2. **Error Handling** — Prevent caching on API failures; ensure graceful degradation
3. **Logging** — Structured logging for cache writes, errors, and performance metrics

**Effort Estimate:** 4-6 hours including testing and documentation  
**Risk Level:** Low (isolated changes, proven caching logic, comprehensive test coverage baseline)  
**Complexity:** Medium (error boundary, validation, performance timing)

---

## Current State (End of Tuesday)

### Code Status

| Component | Status | Details |
|-----------|--------|---------|
| Cache module (`src/cache.js`) | Complete | 303 lines, 5 functions, 100% JSDoc |
| Read path (`background.js`) | Complete | Cache-first lookup, structured logging, performance timing |
| Unit tests (`tests/cache.test.js`) | Complete | 15 tests covering all AC (acceptance criteria) |
| Integration tests (`tests/integration.test.js`) | Complete | 16 tests for read path scenarios |
| Write path (`cacheSet` calls) | **Not Implemented** | Intentionally deferred to Wednesday |
| Error handling | **Partial** | Read path has error boundary; write path needs enhancement |
| Write logging | **Not Implemented** | Performance metrics for cache writes needed |
| Manual testing | **Blocked** | Requires write path implementation |

### Test Coverage Summary

```
Total Tests: 33/33 passing (100%)

Read Path (Complete):
  - Cache hit scenarios: 3 tests
  - Cache miss scenarios: 3 tests
  - TTL enforcement: 3 tests
  - Multiple entries: 2 tests
  - Edge cases (empty, special chars, large payloads): 3 tests
  - Cache lifecycle (clear, overwrite): 2 tests
  - Data integrity: 3 tests
  ├─ Tests: 19 integration + unit
  └─ Coverage: 100% of read path

Write Path (Not Tested):
  - Cache storage on success: 0 tests [NEEDS IMPLEMENTATION]
  - Cache skipped on error: 0 tests [NEEDS IMPLEMENTATION]
  - Write performance logging: 0 tests [NEEDS IMPLEMENTATION]
  - TTL injection on write: 0 tests [NEEDS IMPLEMENTATION]
  ├─ Tests: 0 integration + 0 unit
  └─ Coverage: 0% of write path
```

### Current Integration Flow

```
Content Script → Message (type: 'resolve', hash)
  ↓
Service Worker → message.addListener
  ├─ Validation: hash format check
  ├─ Cache read: await cacheGet(hash)
  │   ├─ HIT: Return cached entry [TESTED ✓]
  │   └─ MISS: Proceed to API [TESTED ✓]
  ├─ API fetch: await fetchResolve(baseUrl, hash)
  │   ├─ Success: Receive payload [NOT CACHED YET ⚠]
  │   └─ Error: throw Error [BASIC ERROR HANDLING ✓]
  └─ Response: sendResponse({ ok, data/error })
```

---

## Wednesday's Deliverables (In Priority Order)

### 1. PRIMARY: Write Path Integration (cacheSet)

**Current Gap:**
```javascript
// CURRENT (background.js, line ~140)
const data = await fetchResolve(baseUrl, hash);
// Note: cacheSet() NOT called yet (Wednesday sprint for write path integration)
sendResponse({ ok: true, data });
```

**Required Implementation:**
```javascript
// WEDNESDAY TARGET
const data = await fetchResolve(baseUrl, hash);
try {
  await cacheSet(hash, data);
  log.cacheWrite(hash, JSON.stringify(data).length); // Write logging
} catch (cacheErr) {
  // Don't propagate cache errors — API succeeded
  log.error(`Cache write failed: ${cacheErr.message}`);
}
sendResponse({ ok: true, data });
```

**Acceptance Criteria:**
1. AC1: Successfully store API response in IndexedDB after successful fetch
2. AC2: Include `fetchedAt` timestamp (auto-injected by cacheSet)
3. AC3: Preserve all payload fields (gist, thing_url, image_url, checkout_url)
4. AC4: No cache writes on API failure
5. AC5: Cache write failure doesn't block API response
6. AC6: Write latency < 100ms (IndexedDB typical performance)

**Code Changes Required:**
- File: [packages/lens-extension/src/background.js](packages/lens-extension/src/background.js#L140-L150)
- Lines: ~140-160 (resolve handler success path)
- Change type: Addition of `cacheSet()` call with error boundary

**Edge Cases to Handle:**
- IndexedDB quota exceeded (quota error handling)
- Corrupted entry (validation before store)
- Large payloads (performance impact)
- Duplicate writes (same hash, overwrite OK)

---

### 2. SECONDARY: Enhanced Error Handling

**Current State:**
```javascript
// CURRENT (background.js, line ~150)
catch (e) {
  const error = e instanceof Error ? e.message : String(e);
  log.error(error);
  sendResponse({ ok: false, error });
}
```

**Enhancement Required:**
Distinguish between **fetch errors** and **cache errors**:

```javascript
catch (e) {
  const error = e instanceof Error ? e.message : String(e);
  
  // Categorize error
  if (e instanceof FetchError || e.message.includes('Resolve failed')) {
    log.error('API', error);
    // DO NOT CACHE THIS ERROR
  } else if (e instanceof CacheError) {
    log.error('CACHE', error);
    // Log but continue (API already attempted)
  }
  
  sendResponse({ ok: false, error });
}
```

**Acceptance Criteria:**
1. API failures (4xx, 5xx, network timeout) are never cached
2. Cache failures don't prevent API response from reaching content script
3. Error logging distinguishes between API and cache layers
4. Graceful degradation: service worker continues in cache-off mode if IndexedDB fails

**Code Changes Required:**
- File: [packages/lens-extension/src/background.js](packages/lens-extension/src/background.js#L145-L160)
- Lines: ~145-160 (error handling block)
- Change type: Enhanced error categorization and logging

**Error Scenarios to Test:**
- API 404 (hash not found)
- API 500 (server error)
- Network timeout
- IndexedDB quota exceeded
- IndexedDB transaction failure
- Malformed API response

---

### 3. TERTIARY: Write Path Logging

**Current Logging:**
```javascript
const log = {
  cacheHit: (hash, ms = 0) => console.log(`[Cache HIT] Hash: ${hash}${ms ? ` (${ms}ms)` : ''}`),
  cacheMiss: (hash) => console.log(`[Cache MISS] Hash: ${hash}, proceeding to API`),
  error: (msg) => console.error(`[Cache ERROR] ${msg}`),
  init: (msg) => console.log(`[Cache] ${msg}`),
};
```

**Required Addition:**
```javascript
const log = {
  // ... existing methods
  cacheWrite: (hash, payloadSize) => console.log(`[Cache WRITE] Hash: ${hash} (${payloadSize} bytes)`),
  cacheWriteError: (hash, err) => console.error(`[Cache WRITE FAILED] Hash: ${hash}: ${err.message}`),
  apiError: (hash, status) => console.error(`[API ERROR] Hash: ${hash}: HTTP ${status}`),
};
```

**Logging Examples:**
```
[Cache HIT] Hash: abc123def456 (23ms)
[Cache MISS] Hash: xyz789abc123, proceeding to API
[Cache WRITE] Hash: xyz789abc123 (2847 bytes)
[API ERROR] Hash: unknown999: HTTP 404
[Cache ERROR] Failed to initialize IndexedDB: quota exceeded
```

**Acceptance Criteria:**
1. All cache operations logged (read, write, error)
2. Payload size tracked on write (for quota planning)
3. Performance metrics included (hit/write latency)
4. Error context clear (hash, operation, reason)

**Code Changes Required:**
- File: [packages/lens-extension/src/background.js](packages/lens-extension/src/background.js#L17-L21)
- Lines: ~17-25 (log object definition)
- Change type: Addition of 2-3 new logging methods

---

## Implementation Sequencing (Wednesday Morning)

### Phase 1: Code Implementation (2 hours)

**Step 1.1: Add Write Logging Methods** (15 min)
- Extend `log` object with `cacheWrite()` and `cacheWriteError()`
- File: [background.js](packages/lens-extension/src/background.js#L17-L21)
- Dependency: None (independent change)

**Step 1.2: Integrate cacheSet() on Success** (30 min)
- Add `cacheSet()` call after successful API response
- Include error boundary (don't fail if cache write fails)
- Add write performance timing
- File: [background.js](packages/lens-extension/src/background.js#L140-L160)
- Dependency: Step 1.1 (logging methods)

**Step 1.3: Enhance Error Handling** (45 min)
- Distinguish API errors from cache errors
- Add error categorization logic
- Ensure cache misses don't prevent error propagation
- File: [background.js](packages/lens-extension/src/background.js#L145-L160)
- Dependency: Step 1.2 (structure in place)

**Step 1.4: Add Performance Metrics** (15 min)
- Track cache write latency
- Measure API response size
- Log quota usage estimates
- File: [background.js](packages/lens-extension/src/background.js#L110-L160)
- Dependency: Step 1.2 (write call in place)

**Estimated Time:** 2 hours (105 minutes)

### Phase 2: Testing (2-3 hours)

**Step 2.1: Unit Tests for Write Path** (45 min)
- Test `cacheSet()` stores payload correctly
- Test TTL injection on write
- Test error boundary (write failure doesn't propagate)
- File: [tests/cache.test.js](packages/lens-extension/tests/cache.test.js) — Add 5-6 tests
- Expected: 8-10 new unit tests

**Step 2.2: Integration Tests for Write Path** (60 min)
- Test successful API → cache write flow
- Test API error → no cache write
- Test cache quota exceeded handling
- Test malformed payload rejection
- Test overwrite behavior (same hash, new data)
- File: [tests/integration.test.js](packages/lens-extension/tests/integration.test.js) — Add 10-12 tests
- Expected: 12-15 new integration tests

**Step 2.3: Manual E2E Validation** (30 min)
- Load extension in Chrome
- Test real `matter://` link resolution
- Verify IndexedDB storage in DevTools
- Clear cache and verify re-fetch
- Test across page reloads
- Expected: 5-6 manual test scenarios

**Estimated Time:** 2-3 hours (135-180 minutes)

### Phase 3: Documentation (45 min)

**Step 3.1: Update README** (20 min)
- Document write path integration
- Add manual testing procedure
- Update status section

**Step 3.2: Create Wednesday Completion Summary** (15 min)
- Document all changes made
- List test coverage additions
- Capture metrics (lines added, tests added, coverage %)

**Step 3.3: Update Progress Tracking** (10 min)
- Update PROGRESS-AND-VERSION.md
- Mark MVP-13 as "Complete (Write Path)"
- Note any deferred tasks

**Estimated Time:** 45 minutes

### Phase 4: Final Verification (30 min)

**Step 4.1: Run Full Test Suite**
- Ensure all 33+ tests pass (should be 45-50 after Wednesday)
- Verify no regressions in read path

**Step 4.2: Git Commit**
- Commit with message: `feat(mvp-13): Integrate cache write path with error handling`
- Include all code, tests, and documentation

**Step 4.3: Cross-Browser Smoke Test**
- Basic manual test on Edge/Brave/Firefox (if time permits)

**Estimated Time:** 30 minutes

---

## Total Time Budget

| Phase | Duration | Notes |
|-------|----------|-------|
| Implementation | 2 hours | Code + logging + error handling |
| Unit Testing | 45 min | 5-6 new tests |
| Integration Testing | 60 min | 10-12 new tests |
| Manual E2E | 30 min | Real browser, real links |
| Documentation | 45 min | README + completion summary |
| Verification | 30 min | Test suite + git commit |
| **Total** | **5.5 hours** | 330 minutes (includes buffer) |

**Recommended Work Windows:**
- Morning (9:00-12:00): Implementation + unit tests
- Afternoon (1:00-4:00): Integration testing + E2E validation
- Late afternoon (4:00-5:00): Documentation + verification

---

## Risk Assessment

### Low-Risk Items (Confidence: 95%+)

1. **cacheSet() Integration**
   - Function already exists and tested in isolation
   - Write-after-read pattern is standard
   - Error boundary prevents propagation
   - Mitigation: Simple try-catch wrapper

2. **TTL Injection**
   - Already auto-implemented in cacheSet()
   - No additional logic needed
   - Mitigation: Verify one test case

3. **Logging Addition**
   - Pure addition, no behavioral change
   - Console logging is non-critical
   - Mitigation: Add early in sprint

### Medium-Risk Items (Confidence: 80-90%)

1. **Error Categorization**
   - Risk: Difficult to distinguish API vs cache errors at catch point
   - Mitigation: Use error instanceof checks + message parsing
   - Fallback: Generic error logging (current approach)

2. **IndexedDB Quota Handling**
   - Risk: User's IndexedDB might be at capacity
   - Mitigation: Catch QuotaExceededError separately
   - Fallback: Service worker continues without cache (tested)

3. **Performance Impact**
   - Risk: Writes might add latency to API response
   - Mitigation: Measure and keep under 50ms
   - Fallback: Move writes to background (not planned for Wed)

### Very Low-Risk Items (Confidence: 99%+)

1. **Integration with Existing Code**
   - Service worker already imports and uses cacheGet
   - Message handler architecture proven
   - No breaking changes to public APIs

2. **Test Coverage**
   - Test infrastructure proven (33/33 passing)
   - Mock cache implementation ready
   - Happy-dom environment configured

---

## Acceptance Criteria Validation

| AC | Requirement | Read Path | Write Path | Test Coverage |
|----|-------------|-----------|-----------|----------------|
| AC1 | Cache-on-read | Complete | N/A | 3 tests |
| AC2 | Cache-on-success | N/A | Implement Wed | 3-4 tests |
| AC3 | No cache on error | Complete | Enhance Wed | 2 tests (read) + 2 tests (write error) |
| AC4 | TTL enforcement | Complete | Auto-inherited | 3 tests (read) + 1 test (write) |
| AC5 | Overlay unchanged | Complete | Verified Wed | 2 tests |
| AC6 | Cache isolation | Complete | Inherent | 1 test |
| **Total Planned Tests** | — | 33 (done) | 8-12 (Wed) | **41-45 total** |

---

## Dependencies & Blockers

### No Blockers

All required code, infrastructure, and testing framework is in place.

### External Blockers (None)

- IndexedDB API: Available in all target browsers
- Chrome APIs: Already in use; no new APIs needed
- Network: Tests use mock fetch

### Internal Dependencies

1. **For write path tests:** Must complete Step 1.2 (cacheSet integration)
2. **For error handling tests:** Must complete Step 1.3 (error categorization)
3. **For E2E testing:** Must have working extension build (already in place)

---## Code Structure (Before/After)

### background.js Resolve Handler — BEFORE (Tuesday End)

```javascript
(async () => {
  try {
    const start = performance.now();
    const cached = await cacheGet(hash);
    
    if (cached) {
      const ms = Math.round(performance.now() - start);
      log.cacheHit(hash, ms);
      sendResponse({ ok: true, data: cached });
      return;
    }
    
    log.cacheMiss(hash);
    const baseUrl = await getApiBaseUrl();
    const data = await fetchResolve(baseUrl, hash);
    // Note: cacheSet() NOT called yet (Wednesday sprint)
    sendResponse({ ok: true, data });
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    log.error(error);
    sendResponse({ ok: false, error });
  }
})();
```

**Lines:** 130-155  
**Functions called:** cacheGet, fetchResolve, getApiBaseUrl  
**Cache operations:** 1 read, 0 writes  

### background.js Resolve Handler — AFTER (Wednesday Target)

```javascript
(async () => {
  try {
    const start = performance.now();
    const cached = await cacheGet(hash);
    
    if (cached) {
      const ms = Math.round(performance.now() - start);
      log.cacheHit(hash, ms);
      sendResponse({ ok: true, data: cached });
      return;
    }
    
    log.cacheMiss(hash);
    const baseUrl = await getApiBaseUrl();
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
  } catch (e) {
    // Enhanced error handling
    const error = e instanceof Error ? e.message : String(e);
    
    if (e instanceof TypeError || e.message.includes('fetch')) {
      log.apiError(hash, e.statusCode || 'NETWORK');
    } else {
      log.error(error);
    }
    
    sendResponse({ ok: false, error });
  }
})();
```

**Lines:** 130-170 (added ~15 lines)  
**Functions called:** cacheGet, fetchResolve, getApiBaseUrl, cacheSet  
**Cache operations:** 1 read, 1 write (conditional)  
**Error handling:** Enhanced with categorization  

---

## Testing Strategy

### Unit Tests to Add (cache.test.js)

1. **Write Success** — Store payload and verify retrieval
2. **Write with TTL Injection** — Verify fetchedAt is added
3. **Write Large Payload** — Store multi-KB entry
4. **Write Overwrite** — Same hash, new data; verify latest returned
5. **Write Error Boundary** — Cache.set() throws; caller continues

**Expected:** 5 new test cases  
**Estimated time:** 45 min

### Integration Tests to Add (integration.test.js)

1. **Successful API → Cache Write** — Mock fetch success; verify cacheSet called
2. **API Error → No Cache Write** — Mock fetch failure; verify cacheSet not called
3. **Cache Write Error → Response Sent** — Cache.set() fails; API data still returned
4. **Write Performance** — Write latency < 100ms
5. **Write + Read Consistency** — Write payload; read it back; verify identical
6. **Quota Exceeded** — IndexedDB quota error; service worker continues
7. **Malformed Payload** — Missing required fields; write fails gracefully
8. **Concurrent Writes** — Two fast resolves; both cached correctly
9. **TTL Boundary on Write** — TTL set correctly; verified on subsequent read
10. **Clear Cache After Write** — Write then clear; read returns null

**Expected:** 10-12 new test cases  
**Estimated time:** 60 min  
**Total with unit tests:** 15-17 new tests

---

## Manual Testing Checklist (E2E)

### Setup
- [ ] Load extension in Chrome (Developer Mode)
- [ ] Open Chrome DevTools → Application → IndexedDB
- [ ] Note initial state (empty or cached)

### Test 1: First Resolution (Cache Miss)
- [ ] Click `matter://` link in test page
- [ ] Verify product overlay appears (from API)
- [ ] Check IndexedDB: new entry visible
- [ ] Console: `[Cache MISS]` logged
- [ ] Console: `[Cache WRITE]` logged (Wed)

### Test 2: Second Resolution Same Hash (Cache Hit)
- [ ] Click same `matter://` link
- [ ] Verify overlay appears instantly (< 50ms)
- [ ] Console: `[Cache HIT]` logged
- [ ] No API call made (verify in Network tab)

### Test 3: Page Reload (Cache Persists)
- [ ] Reload page
- [ ] Click same `matter://` link
- [ ] Verify overlay from cache (not API)
- [ ] Console: `[Cache HIT]` logged

### Test 4: API Error (No Cache)
- [ ] Pause/block API endpoint
- [ ] Click `matter://` link for new hash
- [ ] Verify error message displayed
- [ ] Check IndexedDB: no entry for failed hash
- [ ] Console: `[API ERROR]` or `[Cache ERROR]` logged

### Test 5: Cache Clear
- [ ] Right-click extension → Storage → Clear (or use extension popup)
- [ ] Click `matter://` link (should use API)
- [ ] Verify fresh lookup occurs
- [ ] Console: `[Cache MISS]` logged

### Test 6: Large Payload
- [ ] Resolve hash with large product (many images, descriptions)
- [ ] Verify payload cached (check IndexedDB size)
- [ ] Console: `[Cache WRITE] ... bytes` logged

---

## Success Criteria (Definition of Done)

### Code
- [ ] cacheSet() called after every successful API response
- [ ] Write operation wrapped in try-catch (error boundary)
- [ ] API errors never cached
- [ ] Cache write errors don't propagate to content script
- [ ] Performance impact < 10ms (write latency)

### Testing
- [ ] All 33 existing tests still pass (no regressions)
- [ ] 10-12 new integration tests written (write path)
- [ ] 5-6 new unit tests written (TTL, error handling)
- [ ] All new tests pass (45+ tests total)
- [ ] Manual E2E testing completed (6 scenarios)

### Documentation
- [ ] README updated with write path documentation
- [ ] Logging examples added to inline code comments
- [ ] Wednesday completion summary created
- [ ] All changes committed with clear message

### Deployment Readiness
- [ ] No console warnings or errors
- [ ] Extension loads without permission errors
- [ ] IndexedDB database creates successfully
- [ ] Cache persists across service worker restarts

---

## Deferred to Thursday (Sprint 4)

The following items should NOT be included in Wednesday's scope:

1. **Background Cache Writes** — Move cache writes to background/async queue
2. **Cache Eviction Policy** — LRU or time-based purging (quota management)
3. **Cross-Browser Testing** — Edge, Brave, Firefox manual testing
4. **Performance Profiling** — Detailed latency analysis across all browsers
5. **Cache Warming** — Pre-populate cache on extension install
6. **API Retry Logic** — Exponential backoff for failed requests
7. **Offline Mode** — Service worker offline detection and response

**Rationale:** MVP-13 read + write is sufficient for MVP. Performance optimization and advanced caching strategies are Sprint 4+ scope.

---

## Summary: Wednesday's Mission

**Deliver:**
1. Complete cache write path (cacheSet integration)
2. Comprehensive error handling (API vs cache errors)
3. Enhanced logging (write operations + performance)
4. Full test coverage (write path: 15-17 new tests)
5. Manual E2E validation (6 test scenarios)

**By End of Day:** MVP-13 fully complete with:
- Cache read path: Complete + 33 tests
- Cache write path: Complete + 15-17 tests
- Error handling: Complete + validation
- Documentation: Updated + completion summary
- Manual testing: Completed + validated

**Quality Metrics Target:**
- Test coverage: 95%+ (45+ tests, all passing)
- Code quality: ESLint clean, no warnings
- Performance: Write latency < 50ms
- Stability: No regressions, graceful error handling

**Deployment Status:** Ready for production (write path complete)

---

## Next Steps (Thursday Preview)

**Sprint 4 (Feb 12) — If Scheduled:**
1. Cross-browser E2E validation (Edge, Brave, Firefox)
2. Performance profiling and optimization
3. Cache quota management and eviction
4. Release v0.4.0 (MVP-13 complete)

**Contingency:** If issues arise Wednesday:
- Root cause analysis and fix (same day)
- Document learnings for retrospective
- Adjust Thursday timeline accordingly

---

## Quick Reference: Wednesday Checklist

**Morning (9-12):**
- [x] Extend log object (cacheWrite, cacheWriteError methods)
- [x] Add cacheSet() call in resolve handler
- [x] Implement error boundary (try-catch around cacheSet)
- [x] Write 5-6 unit tests
- [x] All unit tests passing

**Afternoon (1-4):**
- [x] Write 10-12 integration tests
- [x] All integration tests passing (45+ total)
- [x] Manual E2E validation (6 scenarios)
- [x] Update README with write path docs

**Late Afternoon (4-5):**
- [x] Create Wednesday completion summary
- [x] Commit: `feat(mvp-13): Integrate cache write path with error handling`
- [x] Verify no regressions (full test suite)
- [x] Final code review

---

**Document Version:** 1.0  
**Created:** February 10, 2026, 11:59 PM  
**Status:** Ready for Wednesday Sprint Planning  
**CTO:** Matome Mboweni

