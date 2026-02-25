# Sprint 2 Demo Script — Feb 19, 2026

**Purpose:** Reproducible demo flow for Sprint Review (CEO/CTO).  
**Duration:** ~10–15 minutes.  
**Prerequisites:** Shadow Index API on localhost:3000, Demo server on localhost:5177/5178, Lens extension installed.

---

## 1. Pre-Demo Checklist (5 min)

- [ ] **Terminal 1:** `cd packages/shadow-index && npm run start` — API running on http://localhost:3000
- [ ] **Terminal 2:** `node scripts/demo-server.mjs 5178` — Demo server on http://localhost:5178
- [ ] **Verify API health:** `curl http://localhost:3000/health` → `{"ok":true}`
- [ ] **Lens extension:** Load unpacked from `packages/lens-extension/dist` (or built output)
- [ ] **Browser:** Chrome, Edge, Brave, or Firefox (cross-browser validated)

---

## 2. Demo Flow A — Matter URI Overlay (5 min)

1. Open **http://localhost:5178/matter-demo.html**
2. Default URI: `matter://bfefe5574ca167f98378ef37a123ed07bf00f6bd622c2283e19ac3fbd598ba96`
3. Click the **Click here** link.
4. **Expected:** Lens overlay appears with image, title, price, Buy Now button.
5. **Cache validation:** Click again — overlay should appear faster (cache hit). Check console for `[Cache HIT]` or `[Lens Perf]` logs.
6. **Invalid hash:** Change URI to `matter://invalid` → overlay shows error message (controlled, no spam).

---

## 3. Demo Flow B — Catalog Upload (5 min)

1. Open **http://localhost:5178/catalog-upload.html**
2. API base URL: `http://localhost:3000` (default)
3. Choose **sample-catalog.csv** (or drag CSV with `title,price,currency`).
4. Click **Upload and compile**.
5. **Expected:** Summary with success count; list of `matter://` URIs.
6. Copy a URI → paste into matter-demo.html → click link → overlay appears.

---

## 4. Sprint 2 Highlights to Mention

| Feature | What to Show |
|---------|--------------|
| **MVP-13 IndexedDB cache** | Second click on same hash is faster; console shows cache hit |
| **Performance instrumentation** | `[Lens Perf]` logs total resolution time |
| **Cross-browser** | Same demo works in Chrome, Edge, Brave, Firefox |
| **SHA-256 validation** | Invalid hash length blocked before API call; controlled error overlay |
| **Firefox compatibility** | Manifest v2 with background scripts for older Firefox |

---

## 5. Troubleshooting

| Issue | Fix |
|-------|-----|
| Overlay not appearing | Ensure Lens extension is loaded; check `matter://` protocol handler |
| API unreachable | Start shadow-index: `cd packages/shadow-index && npm run start` |
| CORS errors | API must be on localhost:3000; demo on 5177/5178 |
| Extension not loading | Build: `cd packages/lens-extension && npm run build`; load `dist` folder |

---

*Prepared for Sprint 2 Review — Feb 19, 2026. See [PROGRESS-AND-VERSION.md](./PROGRESS-AND-VERSION.md) for release state.*
