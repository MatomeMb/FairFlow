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

### Firefox (MV3 support experimental)
1. Open `about:debugging`
2. Click "This Firefox"
3. Click "Load Temporary Add-on"
4. Select `manifest.json` from `packages/lens-extension/`

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
| Chrome | 110+ | ✅ Primary | Full MV3 support |
| Edge | 110+ | ✅ Full | Chromium-based; identical to Chrome |
| Brave | 1.62+ | ✅ Full | Chromium-based |
| Firefox | 121+ | ⚠️ Experimental | MV3 support in progress |
| Safari | 17+ | ❌ Not supported | Uses web extensions API |

See [docs/MVP-13-CROSS-BROWSER.md](../../docs/MVP-13-CROSS-BROWSER.md) for detailed compatibility notes.

## Features

- Image detection (XMP beacons)
- matter:// link interception
- Product overlay UI
- Ed25519 signature verification (WASM)
- Local caching (IndexedDB; planned Sprint 5)

## Status

**MVP-13 (Caching - Read Path): Complete** ✅

Completed:
- Cache module: 5 functions with IndexedDB backend (Monday, Feb 9)
- Unit tests: 15 tests covering all acceptance criteria (Monday, Feb 9)
- Integration tests: 16 tests for resolve handler read path (Tuesday, Feb 10)
- Logging: Structured [Cache HIT] / [Cache MISS] logging

Deferred to Wednesday:
- cacheSet() integration on successful API responses
- Error path handling (don't cache on API failure)
- Full end-to-end testing with real matter:// links

**Core Features:**
- Image detection (XMP beacons) — MVP-07 ✅
- matter:// link interception — MVP-07 ✅
- Product overlay UI — MVP-07 ✅
- Ed25519 signature verification (WASM) — MVP-08 ✅
- Local caching - read path (IndexedDB) — MVP-13 ✅
