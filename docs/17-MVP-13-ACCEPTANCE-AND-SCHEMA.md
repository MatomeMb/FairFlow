# MVP-13: Extension Caching — Acceptance Criteria & IndexedDB Schema

**Sprint 2, Day 1 (Feb 6, 2026)**  
**Deliverable:** Sprint planning; refined MVP-13 acceptance criteria; IndexedDB schema design.

---

## 1. Sprint 2 Goal (MVP-13)

Provide client-side caching of resolve responses in the Lens extension so that repeated resolution of the same `matter://` hash (or XMP beacon click) does not hit the Shadow Index API every time. This reduces latency, avoids unnecessary rate-limit consumption, and improves offline resilience for recently viewed products.

---

## 2. MVP-13 Acceptance Criteria (Refined)

| # | Criterion | How to verify |
|---|-----------|----------------|
| AC1 | **Cache-on-read** — When the user triggers resolve (matter:// link or image with XMP beacon), the extension checks the cache first by hash. If a valid entry exists, the overlay is rendered from cache without a network request. | Click same matter:// link twice; second time no request to `/resolve/:hash` (check Network tab). Overlay shows correct title/price/image. |
| AC2 | **Cache-on-success** — After a successful API resolve, the response is stored in IndexedDB keyed by hash. Stored shape includes at least `gist`, `thing_url`, and `fetchedAt`. | Resolve once; inspect IndexedDB (Application > IndexedDB > lens DB); entry for that hash exists with expected fields. |
| AC3 | **No cache on error** — If the API returns 4xx/5xx or the request fails, nothing is written to the cache. The overlay shows the error message as today. | Force API error (e.g. invalid hash); no new cache entry; overlay shows error. |
| AC4 | **TTL (optional for MVP)** — Cache entries may optionally be considered stale after a configurable TTL (e.g. 24 hours). If TTL is implemented, a stale entry is treated as a miss and the API is called; the new response overwrites the cache. | If TTL implemented: after TTL expires, next resolve for that hash triggers API call and updates cache. |
| AC5 | **Overlay unchanged** — Cached and non-cached paths both render the same overlay (title, price, image, Buy Now). No behavioural difference except latency and network usage. | Visual and functional parity between first load (API) and second load (cache). |
| AC6 | **Cache owned by extension** — IndexedDB is opened from the extension context (service worker), not the page. Cache is isolated per browser profile and survives page reloads. | Cache persists after closing tab; same cache used from any tab where the extension runs. |

---

## 3. IndexedDB Schema Design

### 3.1 Database and store

| Property | Value | Notes |
|----------|--------|--------|
| **Database name** | `lens-matter-cache` | Scoped to the extension; one DB per browser profile. |
| **Version** | `1` | Bump when schema or store names change; triggers `onupgradeneeded`. |
| **Object store name** | `resolve` | Single store for resolve responses keyed by hash. |
| **Key path** | `hash` | Primary key; string (SHA-256 hash of the .thing). |
| **Value shape** | See below. | Stored as a plain object. |

### 3.2 Stored value shape

Every cache entry is keyed by **hash** (string). The value is a plain object with the following fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `hash` | string | Yes | Same as key; allows consistent reads without key path. |
| `gist` | object | Yes | Minimal product data: `{ title, price, currency, image_url? }`. Used for overlay title, price, image. |
| `thing_url` | string | Yes | URL to download the .thing file. |
| `image_url` | string | No | Product image URL for overlay. |
| `checkout_url` | string | No | Buy Now target URL. |
| `fetchedAt` | number | Yes | Unix timestamp (ms) when the entry was cached; used for TTL and debugging. |

**Example entry:**

```json
{
  "hash": "1a5f3799684d79a1c78df5fe9a4647c6ee255475684e419fcc411790a8a735bc",
  "gist": {
    "title": "Demo Product",
    "price": 14999,
    "currency": "USD",
    "image_url": "https://example.com/demo.jpg"
  },
  "thing_url": "http://localhost:3000/thing/1a5f3799684d79a1c78df5fe9a4647c6ee255475684e419fcc411790a8a735bc",
  "image_url": "https://example.com/demo.jpg",
  "checkout_url": "https://example.com/buy",
  "fetchedAt": 1738828800000
}
```

### 3.3 TTL (optional for Day 1)

- **Default TTL:** 24 hours (86_400_000 ms). Configurable later via options or constant.
- **Behaviour:** On get, if `Date.now() - fetchedAt > TTL`, treat as miss: return `null` and do not use the entry. Caller will fetch from API and overwrite.

### 3.4 Cache operations

| Operation | Description |
|-----------|-------------|
| **get(hash)** | Open DB, read store, return value for `hash` or `null`. If TTL enabled and entry stale, return `null`. |
| **set(hash, value)** | Open DB, put `{ ...value, hash, fetchedAt: Date.now() }` into store. |
| **delete(hash)** | Open DB, delete key `hash`. |
| **clear()** | Open DB, clear the `resolve` store. (Useful for debugging or “clear cache” action.) |

### 3.5 Where the cache runs

- **Context:** Extension service worker (background script). IndexedDB is opened in the worker; no page origin involved.
- **Content script:** Does not open IndexedDB. Sends a message to the background with `{ type: 'resolve', hash }`. Background: check cache; on miss, fetch `GET /resolve/:hash` (base URL from storage or default), then set cache and return; on hit, return cached payload. Content script receives one response and renders the overlay.

---

## 4. API Base URL

- Resolve requests from the background must target the Shadow Index API (e.g. `http://localhost:3000`).
- **Default:** `http://localhost:3000`.
- **Override:** Can be stored in `chrome.storage.local` under key `shadow_index_base_url` for future configuration. Day 1 can use default only.

---

## 5. Message protocol (content ↔ background)

**Request (content → background):**

```ts
{ type: 'resolve', hash: string }
```

**Response (background → content):**

- Success: `{ ok: true, data: ResolvePayload }` where `ResolvePayload` matches the current `/resolve/:hash` JSON (hash, matter_uri, thing_url, image_url, gist, checkout_url, etc.).
- Failure: `{ ok: false, error: string }` (e.g. not_found, network error).

Content script continues to use the same overlay shape; it only switches from `fetch()` to `chrome.runtime.sendMessage()` and uses `data` or `error` accordingly.

---

## 6. Document control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Feb 6, 2026 | CTO | Initial: MVP-13 acceptance criteria and IndexedDB schema for Sprint 2. |

---

*Next: Implement cache in `packages/lens-extension/src/background.js` and wire content script to use it (Day 2).*
