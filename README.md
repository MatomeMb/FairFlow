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

All project documentation is organized in the `docs/` folder.

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
| [**CTO Execution Guide**](./docs/CTO-EXECUTION-GUIDE.md) | **Comprehensive step-by-step professional execution guide** |
| [**Scrum Master Plan for CEO**](./docs/12-SCRUM-MASTER-PLAN-FOR-CEO.md) | **Complete 8-sprint roadmap, execution framework, and success criteria** |
| [Scrum Operating Model](./docs/09-SCRUM-OPERATING-MODEL.md) | Scrum framework, ceremonies, and team structure |
| [MVP Backlog](./docs/10-MVP-BACKLOG.md) | Prioritized product backlog (P0/P1/P2) |
| [Sprint 1 Plan](./docs/11-SPRINT-1-PLAN.md) | Sprint 1 plan (Feb 3-16, 2026) — **Complete, v0.1.0** |
| [**Sprint 2 Plan**](./docs/12-SPRINT-2-PLAN.md) | **Sprint 2 P1 scope (Feb 17 – Mar 2, 2026) — Complete, v0.2.0** |
| [**Sprint 2 Closeout**](./docs/CTO-NEXT-STEPS-SPRINT-2-CLOSEOUT.md) | **Sprint 2 closeout memo: test commands, E2E sign-off, CEO sync points** |
| [**Sprint 3 Plan**](./docs/13-SPRINT-3-PLAN.md) | **Sprint 3 (Feb 17 – Mar 2, 2026) — Complete, v0.3.0 (R2, Rust compiler, matter CLI)** |
| [**CEO Sync (Sprint 2)**](./docs/CEO-SYNC-SPRINT-2.md) | **One-pager: Sprint 2 features delivered, demo flow, Sprint 3 scope** |
| [API_KEYS_GUIDE](./docs/API_KEYS_GUIDE.md) | Complete guide for setting up API keys |

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

**Sprint 1 (MVP v0):**
| Metric | Target |
|--------|--------|
| Compile → Resolve → Display pipeline | Fully functional end-to-end |
| E2E test coverage | 100% of MVP path |
| Demo readiness | Zero workarounds |

**Sprint 4 (MVP v2 Complete):**
| Metric | Target |
|--------|--------|
| .thing files batch compilation | 100+ per request |
| Compile latency | <500ms average |
| Steganography detection (XMP) | ≥90% accuracy |

**Sprint 6 (Beta Launch):**
| Metric | Target |
|--------|--------|
| Merchants onboarded | 5-10 |
| Products in beta | 100+ |
| Steganography survival rate | ≥95% across platforms |
| API uptime | 99.5% |

**Sprint 8 (Production):**
| Metric | Target |
|--------|--------|
| API uptime | 99.9% |
| Compile latency (p99) | <500ms |
| Support quality | <2 tickets/day |
| Merchants live | 10+ production partners |

---

## Team

| Role | Name | Responsibilities |
|------|------|------------------|
| **CEO** | Sobuhle Nyambali | Strategy, partnerships, fundraising |
| **CTO** | Matome Mboweni | Technical architecture, development |

---

## 8-Sprint Delivery Timeline (Feb - May 2026)

| Sprint | Period | Goal | Version | Status |
|--------|--------|------|---------|--------|
| **Sprint 0** | Jan-Feb 2, 2026 | Setup & Architecture | — | ✅ Complete |
| **Sprint 1** | Feb 3-16, 2026 | MVP v0: Compile-Resolve-Display | **v0.1.0** | ✅ **Complete** |
| **Sprint 2** | Feb 17-Mar 2, 2026 | MVP v0.1: XMP + Auth + Logging | **v0.2.0** | ✅ **Complete** |
| **Sprint 3** | Mar 3-16, 2026 | MVP v1: Batch & Catalog | v0.3.0 | ⏳ Planning |
| **Sprint 4** | Mar 17-30, 2026 | MVP v2: Dashboard & Analytics | v0.4.0 | ⏳ Planned |
| **Sprint 5** | Mar 31-Apr 13, 2026 | Performance & Beta Prep | v0.5.0 | ⏳ Planned |
| **Sprint 6** | Apr 14-27, 2026 | Beta Launch & Merchant Onboarding | v1.0.0-beta | ⏳ Planned |
| **Sprint 7** | Apr 28-May 11, 2026 | Beta Fixes & Hardening | v1.0.0-rc | ⏳ Planned |
| **Sprint 8** | May 12-25, 2026 | Production Launch | v1.0.0 | ⏳ Planned |

**Current Status:**

✅ **Sprint 3 Complete** — R2 storage, Rust compiler, and matter CLI shipped.
- **v0.1.0 (Sprint 1):** Core vertical slice (compile → resolve → display)
- **v0.2.0 (Sprint 2):** XMP beacon detection, platform-test JSON logging, auth/rate limits, error handling
- **v0.3.0 (Sprint 3):** R2 storage (MVP-03), Rust Compiler::compile(), matter CLI (`matter compile <file.json>`)

**Features Delivered (Sprint 2):**
- XMP beacon extraction from JPEG (APP1) and PNG (iTXt)
- Image-click overlay trigger for embedded commerce metadata
- Platform survival rate testing with JSON output
- Optional API key authentication (x-api-key / Bearer token)
- Rate limiting (100 req/min per IP)
- Standardized error responses ({ code, message, details? })

**Test Status:**
- Vitest: 12/12 tests pass ✅
- Cargo (Rust): 8/11 pass, 3 deferred ✅
- Manual E2E: PASS (overlay displays correctly) ✅
- Git tag: v0.2.0 (Sprint 2). v0.3.0 (Sprint 3) — R2 + Rust compiler + matter CLI.

**Next:** Sprint 3 scope confirmation with CEO; batch compilation and merchant catalog import planned for Mar 3 start.

See [CODEBASE-ANALYSIS.md](./CODEBASE-ANALYSIS.md) for exhaustive implementation details, test status, and production readiness assessment.

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
