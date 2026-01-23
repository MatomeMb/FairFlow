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

## Key Metrics (Phase 1 Targets)

| Metric | Target |
|--------|--------|
| .thing files created | 10,000+ |
| Compile latency | <500ms |
| Steganography survival rate | ≥50% |
| Browser extension users | 100+ |
| Merchants onboarded | 5-10 |

---

## Team

| Role | Name | Responsibilities |
|------|------|------------------|
| **CEO** | Sobuhle Nyambali | Strategy, partnerships, fundraising |
| **CTO** | Matome Mboweni | Technical architecture, development |

---

## Timeline

| Milestone | Target Date |
|-----------|-------------|
| Phase 0 (Validation) | Feb 2026 |
| Foundation Complete | Apr 2026 |
| Core Complete (50%) | Jul 2026 |
| Browser Extension (75%) | Aug 2026 |
| Beta Launch | Oct 2026 |
| Public Launch | Dec 2026 |

---

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## Contact

- **Company**: .things that Matter
- **Website**: [thingsthatmatter.com](https://thingsthatmatter.com) *(coming soon)*

---

*"Make commerce portable, viral, and universally accessible — for humans today, AI agents tomorrow, and a decentralized economy in the future."*
