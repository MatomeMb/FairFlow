# .things that Matter
## Project Charter

---

| **Document Information** | |
|--------------------------|---|
| **Company Name** | .things that Matter |
| **Document Type** | Project Charter |
| **Version** | 1.0 |
| **Date** | January 21, 2026 |
| **Status** | Draft - Pending Approval |

---

## 1. Executive Summary

### 1.1 Company Vision

**.things that Matter** is building the infrastructure for **Object-Oriented Commerce** — a paradigm shift where products become portable, self-sovereign digital objects that can be transacted anywhere on the internet without requiring users to visit traditional storefronts.

### 1.2 The Problem

The internet today is architected around "Places." To purchase an item, users must:
- Navigate to a specific URL
- Load a heavy storefront
- Parse a unique user interface
- Operate within a walled garden

This model is fundamentally broken because it:
- Rigidly couples the product to the platform
- Assumes commerce is a destination, not a capability
- Is inefficient for AI agents (high compute cost to parse HTML/JSON)
- Creates friction in social sharing and discovery

### 1.3 The Solution

We are building a **Commerce Compiler** that transforms product data into portable, intelligent digital objects called **Universal Commerce Containers** (`.thing` files). These artifacts:

- Carry their own identity, price, semantic meaning, and checkout logic
- Are visually shareable for humans (embedded in images)
- Are computationally efficient for AI agents (binary format)
- Travel freely across the web without platform dependency

### 1.4 Key Innovation: The Distribution Trinity

Every product processed by our compiler exists simultaneously as:

1. **Matter Photo (Visual Vector)**: A stunning product image with commerce payload baked into pixels and metadata
2. **Matter URI (Pointer Vector)**: A `matter://` protocol link for text-based environments
3. **.thing File (Atomic Vector)**: Raw binary file for direct transfer (the "MP3 of Commerce")

---

## 2. Business Objectives

### 2.1 Primary Objectives

| Objective | Target | Timeline | Status |
|-----------|--------|----------|--------|
| Build functional Commerce Compiler | MVP operational | Mar 2026 (achieved) | Done (Sprint 3–4) |
| Launch browser extension | Chrome Web Store | December 2026 | Planned |
| Onboard beta merchants | 5-10 merchants | Q4 2026 | Planned |
| Process product catalog | 10,000+ products | Q4 2026 | Planned |
| Achieve technical proof-of-concept | End-to-end demo | Mar 2026 (achieved) | Done |

### 2.2 Success Criteria

| Metric | Target |
|--------|--------|
| Steganography survival rate | ≥50% across platforms |
| Compiler processing speed | <500ms per product |
| Browser extension adoption | 100+ beta users |
| Merchant satisfaction | >80% positive feedback |
| Technical debt ratio | <20% of codebase |

### 2.3 Strategic Positioning

**.things that Matter** positions as **infrastructure**, not a marketplace:
- We build the "physics" that allow products to travel freely
- Revenue through compiler API access, not transaction fees
- Open standard encourages ecosystem adoption
- Network effects from `.thing` format adoption

---

## 3. Scope Definition

### 3.1 In Scope

| Component | Description |
|-----------|-------------|
| **Commerce Compiler (matter-core)** | Rust library that ingests product data and outputs .thing files |
| **FlatBuffers Schema** | Binary format definition for Universal Commerce Containers |
| **CLIP Integration** | Semantic vectorization for product "cognition" |
| **Ed25519 Signing** | Cryptographic integrity for tamper-proof files |
| **Steganography Engine** | Image embedding for polyglot media distribution |
| **XMP Metadata Injection** | Fast discovery layer for crawlers/extensions |
| **matter:// Protocol** | Custom URI scheme for text-based distribution |
| **Shadow Index API** | Hash-to-artifact resolution service |
| **Cloudflare R2 CDN** | Artifact storage and distribution |
| **Browser Extension (Lens)** | Chrome extension for product discovery and checkout |
| **libmatter SDK** | Developer library with Rust/TypeScript bindings |

### 3.2 Out of Scope (Year 1)

| Item | Rationale |
|------|-----------|
| Mobile SDK (iOS/Android) | Deferred to Year 2 |
| Self-hosted GPU cluster | Use serverless CLIP initially |
| SOC2 compliance | No enterprise customers in Year 1 |
| Payment processing | Redirect to merchant checkout |
| Inventory management | Merchants handle fulfillment |
| Customer support platform | Manual support initially |

### 3.3 Dependencies

| Dependency | Type | Risk Level |
|------------|------|------------|
| Replicate API (CLIP) | External service | Medium |
| Cloudflare R2 | Infrastructure | Low |
| Chrome Web Store | Distribution | Low |
| FlatBuffers library | Open source | Low |
| Rust toolchain | Development | Low |

---

## 4. Stakeholders

### 4.1 Core Team

| Role | Name | Responsibilities |
|------|------|------------------|
| **CEO** | Sobuhle Nyambali | Strategy, partnerships, fundraising |
| **CTO** | Matome Mboweni | Technical architecture, development, delivery |

### 4.2 Target Users

| User Type | Description | Primary Need |
|-----------|-------------|--------------|
| **Merchants** | E-commerce businesses | Distribute products beyond their storefront |
| **Consumers** | Online shoppers | Discover and purchase without friction |
| **AI Agents** | Autonomous commerce bots | Efficient product data parsing |
| **Developers** | Third-party integrators | Easy SDK for Matter-enabled apps |

### 4.3 External Stakeholders

| Stakeholder | Interest |
|-------------|----------|
| Investors | ROI, market traction |
| Platform partners | Integration opportunities |
| Open-source community | Standard adoption |

---

## 5. Project Governance

### 5.1 Decision-Making Authority

| Decision Type | Authority |
|---------------|-----------|
| Strategic direction | CEO |
| Technical architecture | CTO |
| Budget allocation | CEO + CTO jointly |
| Feature prioritization | CTO (with CEO input) |
| Partnership agreements | CEO |
| Hiring decisions | CEO + CTO jointly |

### 5.2 Communication Cadence

| Meeting | Frequency | Participants | Purpose |
|---------|-----------|--------------|---------|
| Strategy sync | Weekly | CEO + CTO | Alignment, blockers |
| Progress demo | Monthly | CEO + CTO | Working software review |
| Investor update | Quarterly | CEO | Progress report |

### 5.3 Reporting Structure

```
CEO (Sobuhle Nyambali)
 └── CTO (Matome Mboweni)
      └── Development (solo initially)
      └── Future: Engineering team
```

---

## 6. Constraints & Assumptions

### 6.1 Constraints

| Constraint | Impact |
|------------|--------|
| **Budget: R72,000 Year 1** | Lean development, free tiers prioritized |
| **Solo developer** | Sequential work, no parallelization |
| **11-month timeline** | Extended from 9 months due to budget |
| **No security audit budget** | Self-review until revenue allows |

### 6.2 Assumptions

| Assumption | Risk if Invalid |
|------------|-----------------|
| Steganography survives ≥50% of platforms | Pivot to matter:// primary distribution |
| CLIP serverless costs remain stable | May need self-hosted GPU |
| Chrome allows extension publishing | May need alternative distribution |
| Rust learning curve manageable | C/C++ background accelerates learning |
| Merchants interested in beta | Extended timeline for adoption |

---

## 7. Budget Summary

### 7.1 Year 1 Budget: R72,000

| Category | Amount (ZAR) | % of Total |
|----------|--------------|------------|
| Development Tools | R6,048 | 8% |
| AI & ML APIs | R21,600 | 30% |
| Infrastructure & Hosting | R7,560 | 10% |
| Monitoring & Operations | R0 | 0% |
| Payments & Financial | R10,800 | 15% |
| Domains & Publishing | R500 | 1% |
| One-Time Costs | R2,800 | 4% |
| Buffer (5%) | R3,600 | 5% |
| **Operating Reserve** | **R19,092** | **27%** |

### 7.2 Monthly Burn Rate

| Phase | Monthly Avg | Duration |
|-------|-------------|----------|
| Setup (Month 1-2) | R7,250 | 2 months |
| Development (Month 3-7) | R6,100 | 5 months |
| Launch prep (Month 8-11) | R6,550 | 4 months |

---

## 8. High-Level Timeline

### 8.1 Phase Overview

| Phase | Duration | Key Deliverable |
|-------|----------|-----------------|
| **Phase 0: Validation** | Feb 2026 (4 weeks) | Steganography proof-of-concept |
| **Phase 1: Foundation** | Mar-Apr 2026 | FlatBuffers schema, Rust compiler |
| **Phase 2: Core** | May-Jul 2026 | CLIP integration, signing, steg engine |
| **Phase 3: Distribution** | Aug-Sep 2026 | CDN, Shadow Index, browser extension |
| **Phase 4: Launch** | Oct-Dec 2026 | Beta merchants, public release |

### 8.2 Key Milestones

| Milestone | Target Date | Success Criteria |
|-----------|-------------|------------------|
| Phase 0 Go/No-Go | Feb 28, 2026 | ≥50% steganography survival |
| 50% completion | Jun 30, 2026 | Working compiler + CLIP |
| 75% completion | Aug 31, 2026 | Browser extension functional |
| Beta launch | Oct 31, 2026 | 5 merchants onboarded |
| Public launch | Dec 15, 2026 | Chrome Web Store published |

---

## 9. Risk Summary

### 9.1 Top Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Steganography fails on major platforms | Medium | High | Phase 0 validation, matter:// fallback |
| Cursor Pro limits slow development | Medium | Medium | Batch work, use slow requests |
| Rust learning takes longer | Low | Medium | C/C++ background provides strong foundation |
| No merchant interest | Low | High | Open-source for developer adoption |
| Budget overrun | Medium | Medium | 5% buffer, strict scope control |

### 9.2 Risk Tolerance

| Risk Type | Tolerance |
|-----------|-----------|
| Technical risk | High (can pivot approaches) |
| Timeline risk | Medium (2-month buffer acceptable) |
| Budget risk | Low (fixed allocation) |
| Security risk | Medium (self-review until audit) |

---

## 10. Approval

### 10.1 Charter Approval

By signing below, stakeholders approve this Project Charter and authorize the project to proceed.

| Role | Name | Signature | Date |
|------|------|-----------|------|
| CEO | Sobuhle Nyambali | _________________ | ___/___/2026 |
| CTO | Matome Mboweni | _________________ | ___/___/2026 |

### 10.2 Change Control

Changes to this charter require written approval from both CEO and CTO. Minor updates (clarifications, typos) may be made by CTO with notification to CEO.

---

## 11. Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 21, 2026 | M. Mboweni | Initial draft |

---

**Next Document:** Technical Architecture Document
