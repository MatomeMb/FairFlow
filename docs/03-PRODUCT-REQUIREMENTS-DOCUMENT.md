# .things that Matter
## Product Requirements Document (PRD)

---

| **Document Information** | |
|--------------------------|---|
| **Company Name** | .things that Matter |
| **Document Type** | Product Requirements Document |
| **Version** | 1.0 |
| **Date** | January 21, 2026 |
| **Author** | Matome Mboweni, CTO |

---

## 1. Product Vision

### 1.1 Vision Statement

**Make commerce portable, viral, and universally accessible — for humans today, AI agents tomorrow, and a decentralized economy in the future.**

### 1.2 Strategic Phases

| Phase | Codename | Focus | Moat |
|-------|----------|-------|------|
| **Phase 1** | **Viral Commerce** | Create .thing files and establish virality | **Accessibility** |
| **Phase 2** | **Agentic Commerce** | Optimize for AI efficiency | **Energy Efficiency** |
| **Phase 3** | **Decentralized Commerce** | Blockchain-based open infrastructure | **Decentralization** |

### 1.3 Phase Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    STRATEGIC ROADMAP                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   PHASE 1: VIRAL COMMERCE (2026)                                │
│   "Make products travel like memes"                              │
│   ────────────────────────────────                               │
│   • .thing file format                                           │
│   • Steganographic images                                        │
│   • Browser extension                                            │
│   • Proof of concept: Virality                                   │
│   • MOAT: Accessibility                                          │
│                                                                  │
│                         │                                        │
│                         ▼                                        │
│                                                                  │
│   PHASE 2: AGENTIC COMMERCE (2027)                              │
│   "The native tongue for AI commerce"                            │
│   ────────────────────────────────                               │
│   • Zero-copy binary parsing                                     │
│   • Semantic search at scale                                     │
│   • Agent SDK & APIs                                             │
│   • Token-efficient transactions                                 │
│   • MOAT: Energy Efficiency                                      │
│                                                                  │
│                         │                                        │
│                         ▼                                        │
│                                                                  │
│   PHASE 3: DECENTRALIZED COMMERCE (2028+)                       │
│   "Open protocol for the world"                                  │
│   ────────────────────────────────                               │
│   • Blockchain-based registry                                    │
│   • Smart contract checkout                                      │
│   • Open-source everything                                       │
│   • Community governance                                         │
│   • MOAT: Decentralization                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Phase 1: Viral Commerce

### 2.1 Phase 1 Overview

| Attribute | Value |
|-----------|-------|
| **Timeline** | 2026 (11 months) |
| **Budget** | R72,000 |
| **Goal** | Prove that products can travel virally across the internet |
| **Success Metric** | 10,000 .thing files created, 100+ extension users |
| **Moat** | Accessibility — products available everywhere |

### 2.2 Phase 1 Problem Statement

**Current State:**
- Products are trapped in platform silos
- Sharing a product = sharing a link to a storefront
- AI agents waste compute scraping HTML to understand products
- No universal format for portable commerce

**Desired State:**
- Products exist as self-contained digital objects
- Sharing a product = sharing the product itself (in an image, link, or file)
- Anyone can decode a product anywhere
- Commerce becomes a layer of reality, not a destination

### 2.3 Phase 1 Requirements

#### 2.3.1 Functional Requirements

| ID | Requirement | Priority | Description |
|----|-------------|----------|-------------|
| P1-F01 | .thing File Format | Must Have | Binary format using FlatBuffers schema |
| P1-F02 | Commerce Compiler | Must Have | Transform product JSON → .thing files |
| P1-F03 | CLIP Vectorization | Must Have | Generate 512-dim semantic embeddings |
| P1-F04 | Ed25519 Signing | Must Have | Cryptographic tamper-proof seal |
| P1-F05 | Zstd Compression | Must Have | Compress descriptions for portability |
| P1-F06 | Polyglot Images | Must Have | Embed .thing in images (steganography) |
| P1-F07 | XMP Metadata Beacon | Must Have | Fast discovery layer in image headers |
| P1-F08 | matter:// URI | Must Have | Text-based distribution protocol |
| P1-F09 | Shadow Index API | Must Have | Hash → artifact resolution service |
| P1-F10 | Browser Extension | Must Have | Detect and display Matter products |
| P1-F11 | Cloudflare R2 CDN | Must Have | Artifact storage and distribution |
| P1-F12 | Batch Compilation | Should Have | Process 1000+ products at once |
| P1-F13 | Merchant Dashboard | Could Have | Self-service product compilation |
| P1-F14 | Analytics | Could Have | Track .thing views and clicks |

#### 2.3.2 Non-Functional Requirements

| ID | Requirement | Target | Description |
|----|-------------|--------|-------------|
| P1-NF01 | Compile Latency | <500ms | Time to compile single product |
| P1-NF02 | File Size | <50KB | Average .thing file size |
| P1-NF03 | Extension Load | <100ms | Time to detect Matter content |
| P1-NF04 | Signature Verify | <10ms | Client-side verification time |
| P1-NF05 | CDN Availability | 99.9% | Artifact availability SLA |
| P1-NF06 | Steg Survival | ≥50% | Platforms where payload survives |

#### 2.3.3 Phase 1 User Stories

**Merchant Stories:**

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| P1-US01 | Merchant | Upload my product catalog | My products become portable .thing files |
| P1-US02 | Merchant | Download polyglot images | I can share shoppable images on social media |
| P1-US03 | Merchant | Get matter:// links | I can share products in text-based channels |
| P1-US04 | Merchant | See which products are compiled | I know my catalog is ready |
| P1-US05 | Merchant | Update product prices | The .thing files reflect current pricing |

**Consumer Stories:**

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| P1-US06 | Consumer | Install a browser extension | I can discover Matter products anywhere |
| P1-US07 | Consumer | See product info on any image | I don't need to visit a store |
| P1-US08 | Consumer | Click to buy directly | I can purchase without navigation |
| P1-US09 | Consumer | Trust the price shown | I know it hasn't been tampered with |
| P1-US10 | Consumer | Share a product with friends | They can also see the product info |

**Developer Stories:**

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| P1-US11 | Developer | Access a compilation API | I can integrate Matter into my app |
| P1-US12 | Developer | Read .thing files easily | I can build Matter-compatible tools |
| P1-US13 | Developer | Verify signatures | I can trust the data integrity |

### 2.4 Phase 1 Acceptance Criteria

| Milestone | Acceptance Criteria |
|-----------|---------------------|
| **Phase 0 Complete** | Steganography tested on 20 platforms, ≥50% survival rate confirmed |
| **Compiler MVP** | Successfully compile JSON → .thing → polyglot image |
| **CLIP Working** | Semantic vectors embedded in .thing files |
| **Extension Alpha** | Detect XMP beacon, display product overlay |
| **75% Complete** | End-to-end demo: image → decode → product display |
| **Beta Launch** | 5 merchants onboarded, 1000+ products compiled |
| **Public Launch** | Extension in Chrome Web Store, documentation complete |

---

## 3. Phase 2: Agentic Commerce

### 3.1 Phase 2 Overview

| Attribute | Value |
|-----------|-------|
| **Timeline** | 2027 |
| **Budget** | TBD (based on Phase 1 revenue) |
| **Goal** | Make .thing the most efficient format for AI agent commerce |
| **Success Metric** | 100K+ agent transactions, documented efficiency gains |
| **Moat** | Energy Efficiency — cheaper for AI to use |

### 3.2 Phase 2 Problem Statement

**Current State:**
- AI agents scrape HTML pages to understand products (expensive)
- JSON APIs are verbose and require full parsing (inefficient)
- Each platform has different data structures (fragmented)
- Agents waste tokens on data extraction (costly)

**Desired State:**
- .thing is the "native tongue" for AI commerce
- Zero-copy field access means O(1) reads (fast)
- Semantic vectors enable instant similarity search (smart)
- Standardized format across all merchants (unified)
- Agents use fewer tokens and less compute (cheap)

### 3.3 Phase 2 Requirements

#### 3.3.1 Functional Requirements

| ID | Requirement | Priority | Description |
|----|-------------|----------|-------------|
| P2-F01 | Agent SDK | Must Have | Python/JS libraries optimized for AI agents |
| P2-F02 | Bulk Read API | Must Have | Efficient batch fetching of .thing files |
| P2-F03 | Vector Search API | Must Have | Query products by semantic similarity |
| P2-F04 | Streaming Compilation | Must Have | Real-time catalog sync for merchants |
| P2-F05 | WASM Runtime | Must Have | Run compiler in any environment |
| P2-F06 | Token Estimation | Should Have | Help agents budget API calls |
| P2-F07 | Agent Analytics | Should Have | Track agent usage patterns |
| P2-F08 | Rate Limiting | Should Have | Fair usage across agents |
| P2-F09 | Caching Layer | Should Have | Reduce redundant fetches |
| P2-F10 | GraphQL API | Could Have | Flexible querying for agents |

#### 3.3.2 Non-Functional Requirements

| ID | Requirement | Target | Description |
|----|-------------|--------|-------------|
| P2-NF01 | Read Latency | <5ms | Time to read single field from .thing |
| P2-NF02 | Vector Search | <50ms | Similarity search across 100K products |
| P2-NF03 | Throughput | 10K req/s | API requests per second |
| P2-NF04 | Token Efficiency | 90% reduction | vs. HTML scraping |
| P2-NF05 | Compute Cost | 80% reduction | vs. JSON parsing |

#### 3.3.3 Phase 2 User Stories

**AI Agent Stories:**

| ID | As an... | I want to... | So that... |
|----|----------|--------------|------------|
| P2-US01 | AI Agent | Read product prices in O(1) time | I minimize compute costs |
| P2-US02 | AI Agent | Search products by semantic meaning | I find relevant items without keywords |
| P2-US03 | AI Agent | Verify product authenticity | I don't transact with fake listings |
| P2-US04 | AI Agent | Batch fetch product catalogs | I efficiently sync data |
| P2-US05 | AI Agent | Estimate token usage before calls | I budget my operations |

**Platform Stories:**

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| P2-US06 | AI Platform | Integrate Matter SDK | My agents can do commerce efficiently |
| P2-US07 | AI Platform | Monitor agent transactions | I understand usage patterns |
| P2-US08 | AI Platform | Set rate limits | I ensure fair resource usage |

### 3.4 Phase 2 Efficiency Metrics

**Comparison: Traditional vs. Matter Protocol**

| Operation | Traditional (HTML/JSON) | Matter (.thing) | Improvement |
|-----------|-------------------------|-----------------|-------------|
| Parse product page | ~500ms, O(n) | ~5ms, O(1) | **100x faster** |
| Read price field | Parse entire response | Direct byte offset | **Zero allocation** |
| Semantic search | External API call | Local vector math | **No API cost** |
| Verify authenticity | Trust platform | Cryptographic proof | **Trustless** |
| Token consumption | ~2000 tokens/product | ~50 tokens/product | **40x cheaper** |
| Memory usage | Full DOM/JSON | Memory-mapped file | **90% reduction** |

---

## 4. Phase 3: Decentralized Commerce

### 4.1 Phase 3 Overview

| Attribute | Value |
|-----------|-------|
| **Timeline** | 2028+ |
| **Budget** | TBD (community-funded / token) |
| **Goal** | Open-source the protocol and decentralize the infrastructure |
| **Success Metric** | Protocol adoption by 1000+ independent nodes |
| **Moat** | Decentralization — no single point of control |

### 4.2 Phase 3 Problem Statement

**Current State (Post Phase 2):**
- .things that Matter controls the signing keys
- Shadow Index is a centralized service
- CDN is our infrastructure
- Users must trust our company

**Desired State:**
- Anyone can become a signing authority
- Product registry lives on blockchain
- Artifacts stored on IPFS/Filecoin
- Protocol governed by community
- Trust is cryptographic, not institutional

### 4.3 Phase 3 Requirements

#### 4.3.1 Functional Requirements

| ID | Requirement | Priority | Description |
|----|-------------|----------|-------------|
| P3-F01 | Open Source Release | Must Have | All code MIT/Apache licensed |
| P3-F02 | Decentralized Registry | Must Have | Blockchain-based product index |
| P3-F03 | Multi-Signer Support | Must Have | Multiple trusted signing authorities |
| P3-F04 | IPFS Integration | Must Have | Decentralized artifact storage |
| P3-F05 | Smart Contract Checkout | Must Have | On-chain payment execution |
| P3-F06 | Governance Token | Should Have | Community decision-making |
| P3-F07 | Node Software | Should Have | Anyone can run a Matter node |
| P3-F08 | Protocol Specification | Must Have | Formal spec for interoperability |
| P3-F09 | Validator Network | Could Have | Decentralized compilation validation |
| P3-F10 | Cross-Chain Bridge | Could Have | Multi-blockchain support |

#### 4.3.2 Non-Functional Requirements

| ID | Requirement | Target | Description |
|----|-------------|--------|-------------|
| P3-NF01 | Decentralization | No single point of failure | Full redundancy |
| P3-NF02 | Censorship Resistance | Cannot be taken down | Distributed infrastructure |
| P3-NF03 | Permissionless | Anyone can participate | Open protocol |
| P3-NF04 | Backwards Compatible | Existing .thing files work | Smooth migration |

#### 4.3.3 Phase 3 User Stories

**Community Stories:**

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| P3-US01 | Developer | Fork and modify the protocol | I can innovate on commerce infrastructure |
| P3-US02 | Node Operator | Run a Matter node | I earn fees and support the network |
| P3-US03 | Merchant | Choose my signing authority | I'm not dependent on one company |
| P3-US04 | Token Holder | Vote on protocol changes | I have a say in governance |
| P3-US05 | Consumer | Trust math, not companies | My transactions are verifiable |

### 4.4 Phase 3 Architecture Vision

```
┌─────────────────────────────────────────────────────────────────┐
│              DECENTRALIZED MATTER PROTOCOL                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                    BLOCKCHAIN LAYER                      │   │
│   │  • Product Registry (hash → metadata)                   │   │
│   │  • Signer Registry (authorized public keys)             │   │
│   │  • Smart Contract Checkout (escrow + release)           │   │
│   │  • Governance (protocol upgrades)                       │   │
│   └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                    STORAGE LAYER                         │   │
│   │  • IPFS (artifact storage)                              │   │
│   │  • Filecoin (persistence incentives)                    │   │
│   │  • Arweave (permanent storage option)                   │   │
│   └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                    NODE NETWORK                          │   │
│   │  • Compiler Nodes (run matter-core)                     │   │
│   │  • Index Nodes (serve Shadow Index)                     │   │
│   │  • Gateway Nodes (HTTP access for legacy)               │   │
│   └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                    CLIENT LAYER                          │   │
│   │  • Browser Extension (unchanged UX)                     │   │
│   │  • Agent SDKs (same APIs)                               │   │
│   │  • Mobile Apps (native clients)                         │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Feature Specifications (Phase 1 Detail)

### 5.1 .thing File Format

**Purpose:** Universal Commerce Container for portable product data.

**Specification:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| magic | uint32 | Yes | 0x54484E47 ("THNG") |
| version | uint8 | Yes | Schema version (1) |
| id | string | Yes | Unique product identifier |
| hash | bytes | Yes | SHA-256 of canonical form |
| title | string | Yes | Product name |
| description | string | No | Product description (Zstd compressed) |
| price | uint64 | Yes | Price in cents |
| currency | string | Yes | ISO 4217 currency code |
| sku | string | No | Merchant SKU |
| image_url | string | No | Primary image URL |
| clip_vector | float[512] | Yes | Semantic embedding |
| checkout_url | string | Yes | Purchase destination |
| merchant_id | string | No | Merchant identifier |
| created_at | uint64 | Yes | Unix timestamp |
| expires_at | uint64 | No | TTL for freshness |
| signature | bytes | Yes | Ed25519 signature |
| signer_pubkey | bytes | Yes | Signer's public key |

**File Size Targets:**

| Content | Size |
|---------|------|
| Header + metadata | ~500 bytes |
| CLIP vector | ~2KB |
| Compressed description | ~1-5KB |
| Signature | 64 bytes |
| **Total typical** | **3-8KB** |

### 5.2 Commerce Compiler

**Purpose:** Transform product data into .thing files and distribution assets.

**Input:**
```json
{
  "id": "prod_123",
  "title": "Premium Wireless Headphones",
  "description": "High-fidelity audio with 30-hour battery...",
  "price": 14999,
  "currency": "USD",
  "image_url": "https://example.com/headphones.jpg",
  "checkout_url": "https://store.example.com/checkout/prod_123"
}
```

**Output:**
```json
{
  "hash": "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
  "thing_url": "https://r2.thingsthatmatter.com/QmYwAP...thing",
  "image_url": "https://r2.thingsthatmatter.com/QmYwAP...jpg",
  "matter_uri": "matter://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
  "gist": {
    "title": "Premium Wireless Headphones",
    "price": 14999,
    "currency": "USD"
  }
}
```

**Compilation Pipeline:**

1. **Validate** — Check input against schema
2. **Fetch Image** — Download product image
3. **Vectorize** — Send to CLIP API, receive 512-dim vector
4. **Compress** — Zstd compress description
5. **Serialize** — Build FlatBuffers binary
6. **Hash** — SHA-256 of canonical binary
7. **Sign** — Ed25519 signature
8. **Embed** — Steganographic image creation
9. **Upload** — Push to Cloudflare R2
10. **Index** — Record in Shadow Index

### 5.3 Browser Extension (Lens)

**Purpose:** Detect and display Matter products on any webpage.

**Features:**

| Feature | Description |
|---------|-------------|
| XMP Detection | Scan images for Matter metadata beacons |
| URI Interception | Handle matter:// protocol links |
| Overlay Display | Show product card on hover/click |
| Signature Verification | Validate Ed25519 in WASM |
| Local Cache | IndexedDB storage for resolved products |
| Settings | Enable/disable, visual preferences |

**UI Components:**

```
┌─────────────────────────────────────────┐
│  [Product Image]                        │
│                                         │
│  Premium Wireless Headphones            │
│  $149.99 USD                            │
│                                         │
│  [✓ Verified by .things that Matter]    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │         BUY NOW                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Powered by Matter Protocol             │
└─────────────────────────────────────────┘
```

**Permissions Required:**

| Permission | Reason |
|------------|--------|
| activeTab | Read page content for detection |
| storage | Cache resolved products |
| webRequest | Intercept matter:// URIs |

### 5.4 Shadow Index API

**Purpose:** Resolve product hashes to artifact locations.

**Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /v1/compile | Compile product JSON to .thing |
| POST | /v1/batch | Compile multiple products |
| GET | /v1/resolve/{hash} | Get artifact URLs for hash |
| GET | /v1/gist/{hash} | Get minimal product data |
| GET | /v1/health | Service health check |

**Example: Resolve**

```http
GET /v1/resolve/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG

Response:
{
  "hash": "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
  "thing_url": "https://r2.thingsthatmatter.com/QmYwAP.thing",
  "image_url": "https://r2.thingsthatmatter.com/QmYwAP.jpg",
  "gist": {
    "title": "Premium Wireless Headphones",
    "price": 14999,
    "currency": "USD"
  },
  "created_at": 1706000000,
  "expires_at": 1737600000
}
```

---

## 6. Success Metrics

### 6.1 Phase 1 KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| .thing files created | 10,000 | Database count |
| Unique products compiled | 5,000 | Distinct SKUs |
| Extension installs | 100+ | Chrome Web Store |
| Active extension users | 50+ | Weekly active |
| Merchants onboarded | 5-10 | Signed agreements |
| Steganography survival | ≥50% | Platform testing |
| Compile success rate | >99% | API metrics |
| Average compile time | <500ms | API metrics |
| Extension detection rate | >95% | Test suite |

### 6.2 Phase 2 KPIs (Future)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Agent SDK downloads | 1,000+ | Package registry |
| Agent transactions | 100K+ | API logs |
| Token efficiency gain | 40x | Benchmark tests |
| Compute cost reduction | 80% | Benchmark tests |
| Vector search queries | 1M+ | API metrics |

### 6.3 Phase 3 KPIs (Future)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Independent nodes | 1,000+ | Network discovery |
| Open source contributors | 100+ | GitHub metrics |
| Protocol forks | 50+ | GitHub forks |
| Decentralized transactions | 1M+ | Blockchain data |

---

## 7. Dependencies & Integrations

### 7.1 External Dependencies

| Dependency | Purpose | Phase | Risk |
|------------|---------|-------|------|
| Replicate API | CLIP inference | P1 | Medium |
| Cloudflare R2 | Artifact storage | P1 | Low |
| Supabase | Database | P1 | Low |
| Vercel | API hosting | P1 | Low |
| Chrome Web Store | Extension distribution | P1 | Low |
| IPFS | Decentralized storage | P3 | Medium |
| Ethereum/Polygon | Smart contracts | P3 | Medium |

### 7.2 Integration Points

| Integration | Type | Phase |
|-------------|------|-------|
| Merchant product catalogs | Inbound data | P1 |
| Social media platforms | Image distribution | P1 |
| AI agent frameworks | SDK integration | P2 |
| Blockchain networks | Protocol layer | P3 |

---

## 8. Constraints & Assumptions

### 8.1 Constraints

| Constraint | Impact |
|------------|--------|
| R72,000 Year 1 budget | Lean development, free tiers |
| Solo developer | Sequential work |
| 11-month Phase 1 timeline | Extended milestones |
| No security audit budget | Self-review initially |

### 8.2 Assumptions

| Assumption | Validation |
|------------|------------|
| Steganography survives ≥50% of platforms | Phase 0 testing |
| CLIP API remains affordable | Monitor pricing |
| Chrome allows extension | Review policies |
| Merchants want portable products | Beta feedback |
| AI agents will adopt efficient formats | Market trends |

---

## 9. Glossary

| Term | Definition |
|------|------------|
| **.thing file** | Universal Commerce Container binary format |
| **Matter Protocol** | The overall system for portable commerce |
| **Polyglot Image** | Image file that is also a valid .thing file |
| **Shadow Index** | Hash-to-artifact resolution service |
| **Lens** | Browser extension for Matter detection |
| **CLIP Vector** | 512-dimension semantic embedding |
| **Zero-Copy Access** | Reading data without memory allocation |
| **Steganography** | Hiding data within images |
| **XMP Beacon** | Metadata header for fast discovery |
| **matter:// URI** | Custom protocol for text-based sharing |

---

## 10. Document Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| CEO | Sobuhle Nyambali | _________________ | ___/___/2026 |
| CTO | Matome Mboweni | _________________ | ___/___/2026 |

---

**Document Version:** 1.0  
**Last Updated:** January 21, 2026  
**Next Review:** Post-Phase 0 (March 2026)
