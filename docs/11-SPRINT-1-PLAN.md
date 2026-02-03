# .things that Matter
## Sprint 1 Plan (MVP v0)

---

| **Document Information** | |
|--------------------------|---|
| **Company Name** | .things that Matter |
| **Document Type** | Sprint Plan |
| **Version** | 1.0 |
| **Date** | February 1, 2026 |
| **Sprint Window** | Feb 3 - Feb 16, 2026 |
| **Author** | Matome Mboweni, CTO |

---

## 1. Sprint Goal

Deliver the MVP vertical slice: **compile → resolve → display** with a `matter://` link.

---

## 2. Sprint Backlog — Final Status

| ID | Item | Status | Notes |
|----|------|--------|-------|
| MVP-01 | Compile single product JSON to `.thing` | ✅ Done (via API) | Rust compiler deferred to Sprint 2 |
| MVP-02 | Generate `matter://` URI from hash | ✅ Done | |
| MVP-04 | Resolve hash via Shadow Index | ✅ Done | |
| MVP-05 | Minimal UI renders product from `matter://` | ✅ Done | Image added to overlay — see content.js + content.css |
| MVP-06 | MVP path tests | ✅ Done | API unit tests (Vitest) + E2E smoke (Playwright or manual) |

---

## 2b. How to run the MVP demo

Run these steps in order:

1. **Start Shadow Index API:**  
   `cd packages/shadow-index && npm install && npm run start`

2. **Generate demo page (optional if demo already exists):**  
   From repo root: `powershell scripts/create-mvp-demo.ps1`  
   (Or POST a product to `http://localhost:3000/compile` manually and use the returned `matter_uri` in a page.)

3. **Start demo server:**  
   `powershell scripts/start-demo-server.ps1`  
   (Serves `demo/` on http://localhost:5177.)

4. **Load Lens extension:**  
   In Chrome: open `chrome://extensions` → turn on **Developer mode** → **Load unpacked** → select the `packages/lens-extension` folder.

5. **Open demo page:**  
   Navigate to http://localhost:5177/matter-demo.html

6. **Click the matter:// link** on the page.

7. **Verify:** Overlay appears with title, price, image, and **Buy Now** button.

---

## 3. Build → Evaluate → Test → Ship

### Build
- Implement the minimal compile and resolve pipeline
- Wire minimal UI to display product gist

### Evaluate
- Validate against MVP acceptance criteria in `docs/10-MVP-BACKLOG.md`
- CEO review of the demo flow

### Test
- Unit tests for compile and resolve
- Basic end-to-end smoke test for the UI

### Ship
- Tag the MVP increment
- Update docs and release notes

---

## 4. Definition of Done

- Build succeeds locally
- Tests for changed areas pass
- MVP acceptance criteria met
- Docs updated
- Increment is demoable

---

## 5. Risks & Mitigations

- **Risk:** Scope too big for sprint  
  **Mitigation:** Split or defer to next sprint

- **Risk:** API integration takes longer  
  **Mitigation:** Stub response to unblock UI, replace with real call later

---

## 6. MVP Demo Steps

1. Start the Shadow Index API (`packages/shadow-index`)
2. POST a sample product JSON to `/compile`
3. Copy the returned `matter://` URI
4. Open any page with a `<a href="matter://...">` link
5. Click the link to view the overlay

---

## 7. MVP Test Checklist

- [x] `/compile` returns `hash`, `matter_uri`, `thing_url`, and `gist`
- [x] `/resolve/:hash` returns gist + URLs
- [x] Extension overlay shows title, price, and image

---

## Sprint 1 — Final Status

| ID | Item | Status | Notes |
|---|---|---|---|
| MVP-01 | Compile single product JSON to `.thing` | ✅ Done | Implemented in Shadow Index API (`POST /compile`). Rust compiler deferred to Sprint 2. |
| MVP-02 | Generate `matter://` URI from hash | ✅ Done | `buildMatterUri(hash)` in API. Returns `matter://{hash}`. |
| MVP-04 | Resolve hash via Shadow Index | ✅ Done | `GET /resolve/:hash` returns full entry. 404 on miss. |
| MVP-05 | Minimal UI renders product from `matter://` | ✅ Done | Overlay displays title, price, image, and Buy Now. See `content.js` + `content.css`. |
| MVP-06 | MVP path tests | ✅ Done | Vitest: 7/7 (compile + resolve). Playwright: 2 automated + 1 manual (see `docs/MANUAL-E2E-SMOKE.md`). `cargo test`: 8 pass, 3 ignored. |

---

## How to Run the MVP Demo

Numbered runbook — exact commands, copy-pasteable:

1.  cd packages/shadow-index
2.  npm install          (skip if already done)
3.  npm run build        (compiles TypeScript)
4.  npm run start        (starts API on localhost:3000)
    --- leave this terminal running ---
5.  Open a second terminal.
6.  powershell scripts/start-demo-server.ps1
    (serves demo/ on localhost:5177)
    --- leave this terminal running ---
7.  Open Chrome.
8.  Navigate to chrome://extensions
9.  Enable Developer Mode (top-right toggle).
10. Click "Load unpacked".
11. Select the folder: packages/lens-extension
12. Navigate to http://localhost:5177/matter-demo.html
13. Click the matter:// link on the page.
14. The overlay should appear with: image, title, price, Buy Now button.

---

## Bugs Fixed During Sprint 1 Verification

- **Hash idempotency:** Hash was computed from the stored object (including `created_at`). Fixed to compute from input payload only (`parsed.data`). Same POST body → same hash.
- **Start script:** `package.json` `"start"` pointed to `dist/index.js`. Corrected to `dist/api/index.js`.
- **Test types:** `res.json()` was untyped in `index.test.ts`. Added `CompileResponse`, `ResolveResponse`, `ErrorResponse` interfaces.
