# .things that Matter
## Sprint 4 Plan — Batch, Catalog & Merchant Foundation

---

| **Document Information** | |
|--------------------------|---|
| **Company Name** | .things that Matter |
| **Document Type** | Sprint Plan |
| **Version** | 1.0 |
| **Date** | March 2026 |
| **Sprint Window** | Mar 3 – Mar 16, 2026 |
| **Author** | Matome Mboweni, CTO |
| **Status** | Approved for execution |

---

## 1. EXECUTIVE SUMMARY

**Sprint Goal:** Enable bulk product ingestion and merchant-facing tooling so the system can support catalog-scale compilation and prepare for beta merchant onboarding.

**Strategic Rationale:**
- Sprint 3 delivered R2 storage and the Rust compiler; single-product compile is production-ready.
- Merchants need to upload many products at once (batch) and import from catalogs (CSV/JSON).
- A minimal merchant-facing surface (dashboard or import UI) unblocks beta onboarding and validates the batch path.

**Key Decisions:**
1. **Implement `POST /batch`** (MVP-11) — accept an array of product objects; compile each; store in R2 (or local); return array of `{ hash, matter_uri, thing_url, gist }`; enforce a configurable cap (e.g. 100) per request.
2. **Catalog import** (MVP-12) — support CSV and/or JSON file upload or JSON array in body; map rows/items to product schema; call compile (or batch) under the hood; return summary (success count, errors, hashes).
3. **Merchant dashboard (lite)** — optional for Sprint 4; if time permits, a single static or minimal SPA page that: uploads a CSV/JSON file, calls batch or catalog endpoint, displays results (hashes, matter URIs, error count). Defer full dashboard to Sprint 5 if needed.

**Expected Outcome:** By end of Sprint 4, the API can accept batch and catalog input; merchants (or internal users) can compile many products in one request and obtain matter URIs at scale. Optional: minimal “upload catalog” page.

**Prerequisites (from Sprint 3):**
- R2 storage operational; `STORAGE_MODE=r2` supported.
- Rust compiler and `matter` CLI available; hash algorithm aligned with API.
- Shadow Index API: `POST /compile`, `GET /resolve/:hash`, `GET /thing/:hash` working with R2.

---

## 2. SPRINT SCOPE & PRIORITIES

### 2.1 Primary (Must Complete)

| ID | Item | Priority | Effort | Owner | Rationale |
|----|------|----------|--------|-------|-----------|
| **MVP-11** | Batch compilation API | P0 | 3 days | CTO | Unblocks catalog and dashboard; `POST /batch` implemented and tested |
| **MVP-12** | Catalog import (CSV/JSON) | P0 | 2 days | CTO | Merchants need to bring existing catalogs; can call batch internally |

### 2.2 Secondary (Nice to Have)

| ID | Item | Priority | Effort | Owner | Rationale |
|----|------|----------|--------|-------|-----------|
| **Merchant dashboard (lite)** | Single page: upload file → batch/catalog → show results | P1 | 2 days | CTO | Validates UX and gives a concrete “merchant” touchpoint |

### 2.3 Deferred (Sprint 5+)

| ID | Item | Reason |
|----|------|--------|
| MVP-13 | Extension caching (IndexedDB) | Lower priority; current performance acceptable |
| MVP-14 | Analytics events | Not required until beta merchants onboard |
| Full merchant dashboard | Multi-page, auth, catalog list | Scope for a dedicated sprint |

**Total Committed:** 5 days primary + 2 days secondary = 7 days. Sprint duration 14 days; buffer for testing and docs.

---

## 3. DETAILED IMPLEMENTATION PLAN

### 3.1 MVP-11: Batch Compilation API

**Acceptance Criteria:**
- `POST /batch` accepts a JSON body: `{ "products": [ { title, price, currency, image_url?, checkout_url? }, ... ] }`.
- Each product is validated (same Zod schema as `POST /compile`); invalid items are skipped or reported in response (design choice: either fail entire batch or return partial success with errors).
- For each valid product: compute hash (same stableStringify + SHA-256 as `/compile`), build .thing payload, upload to R2 when `STORAGE_MODE=r2`, else write to local `data/things`; update `data/index.json` with new entries.
- Response: `{ "results": [ { hash, matter_uri, thing_url, gist }, ... ], "errors": [ { index, code, message }? ] }` and HTTP 200 (or 207 if partial failures).
- Enforce a maximum batch size (e.g. 100) per request; return 400 if exceeded.
- Rate limit and auth: same as existing API (optional API key, 100 req/min per IP); batch consumes one “request” for rate limit.

**Implementation Notes:**
- Reuse existing `hashProduct`, `buildThingPayload`, `uploadThing` (or local write), `loadIndex`/`saveIndex` from `api/index.ts`.
- Loop over `products`; for each valid product, compile, store, append to index, push to `results`; for invalid, push to `errors` with index and message.
- Add unit tests (Vitest): valid batch returns 200 and correct number of results; batch over limit returns 400; invalid item in batch returns 207 with errors array (or 200 with mixed results/errors per product).

**File:** `packages/shadow-index/api/index.ts`  
- Replace the current `POST /batch` stub (501) with the above logic.
- Consider extracting “compile one product and persist” into a shared helper used by both `POST /compile` and the batch loop to avoid duplication.

---

### 3.2 MVP-12: Catalog Import (CSV/JSON)

**Acceptance Criteria:**
- **Option A (recommended for Sprint 4):** New endpoint `POST /catalog/import` that accepts:
  - Either: `Content-Type: application/json` with body `{ "products": [ ... ] }` (same as batch), or
  - Or: `Content-Type: text/csv` with body CSV (header row: e.g. `title,price,currency,image_url,checkout_url`; map to product schema).
- CSV parsing: use a small CSV parser (e.g. `csv-parse` or built-in split); validate each row against product schema; collect errors per row.
- Internally call the same “compile and persist” logic as batch (or call batch helper with parsed products).
- Response: same shape as batch, or a summary `{ "imported": number, "errors": [ { row, message } ] }` plus optional `results` array.
- **Option B:** No new endpoint; document that “catalog import” is achieved by uploading a CSV/JSON to the merchant dashboard (or script), which converts to the batch payload and calls `POST /batch`. Then MVP-12 is “catalog import capability via batch + tooling” rather than a dedicated import API.

**Recommendation:** Implement Option A with a single `POST /catalog/import` that accepts JSON array (same as batch) or CSV body; map CSV rows to products and delegate to the same persistence layer as batch. This keeps the API clear and testable.

**Files:**
- `packages/shadow-index/api/index.ts` — add `POST /catalog/import`; CSV parsing (add dependency if needed, e.g. `csv-parse/sync`).
- Tests: Vitest for CSV and JSON import (valid CSV, invalid row, mixed).

---

### 3.3 Merchant Dashboard (Lite) — Optional

**Acceptance Criteria:**
- A single HTML page (or minimal SPA) that:
  - Provides a file input (CSV or JSON).
  - On submit: reads file, parses CSV or JSON, posts to `POST /batch` or `POST /catalog/import`.
  - Displays: number of products compiled, list of matter URIs (or links), and any errors.
- No auth required for the page itself (API can still require key if configured); or the page can send the API key from a config field.
- Hosted statically (e.g. same demo server or a separate path) so CTO/CEO can demo “upload a catalog and get matter URIs.”

**Implementation:**
- New file: `demo/catalog-upload.html` (or under `packages/` if you prefer). Use `fetch` to `POST /batch` or `POST /catalog/import` with the parsed payload. Display results in a simple table or list.
- Alternatively: extend `scripts/create-mvp-demo.ps1` or add `scripts/import-catalog.ps1` that reads a CSV/JSON file and calls the batch endpoint; then “dashboard” is script-based for Sprint 4 and the web UI is Sprint 5.

**Recommendation:** If time allows, implement the single-page `catalog-upload.html`; otherwise document the script-based flow and defer the page to Sprint 5.

---

## 4. TESTING STRATEGY

- **Unit (Vitest):** Batch: valid array, over limit, invalid item; Catalog import: valid CSV, valid JSON, invalid row, empty file.
- **Integration:** Run batch with 10 products against local API (local or R2); verify index and .thing files (or R2 keys); run catalog import with a small CSV.
- **Manual:** Upload a CSV with 5–10 products via dashboard or script; verify matter URIs and resolve overlay.

---

## 5. DEFINITION OF DONE

- [x] `POST /batch` implemented; accepts `products` array; enforces max size; returns results and optional errors; uses same hash and storage as single compile.
- [x] `POST /catalog/import` implemented; accepts JSON or CSV; maps to products and compiles (via shared batch logic or direct call); returns summary and/or results.
- [x] Vitest tests added for batch and catalog import; all existing tests still pass.
- [x] Optional: `demo/catalog-upload.html` allows uploading a file and viewing batch/catalog results.
- [x] Documentation: `.env.example` documents `BATCH_MAX_SIZE`; runbook: use `POST /batch` or `POST /catalog/import`; see demo/catalog-upload.html.
- [ ] Release: tag `v0.4.0` created when ready.

---

## 6. RISKS & MITIGATIONS

| Risk | Mitigation |
|------|------------|
| Batch size too large (memory/latency) | Cap at 100 per request; document limit; consider streaming in a future sprint |
| CSV format variations | Define supported columns; document expected header; reject or skip bad rows with clear errors |
| Duplicate products in batch | Same product twice yields same hash (idempotent); index overwrites or deduplicates by hash; document behavior |

---

## 7. TIMELINE (EXAMPLE)

| Day | Focus | Deliverables |
|-----|--------|--------------|
| 1–2 | Batch API | `POST /batch` implemented; tests; max size enforced |
| 3 | Catalog import | `POST /catalog/import` (JSON + CSV); tests |
| 4 | Integration + dashboard (lite) | Optional catalog-upload page or script; manual test |
| 5 | Docs + polish | Runbook, PROGRESS-AND-VERSION, tag v0.4.0 |

---

## 8. REFERENCE COMMANDS

```bash
# Shadow Index (with R2)
cd packages/shadow-index && npm run start

# Test batch (after implementation)
curl -X POST http://localhost:3000/batch \
  -H "Content-Type: application/json" \
  -d '{"products":[{"title":"A","price":100,"currency":"USD"},{"title":"B","price":200,"currency":"USD"}]}'

# Matter CLI (single product)
cd packages/matter-core && ./target/release/matter compile demo-product.json
```

---

## 9. SIGN-OFF

**Sprint 4 Approved for Execution:** CTO — March 2026.

---

**Document Version:** 1.0  
**Last Updated:** March 2026  
**Next Review:** End of Sprint 4 (Mar 16, 2026)  
**Status:** Ready for execution
