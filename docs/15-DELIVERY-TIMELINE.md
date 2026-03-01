# Delivery Timeline

Revised 8-sprint schedule (Feb - May 2026). Current status: [PROGRESS-AND-VERSION.md](./PROGRESS-AND-VERSION.md).

---

## Overview

| Sprint | Period | Goal | Version |
|--------|--------|------|---------|
| Sprint 0 | By Jan 19, 2026 | Setup and architecture | - |
| Sprint 1 | Jan 20 - Feb 5, 2026 | MVP vertical slice: compile-resolve-display | v0.4.0 |
| Sprint 2 | Feb 6 - 19, 2026 | MVP-13 IndexedDB cache, cross-browser | v0.5.0 |
| Sprint 3 | Feb 20 - Mar 5, 2026 | MVP-14 Analytics, observability | v0.6.0 |
| Sprint 4 | Mar 6 - 19, 2026 | Beta readiness | - |
| Sprint 5 | Mar 20 - Apr 2, 2026 | Beta launch prep | - |
| Sprint 6 | Apr 3 - 16, 2026 | Extension 1.0, merchant tooling | - |
| Sprint 7 | Apr 17 - 30, 2026 | Beta program | - |
| Sprint 8 | May 1 - 14, 2026 | Public launch prep | - |

---

## Current Status (March 2026)

- **Sprint 3 complete.** Tag v0.6.0 on main.
- **Sprint 4 next:** Beta readiness, merchant onboarding polish, KYC completion, Chrome Web Store prep.

---

## Milestones

| Milestone | Target |
|-----------|--------|
| 10 merchant pilots | Sprint 5 |
| 100 compiled products | Sprint 5 |
| Chrome Web Store submission | Sprint 6 |
| Beta program launch | Sprint 7 |
| Public launch | Sprint 8 |

---

## Dependencies

- Supabase (auth, optional DB)
- Stripe (payments)
- Cloudflare R2 (artifact storage)
- Vercel (API hosting, optional)
