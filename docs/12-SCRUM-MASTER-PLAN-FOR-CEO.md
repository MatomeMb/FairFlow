# .things that Matter
## Scrum Master Plan for CEO (Complete Project)

---

| **Document Information** | |
|--------------------------|---|
| **Company Name** | .things that Matter |
| **Document Type** | Scrum Master Plan (Executive Summary) |
| **Version** | 1.0 |
| **Date** | February 2, 2026 |
| **Author** | CTO & Scrum Master |
| **Audience** | CEO (Product Owner) |

---

## Executive Summary

This document outlines the **complete Scrum strategy** for delivering .things that Matter from MVP (Feb 2026) through a full product launch by Q3 2026. The approach emphasizes **iterative delivery, continuous stakeholder feedback, and risk mitigation** through short 2-week sprints that ship working increments at the end of each cycle.

**Key Commitments:**
- MVP (v0) delivered end of **Sprint 1** (Feb 16, 2026)
- Full MVP capabilities by **Sprint 4** (March 30, 2026)
- Beta features + scaling by **Q2 2026**
- Production readiness by **Q3 2026**

---

## 1. Product Vision & Release Plan

### 1.1 Release Phases

| Phase | Timeline | Goal | Key Deliverable |
|-------|----------|------|-----------------|
| **MVP v0** | Feb 3–16 | Vertical slice: compile → resolve → display | Demo-ready, testable |
| **MVP v1** | Feb 17–Mar 2 | Core pipeline complete | Batch ops, XMP detection |
| **MVP v2** | Mar 3–16 | Full feature parity | Merchant tools, analytics |
| **Beta** | Mar 17–30 | Performance & UX hardening | Real merchant feedback |
| **Production** | Apr–Jun | Scaling & ops maturity | Public launch ready |

### 1.2 Release Roadmap (6-Month View)

```
Feb 2026          Mar 2026           Apr–Jun 2026
├─ Sprint 1       ├─ Sprint 3–4      ├─ Sprint 5–8
│  MVP v0         │  MVP v1–v2       │  Beta → Prod
│  (Feb 3–16)     │  (Mar 3–30)      │  Scaling
│                 │                  │
└─ Complete      └─ Core features   └─ Production
   compile path    + tools            + ops
```

---

## 2. Scrum Framework (Solo Team)

### 2.1 Roles

| Role | Owner | Responsibilities |
|------|-------|------------------|
| **Product Owner** | CEO | Business value, priority, acceptance, merchant feedback |
| **Scrum Master** | CTO | Process health, blockers, sprint facilitation |
| **Development Team** | CTO | Implementation, testing, deployment |

### 2.2 Sprint Cadence (2-Week Cycles)

Each sprint follows a **"Build → Evaluate → Test → Ship"** loop:

#### **Sprint Ceremonies**

| Ceremony | Owner | Duration | When | Purpose |
|----------|-------|----------|------|---------|
| **Planning** | CTO (Scrum Master) | 60–90 min | Day 1 (Monday) | Align on sprint goal, backlog items |
| **Daily Standup** | CTO | 10 min | Daily (Mon–Fri @ 9 AM) | Status, blockers, help needed |
| **Refinement** | CTO + CEO | 30 min | Mid-sprint (Wednesday) | Clarify upcoming stories, adjust scope |
| **Demo/Review** | CTO + CEO | 30 min | Day 10 (Friday) | Show working increment, gather feedback |
| **Retro** | CTO + CEO | 30 min | Day 10 (Friday) | Process improvements |

#### **Weekly Release Schedule**

- **Friday EOD (Day 10):** Sprint increment shipped or tagged
- **Monday AM:** Next sprint planning
- **Rolling metrics:** Tracked daily, reported at retro

---

## 3. Definition of Done (Universal)

All work must meet these criteria before marking **Done**:

- ✅ **Code:** Builds without errors, no warnings (or documented technical debt)
- ✅ **Tests:** Unit + integration tests written and passing (>80% coverage for MVP)
- ✅ **Acceptance Criteria:** Story meets all defined criteria (confirmed by CEO)
- ✅ **Documentation:** Code comments, API docs, or user docs updated
- ✅ **Deployment:** Increment is deployable or shipped to staging/production
- ✅ **No Known Defects:** Critical bugs fixed before sprint end
- ✅ **Demo-Ready:** Can be shown to stakeholders without "work in progress" caveats

---

## 4. Sprint Structure & Backlog Tiers

### 4.1 Product Backlog Tiers

| Tier | Description | Example |
|------|-------------|---------|
| **P0 (Must-Have)** | Blocks MVP launch, high business value | Compile, resolve, display |
| **P1 (Should-Have)** | Rounds out MVP, moderate risk | XMP detection, batch ops |
| **P2 (Nice-to-Have)** | Post-MVP, low risk, nice UX | Analytics, caching |

### 4.2 Story Sizing Rule

- **Stories > 2 days → SPLIT**
- **Stories < 2 hours → GROUP**
- Target: 3–5 stories per sprint for solo dev

### 4.3 Backlog Evolution

Each sprint:
1. **Planning:** Pull P0 + P1 items into sprint backlog
2. **Mid-Sprint Refinement:** Adjust scope if needed, prepare next sprint
3. **Review:** Showcase working increment
4. **Retro:** Reflect on process, velocity, quality

---

## 5. Complete Release Timeline (Sprints 1–8)

### Sprint 1: MVP v0 – Vertical Slice (Feb 3–16)
**Goal:** Compile → resolve → display

| Item | Status | Acceptance Criteria |
|------|--------|---------------------|
| MVP-01: Compile product JSON to `.thing` | Not Started | CLI/API produces valid `.thing` |
| MVP-02: Generate `matter://` URI | Not Started | URI matches compiled artifact |
| MVP-04: Resolve hash via Shadow Index | Not Started | API returns gist + artifact URLs |
| MVP-05: Minimal UI renders product | Not Started | UI displays title, price, image |
| MVP-06: MVP path tests | Not Started | E2E tests cover compile → display |

**Friday Release:** Demo-ready increment, all tests passing

---

### Sprint 2: MVP v0 Polish + XMP Basics (Feb 17–Mar 2)
**Goal:** Stabilize v0, begin XMP detection

| Item | Estimated | Acceptance Criteria |
|------|-----------|---------------------|
| MVP-03: Store artifacts in R2 | 2 days | `.thing` + image persist, retrievable |
| MVP-07: XMP beacon detection (basic) | 2 days | Detects beacon in product images |
| MVP-09: Error handling polish | 2 days | Meaningful errors for all flows |
| Platform Testing Phase 0 (ongoing) | Async | Log results, track survival rate |

**Friday Release:** Stable MVP v0 + basic steganography detection

---

### Sprint 3: MVP v1 – Batch & Tools (Mar 3–9)
**Goal:** Scale compile, add merchant tools

| Item | Estimated | Acceptance Criteria |
|------|-----------|---------------------|
| MVP-11: Batch compilation | 2–3 days | Compile 100+ products in one request |
| MVP-09: Basic auth + rate limits | 2 days | API keys enforced, limits tracked |
| MVP-10: Platform test harness results | 2 days | Results logged to JSON, reported |

**Friday Release:** MVP v1 with batch compilation

---

### Sprint 4: MVP v2 – Dashboard & Analytics (Mar 10–23)
**Goal:** Add merchant visibility, metrics

| Item | Estimated | Acceptance Criteria |
|------|-----------|---------------------|
| MVP-08: Merchant catalog import | 2 days | CSV/JSON ingestion works |
| MVP-14: Analytics events | 2 days | Track views, clicks, shares |
| MVP-13: Extension caching | 2 days | IndexedDB cache works, fallback ok |
| Performance tuning | 1 day | CLIP inference + storage optimized |

**Friday Release:** MVP v2 with analytics and merchant dashboard

---

### Sprint 5: Performance & Beta Prep (Mar 24–Apr 6)
**Goal:** Harden system, prepare for beta

| Item | Estimated | Acceptance Criteria |
|------|-----------|---------------------|
| Load testing + optimization | 3 days | 1000+ RPS tested, latency < 500ms |
| Error recovery + retries | 2 days | Graceful failures, automatic retries |
| Documentation (user + ops) | 2 days | Runbook, FAQ, setup guide complete |

**Friday Release:** Performance-optimized, beta-ready build

---

### Sprint 6: Beta Launch (Apr 7–20)
**Goal:** Closed beta with 5–10 merchants

| Item | Estimated | Acceptance Criteria |
|------|-----------|---------------------|
| Deploy to staging | 1 day | Full pipeline staging-ready |
| Merchant onboarding flow | 2 days | Self-service or manual, works end-to-end |
| Beta feedback loop | 2 days | Collect issues, prioritize fixes |
| Production deployment prep | 1 day | Security review, ops runbook done |

**Friday Release:** Beta environment live, first cohort onboarded

---

### Sprint 7: Beta Fixes & Hardening (Apr 21–May 4)
**Goal:** Address beta feedback, production readiness

| Item | Estimated | Acceptance Criteria |
|------|-----------|---------------------|
| Fix critical beta issues | 2–3 days | Blockers resolved, retested |
| Security audit + fixes | 2 days | Pen test results addressed |
| Ops monitoring + alerting | 2 days | Production metrics, on-call runbook |

**Friday Release:** Production-ready build

---

### Sprint 8: Production Launch (May 5–18)
**Goal:** Public launch

| Item | Estimated | Acceptance Criteria |
|------|-----------|---------------------|
| Final cutover & comms | 1 day | DNS, redirect, launch announcement ready |
| Production deployment | 1 day | Zero-downtime deploy, rollback plan tested |
| Launch monitoring | 2 days | Metrics tracked, support on-call |
| Post-launch metrics review | 1 day | KPIs vs. targets, retro notes |

**Friday Release:** 🚀 **Public Launch**

---

## 6. Risk Management & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| **Steganography survival (XMP/CLIP) fails in production** | Blocks core feature | Medium | Phase 0 platform testing + beta real-world tests |
| **API latency too high for user experience** | User churn | Medium | Load test early (Sprint 5), optimize CLIP inference |
| **R2 storage costs exceed budget** | Financial impact | Low | Monitor usage, optimize image compression, CDN caching |
| **Merchant integration takes longer than planned** | Delays revenue | Medium | Mock API early, split import tool into P1 |
| **Single developer bottleneck** | Scope creep, burnout | High | Strict sprint goals, P0/P1/P2 triage, technical debt paydown |
| **Authentication/security gaps discovered late** | Launch delay | Low | Security review in Sprint 7, pen test early |

**Mitigation Strategy:**
- Weekly blockers check (standup)
- Monthly retro to adjust timeline if needed
- P0/P1/P2 triage allows scope flexibility without delays
- Continuous Phase 0 testing of core steganography pipeline

---

## 7. Capacity & Velocity Planning

### 7.1 Team Capacity

**Solo Developer (CTO):**
- **Available:** 40 hours/week = 8 hours/day × 5 days
- **Admin/Comms:** ~20% (5 hours) → **Coding capacity: 32 hours/week per sprint**
- **Contingency:** 10% for bugs/tech debt → **Effective capacity: ~28 hours/week**

### 7.2 Velocity Assumptions

| Phase | Velocity (Story Points) | Assumption |
|-------|-------------------------|-----------|
| Sprint 1 (MVP v0) | 13 pts | High focus, minimal context switching |
| Sprint 2–4 (MVP features) | 10–12 pts | Adding complexity, more testing |
| Sprint 5–8 (Beta + Prod) | 8–10 pts | Performance work, hardening, process overhead |

**Adjustment Rule:** If velocity drops below 8 pts 2 sprints in a row, extend timeline or reduce scope.

---

## 8. Metrics & KPIs

### 8.1 Process Metrics (Tracked Weekly)

| Metric | Target | Tool |
|--------|--------|------|
| **Sprint Goal Success Rate** | 100% | Manual review at retro |
| **Cycle Time (story start → done)** | < 3 days average | Jira/Manual tracking |
| **Defect Escape Rate** | < 2% (bugs found post-release) | QA tracking |
| **Code Coverage** | > 80% (MVP), > 70% (overall) | CI/CD pipeline |
| **Velocity** | Consistent ±15% sprint-to-sprint | Burndown chart |

### 8.2 Business Metrics (Tracked Monthly)

| Metric | Sprint 1 | Sprint 4 | Sprint 8 |
|--------|----------|----------|----------|
| **Time-to-Merchant-First-Product** | N/A | < 1 hour | < 15 min |
| **Steganography Survival Rate** | Phase 0 baseline | > 95% | > 98% |
| **API SLA Uptime** | N/A | 99.5% | 99.9% |
| **Support Tickets** | N/A | < 5/day | < 2/day |

---

## 9. Communication & Reporting

### 9.1 Stakeholder Updates

| Stakeholder | Frequency | Format | Topics |
|-------------|-----------|--------|--------|
| **CEO (Product Owner)** | Daily (standup) | Slack + 10 min sync | Blockers, progress, priority changes |
| **CEO (Sprint Review)** | Weekly (Friday EOD) | Demo | Working increment, feedback |
| **CEO (Retro)** | Weekly (Friday) | 30 min meeting | What worked, what didn't, velocity |

### 9.2 External Communication (Investors/Advisors)

| Update | Frequency | Audience | Content |
|--------|-----------|----------|---------|
| **Sprint Report** | Bi-weekly | Investors | Velocity, risks, timeline adjustments |
| **Phase Summary** | Monthly | Board | MVP progress, merchant readiness, burn rate |
| **Milestone Demo** | Per phase end | All | Live demo, metrics review, next phase preview |

---

## 10. Definition of Success (Launch Criteria)

For each phase to close, ALL of these must be met:

### MVP v0 (End of Sprint 1)
- ✅ Compile + resolve + display works end-to-end
- ✅ All tests passing
- ✅ CEO can demo to advisors without workarounds
- ✅ No P0 bugs open

### MVP v1–v2 (End of Sprint 4)
- ✅ All MVP features (batch, auth, detection, analytics) working
- ✅ Merchant onboarding flow validated
- ✅ Performance targets met (< 500ms latency, > 99.5% uptime in staging)
- ✅ No P0 bugs, < 3 P1 bugs open

### Beta (End of Sprint 6)
- ✅ 5–10 merchants successfully onboarded
- ✅ At least 100 products compiled and resolved
- ✅ Steganography detected in > 90% of beta images
- ✅ Zero security vulnerabilities found

### Production (End of Sprint 8)
- ✅ Public API live, documented
- ✅ 99.9% uptime on production
- ✅ Support runbook tested and staffed
- ✅ First cohort of merchants live, positive feedback

---

## 11. Backlog Grooming & Scope Management

### 11.1 Backlog Prioritization Rules

1. **P0 must be done in current sprint** before any P1 is started
2. **Any P1 blocking P0** gets escalated to P0
3. **Nice-to-have (P2) only if sprint capacity allows** after P0/P1 complete
4. **Recurring tasks** (Phase 0 testing, tech debt) get 10% of sprint capacity

### 11.2 Scope Flexibility

| Scenario | Action |
|----------|--------|
| Sprint goal achieved early | Add highest P1 item |
| Blocker discovered mid-sprint | Reassess scope, escalate to CEO |
| Velocity drops > 20% | Extend timeline 1 sprint, review root cause |
| New high-priority merchant request | Add to next sprint planning, don't disrupt current |

---

## 12. Tools & Automation

| Tool | Purpose | Owner |
|------|---------|-------|
| **GitHub** | Source control, PR reviews | CTO |
| **Jira/Linear** | Sprint planning, backlog, burndown | CTO (manual) |
| **CI/CD (GitHub Actions)** | Auto test, build, deploy | CTO |
| **Slack** | Daily standup, blockers | CTO + CEO |
| **Loom/Screen Recordings** | Sprint demos, onboarding | CTO |

---

## 13. Next Steps (Start Sprint 1)

### Week of Feb 3, 2026

- [ ] Monday 9 AM: Sprint 1 Planning (90 min)
  - Confirm MVP v0 goal
  - Assign items, define acceptance criteria
  - Identify dependencies and risks
- [ ] Daily: 10 min standup (9:15 AM)
- [ ] Wednesday: Mid-sprint refinement (30 min)
  - Adjust scope if needed
  - Preview Sprint 2 backlog
- [ ] Friday 3 PM: Sprint 1 Review + Demo (30 min)
  - Show working compile → resolve → display flow
  - CEO feedback
- [ ] Friday 3:45 PM: Retro (30 min)
  - What went well?
  - What was hard?
  - Velocity baseline

---

## 14. FAQ for CEO

**Q: Why 2-week sprints?**  
A: Short cycles let us get feedback fast, adjust course if needed, and ship frequently. You see working code every Friday.

**Q: What if a sprint slips?**  
A: We triage: P0 items must ship on time. P1/P2 items move to next sprint. We retro on root causes and adjust.

**Q: Can we add a feature mid-sprint?**  
A: Only if it's higher priority than current items and scope-equivalent. Otherwise, it goes in the backlog for next sprint.

**Q: How do we handle bugs found in production?**  
A: Critical bugs are P0 and pulled into the sprint immediately. All others are triaged and queued in the backlog.

**Q: Will we really launch in Q2 2026?**  
A: Yes, if velocity stays consistent and no major platform risks materialize. Phase 0 testing is our insurance policy against steganography failures.

---

## Approval & Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| **CEO (Product Owner)** | [CEO Name] | ________________ | Feb 2, 2026 |
| **CTO (Scrum Master)** | Matome Mboweni | ________________ | Feb 2, 2026 |

---

**Document Version History:**
- v1.0 (Feb 2, 2026) – Initial plan, Sprints 1–8 outlined

**Next Review:** End of Sprint 1 (Feb 16, 2026) – Velocity baseline, timeline adjustment if needed

---

*This plan is a living document. It will be reviewed and adjusted at the end of each sprint based on actual velocity, risks, and market feedback.*
