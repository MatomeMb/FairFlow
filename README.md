# fairflow

> **Building the infrastructure for Object-Oriented Commerce** — where products become portable, self-sovereign digital objects that can be transacted anywhere on the internet.

---

## Vision

The internet today is architected around "Places." To purchase an item, users must navigate to a specific URL, load a heavy storefront, and operate within a walled garden. We're changing that.

**fairflow** builds a **Commerce Compiler** that transforms product data into portable, intelligent digital objects called **Universal Commerce Containers** (`.thing` files). These artifacts:

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

2. **Clone and navigate:**
   ```bash
   cd mcj
   npm install
   ```

3. **Configure Environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys (see docs/API_KEYS_GUIDE.md)
   ```

4. **Start the demo:**
   ```bash
   npm run demo
   ```

5. **Access:**
   - Landing: http://localhost:5177/
   - Developer Demo: http://localhost:5177/index.html
   - Catalog Upload: http://localhost:5177/catalog-upload.html
   - Matter Demo: http://localhost:5177/matter-demo.html
   - API Dashboard: http://localhost:3000/v1/analytics/dashboard

For detailed setup: See [SETUP.md](./SETUP.md). For API key configuration: See [docs/API_KEYS_GUIDE.md](./docs/API_KEYS_GUIDE.md).

---

## Latest Features (v0.7.0)

### Payment Processing & E-Commerce
- **Stripe Integration**: Full checkout flow with session management
- **Order Tracking**: Consumer-facing order confirmation and status tracking
- **Public Product Pages**: Shareable product detail pages via `/thing/:hash`
- **Order Management**: GET `/orders/:sessionId` endpoint for order retrieval

### Merchant Portal Enhancements  
- **Payout Routing Automation**: Automated merchant payout infrastructure (MOR)
- **State Separation**: Clean separation of merchant and consumer workflows
- **KYC Integration**: Complete merchant verification and compliance workflows
- **Analytics Dashboard**: Authenticated merchant analytics with real-time metrics

### Frontend Polish (Sprint A)
- 20+ UI/UX refinements (F-01 through F-20)
- fairflow logo and brand identity implementation
- Google OAuth visual improvements
- Responsive layout optimizations
- Address field components and form validation

---

## Current Status (As of Feb 25, 2026)

**Version:** v0.7.0 (Payment Integration & Merchant Portal Complete)  
**Last Updated:** Feb 25, 2026

### What's Complete (Sprints 1–6 + Payment Integration, deployed)

**Sprint 1 (Completed Feb 5):**
- Full MVP pipeline: compile → resolve → display (Rust compiler, matter CLI, .thing format)
- Extension (Lens v0.3.0): Matter overlay, MV3 manifest, link resolution
- API (Shadow Index v0.6.0): Batch and catalog import, R2 storage
- Demo: Catalog upload and matter-demo routes
- Git tag: v0.4.0

**Sprint 2 (Completed Feb 8, 02:43–13:13 UTC+2):**
- Extension caching (MVP-13): IndexedDB cache, overlay perf optimization  
- Cross-browser compatibility: Chrome, Edge, Brave, Firefox validated
- 88/88 tests passing, performance baseline: cache hit 16ms, miss 185ms
- Git tag: v0.5.0, v0.3.0 lens, v0.3.0 matter-core

**Sprint 3 (Completed Feb 10, 13:06–15:48 UTC+2):**
- Analytics (MVP-14): Event spec finalized, JSONL storage implemented
- Reporting engine: GET /v1/analytics/report aggregation complete
- Observability and retention policies implemented
- Git tag: v0.6.0

**Sprint 4 (Completed Feb 11, 02:37–02:39 UTC+2):**
- Production hardening: Security audit, load testing, operations manual
- Gate 4 signed off, runbook deployed
- Git tag: v0.6.0 release

**Sprint 5 (Completed Feb 11, 02:46–02:54 UTC+2):**
- Landing page: demo/landing.html (default at http://localhost:5177/)
- Store assets: Screenshots (4x 1280x800px), privacy policy deployed to Netlify
- Support workflow: [SUPPORT-WORKFLOW.md](./docs/SUPPORT-WORKFLOW.md), beta templates created
- Git tag: v0.6.1

**Sprint 6 (Completed Feb 11, 03:22–05:24 UTC+2):**
- Chrome Web Store submission: Checklist complete, submission guide deployed
- Build system fix: Test file exclusion in TypeScript production build
- Screenshots validated, privacy URL deployed, submission-ready documentation
- Git tags: v0.6.2, v0.6.3

**Weekend Sprint & Rebrand (Completed Feb 24-25):**
- **Brand Evolution:** Rebranded from ".things that Matter" to "fairflow"
- **Payment Processing:** Full Stripe integration with checkout and order confirmation
- **Merchant Portal:** State separation, payout routing automation, KYC workflows
- **Consumer Experience:** Public product pages (`/thing/:hash`), order tracking (`/orders/:sessionId`)
- **Frontend Polish:** 20+ UI/UX improvements (F-01 through F-20), logo refinement, Google OAuth styling
- **API Enhancements:** Authenticated analytics, merchant routes, public resolve endpoints
- **Infrastructure:** Runtime data file management, improved config portability

**Next steps:** Complete PR merge to main, continue merchant portal refinements, prepare for beta merchant outreach.

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
| [Scrum Master Plan for CEO](./docs/12-SCRUM-MASTER-PLAN-FOR-CEO.md) | 8-sprint roadmap and success criteria |
| [Scrum Operating Model](./docs/09-SCRUM-OPERATING-MODEL.md) | Scrum framework, ceremonies, and team structure |
| [MVP Backlog](./docs/10-MVP-BACKLOG.md) | Prioritized product backlog (P0/P1/P2) |
| [Sprint 1 Plan](./docs/11-SPRINT-1-PLAN.md) | Sprint 1 (Jan 20–Feb 5, 2026) — MVP vertical slice |
| [Sprint 2 Plan](./docs/12-SPRINT-2-PLAN.md) | Sprint 2 (Feb 6–Feb 19, 2026) — Extension caching (MVP-13), overlay polish |
| [MVP-13 Acceptance & Schema](./docs/17-MVP-13-ACCEPTANCE-AND-SCHEMA.md) | IndexedDB cache design, acceptance criteria, message protocol |
| [MVP-13 Cross-Browser](./docs/MVP-13-CROSS-BROWSER.md) | Chrome/Edge/Brave/Firefox compatibility matrix and testing checklist |
| [Friday Execution Guide](./docs/FRIDAY-EXECUTION-GUIDE.md) | Sprint flow, decision tree, baselines for Fri Feb 13 cross-browser validation |
| [Friday Sprint Analysis](./docs/FRIDAY-CROSS-BROWSER-SPRINT-ANALYSIS.md) | Risk matrix, contingencies, pre-flight checklist |
| [Sprint 2 Completion Checklist](./docs/SPRINT-2-COMPLETION-CHECKLIST.md) | AC gates, quality checkpoints, DoD, demo prep, risk mitigation |
| [Verify MVP-13 Cache](./docs/VERIFY-MVP-13-CACHE.md) | Manual verification steps: cache hit/miss, IndexedDB inspection |
| [Sprint 2 Closeout](./docs/CTO-NEXT-STEPS-SPRINT-2-CLOSEOUT.md) | Sprint 2 closeout memo |
| [MVP-14 Event Spec](./docs/MVP-14-EVENT-SPEC-AND-STORAGE.md) | Analytics event schema and JSONL storage (Sprint 3) |
| [Analytics Reporting Engine Spec](./docs/ANALYTICS-REPORTING-ENGINE-SPEC.md) | MVP-14 Phase 2: GET /v1/analytics/report aggregation engine (complete spec) |
| [Analytics Impl Brief](./docs/ANALYTICS-REPORTING-IMPL-BRIEF.md) | MVP-14 phases 1–4 execution plan with 4-phase roadmap |
| [Analytics Phase 1 Implementation](./docs/ANALYTICS-REPORTING-PHASE1-IMPL-PROMPT.md) | Ready-to-code guide: fixtures, starter template, 60+ test stubs |
| [Analytics Complete Summary](./docs/ANALYTICS-REPORTING-COMPLETE-SUMMARY.md) | Quick start (8 steps), roadmap, acceptance criteria, test data facts |
| [Analytics Phase 1 CTO Handoff](./docs/ANALYTICS-PHASE1-CTO-HANDOFF.md) | Phase 1 directive: core aggregation logic (5 days, ready-to-code) |
| [Analytics Phase 2 CTO Handoff](./docs/ANALYTICS-PHASE2-CTO-HANDOFF.md) | Phase 2 directive: HTTP API route (3–4 days, integration testing) |
| [Analytics Phase 3 CTO Handoff](./docs/ANALYTICS-PHASE3-CTO-HANDOFF.md) | Phase 3 directive: performance verification (2–3 days, load testing) |
| [Analytics Performance Baseline](./docs/ANALYTICS-PERFORMANCE-BASELINE.md) | Performance verified: 90-day < 500ms, memory < 500MB, load tests passing |
| [Analytics Production Readiness](./docs/ANALYTICS-PRODUCTION-READINESS.md) | Final sign-off checklist: phases 1–3 complete, production ready |
| [Analytics Final Release v0.6.0](./docs/ANALYTICS-FINAL-RELEASE-v0.6.0.md) | Release handoff: git workflow, tag creation, merge to main, next steps |
| [Sprint 3 Plan](./docs/13-SPRINT-3-PLAN.md) | Sprint 3 (Mar 3-16, 2026) — R2 storage, Rust compiler, matter CLI |
| [Sprint 4 Plan](./docs/14-SPRINT-4-PLAN.md) | Sprint 4 (Mar 17-30, 2026) — Batch, catalog import, catalog-upload demo |
| [Delivery Timeline](./docs/15-DELIVERY-TIMELINE.md) | 8-sprint Feb–May 2026; current status; revised milestones |
| [Weekly Work Plan](./docs/16-WEEKLY-WORK-PLAN.md) | Day-by-day work and realistic estimates (Sprints 5–8) |
| [Progress and Version](./docs/PROGRESS-AND-VERSION.md) | Code version, sprint state, next sprint (single source of truth) |
| [CEO Sync (Sprint 2)](./docs/CEO-SYNC-SPRINT-2.md) | Sprint 2 features delivered, demo flow, Sprint 3 scope |
| [API_KEYS_GUIDE](./docs/API_KEYS_GUIDE.md) | Guide for setting up API keys |

**Setup & Configuration:**
- [SETUP.md](./SETUP.md) - Detailed development environment setup
- [SETUP_COMPLETE.md](./SETUP_COMPLETE.md) - Setup completion summary and status
- [docs/RUST_WINDOWS_SETUP.md](./docs/RUST_WINDOWS_SETUP.md) - Rust installation on Windows

**Phase 0 Implementation:**
- [Phase 0 Platform Testing Guide](./docs/PHASE0_PLATFORM_TESTING.md) - Platform validation testing workflow and decision matrix
- [matter-core/PHASE0_IMPLEMENTATION.md](./packages/matter-core/PHASE0_IMPLEMENTATION.md) - Phase 0 steganography implementation details

PDF versions are available in [`docs/pdf/`](./docs/pdf/). Historical day reports: [docs/archive/](./docs/archive/README.md).

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

**Delivered (Sprints 1–6 + Payment Integration):** Compile to resolve to display pipeline; batch and catalog import; R2 storage; Rust compiler; matter CLI; extension overlay and XMP beacon; auth and rate limits; IndexedDB cache; analytics and reporting; production hardening; landing page; store assets; screenshots and privacy policy; Stripe payment processing; merchant portal with payout automation; public product pages; order tracking; authenticated analytics. 88/88 tests passing. Ready for production deployment.

---

## Team

| Role | Name | Responsibilities |
|------|------|------------------|
| **CEO** | Sobuhle Nyambali | Strategy, partnerships, fundraising |
| **CTO** | Matome Mbowene | Technical architecture, development |

---

## 8-Sprint Delivery Timeline

*Source: [Delivery Timeline](./docs/15-DELIVERY-TIMELINE.md). Day-by-day work: [Weekly Work Plan](./docs/16-WEEKLY-WORK-PLAN.md). Last updated: Feb 25, 2026.*

| Sprint | Planned Window | Actual Completion | Days | Goal | Version | Status |
|--------|--------|--------|------|------|---------|--------|
| Sprint 0 | By Jan 19, 2026 | By Jan 19, 2026 | ~5 | Setup and architecture | — | ✓ Complete |
| Sprint 1 | Jan 20–Feb 5, 2026 | Feb 5, 2026 | 17 | Full MVP: compile–resolve–display; P1; R2; Rust; batch & catalog; demo | v0.4.0 | ✓ Complete |
| Sprint 2 | Feb 6–19, 2026 | Feb 8, 2026 (13:13 UTC+2) | 3 | Extension caching (MVP-13): IndexedDB cache, overlay perf, cross-browser | v0.5.0 | ✓ Complete |
| Sprint 3 | Feb 20–Mar 5, 2026 | Feb 10, 2026 (15:48 UTC+2) | 2 | Analytics (MVP-14), observability, retention policy | v0.6.0 | ✓ Complete |
| Sprint 4 | Mar 6–19, 2026 | Feb 11, 2026 (02:39 UTC+2) | <1 | Production hardening, security, operations, scaling | v0.6.0 (release) | ✓ Complete |
| Sprint 5 | Mar 20–Apr 2, 2026 | Feb 11, 2026 (02:54 UTC+2) | <1 | Beta launch prep: landing, store assets, support, demo polish | v0.6.1 | ✓ Complete |
| Sprint 6 | Apr 3–16, 2026 | Feb 11, 2026 (05:24 UTC+2) | ~2 | Extension 1.0 release readiness, Chrome Web Store submission | v0.6.3 | ✓ Complete |
| **Weekend Sprint** | **Feb 24-25, 2026** | **Feb 25, 2026** | **2** | **Payment integration, merchant portal, rebrand to fairflow** | **v0.7.0** | **✓ Complete** |
| Sprint 7 | Apr 17–30, 2026 | In Progress | ~14 est | Beta program execution, merchant onboarding, feedback loop | v1.0 (candidate) | ⚡ In Progress |
| Sprint 8 | May 1–14, 2026 | Planned | ~14 est | Public launch prep, final validation | v1.0 (release) | ○ Planned |

**Current status (Feb 25, 2026):** Sprints 1–6 complete (v0.6.3 deployed). Weekend sprint complete (v0.7.0) with Stripe payment integration, merchant portal with payout automation, and rebrand to fairflow. PR to main in progress. Sprint 7 (beta merchant outreach) in progress. Single source of truth: [Progress and Version](./docs/PROGRESS-AND-VERSION.md).

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

See [Phase 0 Platform Testing Guide](./docs/PHASE0_PLATFORM_TESTING.md) for the full workflow.

---

## Contact

- **Company**: fairflow
- **Website**: [fairflow.co](https://fairflow.co) *(coming soon)*
- **Repository**: [GitHub](https://github.com/MatomeMb/.Things-That-Matter)

---

*"Make commerce portable, viral, and universally accessible — for humans today, AI agents tomorrow, and a decentralized economy in the future."*
