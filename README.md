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
   npm install
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

## Current Sprint (Sprint 3: Feb 20 – Mar 5, 2026)

**Goal:** MVP-14 Analytics & Observability — view/click event tracking, API ingestion, merchant reporting, internal observability dashboard  
**Target:** Tag v0.6.0

**Phases:** Infrastructure (sendEvent, overlay hooks, POST /v1/analytics/event) — **Done Feb 21** | Reporting (GET /v1/analytics/report) | Observability (HTML dashboard, E2E) | Release

**Sprint 2 complete (Feb 19, 2026):** MVP-13 IndexedDB cache, cross-browser validation (Chrome, Edge, Brave, Firefox); performance instrumentation; lens v0.3.0, tag v0.5.0. [Demo script](./docs/SPRINT-2-DEMO-SCRIPT.md) | [Retrospective](./docs/SPRINT-2-RETROSPECTIVE-FEB-19.md)

**Full spec:** [13-SPRINT-3-PLAN.md](./docs/13-SPRINT-3-PLAN.md) | **Implementation:** [FEBRUARY-21-ANALYSIS.md](./docs/FEBRUARY-21-ANALYSIS.md)

---

## Documentation

All project documentation is in the `docs/` folder. **Current plan and status:** [Progress and Version](./docs/PROGRESS-AND-VERSION.md) (single source of truth), [Delivery Timeline](./docs/15-DELIVERY-TIMELINE.md) (revised 8-sprint schedule), [Weekly Work Plan](./docs/16-WEEKLY-WORK-PLAN.md) (day-by-day estimates).

| Document | Description |
|----------|-------------|
| [00-DOCUMENT-INDEX](./docs/00-DOCUMENT-INDEX.md) | Overview of all project documents |
| [01-PROJECT-CHARTER](./docs/01-PROJECT-CHARTER.md) | Vision, objectives, scope, and governance |
| [02-TECHNICAL-ARCHITECTURE](./docs/02-TECHNICAL-ARCHITECTURE.md) | System design and component architecture |
| [03-PRODUCT-REQUIREMENTS](./docs/03-PRODUCT-REQUIREMENTS-DOCUMENT.md) | Functional and non-functional requirements |
| [04-DEVELOPMENT-ROADMAP](./docs/04-DEVELOPMENT-ROADMAP.md) | Sprint breakdown and milestones |
| [05-RISK-ASSESSMENT](./docs/05-RISK-ASSESSMENT.md) | Risk analysis and mitigation strategies |
| [06-BUDGET-PROJECTIONS](./docs/06-BUDGET-FINANCIAL-PROJECTIONS.md) | Financial planning and cost breakdown |
| [07-SYSTEM-DIAGRAMS](./docs/07-SYSTEM-DIAGRAMS.md) | UML diagrams and system analysis |
| [08-CTO-NEXT-STEPS](./docs/08-CTO-NEXT-STEPS.md) | CTO action plan and immediate priorities |
| [CTO Execution Guide](./docs/CTO-EXECUTION-GUIDE.md) | Step-by-step execution guide |
| [Scrum Operating Model](./docs/09-SCRUM-OPERATING-MODEL.md) | Scrum framework, ceremonies, and team structure |
| [MVP Backlog](./docs/10-MVP-BACKLOG.md) | Prioritized product backlog (P0/P1/P2) |
| [Sprint 1 Plan](./docs/11-SPRINT-1-PLAN.md) | Sprint 1 (Jan 20–Feb 5, 2026) — MVP vertical slice |
| [Sprint 2 Plan](./docs/12-SPRINT-2-PLAN.md) | Sprint 2 (Feb 6–19, 2026) — Extension caching (MVP-13), overlay polish |
| [Sprint 2 Demo Script](./docs/SPRINT-2-DEMO-SCRIPT.md) | Reproducible demo flow for Sprint Review |
| [Sprint 2 Retrospective](./docs/SPRINT-2-RETROSPECTIVE-FEB-19.md) | Sprint 2 closeout, lessons learned, action items |
| [Sprint 3 Plan](./docs/13-SPRINT-3-PLAN.md) | Sprint 3 (Feb 20–Mar 5, 2026) — Analytics & observability (MVP-14); event schema, API ingestion, report endpoint, dashboard |
| [MVP-14 Event Spec & Storage](./docs/MVP-14-EVENT-SPEC-AND-STORAGE.md) | Event schema (view/click), storage decision (JSONL), validation |
| [February 21 Analysis](./docs/FEBRUARY-21-ANALYSIS.md) | MVP-14 pipeline architecture, implementation summary |
| [Analytics Reporting Engine](./docs/ANALYTICS-REPORTING-ENGINE-README.md) | Entry point — spec, impl brief, performance, readiness |
| [Analytics Reporting Engine Spec](./docs/ANALYTICS-REPORTING-ENGINE-SPEC.md) | GET /v1/analytics/report spec, aggregation |
| [Analytics Reporting Impl Brief](./docs/ANALYTICS-REPORTING-IMPL-BRIEF.md) | 4-phase execution plan, task checklists |
| [Analytics Performance Baseline](./docs/ANALYTICS-PERFORMANCE-BASELINE.md) | Measured times; targets < 500ms |
| [Analytics Production Readiness](./docs/ANALYTICS-PRODUCTION-READINESS.md) | Final checklist, sign-off |
| [Deployment](./docs/DEPLOYMENT.md) | Staging and production deployment procedures |
| [Staging Deployment Notes v0.6.0](./docs/STAGING-DEPLOYMENT-NOTES.md) | v0.6.0-specific verification |
| [Phase 4 Optimization Plan](./docs/PHASE-4-OPTIMIZATION-PLAN.md) | Internal dashboard, retention, monitoring |
| [What's Next](./WHATS-NEXT-POST-REFACTORING.md) | Post-refactoring action plan |
| [v0.6.0 Release Ready](./V0.6.0-RELEASE-READY.md) | Pre-release checklist, git commands |
| [Sprint 4 Plan](./docs/14-SPRINT-4-PLAN.md) | Sprint 4 (Mar 6–19, 2026) — Beta readiness |
| [MVP-13 Acceptance & Schema](./docs/17-MVP-13-ACCEPTANCE-AND-SCHEMA.md) | IndexedDB cache design, acceptance criteria |
| [MVP-13 Cross-Browser](./docs/MVP-13-CROSS-BROWSER.md) | Chrome/Edge/Brave/Firefox compatibility |
| [Delivery Timeline](./docs/15-DELIVERY-TIMELINE.md) | 8-sprint Feb–May 2026; current status; revised milestones |
| [Weekly Work Plan](./docs/16-WEEKLY-WORK-PLAN.md) | Day-by-day work and realistic estimates |
| [Progress and Version](./docs/PROGRESS-AND-VERSION.md) | Code version, sprint state, next sprint (single source of truth) |
| [API_KEYS_GUIDE](./docs/API_KEYS_GUIDE.md) | Guide for setting up API keys |

**Setup & Configuration:**
- [SETUP.md](./SETUP.md) - Detailed development environment setup
- [docs/RUST_WINDOWS_SETUP.md](./docs/RUST_WINDOWS_SETUP.md) - Rust installation on Windows

PDF versions are available in the [`docs/pdf/`](./docs/pdf/) folder (if generated).

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
| Browser Extension | Vanilla JS + WASM |

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

**Delivered (Sprints 1–2, partial Sprint 3):** Compile → resolve → display pipeline; batch and catalog import; R2 storage; Rust compiler; matter CLI; extension overlay and XMP beacon; auth and rate limits; **MVP-13 IndexedDB cache**; cross-browser validation (Chrome, Edge, Brave, Firefox); performance instrumentation; **MVP-14 event ingestion** (view/click events, POST /v1/analytics/event, JSONL storage). See [Progress and Version](./docs/PROGRESS-AND-VERSION.md) and [FEBRUARY-21-ANALYSIS.md](./docs/FEBRUARY-21-ANALYSIS.md).

**Planned (Sprint 3–8, Feb–May 2026):** MVP-14 reporting (GET /v1/analytics/report), status dashboard; beta readiness; beta launch prep. Full metrics, day-by-day plan: [13-SPRINT-3-PLAN.md](./docs/13-SPRINT-3-PLAN.md), [Weekly Work Plan](./docs/16-WEEKLY-WORK-PLAN.md).

---

## Team

| Role | Name | Responsibilities |
|------|------|------------------|
| **CEO** | Sobuhle Nyambali | Strategy, partnerships, fundraising |
| **CTO** | Matome Mboweni | Technical architecture, development |

---

## Timeline (4-Week Rolling View)

*Source: [Delivery Timeline](./docs/15-DELIVERY-TIMELINE.md). Day-by-day work: [Weekly Work Plan](./docs/16-WEEKLY-WORK-PLAN.md).*

### Previous 2 Weeks (Feb 6–19, 2026) — Completed

| Task | Status |
|------|--------|
| MVP-13 IndexedDB cache integrated | Done |
| Cross-browser validation (Chrome, Edge, Brave, Firefox) | Done |
| Performance instrumentation ([Lens Perf] logs, lazy-load) | Done |
| SHA-256 validation, controlled error overlay | Done |
| Regression test pass, console hygiene | Done |
| Sprint 2 demo script and retrospective | Done |
| v0.5.0 tagged (lens v0.3.0, shadow-index v0.5.0) | Done |

### Now (Feb 20 – Mar 5, 2026)

Sprint 3 in progress. Tag v0.5.0 on main. Single source of truth: [Progress and Version](./docs/PROGRESS-AND-VERSION.md).

### Next 2 Weeks (Feb 20 – Mar 5, 2026) — Sprint 3

| Phase | Tasks | Status |
|-------|-------|--------|
| **Infrastructure** | sendEvent, view/click hooks, POST /v1/analytics/event, JSONL storage | Done (Feb 21) |
| **Reporting** | Aggregation engine; GET /v1/analytics/report (from, to, groupBy) | Planned |
| **Observability** | Internal HTML status dashboard; API request logging; E2E: View to DB to Report | Planned |
| **Release** | Sprint review; demo conversion tracking; tag v0.6.0 | Planned |

---

### Full 8-Sprint Overview

| Sprint | Period | Goal | Version |
|--------|--------|------|---------|
| Sprint 0 | By Jan 19, 2026 | Setup and architecture | — |
| Sprint 1 | Jan 20–Feb 5, 2026 | Full MVP: compile–resolve–display; P1; R2; Rust; batch & catalog; demo | v0.4.0 |
| Sprint 2 | Feb 6–19, 2026 | Extension caching (MVP-13): IndexedDB cache, overlay perf, cross-browser | v0.5.0 |
| Sprint 3 | Feb 20–Mar 5, 2026 | Analytics (MVP-14), observability | v0.6.0 |
| Sprint 4 | Mar 6–19, 2026 | Beta readiness | — |
| Sprint 5 | Mar 20–Apr 2, 2026 | Beta launch prep | — |
| Sprint 6 | Apr 3–16, 2026 | Extension 1.0 / merchant tooling | — |
| Sprint 7 | Apr 17–30, 2026 | Beta program | — |
| Sprint 8 | May 1–14, 2026 | Public launch prep | — |

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
| `scripts/demo-server.mjs` | Start demo server for matter-demo and catalog-upload (default port 5177) |

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

See [Manual E2E Smoke](./docs/MANUAL-E2E-SMOKE.md) for end-to-end testing workflow.

## Contact

- **Company**: .things that Matter
- **Website**: [thingsthatmatter.com](https://thingsthatmatter.com) *(coming soon)*
- **Repository**: [GitHub](https://github.com/MatomeMb/.Things-That-Matter)

---

*"Make commerce portable, viral, and universally accessible — for humans today, AI agents tomorrow, and a decentralized economy in the future."*
