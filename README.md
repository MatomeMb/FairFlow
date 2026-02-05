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
| [Sprint 1 Plan](./docs/11-SPRINT-1-PLAN.md) | Sprint 1 (Feb 3–16, 2026) — MVP vertical slice |
| [Sprint 2 Plan](./docs/12-SPRINT-2-PLAN.md) | Sprint 2 (Feb 17–Mar 2, 2026) — P1 scope |
| [Sprint 2 Closeout](./docs/CTO-NEXT-STEPS-SPRINT-2-CLOSEOUT.md) | Sprint 2 closeout memo |
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

PDF versions are available in the [`docs/pdf/`](./docs/pdf/) folder.

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

**Delivered (Sprints 1–4):** Compile → resolve → display pipeline; batch and catalog import; R2 storage; Rust compiler; matter CLI; extension overlay and XMP beacon; auth and rate limits. See [Progress and Version](./docs/PROGRESS-AND-VERSION.md) and [Delivery Timeline](./docs/15-DELIVERY-TIMELINE.md) for actuals and acceptance criteria.

**Planned (Sprints 5–8, Feb–May 2026):** Extension caching (MVP-13), analytics (MVP-14), beta readiness, beta launch prep. Full metrics, day-by-day plan, and revised milestones: [Delivery Timeline](./docs/15-DELIVERY-TIMELINE.md), [Weekly Work Plan](./docs/16-WEEKLY-WORK-PLAN.md).

---

## Team

| Role | Name | Responsibilities |
|------|------|------------------|
| **CEO** | Sobuhle Nyambali | Strategy, partnerships, fundraising |
| **CTO** | Matome Mboweni | Technical architecture, development |

---

## 8-Sprint Delivery Timeline (Revised Plan — Feb–May 2026)

*Source: [Delivery Timeline](./docs/15-DELIVERY-TIMELINE.md). Day-by-day work: [Weekly Work Plan](./docs/16-WEEKLY-WORK-PLAN.md).*

| Sprint | Period | Goal | Version | Status |
|--------|--------|------|---------|--------|
| Sprint 0 | Jan–Feb 2, 2026 | Setup and architecture | — | Complete |
| Sprint 1 | Feb 3–16, 2026 | MVP vertical slice: compile–resolve–display | v0.1.0 | Complete |
| Sprint 2 | Feb 17–Mar 2, 2026 | P1: XMP beacon, auth, rate limit, error shape | v0.2.0 | Complete |
| Sprint 3 | Mar 3–16, 2026 | R2 storage, Rust compiler, matter CLI | v0.3.0 | Complete |
| Sprint 4 | Mar 17–30, 2026 | Batch (MVP-11), catalog import (MVP-12), catalog-upload demo | v0.4.0 | Complete |
| Sprint 5 | Mar 31–Apr 13, 2026 | Extension caching (MVP-13), overlay polish | v0.5.0 | Planned |
| Sprint 6 | Apr 14–27, 2026 | Analytics (MVP-14), observability | — | Planned |
| Sprint 7 | Apr 28–May 11, 2026 | Beta readiness (onboarding, support, stability) | — | Planned |
| Sprint 8 | May 12–25, 2026 | Beta launch prep (store assets, landing, first merchants) | — | Planned |

**Current status:** Sprints 1–4 complete; **v0.4.0** released (shadow-index batch/catalog, lens-extension v0.2.0, matter-core v0.3.0). Next: Sprint 5 (MVP-13 IndexedDB caching). Single source of truth: [Progress and Version](./docs/PROGRESS-AND-VERSION.md).

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

See [Phase 0 Platform Testing Guide](./docs/PHASE0_PLATFORM_TESTING.md) for complete testing workflow.

## Contact

- **Company**: .things that Matter
- **Website**: [thingsthatmatter.com](https://thingsthatmatter.com) *(coming soon)*
- **Repository**: [GitHub](https://github.com/MatomeMb/.Things-That-Matter)

---

*"Make commerce portable, viral, and universally accessible — for humans today, AI agents tomorrow, and a decentralized economy in the future."*
