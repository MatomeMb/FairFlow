# MVP-13 Extension Cache — Verification Steps

Use this checklist to verify that the Lens extension resolve cache (IndexedDB) works as designed.

---

## Prerequisites

1. **Shadow Index API** running on `http://localhost:3000`
   - Run from the package directory so `data/index.json` is found:  
     `cd packages\shadow-index` then `npm run start`
   - Confirm: open http://localhost:3000/health — should return `{"status":"ok"}`
   - Confirm resolve: open http://localhost:3000/resolve/bfefe5574ca167f98378ef37a123ed07bf00f6bd622c2283e19ac3fbd598ba96 — should return JSON with `gist`, `thing_url`.

2. **Demo page** (optional but recommended)
   - From repo root: `node scripts/demo-server.mjs 5177`
   - Open http://localhost:5177/matter-demo.html
   - Default URI is pre-filled with a known hash that exists in the index

3. **Lens extension** loaded in Chrome
   - Open `chrome://extensions`
   - Enable "Developer mode"
   - "Load unpacked" → select folder `packages/lens-extension` (the folder that contains `manifest.json` and `src/`)

---

## Verification Steps

### 1. First click (cache miss — API call)

1. Open http://localhost:5177/matter-demo.html (or any page where you can click a `matter://` link).
2. Open DevTools (F12) → **Network** tab. Leave it open.
3. Click the **"Click here"** link (the matter:// URI).
4. **Expected:** Overlay appears with product title, price, image, Buy Now.
5. In Network tab, **confirm** one request to `http://localhost:3000/resolve/<hash>` with status 200.

### 2. Second click (cache hit — no API call)

1. Click the **same** "Click here" link again (or the same matter:// link elsewhere).
2. **Expected:** Overlay appears again with the same content (no flicker or delay).
3. In Network tab, **confirm** there is **no** new request to `/resolve/`. (Only the first request should appear.)

### 3. IndexedDB contents

1. In DevTools, go to **Application** (or **Storage** in some Chromes).
2. In the left sidebar, expand **IndexedDB**.
3. Expand **lens-matter-cache** → **resolve**.
4. **Expected:** At least one entry; key = the hash you resolved (e.g. `1a5f3799684d79a1c78df5fe9a4647c6ee255475684e419fcc411790a8a735bc`).
5. Click the entry and confirm the value has: `hash`, `gist` (title, price, currency), `thing_url`, `fetchedAt`.

### 4. Error path (no cache on failure)

1. In the demo page, change the URI to a **non-existent** hash, e.g. `matter://0000000000000000000000000000000000000000000000000000000000000000`.
2. Click the link.
3. **Expected:** Overlay shows an error message (e.g. "No artifact found" or "Resolve failed").
4. In IndexedDB → **resolve**, **confirm** there is **no** entry for `0000...`.

---

## Quick API sanity check (no browser)

From PowerShell, with the API running:

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/resolve/1a5f3799684d79a1c78df5fe9a4647c6ee255475684e419fcc411790a8a735bc" -Method Get
```

Expected: JSON with `gist.title`, `gist.price`, `thing_url`, etc.

---

## Troubleshooting

| Issue | Check |
|-------|--------|
| Overlay does not appear | Extension loaded? Content script runs on the page origin; try refreshing the demo page. |
| "Extension error" in overlay | Background script may have crashed; check `chrome://extensions` → Lens → "Service worker" → Inspect. |
| Network shows /resolve on every click | Cache may not be writing or TTL may be 0; check background console and IndexedDB. |
| API 404 for hash | That hash is not in the index; use a hash from `packages/shadow-index/data/index.json` (e.g. `1a5f3799684d79a1c78df5fe9a4647c6ee255475684e419fcc411790a8a735bc`). |

---

*Doc: MVP-13 cache verification. Sprint 2.*
