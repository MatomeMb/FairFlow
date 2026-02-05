# .things that Matter
## Development Roadmap & Milestones

---

| **Document Information** | |
|--------------------------|---|
| **Company Name** | .things that Matter |
| **Document Type** | Development Roadmap |
| **Version** | 1.0 |
| **Date** | January 21, 2026 |
| **Author** | Matome Mboweni, CTO |

---

## 1. Roadmap Overview

### 1.1 Phase 1 Timeline (2026)

```
        JAN    FEB    MAR    APR    MAY    JUN    JUL    AUG    SEP    OCT    NOV    DEC
         │      │      │      │      │      │      │      │      │      │      │      │
    ─────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼────
         │      │      │      │      │      │      │      │      │      │      │      │
  Setup ─┼──────┤      │      │      │      │      │      │      │      │      │      │
         │ ████ │      │      │      │      │      │      │      │      │      │      │
         │      │      │      │      │      │      │      │      │      │      │      │
Phase 0 ─┼──────┼──────┤      │      │      │      │      │      │      │      │      │
         │      │██████│      │      │      │      │      │      │      │      │      │
         │      │      │      │      │      │      │      │      │      │      │      │
 Found- ─┼──────┼──────┼──────┼──────┤      │      │      │      │      │      │      │
  ation  │      │      │██████│██████│      │      │      │      │      │      │      │
         │      │      │      │      │      │      │      │      │      │      │      │
  Core  ─┼──────┼──────┼──────┼──────┼──────┼──────┼──────┤      │      │      │      │
         │      │      │      │      │██████│██████│██████│      │      │      │      │
         │      │      │      │      │      │      │      │      │      │      │      │
 Distri-─┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┤      │      │
 bution  │      │      │      │      │      │      │      │██████│██████│      │      │
         │      │      │      │      │      │      │      │      │      │      │      │
 Launch ─┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┤
         │      │      │      │      │      │      │      │      │      │██████│██████│
         │      │      │      │      │      │      │      │      │      │      │      │
    ─────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼────
         │      │      │      │      │      │ 50%  │      │ 75%  │      │      │ 100% │
         │      │  GO/ │      │      │      │  ▲   │      │  ▲   │      │      │  ▲   │
         │      │ NO-GO│      │      │      │      │      │      │      │      │      │
```

### 1.2 Sprint Structure

| Sprint | Duration | Focus |
|--------|----------|-------|
| Setup | 2 weeks | Environment, contracts, planning |
| Phase 0 | 4 weeks | Steganography validation |
| Foundation | 8 weeks | FlatBuffers, Rust compiler |
| Core | 12 weeks | CLIP, signing, steganography engine |
| Distribution | 8 weeks | CDN, API, browser extension |
| Launch | 8 weeks | Beta merchants, public release |

**Scrum Cadence Note:** The roadmap remains the long-range view, but execution now follows **2-week Scrum sprints** with a shippable increment at each sprint end. The active sprint plan lives in `docs/11-SPRINT-1-PLAN.md` and the product backlog in `docs/10-MVP-BACKLOG.md`.

---

## 2. Detailed Sprint Breakdown

### 2.1 Sprint 0: Setup (Jan 21 - Feb 2, 2026)

**Duration:** 2 weeks  
**Objective:** Establish foundation for development

| Week | Tasks | Deliverables |
|------|-------|--------------|
| Week 1 | Sign new company contract | Signed agreement |
| | Set up development environment | Cursor Pro, VS Code, Rust toolchain |
| | Create GitHub organization | thingsthatmatter org |
| | Initialize monorepo structure | packages/ directory |
| Week 2 | Set up Supabase project | Database schema |
| | Configure Vercel deployment | CI/CD pipeline |
| | Set up Cloudflare R2 bucket | Storage ready |
| | Begin Rust learning | Chapters 1-5 of The Rust Book |

**Exit Criteria:**
- [ ] Contract signed
- [ ] Development environment operational
- [ ] Repository initialized with structure
- [ ] Infrastructure accounts created

---

### 2.2 Sprint 1: Phase 0 - Validation (Feb 3 - Mar 2, 2026)

**Duration:** 4 weeks  
**Objective:** Prove steganography viability  
**Budget:** R2,000

| Week | Tasks | Deliverables |
|------|-------|--------------|
| Week 3 | Research steganography techniques | Technical notes |
| | Build basic XMP injection tool (Rust) | xmp_inject.rs |
| | Build EOF append tool (Rust) | eof_append.rs |
| | Test on 5 platforms | Initial results |
| Week 4 | Test on 15 additional platforms | Full platform matrix |
| | Document survival rates | Platform compatibility table |
| | Build basic extraction tool | extract_payload.py |
| | CLIP API integration test | clip_test.py |
| Week 5 | Build end-to-end prototype | JSON → .thing → image → decode |
| | Cost analysis for CLIP | Cost projections |
| | Validate Ed25519 signing | sign_verify.py |
| Week 6 | Compile results | Phase 0 Report |
| | Go/No-Go decision | Decision document |
| | Plan adjustments if needed | Updated roadmap |

**Platform Testing Matrix:**

| Platform | Test | Status |
|----------|------|--------|
| Discord | Upload/download image | Pending |
| Telegram | Send/receive image | Pending |
| Twitter/X | Tweet with image | Pending |
| Instagram | Post image | Pending |
| Facebook | Share image | Pending |
| WhatsApp | Send image | Pending |
| Signal | Send image | Pending |
| Reddit | Post image | Pending |
| Pinterest | Pin image | Pending |
| LinkedIn | Post image | Pending |
| Slack | Share image | Pending |
| Email (Gmail) | Attach image | Pending |
| Email (Outlook) | Attach image | Pending |
| Google Photos | Upload | Pending |
| iCloud Photos | Upload | Pending |
| Dropbox | Upload | Pending |
| Google Drive | Upload | Pending |
| OneDrive | Upload | Pending |
| Direct download | HTTP transfer | Pending |
| S3/R2 | CDN delivery | Pending |

**Decision Gate:**

| Survival Rate | Decision |
|---------------|----------|
| ≥70% | Full steam ahead with steganography |
| 50-69% | Hybrid approach: steg + matter:// URIs |
| <50% | Pivot to matter:// as primary distribution |

**Exit Criteria:**
- [ ] 20 platforms tested
- [ ] Survival rate documented
- [ ] End-to-end prototype working
- [ ] Go/No-Go decision made
- [ ] Phase 0 Report complete

---

### 2.3 Sprint 2-3: Foundation (Mar 3 - Apr 27, 2026)

**Duration:** 8 weeks  
**Objective:** Build compiler foundation

#### Sprint 2: FlatBuffers & Schema (Mar 3 - Mar 30)

| Week | Tasks | Deliverables |
|------|-------|--------------|
| Week 7 | Design FlatBuffers schema | thing.fbs |
| | Set up flatc compiler | Build scripts |
| | Generate Rust bindings | thing_generated.rs |
| | Write schema documentation | Schema docs |
| Week 8 | Implement basic serializer (Rust) | serialize.rs |
| | Implement basic deserializer (Rust) | deserialize.rs |
| | Unit tests for serialization | tests/serialize.rs |
| | Zstd compression integration | compress.rs |

#### Sprint 3: Rust Compiler Foundation (Mar 31 - Apr 27)

| Week | Tasks | Deliverables |
|------|-------|--------------|
| Week 9 | Product JSON validation (serde_json + validator) | validator.rs |
| | Image download utility | fetch_image.rs |
| | CLIP API integration | clip_client.rs |
| | Vector embedding pipeline | vectorize.rs |
| Week 10 | Ed25519 signing implementation | crypto.rs |
| | Signature verification | verify.rs |
| | Key management utilities | keys.rs |
| | Integration tests | tests/crypto.rs |
| Week 11 | Full compile() function | compiler.rs |
| | CLI tool | matter-cli (Rust binary) |
| | Batch processing support | batch.rs |
| | Error handling & logging | errors.rs |
| Week 12 | End-to-end testing | tests/e2e.rs |
| | Performance benchmarking | benches/ |
| | Documentation | compiler_docs.md |
| | Code review & cleanup | Refactored code |

**Milestone: 30% Complete**

**Exit Criteria:**
- [ ] FlatBuffers schema finalized
- [ ] Rust compiler produces valid .thing files
- [ ] CLIP vectors embedded correctly
- [ ] Ed25519 signatures verify correctly
- [ ] CLI tool operational
- [ ] <500ms compile time achieved

---

### 2.4 Sprint 4-6: Core (Apr 28 - Jul 20, 2026)

**Duration:** 12 weeks  
**Objective:** Complete core functionality

#### Sprint 4: Steganography Engine (Apr 28 - May 25)

| Week | Tasks | Deliverables |
|------|-------|--------------|
| Week 13 | XMP metadata injection library | xmp.rs |
| | EOF binary append library | eof.rs |
| | Image format handling (JPEG/PNG) | image_utils.rs |
| | Polyglot image generator | polyglot.rs |
| Week 14 | XMP beacon format specification | xmp_spec.md |
| | Gist JSON structure | gist.rs |
| | Metadata extraction library | extract.rs |
| | Unit tests | tests/steg.rs |
| Week 15 | Integration with compiler | Updated compiler.rs |
| | Output: .thing + polyglot image | Full pipeline |
| | Quality validation | image_quality.rs |
| | Documentation | steg_docs.md |
| Week 16 | Platform-specific optimizations | platform_compat.rs |
| | Fallback strategies | fallback.rs |
| | Error recovery | recovery.rs |
| | Performance tuning | Optimized code |

#### Sprint 5: Shadow Index API (May 26 - Jun 22)

| Week | Tasks | Deliverables |
|------|-------|--------------|
| Week 17 | API design & OpenAPI spec | openapi.yaml |
| | Supabase schema (hash → metadata) | migrations/ |
| | POST /compile endpoint | api/compile.ts |
| | GET /resolve endpoint | api/resolve.ts |
| Week 18 | GET /gist endpoint | api/gist.ts |
| | POST /batch endpoint | api/batch.ts |
| | Authentication (API keys) | auth.ts |
| | Rate limiting | ratelimit.ts |
| Week 19 | Cloudflare R2 integration | storage.ts |
| | Upload pipeline | upload.ts |
| | CDN URL generation | cdn.ts |
| | Caching layer (Redis) | cache.ts |
| Week 20 | Error handling | errors.ts |
| | Logging & monitoring | logging.ts |
| | API documentation | api_docs.md |
| | Deploy to Vercel | Production API |

**Milestone: 50% Complete**

#### Sprint 6: matter:// Protocol (Jun 23 - Jul 20)

| Week | Tasks | Deliverables |
|------|-------|--------------|
| Week 21 | URI scheme specification | matter_uri_spec.md |
| | Hash encoding (Base58) | encoding.ts |
| | URI generation in compiler | Updated compiler |
| | URI parsing library | uri_parser.ts |
| Week 22 | Protocol handler research | Browser compatibility notes |
| | Fallback HTTPS URLs | fallback_urls.ts |
| | Deep linking support | deeplink.ts |
| | Documentation | protocol_docs.md |
| Week 23 | Rust: Steganography integration | matter-core/src/steg/ |
| | Rust: CLIP client optimization | matter-core/src/clip/ |
| | WASM build optimization | Smaller WASM |
| | Performance benchmarks | benches/ |
| Week 24 | Rust: Full pipeline optimization | matter-core/src/compiler.rs |
| | Integration tests | tests/integration.rs |
| | Documentation | rust_docs.md |
| | Code review & refactoring | Optimized codebase |

**Exit Criteria:**
- [ ] Steganography engine complete
- [ ] Shadow Index API deployed
- [ ] matter:// URI generation working
- [ ] Rust port 30% complete
- [ ] All core features functional

---

### 2.5 Sprint 7-8: Distribution (Jul 21 - Sep 14, 2026)

**Duration:** 8 weeks  
**Objective:** Browser extension and distribution infrastructure

#### Sprint 7: Browser Extension (Jul 21 - Aug 17)

| Week | Tasks | Deliverables |
|------|-------|--------------|
| Week 25 | Extension architecture design | Architecture doc |
| | Manifest v3 setup | manifest.json |
| | Content script: DOM observer | content.js |
| | XMP beacon detection | detect.js |
| Week 26 | Background worker: fetch .thing | background.js |
| | WASM: libmatter compilation | libmatter.wasm |
| | Signature verification in WASM | verify.wasm |
| | IndexedDB caching | cache.js |
| Week 27 | Overlay UI: Shadow DOM | overlay.js |
| | Product card component | card.js |
| | Styling (isolated CSS) | styles.css |
| | "Buy Now" flow | checkout.js |
| Week 28 | matter:// URI interception | protocol.js |
| | Settings page | settings.html |
| | Error handling | errors.js |
| | Testing & debugging | test_extension.js |

**Milestone: 75% Complete**

#### Sprint 8: Polish & Integration (Aug 18 - Sep 14)

| Week | Tasks | Deliverables |
|------|-------|--------------|
| Week 29 | Extension performance optimization | Optimized code |
| | Bundle size reduction | <100KB target |
| | Cross-browser testing (Chrome, Edge) | Compatibility report |
| | Accessibility review | A11y fixes |
| Week 30 | Integration: compiler + API + extension | Full pipeline test |
| | End-to-end testing | E2E test suite |
| | Bug fixes | Issue resolution |
| | Documentation | User guide |
| Week 31 | Rust port: steganography | steg.rs |
| | Rust port: CLIP client | clip.rs |
| | WASM build optimization | Smaller WASM |
| | Performance benchmarks | Benchmark report |
| Week 32 | Security review (self) | Security checklist |
| | Code cleanup | Refactored code |
| | README updates | Documentation |
| | Prepare for beta | Beta checklist |

**Exit Criteria:**
- [ ] Browser extension functional
- [ ] End-to-end demo working
- [ ] Rust compiler 50-70% complete
- [ ] WASM verification working
- [ ] Ready for beta testing

---

### 2.6 Sprint 9-10: Launch (Sep 15 - Dec 15, 2026)

**Duration:** 13 weeks  
**Objective:** Beta launch and public release

#### Sprint 9: Beta Program (Sep 15 - Oct 26)

| Week | Tasks | Deliverables |
|------|-------|--------------|
| Week 33 | Beta merchant onboarding (5-10) | Merchant accounts |
| | Merchant documentation | Onboarding guide |
| | Support process setup | Support workflow |
| | Feedback collection system | Feedback forms |
| Week 34 | Compile merchant catalogs | 1000+ products |
| | Monitor performance | Metrics dashboard |
| | Bug triage & fixes | Bug fixes |
| | Merchant feedback calls | Feedback notes |
| Week 35 | Iterate on feedback | Updated features |
| | Extension improvements | v0.2 release |
| | API improvements | API updates |
| | Documentation updates | Updated docs |
| Week 36-37 | Continue beta testing | Ongoing support |
| | Stability improvements | Stable release |
| | Performance tuning | Optimized system |
| | Prepare Chrome Web Store | Store assets |

#### Sprint 10: Public Launch (Oct 27 - Dec 15)

| Week | Tasks | Deliverables |
|------|-------|--------------|
| Week 38 | Chrome Web Store submission | Submitted extension |
| | Review response handling | Updates if needed |
| | Landing page | thingsthatmatter.com |
| | Documentation site | docs.thingsthatmatter.com |
| Week 39-40 | Marketing preparation | Blog posts, demos |
| | Developer documentation | SDK docs |
| | API documentation | API reference |
| | Support documentation | FAQ, troubleshooting |
| Week 41-42 | Public launch | Live |
| | Monitor adoption | Analytics |
| | Support incoming users | User support |
| | Bug fixes | Patch releases |
| Week 43-44 | Post-launch stabilization | Stable v1.0 |
| | Retrospective | Lessons learned |
| | Phase 2 planning | Phase 2 roadmap |
| | Year-end wrap | Annual report |

**Milestone: 100% Complete**

**Exit Criteria:**
- [ ] 5-10 beta merchants onboarded
- [ ] 1000+ products compiled
- [ ] Extension in Chrome Web Store
- [ ] Documentation complete
- [ ] Public launch successful

---

## 3. Milestone Summary

| Milestone | Date | Completion | Key Deliverable |
|-----------|------|------------|-----------------|
| Contract Signed | Jan 21, 2026 | 0% | New company agreement |
| Phase 0 Complete | Mar 2, 2026 | 15% | Steganography validation |
| Foundation Complete | Apr 27, 2026 | 30% | Rust compiler MVP |
| Core Complete | Jul 20, 2026 | 50% | Full pipeline working |
| 75% Milestone | Aug 17, 2026 | 75% | Browser extension functional |
| Beta Launch | Oct 26, 2026 | 90% | Merchants onboarded |
| Public Launch | Dec 15, 2026 | 100% | Chrome Web Store live |

---

## 4. Dependencies & Critical Path

### 4.1 Critical Path

```
Contract Sign → Phase 0 → Go/No-Go → FlatBuffers → Rust Compiler
                                           ↓
                                      CLIP Integration
                                           ↓
                                    Steganography Engine
                                           ↓
                                     Shadow Index API
                                           ↓
                                    Browser Extension
                                           ↓
                                      Beta Launch
                                           ↓
                                     Public Launch
```

### 4.2 Dependency Matrix

| Task | Depends On | Blocks |
|------|------------|--------|
| Phase 0 | Contract signed | Go/No-Go decision |
| FlatBuffers schema | Phase 0 Go | Rust compiler |
| Rust compiler | FlatBuffers | Steganography |
| CLIP integration | API account | Rust compiler |
| Ed25519 signing | None | Compiler |
| Steganography | Rust compiler | Shadow Index |
| Shadow Index API | Steganography | Browser extension |
| Browser extension | Shadow Index, WASM | Beta launch |
| Rust optimization | Rust compiler working | Performance tuning |
| Beta launch | Extension, merchants | Public launch |

---

## 5. Risk to Timeline

| Risk | Probability | Impact | Mitigation | Schedule Impact |
|------|-------------|--------|------------|-----------------|
| Phase 0 fails (<50% survival) | Medium | High | Pivot to matter:// | +2 weeks |
| Cursor Pro limits slow dev | Medium | Medium | Batch work | +2-4 weeks |
| CLIP API pricing changes | Low | Medium | Self-host GPU | +4 weeks |
| Chrome rejects extension | Low | High | Firefox first | +4 weeks |
| Rust learning takes longer | Low | Low | C/C++ background accelerates learning | None |
| Merchant adoption slow | Medium | Medium | Developer focus | Shift strategy |

---

## 6. Resource Allocation

### 6.1 Time Allocation by Category

| Category | Hours/Week | % of Time |
|----------|------------|-----------|
| Core development | 20 | 67% |
| Learning (Rust) | 3 | 10% |
| Documentation | 2 | 7% |
| Testing | 3 | 10% |
| Admin/meetings | 2 | 6% |
| **Total** | **30** | **100%** |

### 6.2 Monthly Budget Burn

| Month | Amount | Cumulative | Key Expenses |
|-------|--------|------------|--------------|
| Feb | R8,000 | R8,000 | Phase 0, setup |
| Mar | R6,500 | R14,500 | Development tools |
| Apr | R6,000 | R20,500 | CLIP API |
| May | R6,000 | R26,500 | CLIP, storage |
| Jun | R6,300 | R32,800 | API hosting |
| Jul | R6,000 | R38,800 | Development |
| Aug | R6,200 | R45,000 | Extension dev |
| Sep | R6,000 | R51,000 | Testing |
| Oct | R6,000 | R57,000 | Beta support |
| Nov | R7,500 | R64,500 | Launch prep |
| Dec | R7,500 | R72,000 | Public launch |

---

## 7. Progress Tracking

### 7.1 Weekly Checkpoints

Every Friday:
- [ ] Code committed to repository
- [ ] Progress update to CEO
- [ ] Blockers identified
- [ ] Next week planned

### 7.2 Monthly Demos

First Monday of each month:
- [ ] Working demo of new features
- [ ] Metrics review
- [ ] Budget review
- [ ] Timeline adjustment if needed

### 7.3 Milestone Reviews

At each milestone:
- [ ] Deliverables verified
- [ ] Quality assessment
- [ ] Go/No-Go for next phase
- [ ] Retrospective

---

## 8. Success Criteria by Phase

### Phase 0 Success (Feb 2026)
- [ ] ≥50% steganography survival rate
- [ ] CLIP integration working
- [ ] End-to-end prototype functional
- [ ] Clear Go/No-Go decision

### Foundation Success (Apr 2026)
- [ ] FlatBuffers schema finalized
- [ ] Rust compiler producing valid .thing files
- [ ] <500ms compile time
- [ ] CLI tool operational

### Core Success (Jul 2026)
- [ ] Steganography engine complete
- [ ] Shadow Index API deployed
- [ ] matter:// URIs generating
- [ ] Rust port 30% complete

### Distribution Success (Sep 2026)
- [ ] Browser extension functional
- [ ] End-to-end demo working
- [ ] WASM verification working
- [ ] Ready for beta

### Launch Success (Dec 2026)
- [ ] 5-10 merchants onboarded
- [ ] 1000+ products compiled
- [ ] Extension in Chrome Web Store
- [ ] Public launch complete

---

**Document Version:** 1.0  
**Last Updated:** January 21, 2026  
**Next Review:** Monthly
