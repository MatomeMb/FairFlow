# Manual E2E Testing - Cache Write Path (Wednesday Sprint)

**Date:** February 11, 2026  
**Tester:** [Your Name]  
**Browser:** Chrome v[version]  
**Time Started:** [timestamp]  
**Time Completed:** [timestamp]

---

## Pre-Test Setup

### 1. Clear All Cache
```javascript
// In DevTools Console (F12)
await window.indexedDB.deleteDatabase('lens-matter-cache');
console.log('Cache cleared');
```

### 2. Verify Extension is Loaded
```bash
chrome://extensions → Lens Extension → Check "Developer mode" is ON
```

### 3. Open DevTools
- Press **F12** → Console tab (for logs)
- Open **Application** tab → IndexedDB → lens-matter-cache → resolve

### 4. Set Log Filter
```javascript
// In Console, run:
console.clear();
```

---

## Scenario 1: First Resolution (Cache Miss → Write)

**Objective:** Verify cache miss is detected and write is triggered

**Steps:**
1. Navigate to a page with a `matter://` link
2. Click the link
3. Observe console logs
4. Check IndexedDB in Application tab

**Expected Console Output:**
```
[Cache MISS] Hash: abc123def456..., proceeding to API
[Cache WRITE] Hash: abc123def456... (2847 bytes, 12ms)
```

**Expected IndexedDB Entry:**
```
Key: abc123def456...
Value: {
  hash: "abc123def456...",
  gist: { title: "...", price: 1999, currency: "USD" },
  thing_url: "http://localhost:3000/thing/abc123...",
  fetchedAt: 1707667200000,
  ... (other fields)
}
```

**Expected UI:**
- Overlay appears with product content
- No errors in console

**Pass/Fail:**
- [ ] PASS: Console shows both MISS and WRITE logs
- [ ] PASS: IndexedDB has entry with correct hash
- [ ] PASS: Entry includes `fetchedAt` timestamp
- [ ] PASS: Overlay renders correctly
- [ ] PASS: No console errors

**Notes:**
_________________________________________________________________

---

## Scenario 2: Second Resolution (Cache Hit)

**Objective:** Verify cache hit is detected and API is NOT called

**Steps:**
1. Click the **same** `matter://` link again
2. Observe console
3. Check Network tab (should see NO new API requests)

**Expected Console Output:**
```
[Cache HIT] Hash: abc123def456... (23ms)
```

**Expected Network Tab:**
- No new GraphQL/API requests
- Previous request from Scenario 1 still visible

**Expected UI:**
- Overlay appears instantly (should be faster than Scenario 1)
- Content is identical to Scenario 1

**Pass/Fail:**
- [ ] PASS: Console shows HIT log (not MISS)
- [ ] PASS: Network tab shows NO new API call
- [ ] PASS: Latency < 50ms
- [ ] PASS: Content is identical
- [ ] PASS: No console errors

**Notes:**
_________________________________________________________________

---

## Scenario 3: Page Reload (Cache Persistence)

**Objective:** Verify cache persists across page reloads

**Steps:**
1. Reload the page (Ctrl+R)
2. Wait for extension to reinitialize
3. Click the **same** `matter://` link again
4. Observe console

**Expected Console Output:**
```
[Cache HIT] Hash: abc123def456... (25ms)
```

**Expected Behavior:**
- Cache is still present after reload
- No new API call made
- Content renders immediately

**Pass/Fail:**
- [ ] PASS: Cache persists after reload
- [ ] PASS: Cache HIT is logged
- [ ] PASS: No new API call
- [ ] PASS: No console errors

**Notes:**
_________________________________________________________________

---

## Scenario 4: API Error Handling (4xx/5xx)

**Objective:** Verify API errors are NOT cached

**Steps:**
1. Clear cache: `await window.indexedDB.deleteDatabase('lens-matter-cache');`
2. Simulate API error by:
   - Option A: Click invalid hash in URL: `matter://invalid_hash_xyz_000`
   - Option B: Temporarily change API URL to invalid endpoint
3. Observe console and IndexedDB

**Expected Console Output:**
```
[Cache MISS] Hash: invalid_hash_xyz_000, proceeding to API
[API ERROR] Hash: invalid_hash_xyz_000: 404
```

**Expected IndexedDB:**
- NO new entry for that hash
- Cache should remain empty (or only have previous entries)

**Expected UI:**
- Error message displayed (or handled gracefully)

**Pass/Fail:**
- [ ] PASS: Console shows API ERROR log
- [ ] PASS: IndexedDB does NOT contain error hash
- [ ] PASS: No cache entry created on failure
- [ ] PASS: Error is displayed to user

**Notes:**
_________________________________________________________________

---

## Scenario 5: Cache Write Error Recovery (QuotaExceededError)

**Objective:** Verify cache write failure doesn't block user response

**Steps:**
1. Clear cache: `await window.indexedDB.deleteDatabase('lens-matter-cache');`
2. Simulate quota exceeded:
   ```javascript
   // In DevTools Console:
   const fakeQuotaError = new DOMException('QuotaExceededError', 'QuotaExceededError');
   // (Alternatively: fill cache with large payloads until quota is exceeded)
   ```
3. Click a `matter://` link
4. Observe console and UI

**Expected Console Output:**
```
[Cache MISS] Hash: abc123..., proceeding to API
[Cache WRITE FAILED] Hash: abc123...: QuotaExceededError
```

**Expected UI:**
- Overlay still appears with content
- User sees product information despite cache write failure
- NO broken overlays or missing content

**Pass/Fail:**
- [ ] PASS: Console shows WRITE FAILED log
- [ ] PASS: Overlay renders correctly
- [ ] PASS: User data is complete
- [ ] PASS: No console JavaScript errors

**Notes:**
_________________________________________________________________

---

## Scenario 6: Large Payload Caching

**Objective:** Verify large payloads are cached within performance targets

**Steps:**
1. Find or create a `matter://` link for a large product (many images, long description)
2. Click link and observe console timing

**Expected Console Output:**
```
[Cache MISS] Hash: large_product_hash (156234 bytes, 35ms)
```

**Performance Targets:**
- Payload size: 100KB-1MB → expected latency 20-50ms
- Write latency < 50ms (p95 acceptable)

**Expected Behavior:**
- Write latency logged accurately
- No UI blocking or stuttering
- Cache entry successfully created

**Pass/Fail:**
- [ ] PASS: Write latency < 50ms
- [ ] PASS: Payload size correctly calculated in bytes
- [ ] PASS: Large data successfully cached
- [ ] PASS: No console errors

**Notes:**
_________________________________________________________________

---

## Summary Results

| Scenario | Objective | Status | Notes |
|----------|-----------|--------|-------|
| 1 | Cache Miss → Write | [ ] PASS / [ ] FAIL | |
| 2 | Cache Hit | [ ] PASS / [ ] FAIL | |
| 3 | Persistence | [ ] PASS / [ ] FAIL | |
| 4 | Error Handling | [ ] PASS / [ ] FAIL | |
| 5 | Write Error Recovery | [ ] PASS / [ ] FAIL | |
| 6 | Large Payload | [ ] PASS / [ ] FAIL | |

**Overall Status:** [ ] ALL PASS / [ ] FAILURES DETECTED

---

## Troubleshooting

### Issue: "Database not initialized" error

**Solution:**
1. Check extension is loaded: `chrome://extensions`
2. Verify IndexedDB exists: DevTools → Application → IndexedDB
3. Reload extension: Click reload icon in chrome://extensions

### Issue: Cache not appearing in IndexedDB

**Solution:**
1. Verify database name is correct: `lens-matter-cache`
2. Check object store name: `resolve`
3. Ensure API is returning valid data

### Issue: API not being called on cache miss

**Solution:**
1. Clear cache: `await window.indexedDB.deleteDatabase('lens-matter-cache');`
2. Reload page: Ctrl+R
3. Click link again

### Issue: Write latency > 50ms

**Solution:**
1. Check IndexedDB size: DevTools → Application → Storage
2. Consider clearing old entries if quota is near limit
3. Profile with DevTools → Performance tab

---

## Sign-off

**Tester:** _________________________________  
**Date/Time Completed:** _________________________________  
**All 6 Scenarios Passed:** [ ] YES / [ ] NO  
**Blockers:** _________________________________  
**Notes:** _________________________________________________________________
