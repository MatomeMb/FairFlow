# Sprint 2 — Execution Plan

Orderly implementation of P1 items (MVP-07 through MVP-10). Order follows dependencies and risk: error handling first, then auth/rate limits (with demo-safe option), then platform logging, then XMP beacon.

---

## Execution order

| Order | ID | Item | Rationale |
|-------|-----|------|-----------|
| 1 | MVP-10 | Error handling polish | Consistent errors improve UX and unblock clear auth/API messages. |
| 2 | MVP-09 | Basic auth and rate limits | API keys + rate limit; optional so demo works without keys. |
| 3 | MVP-08 | Platform test harness results logging | Results recorded in JSON; self-contained in matter-core. |
| 4 | MVP-07 | XMP beacon detection (basic) | Extension detects beacon in images; depends on resolve (already works). |

---

## MVP-10: Error handling polish

**Acceptance:** Meaningful errors for MVP flows.

**Tasks:**
1. **API:** Define a single error response shape: `{ code, message, details? }`. Use for compile (invalid JSON, validation), resolve (not found), thing (not found), batch (not implemented).
2. **API:** Compile: when body is not JSON, return 400 with code e.g. `invalid_json` and message.
3. **Extension:** On resolve failure, show API `message` in overlay if present; otherwise "Unable to load".

**Definition of done:** All API error responses use the same shape; extension shows API message when resolve fails.

---

## MVP-09: Basic auth and rate limits

**Acceptance:** API keys enforced.

**Tasks:**
1. **API:** Add optional API key check: if env `SHADOW_INDEX_API_KEY` is set, require header `x-api-key` or `Authorization: Bearer <key>` to match; otherwise skip (demo mode).
2. **API:** Add simple in-memory rate limit: e.g. 100 req/min per IP or per key when key is required. Return 429 with error shape when exceeded.
3. **Docs:** Document env vars and header in README or API_KEYS_GUIDE.

**Definition of done:** With API key set, requests without valid key get 401; rate limit returns 429; with key unset, all requests allowed (demo).

---

## MVP-08: Platform test harness results logging

**Acceptance:** Results recorded in JSON.

**Tasks:**
1. **matter-core (platform-test):** Add command e.g. `record-result --platform <name> --image <path> --output <results.json>` that runs extraction (XMP + EOF), writes one platform entry to the JSON file (append or merge), with `xmp_survives`, `eof_survives`, `notes`.
2. **Docs:** Update PHASE0 or platform-test README with record-result usage and expected JSON shape.

**Definition of done:** Running record-result appends a platform result to a JSON file; generate-report can consume it.

---

## MVP-07: XMP beacon detection (basic)

**Acceptance:** Detects beacon in images for MVP.

**Tasks:**
1. **Extension:** Add minimal XMP extraction in JS: fetch image bytes, parse JPEG APP1 (0xFFE1, namespace `http://ns.adobe.com/xap/1.0/`) or PNG iTXt (keyword `XML:com.adobe.xmp`), extract XML and regex `<matter:hash>([^<]+)</matter:hash>` and optionally `<matter:gist>([^<]+)</matter:gist>`.
2. **Extension:** On image click (or context menu / dedicated "Scan image"): if image has matter beacon, get hash, call resolve, show overlay. Option: show a small badge on images that have a beacon (e.g. after scanning visible images on load or on hover).
3. **MVP scope:** "Basic" = click on image → if beacon present, show overlay. No requirement to scan all images on page automatically unless simple.

**Definition of done:** User can click an image that contains Matter XMP; overlay appears with product info from resolve.

---

## Verification (after each item)

- Build succeeds (shadow-index: `npm run build`; matter-core: `cargo build`; extension: load in Chrome).
- Existing tests pass (Vitest 7/7, cargo test).
- Sprint 1 demo flow still works (compile → matter:// link → overlay).

---

*Sprint 2 execution v1.0 | Feb 2026*
