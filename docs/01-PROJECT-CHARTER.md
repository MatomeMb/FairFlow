# Project Charter: fairflow

**Document Version:** 1.0  
**Effective Date:** March 2026  
**Status:** Active

---

## 1. Vision Statement

fairflow builds portable, self-sovereign commerce infrastructure. Products become cryptographically signed digital objects (.thing files) that carry their own identity, pricing, and checkout logic. They can be embedded in images, shared via matter:// URIs, and resolved by AI agents or browser extensions — freeing commerce from walled-garden platforms.

---

## 2. Mission

Make commerce portable, viral, and universally accessible — for humans today, AI agents tomorrow, and a decentralized economy in the future.

---

## 3. Objectives

Build and launch the fairflow Commerce Compiler and distribution network targeting South African merchants initially, then expanding globally. Key objectives:

- Compile products into .thing artifacts
- Distribute via browser extension (Lens)
- Process payments via Stripe
- Provide merchant analytics

---

## 4. Scope

**In scope:**

- Commerce Compiler (Rust)
- Shadow Index API (Node.js)
- Auth Portal (React)
- Browser Extension (Chrome)
- Analytics Pipeline

**Out of scope (for now):**

- Mobile applications
- Blockchain integration
- Multi-currency beyond ZAR

---

## 5. Stakeholders

| Role | Name | Responsibilities |
|------|------|------------------|
| CEO | Sobuhle Nyambali | Strategy, partnerships, fundraising |
| CTO | Matome Mboweni | Technical architecture, development |

---

## 6. Success Criteria

- 10 merchant pilots by Sprint 5
- 100 compiled products
- Resolve latency under 500ms
- Uptime above 95%
- Browser extension published in Chrome Web Store

---

## 7. Timeline

- **Duration:** 8 sprints (January–May 2026)
- **Sprint 0–2:** Complete
- **Sprint 3:** In progress (Analytics MVP-14)
- **Sprint 4+:** Beta readiness

---

## 8. Governance

- Weekly sprint reviews
- Bi-weekly stakeholder demos
- Git-based version control
- CI/CD for automated quality gates

---

## 9. Risks

| Risk | Mitigation |
|------|------------|
| Platform dependency (Chrome extension approval) | Follow Chrome Web Store policies; maintain fallback distribution options |
| Payment processing compliance (PCI) | Use Stripe for PCI-compliant payment handling |
| Data privacy (POPIA for SA merchants) | Implement POPIA-compliant data handling; document data flows and consent |

---

## 10. Budget

**Phase:** Self-funded

**Infrastructure costs:**

- Supabase: Free tier
- Cloudflare R2: Free tier
- Vercel: Hobby tier
- Stripe: 2.9% + R5 per transaction

---

*This charter serves as the authoritative reference for project scope, objectives, and governance. Amendments require stakeholder approval.*
