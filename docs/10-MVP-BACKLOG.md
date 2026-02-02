# .things that Matter
## MVP Backlog (Scrum)

---

| **Document Information** | |
|--------------------------|---|
| **Company Name** | .things that Matter |
| **Document Type** | MVP Backlog |
| **Version** | 1.0 |
| **Date** | February 1, 2026 |
| **Author** | Matome Mboweni, CTO |

---

## 1. MVP Definition (v0)

**Goal:** Deliver a minimal, end-to-end demo where a product can be compiled into a `.thing`, resolved via API, and displayed from a `matter://` link.

**MVP Acceptance Criteria:**
- A single product JSON compiles to a `.thing`
- A `matter://` URI is generated and can be resolved
- Shadow Index API returns a gist for the hash
- A minimal UI (extension or simple viewer) displays the product
- Tests pass for the MVP path

**Out of Scope for MVP v0:**
- Full steganography pipeline in production
- Batch compilation
- Merchant dashboard
- Advanced analytics

---

## 2. Product Backlog (Prioritized)

### P0 (Must Have for MVP)

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| MVP-01 | Compile single product JSON to `.thing` | CLI or API produces valid `.thing` file |
| MVP-02 | Generate `matter://` URI from hash | URI matches the compiled artifact |
| MVP-03 | Store artifacts in R2 | `.thing` and image stored and retrievable |
| MVP-04 | Resolve hash via Shadow Index | API returns gist + artifact URLs |
| MVP-05 | Minimal UI renders product from `matter://` | UI shows title, price, image |
| MVP-06 | MVP path tests | Tests cover compile → resolve → display |

### P1 (Next Sprint Candidates)

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| MVP-07 | XMP beacon detection (basic) | Detects beacon in images for MVP |
| MVP-08 | Platform test harness results logging | Results recorded in JSON |
| MVP-09 | Basic auth and rate limits | API keys enforced |
| MVP-10 | Error handling polish | Meaningful errors for MVP flows |

### P2 (Post-MVP)

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| MVP-11 | Batch compilation | 100+ products processed |
| MVP-12 | Merchant catalog import | CSV/JSON ingestion |
| MVP-13 | Extension caching | IndexedDB cache works |
| MVP-14 | Analytics events | Track views and clicks |

---

## 3. Evaluation Tasks (Always On)

- Platform testing for steganography survival (Phase 0)
- MVP usability feedback from CEO
- Cost/performance tracking for CLIP and storage

---

## 4. Backlog Maintenance

- Review and reprioritize each sprint planning
- Split or re-scope any story > 2 days
- Keep acceptance criteria crisp and testable
