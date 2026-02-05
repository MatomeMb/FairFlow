# .things that Matter
## Sprint 3 Plan — Detailed & Comprehensive

---

| **Document Information** | |
|--------------------------|---|
| **Company Name** | .things that Matter |
| **Document Type** | Sprint Plan |
| **Version** | 2.0 (Detailed) |
| **Date** | February 5, 2026 |
| **Sprint Window** | Feb 17 – Mar 2, 2026 (immediate start) |
| **Author** | Matome Mboweni, CTO |
| **Status** | Approved for execution |

---

## EXECUTIVE SUMMARY

**Sprint Goal:** Establish production readiness by implementing R2 storage infrastructure and Rust compiler pipeline, enabling the system to scale beyond local development.

**Strategic Rationale:**
- Current system only stores `.thing` files locally (not production-ready)
- Compilation only available via Node.js API (not portable)
- Before onboarding merchants, need: distributed storage, CLI tooling, and batch processing capability

**Key Decisions Made:**
1. **Prioritize R2 storage (MVP-03)** over P2 items — foundational for production
2. **Implement Rust compiler** — enables CLI, portability, and WASM compilation
3. **Defer P2 items (MVP-11–14)** to Sprint 4 — batch/analytics require storage infrastructure first

**Expected Outcome:** By end of Sprint 3, the system can compile products via CLI, store artifacts in cloud storage, and serve them via CDN — ready for beta merchant onboarding.

---

## 1. SPRINT SCOPE & PRIORITIES

### 1.1 Primary Items (Must Complete)

| ID | Item | Priority | Effort | Owner | Rationale |
|----|------|----------|--------|-------|-----------|
| **MVP-03** | Store artifacts in R2 | P0 | 3 days | CTO | Foundational for production; unblocks merchant onboarding |
| **Rust-Compiler** | Implement Compiler::compile() in matter-core | P0 | 4 days | CTO | Enables CLI tooling; required for WASM; reduces API dependency |

### 1.2 Secondary Items (Nice to Have)

| ID | Item | Priority | Effort | Owner | Rationale |
|----|------|----------|--------|-------|-----------|
| **CLI-Tool** | Build `matter` CLI binary | P1 | 2 days | CTO | Merchant-facing tool for local compilation |
| **MVP-11-Lite** | Basic batch compilation (10 products) | P1 | 1 day | CTO | Validates compiler performance; defers 100+ to Sprint 4 |

### 1.3 Deferred Items (Sprint 4)

| ID | Item | Reason Deferred |
|----|------|-----------------|
| MVP-11 (full) | Batch compilation (100+) | Requires R2 storage + Rust compiler first |
| MVP-12 | Merchant catalog import | Depends on batch compilation |
| MVP-13 | Extension caching | Lower priority; current performance acceptable |
| MVP-14 | Analytics events | Not needed until beta merchants onboard |

**Total Committed Effort:** 7 days (primary) + 3 days (secondary) = 10 days  
**Sprint Duration:** 14 days (Feb 17 – Mar 2)  
**Buffer:** 4 days for polish, bugs, testing

---

## 2. DETAILED IMPLEMENTATION PLAN

### 2.1 MVP-03: Store Artifacts in R2

**Acceptance Criteria:**
- `.thing` files stored in Cloudflare R2 bucket
- Images (polyglot or source) stored in R2
- Public CDN URLs accessible (https://cdn.example.com/things/{hash}.thing)
- Shadow Index API updated to use R2 instead of local file system
- Existing demo flow works with R2-backed storage

**Implementation Breakdown:**

#### Day 1: R2 Setup & SDK Integration

**Task list:** [13-SPRINT-3-DAY1-TASKS.md](./13-SPRINT-3-DAY1-TASKS.md)

**Tasks:**
1. Create Cloudflare R2 bucket: `matter-artifacts-prod`
2. Configure CORS for public read access
3. Set up custom domain: `cdn.thingsthatmatter.com` (or R2.dev subdomain)
4. Install R2 SDK in Shadow Index:
   ```bash
   cd packages/shadow-index
   npm install @aws-sdk/client-s3  # R2 uses S3-compatible API
   ```
5. Create environment variables:
   ```
   CLOUDFLARE_R2_ACCOUNT_ID=xxx
   CLOUDFLARE_R2_ACCESS_KEY_ID=xxx
   CLOUDFLARE_R2_SECRET_ACCESS_KEY=xxx
   CLOUDFLARE_R2_BUCKET=matter-artifacts-prod
   CLOUDFLARE_R2_PUBLIC_URL=https://cdn.thingsthatmatter.com
   ```

**File: `packages/shadow-index/lib/storage.ts` (new)**

- S3Client with R2 endpoint and credentials
- `uploadThing(hash, data)` → PutObject to `things/{hash}.thing`, return public URL
- `uploadImage(hash, imageData, mimeType)` → PutObject to `images/{hash}.{ext}`, return public URL
- `getThing(hash)` → GetObject, return Buffer or null on NoSuchKey

**Testing:** Manual upload test via Node script

#### Day 2: Shadow Index API Integration

**Update: `packages/shadow-index/api/index.ts`**

- Add `STORAGE_MODE=r2` | `local` (default: `local`)
- In POST /compile: if R2, call `uploadThing(hash, thingData)` and use returned URL for thing_url; optionally upload image if UPLOAD_IMAGES_TO_R2=true
- In GET /thing/:hash: if R2, call `getThing(hash)` and stream response; else keep existing file read
- In index store: persist thing_url (R2 CDN URL) and image_url (R2 CDN if uploaded)
- Keep local fallback so existing demo works without R2 credentials

#### Day 3: Testing & Validation

- Upload single product via POST /compile → verify .thing in R2
- GET /thing/:hash returns data from R2
- GET /resolve/:hash returns R2 CDN URLs
- Demo flow works with STORAGE_MODE=r2
- Vitest: add R2 tests (mock or skip when no credentials)
- Update runbook in docs/11-SPRINT-1-PLAN.md with R2 setup steps

---

### 2.2 Rust Compiler: Implement Compiler::compile()

**Acceptance Criteria:**
- Compiler::compile() accepts product JSON string, returns .thing bytes
- Hash computed using same algorithm as Shadow Index API (stable stringify)
- .thing format matches API output (JSON for now; FlatBuffers deferred)
- Unit tests: valid JSON → valid .thing, correct hash, deterministic output
- Optional: CLI binary `matter compile <file.json>` writes .thing to disk

**Implementation Breakdown:**

#### Day 4: Compiler Core Logic

**File: `packages/matter-core/src/compiler/mod.rs`**

- Replace todo!() with: parse ProductInput (title, price, currency, image_url, checkout_url), validate (title non-empty, currency non-empty), compute_hash (stable JSON key order, SHA-256, hex), build ThingFile (hash, created_at ISO), serialize to JSON bytes
- Dependencies: serde, serde_json, sha2, hex, chrono (already in Cargo.toml where needed)
- compute_hash: same key order as API (e.g. checkout_url, currency, image_url, price, title) and same stringify so hash matches API

#### Day 5: Unit Tests & Validation

**File: `packages/matter-core/src/compiler/mod.rs` (tests)**

- test_compile_valid_product: compile JSON → thing bytes, parse back, assert title/price/currency/hash present
- test_hash_deterministic: same JSON twice → same hash in both thing outputs
- test_compile_missing_title: invalid/missing field → Err
- test_compile_empty_title: title "" → Err
- Remove #[ignore] from compiler tests once implemented
- Run: cargo test compiler

#### Day 6: CLI Binary (Optional)

**File: `packages/matter-core/src/bin/matter.rs` (new)**

- Args: compile <input.json>
- Read JSON from file, call Compiler::compile(), write {hash}.thing to current dir, print "Compiled: {hash}.thing" and "matter://{hash}"
- Cargo.toml: add [[bin]] name = "matter", path = "src/bin/matter.rs"
- Build: cargo build --release --bin matter
- Document in packages/matter-core/README.md and docs/11-SPRINT-1-PLAN.md

#### Day 7: Integration (Optional)

- Optional: Node API calls Rust compiler via napi-rs or subprocess; not required for Sprint 3. API can keep TypeScript compile logic.

---

## 3. TESTING STRATEGY

- **Unit:** Vitest (R2 upload/download, compile/resolve with R2); cargo test (Compiler + CLI)
- **Integration:** E2E flow: CLI compile → API compile same JSON → same hash; GET /resolve returns R2 URLs; overlay loads from R2
- **Manual:** Demo flow with STORAGE_MODE=r2; sign off in MANUAL-E2E-SMOKE if needed

---

## 4. DEFINITION OF DONE

- R2 bucket created; API uploads/serves .thing (and optionally images) from R2; resolve returns R2 CDN URLs
- Rust Compiler::compile() implemented and tested; hash matches API for same input
- Optional: matter CLI compile command works
- All existing tests pass; new R2 and compiler tests added
- docs/13-SPRINT-3-PLAN.md updated with final status; runbook includes R2 setup; PROGRESS-AND-VERSION.md → v0.3.0
- Tag v0.3.0 created; .env.example documents R2 and STORAGE_MODE

---

## 5. RISKS & MITIGATIONS

| Risk | Mitigation |
|------|-------------|
| R2 setup complexity | Start with R2 first; keep STORAGE_MODE=local default |
| Rust hash mismatch with API | Same stable stringify; cross-validate with tests |
| R2 costs | Free tier 10GB; monitor usage |
| Integration breaks demo | STORAGE_MODE toggle; local remains default |

---

## 6. TIMELINE & MILESTONES

**Week 1 (Feb 17–23):** R2 setup + API integration (Days 1–2); R2 testing (Day 3); Rust compiler core + tests (Days 4–5)  
**Week 2 (Feb 24 – Mar 2):** CLI binary (Day 6); integration testing, docs, polish (Days 7+); tag v0.3.0, closeout

**Milestone 1 (Week 1 EOD):** R2 storage functional; Rust compiler implemented and tested  
**Milestone 2 (Sprint EOD):** v0.3.0 released; ready for Sprint 4 (batch, catalog import)

---

## 7. SUCCESS METRICS

- R2 upload/serve success; hash match (Rust vs API) 100%; demo flow passes with R2; CLI compile &lt;500ms per product; docs and runbook updated

---

## 8. DEMO SCRIPT (END OF SPRINT 3)

1. Show R2 bucket and CDN URLs  
2. Compile via Rust CLI: matter compile demo-product.json  
3. Upload via API with STORAGE_MODE=r2  
4. Resolve and display in Lens overlay (resources from R2 CDN)

**Message:** "We can compile locally via CLI, store in cloud storage, and serve globally via CDN — ready for merchant onboarding."

---

## 9. NEXT SPRINT PREVIEW (Sprint 4)

**Tentative (Mar 3–16, 2026):** MVP-11 (batch 100+), MVP-12 (catalog import), Merchant dashboard (basic web UI). Prerequisites: R2 + Rust compiler done in Sprint 3.

---

## 10. APPENDIX: REFERENCE COMMANDS

- R2: wrangler r2 bucket create; env vars CLOUDFLARE_R2_*
- Rust: cargo add serde serde_json sha2 hex chrono; cargo test; cargo build --release --bin matter
- Shadow Index: STORAGE_MODE=r2 + R2 env vars; npm run start; POST /compile, GET /resolve/:hash
- Verification: curl R2 CDN URL; matter compile vs API compile same JSON → same hash

---

## 11. BUDGET IMPACT

R2 free tier (10GB); Class A/B operations low cost; estimated ~R55/year for MVP.

---

## 12. SIGN-OFF

**Sprint 3 Approved for Execution:** CTO (Product Owner / Scrum Master / Developer) — Feb 5, 2026.

---

**Document Version:** 2.0 (Detailed)  
**Last Updated:** February 5, 2026  
**Next Review:** End of Sprint 3 (March 2, 2026)  
**Status:** Ready for execution

*Begin with R2 setup (Day 1) on Monday, February 17, 2026.*
