# lens-extension

Browser extension for discovering and interacting with .thing commerce objects.

## Overview

The Lens extension:
- Detects .thing objects embedded in images (XMP beacons) — MVP-07
- Intercepts `matter://` protocol links
- Displays product overlays on hover/click
- Caches resolve responses locally with 24-hour TTL — MVP-13
- Supports Chrome, Edge, Brave, and Firefox

## Features (MVP-13: Extension Caching)

### IndexedDB Cache

The extension maintains a local IndexedDB cache (`lens-matter-cache`) to:
- **Reduce API calls:** Repeated clicks on the same hash use cached data.
- **Improve UX:** Instant overlay display on cache hit (no network latency).
- **Support offline:** Previously viewed products remain accessible without network.

**Cache behavior:**
- First resolve request: calls Shadow Index API, stores response in IndexedDB.
- Subsequent requests: returned instantly from cache (no API call).
- Cache TTL: 24 hours (stale entries are refreshed on next resolve).
- Error handling: failed API requests are NOT cached; overlay shows error message.

**Verification:** See [docs/VERIFY-MVP-13-CACHE.md](../../docs/VERIFY-MVP-13-CACHE.md) for manual testing steps.

### XMP Beacon Detection — MVP-07

The extension detects .thing objects embedded in image metadata:
- **JPEG:** Scans APP1 (XMP) markers.
- **PNG:** Extracts iTXt chunks.
- **Extraction:** Parses `<matter:hash>` and `<matter:gist>` XML tags.

## Development

```bash
# Install dependencies
pnpm install

# Build extension
pnpm build

# Watch mode
pnpm dev

# Run tests
pnpm test
```

## Loading in Browser

### Chrome/Edge
1. Open `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `packages/lens-extension/` folder

### Brave
1. Open `brave://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `packages/lens-extension/` folder

### Firefox
**Option A — MV3 (manifest.json):** Try first; Firefox 121+ supports MV3 experimentally.
1. Open `about:debugging`
2. Click "This Firefox"
3. Click "Load Temporary Add-on"
4. Select `manifest.json` from `packages/lens-extension/`

**Option B — MV2 fallback (manifest_v2.json):** Use if MV3 fails to load or message passing is broken.
1. Open `about:debugging` → This Firefox → Load Temporary Add-on
2. Select `manifest_v2.json` (Firefox accepts any manifest filename)
3. Includes `firefox-compat.js` (chrome.* polyfill for `browser.*` API)

See [docs/FRIDAY-CROSS-BROWSER-SPRINT-ANALYSIS.md](../../docs/FRIDAY-CROSS-BROWSER-SPRINT-ANALYSIS.md) for Firefox risk mitigation.

## Configuration

### API Base URL

By default, the extension resolves hashes from `http://localhost:3000`. To use a custom API:

```javascript
// In browser console on any page with the extension:
chrome.storage.local.set({ shadow_index_base_url: 'http://api.example.com:3000' });
```

Verify:
```javascript
chrome.storage.local.get(['shadow_index_base_url'], (items) => {
  console.log('API base URL:', items.shadow_index_base_url || 'default (localhost:3000)');
});
```

### Clear Cache

To manually clear the cache:

```javascript
indexedDB.deleteDatabase('lens-matter-cache');
```

Or reload the extension (DevTools → Extension details → Reload).

## Project Structure

```
src/
├── manifest.json    # Extension manifest (v3)
├── content.js       # Content script (XMP detection, overlay rendering)
├── background.js    # Service worker (IndexedDB cache, message handler)
├── popup.html       # Extension popup UI
└── content.css      # Overlay and UI styles

tests/
├── cache.test.js       # Cache unit tests (MVP-13, 15 tests)
└── integration.test.js # Cache integration tests (Tuesday sprint, 16 tests)
```

## Architecture

### Message Flow (MVP-13)

```
Content Script (page context)
  ↓ chrome.runtime.sendMessage({ type: 'resolve', hash })
Service Worker (extension context)
  ↓ cacheGet(hash) → check IndexedDB
  ├─ HIT → return cached data
  └─ MISS → fetch GET /resolve/:hash
      ↓ on success → cacheSet(hash, data) → return data
      └─ on error → return error (no cache write)
  ↓ chrome.runtime.sendResponse({ ok, data|error })
Content Script
  ↓ renderOverlay(data)
```

### Cache Storage (IndexedDB)

**Database:** `lens-matter-cache` (v1)  
**Store:** `resolve` (keyed by hash)  
**Entry shape:**

```javascript
{
  hash: "1a5f3799684d79a1c78df5fe9a4647c6ee255475684e419fcc411790a8a735bc",
  gist: {
    title: "Demo Product",
    price: 14999,        // cents
    currency: "USD",
    image_url: "https://..."
  },
  thing_url: "http://localhost:3000/thing/1a5f37...",
  image_url: "https://...",
  checkout_url: "https://...",
  fetchedAt: 1738828800000
}
```

## Testing

### Unit Tests

Run cache behavior and integration tests:

```bash
# Run all tests once
pnpm test

# Watch mode (for development)
pnpm test:watch
```

**Test Coverage:**
- **cache.test.js:** 15 tests for cache module internals
  - AC1: Cache-on-read (cache hit/miss logic)
  - AC2: Cache-on-success (field validation, timestamp injection)
  - AC3: No cache on error (null/undefined rejection)
  - AC4: TTL enforcement (24-hour boundary)
  - AC5: Overlay shape (data consistency)
  - AC6: Cache isolation (IndexedDB persistence)

- **integration.test.js:** 16 tests for resolve handler integration
  - Cache hit scenarios (return data without API call)
  - Cache miss scenarios (API fallback)
  - TTL enforcement at boundaries
  - Multiple independent entries
  - Edge cases (empty hash, special characters, large payloads)
  - Data integrity (field preservation, fetchedAt auto-injection)

**Total:** 33 passing tests covering cache-first read path

### Manual Testing

Follow the steps in [docs/VERIFY-MVP-13-CACHE.md](../../docs/VERIFY-MVP-13-CACHE.md):

1. Build extension: `pnpm build`
2. Load in Chrome: `chrome://extensions` → Load unpacked → select folder
3. Open demo: `http://localhost:5177/matter-demo.html`
4. DevTools (F12) → Network tab
5. First click "Click here" → Network shows `/resolve/` request, overlay appears
6. Second click (same hash) → **No new `/resolve/` request** (cache hit!)
7. Verify cache: DevTools → Application → IndexedDB → `lens-matter-cache` → `resolve` object store

---

## Cache Write Path (Completed Feb 11)

### How It Works

The extension automatically stores successful API responses in IndexedDB:

1. **Read Check:** Extension checks IndexedDB for requested hash
   - Cache HIT → Return cached data (< 50ms latency)
   - Cache MISS → Proceed to API

2. **API Call:** Fetches content from backend
   - Returns payload to user immediately via `chrome.runtime.sendResponse()`

3. **Automatic Caching:** After successful API response
   - Payload stored with `fetchedAt` timestamp
   - **Error Boundary:** Cache write failures don't affect user experience
   - Graceful degradation: If cache write fails, user still gets API data

### Write Path Flow

```
User clicks matter:// link
    ↓
Check cache (cacheGet)
    ├─ HIT → Return cached data [<50ms]
    └─ MISS → Call API [async]
              ↓
         API succeeds → Return to user [*important: happens immediately*]
              ↓
         Background: Cache write (cacheSet) [async, may fail]
              ├─ Success → [Cache WRITE] logged with size/latency
              └─ Failure → [Cache WRITE FAILED] logged, app continues
```

### Error Handling

**API Errors (4xx, 5xx, network timeout):**
- Never cached
- Logged with [API ERROR] prefix and status code
- User sees error message in overlay

**Cache Write Errors:**
- Logged with [Cache WRITE FAILED] prefix and error message
- User response unaffected (API data already sent)
- Future requests will retry cache write

**QuotaExceededError:**
- Logged but not fatal
- Extension continues working in degraded mode
- Consider clearing old entries or implementation cache eviction policy

### Performance Metrics

**Typical cache write latency:**
- Small payloads (<10KB): 5-15ms
- Medium payloads (10-100KB): 15-30ms
- Large payloads (>100KB): 30-50ms

**Target:** <50ms for 95th percentile

**Measurement:** Check console logs
```
[Cache WRITE] Hash: abc123... (2847 bytes, 12ms)
```

### Monitoring Cache Operations

**View cache writes in console:**
```
// Successful write
[Cache WRITE] Hash: abc123... (2847 bytes, 12ms)

// Cache miss (API call)
[Cache MISS] Hash: xyz789..., proceeding to API

// Cache hit (no API call)
[Cache HIT] Hash: abc123... (23ms)

// Write failure (user still gets API data)
[Cache WRITE FAILED] Hash: abc123...: QuotaExceededError

// API error (no cache entry created)
[API ERROR] Hash: unknown999: 404
```

**Check IndexedDB:**
DevTools → Application → IndexedDB → `lens-matter-cache` → `payloads`

**Test cache lifecycle:**
1. First click: cache miss + API call + write
2. Second click: cache hit (no API call)
3. Reload extension: cache persists
4. Delete DB manually: cache cleared, next click refetches

### Known Limitations

- Cache writes are synchronous relative to user response (response always happens first)
- Large payloads (>5MB) may hit IndexedDB quota on devices with limited storage
- No automatic cache eviction (quota management planned for future sprint)
- Cross-browser validation: Friday Feb 13 sprint (Chrome/Edge/Brave/Firefox); prep complete

**Expected behavior:**
- First resolution: API call → IndexedDB write → overlay displays
- Subsequent resolutions (same hash, <24h): IndexedDB read (no API call) → instant overlay
- Stale cache (>24h): IndexedDB miss → API call → overlay displays


## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Extension error" in overlay | Check background script: DevTools → chrome://extensions → Lens → Inspect. Check console for errors. |
| Overlay not appearing | Extension loaded? Content script runs on the page origin. Try refreshing the demo page. |
| Network tab shows `/resolve` on every click | Cache may not be writing. Check background console; verify IndexedDB is not full. Clear and retry. |
| IndexedDB not visible in DevTools | Load extension; open any page in the extension's scope; DevTools → Application → IndexedDB. |
| Cross-browser issues | See [docs/MVP-13-CROSS-BROWSER.md](../../docs/MVP-13-CROSS-BROWSER.md) for support matrix. |

## Supported Browsers

| Browser | Version | Support | Notes |
|---------|---------|---------|-------|
| Chrome | 110+ | Primary | Full MV3 support |
| Edge | 110+ | Full | Chromium-based; identical to Chrome |
| Brave | 1.62+ | Full | Chromium-based |
| Firefox | 121+ | Experimental | MV3 support in progress |
| Safari | 17+ | Not supported | Uses web extensions API |

See [docs/MVP-13-CROSS-BROWSER.md](../../docs/MVP-13-CROSS-BROWSER.md) for detailed compatibility notes.

## Features

- Image detection (XMP beacons)
- matter:// link interception
- Product overlay UI
- Ed25519 signature verification (WASM)
- Local caching (IndexedDB; planned Sprint 5)

## Status

**MVP-13 (Caching): Complete**

Completed:
- Cache module: 5 functions with IndexedDB backend (Monday, Feb 9)
- Unit tests: 15 tests covering all acceptance criteria
- Integration tests: 16 tests for resolve handler
- Logging: Structured [Cache HIT] / [Cache MISS] logging
- cacheSet() integration in background.js (Wednesday, Feb 11)
- E2E validation: 45/45 tests passing (Thursday, Feb 12)
- Firefox compatibility layer + manifest_v2 fallback (Friday prep)

**Core Features:**
- Image detection (XMP beacons) — MVP-07 [Complete]
- matter:// link interception — MVP-07 [Complete]
- Product overlay UI — MVP-07 [Complete]
- Ed25519 signature verification (WASM) — MVP-08 [Complete]
- Local caching - read path (IndexedDB) — MVP-13 [Complete]
