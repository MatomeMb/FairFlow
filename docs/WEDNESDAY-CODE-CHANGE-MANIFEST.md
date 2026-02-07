# WEDNESDAY CODE CHANGE MANIFEST

**Purpose:** Exact line-by-line code changes needed for Wednesday implementation  
**File:** `packages/lens-extension/src/background.js`  
**Total Changes:** 3 edits (~20 lines added)  

---

## Edit 1: Extend Logging Methods (Lines 17-21)

### Location

File: `packages/lens-extension/src/background.js`  
Lines: After existing log object definition (after line 21)

### Before (Current)

```javascript
// Logging helpers
const log = {
  cacheHit: (hash, ms = 0) => console.log(`[Cache HIT] Hash: ${hash}${ms ? ` (${ms}ms)` : ''}`),
  cacheMiss: (hash) => console.log(`[Cache MISS] Hash: ${hash}, proceeding to API`),
  error: (msg) => console.error(`[Cache ERROR] ${msg}`),
  init: (msg) => console.log(`[Cache] ${msg}`),
};
```

### After (Wednesday)

```javascript
// Logging helpers
const log = {
  cacheHit: (hash, ms = 0) => console.log(`[Cache HIT] Hash: ${hash}${ms ? ` (${ms}ms)` : ''}`),
  cacheMiss: (hash) => console.log(`[Cache MISS] Hash: ${hash}, proceeding to API`),
  cacheWrite: (hash, bytes, ms = 0) => console.log(`[Cache WRITE] Hash: ${hash} (${bytes} bytes${ms ? `, ${ms}ms` : ''})`),
  cacheWriteError: (hash, err) => console.error(`[Cache WRITE FAILED] Hash: ${hash}: ${err.message}`),
  apiError: (hash, status) => console.error(`[API ERROR] Hash: ${hash}: HTTP ${status}`),
  error: (msg) => console.error(`[Cache ERROR] ${msg}`),
  init: (msg) => console.log(`[Cache] ${msg}`),
};
```

### Changes Made

- **Line 19:** Add `cacheWrite()` method (logs successful cache writes)
- **Line 20:** Add `cacheWriteError()` method (logs cache write failures)
- **Line 21:** Add `apiError()` method (logs API-layer errors)

### Rationale

Extends logging to cover cache write operations, distinguishes error types for better debugging.

---

## Edit 2: Integrate cacheSet() Call (Lines 140-160)

### Location

File: `packages/lens-extension/src/background.js`  
Lines: In resolve message handler, after fetchResolve call (around line 140-150)

### Before (Current)

```javascript
    log.cacheMiss(hash);
    const baseUrl = await getApiBaseUrl();
    const data = await fetchResolve(baseUrl, hash);
    // Note: cacheSet() NOT called yet (Wednesday sprint for write path integration)
    sendResponse({ ok: true, data });
```

### After (Wednesday)

```javascript
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
```

### Changes Made

- **Line 143:** Calculate payload size (JSON string length)
- **Line 145:** Start timing for performance metrics
- **Line 146:** Call `cacheSet(hash, data)` to store in IndexedDB
- **Line 148:** Calculate write latency
- **Line 149:** Log successful write with metrics
- **Line 150-152:** Catch and log any cache write errors (but don't propagate)

### Key Points

1. **Error Boundary:** Cache write errors don't prevent API response
2. **Performance Metrics:** Track write latency for monitoring
3. **Payload Tracking:** Log size for quota planning
4. **Graceful Degradation:** Service worker continues if IndexedDB fails

---

## Edit 3: Enhance Error Handling (Lines 155-165)

### Location

File: `packages/lens-extension/src/background.js`  
Lines: In the catch block of resolve handler (around line 155-165)

### Before (Current)

```javascript
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e);
      log.error(error);
      sendResponse({ ok: false, error });
    }
```

### After (Wednesday)

```javascript
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e);
      
      // Categorize error type for better logging
      if (e instanceof TypeError || 
          e.message.includes('fetch') || 
          e.message.includes('Resolve failed')) {
        const status = e.status || e.statusCode || 'NETWORK';
        log.apiError(hash, status);
      } else {
        log.error(error);
      }
      
      sendResponse({ ok: false, error });
    }
```

### Changes Made

- **Line 159-162:** Add error categorization logic
- **Line 160:** Check if error is TypeError or fetch-related
- **Line 164:** Use specialized `apiError()` logging for API failures
- **Line 165:** Use generic `error()` logging for other failures

### Key Points

1. **API vs Cache Errors:** Distinguish error sources
2. **Better Observability:** Different logging for different error types
3. **No Cache on Failure:** API errors are never stored in cache
4. **Error Classification:** Helps with debugging and monitoring

---

## Summary of All Changes

| Edit | Type | Lines | Impact | Risk |
|------|------|-------|--------|------|
| 1 | Addition | +3 | Logging | Low |
| 2 | Addition | +11 | Core feature | Low |
| 3 | Modification | +8 | Error handling | Low |
| **Total** | | **+22 lines** | **Complete write path** | **Low** |

---

## Testing Each Edit

### After Edit 1 (Logging)

```javascript
// Verify new methods exist
console.log(typeof log.cacheWrite); // 'function'
console.log(typeof log.cacheWriteError); // 'function'
console.log(typeof log.apiError); // 'function'

// Test logging
log.cacheWrite('test-hash', 1234, 15);
// Output: [Cache WRITE] Hash: test-hash (1234 bytes, 15ms)
```

### After Edit 2 (cacheSet Integration)

```javascript
// Trigger resolve for hash
// Should see:
// [Cache MISS] Hash: abc123...
// [Cache WRITE] Hash: abc123... (2847 bytes, 12ms)

// Then trigger same hash again
// Should see:
// [Cache HIT] Hash: abc123... (8ms)
```

### After Edit 3 (Error Handling)

```javascript
// Block API (Network tab → Offline)
// Trigger resolve
// Should see:
// [API ERROR] Hash: abc123: NETWORK
// NOT [Cache WRITE] (no write on API error)
```

---

## Code Quality Checklist

- [ ] No unused variables
- [ ] All async/await properly handled
- [ ] Error messages are descriptive
- [ ] Performance timing included
- [ ] Console logging appropriate level (log vs error)
- [ ] No breaking changes to public API
- [ ] Backwards compatible
- [ ] No global variable pollution

---

## Git Commit Details

### Commit Message

```
feat(mvp-13): Integrate cache write path with error handling

- Add cacheSet() call after successful API responses
- Implement error boundary (write failure != API failure)
- Distinguish API errors from cache/other errors  
- Add structured logging for cache writes and errors
- Track write latency and payload size
- Include performance metrics in logging
```

### Files Changed

```
packages/lens-extension/src/background.js
  +3 logging methods
  +11 cacheSet integration
  +8 error handling enhancement
  = +22 lines
```

### Testing Additions

After commit, add tests:

```bash
# Unit tests for new logging
tests/cache.test.js +5-6 tests

# Integration tests for write path
tests/integration.test.js +10-12 tests

# Total: 45+ tests (all passing)
```

---

## Rollback Instructions (If Needed)

```bash
# Undo just Edit 3 (error handling)
# Manually remove lines 159-162, keep simple catch

# Undo Edits 2 & 3 (revert to read-only)
# Delete lines 143-155, keep original sendResponse

# Undo all (complete rollback)
git revert fe536b9

# Verify rollback
npm run test  # Should show 33/33 passing
```

---

## Performance Checklist

- [ ] Write latency measured and < 50ms typical
- [ ] Payload size calculation (JSON.stringify) adds negligible overhead
- [ ] No blocking operations in hot path
- [ ] Performance.now() calls have minimal impact
- [ ] Error handling doesn't create memory leaks
- [ ] No unnecessary function calls

---

## Final Pre-Implementation Checklist

- [ ] All three edits reviewed and understood
- [ ] No conflicting code exists
- [ ] Test infrastructure ready (vitest configured)
- [ ] Background.js currently loads without errors
- [ ] Browser extension can be loaded in Dev Mode
- [ ] Chrome DevTools IndexedDB inspector available
- [ ] Git repository clean (ready for commit)

**Status:** Ready for Wednesday implementation ✓

