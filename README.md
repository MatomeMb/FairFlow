# .things that Matter

> **Building the infrastructure for Object-Oriented Commerce** — where products become portable, self-sovereign digital objects that can be transacted anywhere on the internet.

---

## Vision

The internet today is architected around "Places." To purchase an item, users must navigate to a specific URL, load a heavy storefront, and operate within a walled garden. We're changing that.

**.things that Matter** builds a **Commerce Compiler** that transforms product data into portable, intelligent digital objects called **Universal Commerce Containers** (`.thing` files). These artifacts:

- Carry their own identity, price, semantic meaning, and checkout logic
- Are visually shareable for humans (embedded in images)
- Are computationally efficient for AI agents (binary format)
- Travel freely across the web without platform dependency

---

## The Distribution Trinity

Every product processed by our compiler exists simultaneously as:

| Vector | Format | Use Case |
|--------|--------|----------|
| **Matter Photo** | Polyglot image with embedded commerce data | Social media, messaging |
| **Matter URI** | `matter://` protocol link | Text-based environments |
| **.thing File** | Raw binary container | Direct transfer, AI agents |

---

## Quick Start

### Development Setup

1. **Install Prerequisites:**
   - [Rust](https://rustup.rs/) (1.70+)
   - [Node.js](https://nodejs.org/) (18+)
   - [Git](https://git-scm.com/)

2. **Verify Setup:**
   ```bash
   # Windows
   .\scripts\setup-check.ps1
   
   # Linux/Mac
   bash scripts/setup-check.sh
   ```

3. **Configure Environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. **Install Dependencies:**
   ```bash
   cd packages/shadow-index
   pnpm install  # or npm install
   ```

5. **Read the Setup Guide:**
   See [SETUP.md](./SETUP.md) for detailed instructions.

6. **Configure API Keys:**
   See [docs/API_KEYS_GUIDE.md](./docs/API_KEYS_GUIDE.md) for step-by-step API keys setup.

**Quick Setup Verification:**
```bash
# Windows
.\scripts\test-setup.ps1

# Test all API keys are configured
```

---

## Current Sprint (Sprint 2: Feb 6–19, 2026)

**Goal:** MVP-13 Extension Caching — IndexedDB cache, overlay performance, cross-browser validation  
**Capacity:** 10 working days × 5 hours = 50 hours  
**Target Version:** lens-extension v0.3.0

### Daily Breakdown (5-Hour Work Days)

**Week 1: Planning & Implementation (Feb 6–12)** — Complete

| Day | Date | Focus | Subtasks (5h each) | Status |
|-----|------|-------|-------------------|--------|
| Fri | Feb 6 | Planning + Schema | Sprint kickoff (1h) → Criteria review (1.5h) → Schema finalization (1.5h) → Test structure (1h) | Complete |
| Mon | Feb 9 | AC1 & AC2 Tests | Framework setup (0.5h) → Cache-on-read tests (1.5h) → Cache-on-success tests (1.5h) → Review (1h) | Complete |
| Tue | Feb 10 | AC3, AC4 & Messages | Error isolation tests (1.5h) → TTL tests (1.5h) → Message protocol (1h) → Run suite (1h) | Complete |
| Wed | Feb 11 | Cache Impl | `cacheGet()` (1h) → `cacheSet()` (1h) → Message handler (1h) → Error handling (1h) → Manual test (1h) | Complete |
| Thu | Feb 12 | Content Script & Polish | Integrate `resolveHash()` (1h) → Overlay optimization (1h) → E2E validation (1.5h) → Verify IndexedDB (1h) | Complete |

**Week 2: Cross-Browser, Polish, Release (Feb 13–19)**

| Day | Date | Focus | Subtasks (5h each) | Status |
|-----|------|-------|-------------------|--------|
| Fri | Feb 13 | Cross-Browser Test | Chrome/Edge/Brave/Firefox validation (7h sprint) | Pending |
| Mon | Feb 16 | Tests & Documentation | Finalize tests (1h) → Integration test (1h) → README update (1h) → Verify docs (1h) → Progress update (1h) | Pending |
| Tue | Feb 17 | Performance Validation | Profile render (1h) → Lazy-load verify (1h) → Baseline measurements (1h) → Document (1h) → 3G throttle test (1h) | Pending |
| Wed | Feb 18 | Bug Fixes & Polish | Regression test (1.5h) → Fix bugs (1.5h) → Code review (1h) → Console validation (1h) | Pending |
| Thu | Feb 19 | Sprint Review & Release | Demo prep (1h) → Demo/recording (1h) → Git tag v0.3.0 (1h) → Update progress (1h) → Retrospective (1h) | Pending |

### Key Deliverables

- **Feb 6:** Sprint plan + IndexedDB schema finalized
- **Feb 9:** AC1 + AC2 tests passing (cache-on-read, cache-on-success)
- **Feb 10:** AC3 + AC4 tests passing (no cache on error, TTL enforcement)
- **Feb 11:** Cache functions in background.js (`cacheGet`, `cacheSet`)
- **Feb 12:** Content script integration + overlay optimization + E2E manual test
- **Feb 13:** Chrome, Edge, Brave, Firefox cross-browser validation (7h sprint)
- **Feb 16:** Test suite finalized + docs updated
- **Feb 17:** Performance baselines (cache hit <20ms, overlay render <50ms)
- **Feb 18:** All bugs fixed + regression test passing
- **Feb 19:** v0.3.0 tagged + demo delivered to CEO

**Detailed daily breakdown:** [docs/16-WEEKLY-WORK-PLAN.md](./docs/16-WEEKLY-WORK-PLAN.md)

---

## Documentation

**Master document (investor-grade):** [THINGS-THAT-MATTER-TECHNICAL-DOCUMENTATION](./THINGS-THAT-MATTER-TECHNICAL-DOCUMENTATION.md) — architecture, roadmap, use cases, financials. PDF: `THINGS-THAT-MATTER-TECHNICAL-DOCUMENTATION.pdf`

**Current status:** [Progress and Version](./docs/PROGRESS-AND-VERSION.md) | [Delivery Timeline](./docs/15-DELIVERY-TIMELINE.md) | [Weekly Work Plan](./docs/16-WEEKLY-WORK-PLAN.md)

| Document | Description |
|----------|-------------|
| [Document Index](./docs/00-DOCUMENT-INDEX.md) | Overview of all project documents |
| [01 Project Charter](./docs/01-PROJECT-CHARTER.md) | Vision, objectives, governance |
| [02 Technical Architecture](./docs/02-TECHNICAL-ARCHITECTURE.md) | System design, components |
| [03 Product Requirements](./docs/03-PRODUCT-REQUIREMENTS-DOCUMENT.md) | Features, user stories |
| [04 Development Roadmap](./docs/04-DEVELOPMENT-ROADMAP.md) | Sprint breakdown, milestones |
| [05 Risk Assessment](./docs/05-RISK-ASSESSMENT.md) | Risk register, mitigation |
| [06 Budget](./docs/06-BUDGET-FINANCIAL-PROJECTIONS.md) | Financial planning |
| [CTO Execution Guide](./docs/CTO-EXECUTION-GUIDE.md) | Step-by-step execution guide |
| [API Keys Guide](./docs/API_KEYS_GUIDE.md) | API keys setup |

**Setup:** [SETUP.md](./SETUP.md) | [Rust Windows Setup](./docs/RUST_WINDOWS_SETUP.md)

---

## Technical Stack

| Component | Technology |
|-----------|------------|
| Commerce Compiler | Rust (MVP) |
| Binary Format | FlatBuffers |
| Semantic Vectors | CLIP (ViT-B/32) |
| Cryptographic Signing | Ed25519 |
| Compression | Zstandard (Zstd) |
| API | Node.js / Vercel Edge |
| Database | PostgreSQL (Supabase) |
| Storage | Cloudflare R2 |
| Browser Extension | Vanilla JS, IndexedDB, MV3 |

---

## Strategic Phases

```
PHASE 1: VIRAL COMMERCE (2026)
├── .thing file format
├── Steganographic images
├── Browser extension (Lens)
└── MOAT: Accessibility

PHASE 2: AGENTIC COMMERCE (2027)
├── Zero-copy binary parsing
├── Agent SDK & APIs
├── Token-efficient transactions
└── MOAT: Energy Efficiency

PHASE 3: DECENTRALIZED COMMERCE (2028+)
├── Blockchain-based registry
├── Smart contract checkout
├── Open protocol
└── MOAT: Decentralization
```

---

## Key Metrics & Success Criteria

**Delivered (Sprint 1):** Compile to resolve to display pipeline; batch and catalog import; R2 storage; Rust compiler; matter CLI; extension overlay and XMP beacon; auth and rate limits. MVP-13 IndexedDB cache integrated (Sprint 2, Week 1). See [Progress and Version](./docs/PROGRESS-AND-VERSION.md) and [Delivery Timeline](./docs/15-DELIVERY-TIMELINE.md) for actuals and acceptance criteria.

**In progress (Sprint 2):** Cross-browser validation, performance profiling, lens-extension v0.3.0 release (Feb 19 target).

**Planned (Sprints 3–8):** Analytics (MVP-14), beta readiness, beta launch prep. Full metrics and revised milestones: [Delivery Timeline](./docs/15-DELIVERY-TIMELINE.md), [Weekly Work Plan](./docs/16-WEEKLY-WORK-PLAN.md).

---

## Team

| Role | Name | Responsibilities |
|------|------|------------------|
| **CEO** | Sobuhle Nyambali | Strategy, partnerships, fundraising |
| **CTO** | Matome Mbowene | Technical architecture, development |

---

## 8-Sprint Delivery Timeline

*Source: [Delivery Timeline](./docs/15-DELIVERY-TIMELINE.md). Day-by-day work: [Weekly Work Plan](./docs/16-WEEKLY-WORK-PLAN.md). Last updated: Feb 8, 2026.*

| Sprint | Period | Goal | Version | Status |
|--------|--------|------|---------|--------|
| Sprint 0 | By Jan 19, 2026 | Setup and architecture | — | Complete |
| Sprint 1 | Jan 20–Feb 5, 2026 | Full MVP: compile–resolve–display; P1; R2; Rust; batch & catalog; demo | v0.4.0 | Complete |
| Sprint 2 | Feb 6–19, 2026 | Extension caching (MVP-13): IndexedDB cache, overlay perf, cross-browser | v0.3.0 (lens) | In Progress |
| Sprint 3 | Feb 20–Mar 5, 2026 | Analytics (MVP-14), observability | — | Planned |
| Sprint 4 | Mar 6–19, 2026 | Beta readiness (onboarding, support, stability) | — | Planned |
| Sprint 5 | Mar 20–Apr 2, 2026 | Beta launch prep (store assets, landing, first merchants) | — | Planned |
| Sprint 6 | Apr 3–16, 2026 | Extension 1.0 / merchant tooling | — | Planned |
| Sprint 7 | Apr 17–30, 2026 | Beta program | — | Planned |
| Sprint 8 | May 1–14, 2026 | Public launch prep | — | Planned |

**Current status:** Sprint 1 complete (v0.4.0). Sprint 2 in progress: MVP-13 cache integrated; 45/45 tests passing; Friday Feb 13 cross-browser sprint next. Single source of truth: [Progress and Version](./docs/PROGRESS-AND-VERSION.md).

---

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## Helper Scripts

| Script | Purpose |
|--------|---------|
| `scripts/setup-check.ps1` | Verify development environment setup |
| `scripts/test-setup.ps1` | Test API keys configuration |
| `scripts/setup-api-keys.ps1` | Interactive API keys setup helper |
| `scripts/generate-ed25519-keys.py` | Generate Ed25519 cryptographic keys |
| `scripts/create-test-data.ps1` | Create test data for platform validation |

---

## Testing Tools

Phase 0 includes testing binaries for steganography validation:

### Steganography Testing (`steg-test`)
Test individual steganography operations:
```bash
cd packages/matter-core
cargo run --bin steg-test -- inject-xmp image.jpg "hash123" '{"title":"Product","price":2999}' output.jpg
cargo run --bin steg-test -- extract-xmp polyglot.jpg
cargo run --bin steg-test -- full-embed image.jpg thing.bin "hash123" '{"title":"Product","price":2999}' output.jpg
```

### Platform Validation Testing (`platform-test`)
Test steganography survival across platforms:
```bash
cd packages/matter-core
cargo run --bin platform-test -- create-test-images test.jpg thing.bin test_output/
cargo run --bin platform-test -- test-extraction downloaded_image.jpg
cargo run --bin platform-test -- generate-report results.json
```

See [Manual E2E Smoke](./docs/MANUAL-E2E-SMOKE.md) for testing workflows.

---

## Contact

- **Company**: .things that Matter
- **Website**: [thingsthatmatter.com](https://thingsthatmatter.com) *(coming soon)*
- **Repository**: [GitHub](https://github.com/MatomeMb/.Things-That-Matter)

---

*"Make commerce portable, viral, and universally accessible — for humans today, AI agents tomorrow, and a decentralized economy in the future."*
