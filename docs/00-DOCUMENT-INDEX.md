# .things that Matter
## Project Documentation Index

---

| **Company Name** | .things that Matter |
|------------------|---------------------|
| **Document Set Version** | 1.0 |
| **Date Created** | January 21, 2026 |
| **Total Documents** | 7 Core Documents + Execution Guide + Scrum Pack (3) |

---

## Document Overview

This folder contains the complete project documentation for **.things that Matter**, a company building infrastructure for **Object-Oriented Commerce** — portable, viral product distribution via `matter://` URIs and a browser extension.

**Current status (March 2026):** Sprints 1–4 complete. MVP path live: compile → R2/local storage → resolve → matter:// → extension overlay; batch and catalog import (POST /batch, POST /catalog/import) and lite merchant demo (catalog-upload.html) delivered. Release **v0.4.0** tagged. Next: **Sprint 5** (MVP-13 extension caching). Day-by-day work and realistic estimates: [16-WEEKLY-WORK-PLAN.md](./16-WEEKLY-WORK-PLAN.md). Timeline and milestones: [15-DELIVERY-TIMELINE.md](./15-DELIVERY-TIMELINE.md).

---

## Document List

| # | Document | Purpose | Pages |
|---|----------|---------|-------|
| 01 | [Project Charter](./01-PROJECT-CHARTER.md) | Company vision, objectives, governance, budget summary | ~10 |
| 02 | [Technical Architecture](./02-TECHNICAL-ARCHITECTURE.md) | System design, components, data flow, security | ~15 |
| 03 | [Product Requirements (PRD)](./03-PRODUCT-REQUIREMENTS-DOCUMENT.md) | 3-phase strategy, features, user stories, success metrics | ~20 |
| 04 | [Development Roadmap](./04-DEVELOPMENT-ROADMAP.md) | Sprint breakdown, milestones, timeline, dependencies | ~15 |
| 05 | [Risk Assessment](./05-RISK-ASSESSMENT.md) | Risk register, analysis, mitigation strategies | ~12 |
| 06 | [Budget & Financials](./06-BUDGET-FINANCIAL-PROJECTIONS.md) | Detailed budget, cash flow, revenue projections | ~10 |
| **CTO** | [**CTO Execution Guide**](./CTO-EXECUTION-GUIDE.md) | **Step-by-step professional guide for CTO execution** | **~30** |
| 09 | [Scrum Operating Model](./09-SCRUM-OPERATING-MODEL.md) | Scrum cadence, DoD, build-evaluate-test-ship loop | ~5 |
| 10 | [MVP Backlog](./10-MVP-BACKLOG.md) | Prioritized MVP scope and acceptance criteria | ~4 |
| 11 | [Sprint 1 Plan](./11-SPRINT-1-PLAN.md) | Sprint 1 goal, backlog, and DoD | ~3 |
| 12 | [Sprint 2 Plan](./12-SPRINT-2-PLAN.md) | Sprint 2 (P1) goal, backlog, and DoD | ~2 |
| — | [**Progress and Version**](./PROGRESS-AND-VERSION.md) | **Code version, sprint state, P1 stage** | ~2 |
| — | [**CTO Next Steps (Sprint 1 closeout)**](./CTO-NEXT-STEPS-SPRINT-1-CLOSEOUT.md) | **Post–Sprint 1 actions and Sprint 2 readiness** | ~2 |
| 13 | [Sprint 3 Plan](./13-SPRINT-3-PLAN.md) | Sprint 3 (R2 + Rust compiler) goal, backlog, DoD | ~2 |
| 14 | [**Sprint 4 Plan**](./14-SPRINT-4-PLAN.md) | **Sprint 4 (bulk ingestion): POST /batch, POST /catalog/import, optional merchant dashboard** | ~6 |
| 15 | [**Delivery Timeline (Feb–May 2026)**](./15-DELIVERY-TIMELINE.md) | **8-sprint timeline: current status, actuals (S1–4), realistic S5–8, milestones** | ~8 |
| 16 | [**Weekly Work Plan**](./16-WEEKLY-WORK-PLAN.md) | **Day-by-day work for each week; realistic hour estimates; Sprints 5–8 daily tasks** | ~10 |
| — | [**Next Steps (Sprint 3)**](./NEXT-STEPS-SPRINT-3.md) | **Step-by-step R2 setup, .env, verify-r2, Day 2 API wiring (with links)** | ~4 |
| — | [**CTO Next Steps (Sprint 2 closeout)**](./CTO-NEXT-STEPS-SPRINT-2-CLOSEOUT.md) | **Sprint 2 closeout, test verification, tag, CEO sync, Sprint 3 scope** | ~2 |
| — | [**CEO Sync (Sprint 2)**](./CEO-SYNC-SPRINT-2.md) | **Brief on Sprint 2 features delivered and Sprint 3 scope** | ~1 |
| — | [**Project State Clarification**](./PROJECT-STATE-CLARIFICATION.md) | **Verification results, date paradox resolution, Sprint 1 checklist** | ~2 |

---

## Quick Reference

### Company Vision
**Make commerce portable, viral, and universally accessible — for humans today, AI agents tomorrow, and a decentralized economy in the future.**

### Three Strategic Phases

| Phase | Focus | Moat | Timeline |
|-------|-------|------|----------|
| **Phase 1** | Viral Commerce | Accessibility | 2026 |
| **Phase 2** | Agentic Commerce | Energy Efficiency | 2027 |
| **Phase 3** | Decentralized Commerce | Decentralization | 2028+ |

### Key Numbers

| Metric | Value |
|--------|-------|
| Year 1 Budget | R72,000 |
| Timeline | 11 months |
| Team Size | 2 (CEO + CTO) |
| Target Merchants | 5-10 beta |
| Target Products | 10,000 compiled |

### Key Milestones (Revised — see [15-DELIVERY-TIMELINE](./15-DELIVERY-TIMELINE.md))

| Date | Milestone | Status |
|------|-----------|--------|
| Jan 21, 2026 | Contract signed | Done |
| Feb 16, 2026 | Phase 0 / MVP slice (compile → overlay) | Done |
| Mar 2, 2026 | P1 hardening (XMP, auth, errors) | Done |
| Mar 16, 2026 | R2 + Rust compiler (30%) | Done |
| Mar 30, 2026 | Batch + catalog (50%) | Done |
| May 25, 2026 | Caching, analytics, beta prep (75%) | Planned |
| Sep 30, 2026 | Beta launch (90%) | Planned |
| Dec 15, 2026 | Public launch (100%) | Planned |

---

## Core Technology Stack

| Component | Technology |
|-----------|------------|
| Binary Format | FlatBuffers |
| Compiler | Rust |
| Semantic AI | CLIP ViT-B/32 |
| Cryptography | Ed25519 |
| Distribution | Steganography + matter:// URI |
| Storage | Cloudflare R2 |
| Database | Supabase (PostgreSQL) |
| API Hosting | Vercel |
| Browser Extension | Chrome (Manifest v3) |

---

## Key Risks

| Risk | Score | Mitigation |
|------|-------|------------|
| Steganography fails | HIGH | Phase 0 validation, hybrid approach |
| No merchant adoption | HIGH | Developer-first, open source |
| Budget overrun | HIGH | Weekly tracking, hard limits |
| Solo developer burnout | HIGH | Sustainable pace, rest policy |
| Scope creep | HIGH | Feature freeze after Phase 0 |

---

## Approval Status

| Document | CTO | CEO |
|----------|-----|-----|
| Project Charter | Pending | Pending |
| Technical Architecture | Pending | - |
| Product Requirements | Pending | Pending |
| Development Roadmap | Pending | Pending |
| Risk Assessment | Pending | Pending |
| Budget & Financials | Pending | Pending |

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 21, 2026 | M. Mboweni | Initial creation |
| 1.1 | Mar 2026 | M. Mboweni | Delivery timeline (15), revised milestones, Sprint 4 complete; single source of truth: [15-DELIVERY-TIMELINE.md](./15-DELIVERY-TIMELINE.md) |
| 1.2 | Mar 2026 | M. Mboweni | Weekly work plan (16) with day-by-day and estimates; expanded 15 with current status; PROGRESS and Scrum model updated; backlog status column |

---

## Next Steps

1. **Sprint 5 planning** (MVP-13 caching, extension polish) — see [15-DELIVERY-TIMELINE.md](./15-DELIVERY-TIMELINE.md).
2. **Align budget and roadmap** with revised milestone dates (Phase 1 to Dec 2026).
3. **CEO sync** on revised timeline and beta target (Sep 2026).

---

**Prepared by:** Matome Mboweni, CTO  
**For:** Sobuhle Nyambali, CEO  
**Date:** January 21, 2026
