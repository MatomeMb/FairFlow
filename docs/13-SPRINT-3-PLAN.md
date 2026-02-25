# .things that Matter
## Sprint 3 Plan — Analytics & Observability

---

| **Document Information** | |
|--------------------------|---|
| **Company Name** | .things that Matter |
| **Document Type** | Sprint Plan |
| **Version** | 3.0 |
| **Date** | February 19, 2026 |
| **Sprint Window** | Feb 20 – Mar 5, 2026 |
| **Author** | Matome Mboweni, CTO |
| **Status** | Approved for execution |

---

## EXECUTIVE SUMMARY

**Sprint Goal:** Implement conversion tracking (MVP-14) and system observability to quantify the value of `matter://` distribution and ensure system health for the first beta merchants.

**Strategic Rationale:**
- We need to prove engagement (views/clicks) to merchants.
- Distributed nature of "The Lens" requires centralized (or semi-centralized) event collection.
- Moving from "it works" to "it's healthy" via logging and monitoring.

**Key Decisions Made:**
1. **Lightweight Analytics:** Use a simple `POST /analytics/event` pattern to avoid heavy tracking dependencies.
2. **Aggregated Reports:** Prefer post-processed aggregations over real-time processing to minimize API latency.
3. **Internal Dashboard:** A simple JSON or minimal HTML view for system status.

**Expected Outcome:** 
- Direct visibility into product engagement (views/clicks).
- Performance baseline for API resolution in a multi-tenant environment.
- Exportable CSV/JSON reports for early merchant partners.

---

## 1. SPRINT SCOPE & PRIORITIES

### 1.1 Primary Items (Must Complete)

| ID | Item | Priority | Effort | Owner | Rationale |
|----|------|----------|--------|-------|-----------|
| **MVP-14** | Analytics Events (Views/Clicks) | P0 | 4 days | CTO | Required for merchant value proposition |
| **API-Log** | Enhanced API Observability | P1 | 3 days | CTO | Detect bottlenecks and errors early |
| **RP-01** | Basic Analytics Reporting | P1 | 2 days | CTO | Enables stakeholder feedback |

### 1.2 Secondary Items (Nice to Have)

| ID | Item | Priority | Effort | Owner | Rationale |
|----|------|----------|--------|-------|-----------|
| **UX-01** | Cache performance logs | P2 | 1 day | CTO | Optimize the MVP-13 caching layer |
| **EXT-01** | CSV Report Export | P2 | 1 day | CTO | Professionalizes the output |

---

## 2. DAILY BREAKDOWN & ALLOCATION

### Week 1: Event Infrastructure

| Day | Date | Hours | Task | Deliverable |
|-----|------|-------|------|-------------|
| **Fri** | Feb 20 | 6 | **Sprint 3 Kickoff & Design:** Finalize event schema (hash, eventType, timestamp, anonID). Design storage strategy in `shadow-index`. | Schema Doc |
| **Mon** | Feb 23 | 6 | **Extension Event Hooks:** Implement `sendEvent(type, hash)` in [packages/lens-extension/src/background.js](packages/lens-extension/src/background.js). Hook into overlay open. | Event dispatch logic |
| **Tue** | Feb 24 | 6 | **Conversion Tracking:** Hook event dispatch into "Buy Now" button clicks (content script to background message). | Click tracking active |
| **Wed** | Feb 25 | 6 | **Analytics API Endpoint:** Implement `POST /v1/analytics/event` in [packages/shadow-index/api/index.ts](packages/shadow-index/api/index.ts). Add Zod validation. | API ingestion live |
| **Thu** | Feb 26 | 6 | **Storage Persistence:** Wire ingestion to persistent storage (JSON log-append or minimal DB). Handle high-volume buffering. | Durable event logs |

### Week 2: Reporting & Observability

| Day | Date | Hours | Task | Deliverable |
|-----|------|-------|------|-------------|
| **Fri** | Feb 27 | 6 | **Aggregation Engine:** Logical layer to aggregate raw events into daily counts per product (hash). | Daily summary logic |
| **Mon** | Mar 2 | 6 | **Reporting API:** `GET /v1/analytics/report` allowing filtering by hash/date. | Report endpoint |
| **Tue** | Mar 3 | 6 | **Observability Dashboard:** Simple internal HTML view of API status, error rates, and top 10 products. | Status UI |
| **Wed** | Mar 4 | 6 | **Integration & Performance:** E2E test full cycle (View → API → Report). Optimize any slow SQL/read paths. | Verified flow |
| **Thu** | Mar 5 | 6 | **Sprint Review & v0.6.0:** Demo to CEO. Tag release. Update progress docs. | Sprint 3 Closed |

---

## 3. TECHNICAL SPECIFICATION

### 3.1 Event Schema & Storage
Detailed specification: [MVP-14-EVENT-SPEC-AND-STORAGE.md](./MVP-14-EVENT-SPEC-AND-STORAGE.md)

**Key Events:**
- **View:** `hash`, `source_url`, `timestamp`.
- **Click:** `hash`, `source_url`, `target_action` (`checkout_initiated`, etc.).

**Storage Strategy:**
- **Choice:** API Logs (JSONL / append-only).
- **Location:** `packages/shadow-index/data/events/YYYY-MM-DD.jsonl`.
- **Logic:** Fast implementation for MVP; aggregation job handles reporting.

---

## 4. DEFINITION OF DONE (D.o.D)
- [ ] Extension sends view/click events for every `matter://` interaction.
- [ ] API successfully stores events without impacting resolution latency.
- [ ] Weekly engagement report can be generated for any given hash.
- [ ] No regression on resolution tests.
- [ ] Git tag `v0.6.0` applied.


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
