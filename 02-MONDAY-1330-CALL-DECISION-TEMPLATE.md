# Monday 13:30 Call — Decision Template
Quick links: [Demo Script](01-DEMO-SCRIPT.md) · [Decision Template](02-MONDAY-1330-CALL-DECISION-TEMPLATE.md) · [Live Notes](03-MONDAY-1330-CALL-NOTES.md)

Two minutes at the top of the call. Matome reads this, Sobuhle answers, and Feature 1 is either unblocked or scoped around.

---

## Opening (30 seconds)

> Before I show you what we built this week, I need two quick answers from you — they determine what I build first in Week 3. Everything else is already scoped and ready to go.

---

## Decision 1: MoR Bank Account

> Last Thursday you committed to researching a bank account to hold consumer payments before releasing them to merchants. Three options usually come up for South African fintechs:
>
> - Wise Business — easy API, good for ZAR transfers, works for the Wise payout integration I've already scoped
> - Standard Bank or FNB Business Account — traditional route, requires manual EFT or their API (slower)
> - Peach Payments — South African payment processor, handles splitting and payouts natively
>
> Which of these did your research land on — or did something else come up?

Matome listens and records the answer. This determines the payout API for Feature 1.

| Sobuhle's answer | Matome's action |
|---|---|
| Wise Business | Proceed with Wise API integration as scoped |
| Standard Bank / FNB | Use manual EFT for MVP; automate in Week 4 |
| Peach Payments | Replace Wise scope with Peach Payments API |
| Still researching | Feature 1 deferred; Matome proceeds with Features 2–6 this week |

---

## Decision 2: First Beta Merchant

> By end of Week 3 the platform will support self-serve merchant registration — no developer involvement needed. Do you have someone specific in mind as merchant number one? I need to know:
>
> 1. Are they comfortable with a simple KYC form for now (no Stripe, just ID number and bank details)?
> 2. Do they have a product with an image URL ready, or do we need an image upload feature before they can go live?
> 3. What category — coffee, textiles, food? I want to make sure the ConsumerShop displays correctly for their product type.

Why this matters: If the first merchant needs image upload (not just image URL), that becomes an unscoped Feature 7 and needs to land before registration opens.

---

## Demo Sequence (after decisions are recorded)

Run through the five scenes from 01-DEMO-SCRIPT.md in order. When the demo ends, close with:

> Everything you see here was built in five days. The platform is audit-clean — all security blockers resolved, TypeScript errors zero. Week 3 unlocks the first real merchant. I just need your bank decision and I start Feature 1 tomorrow.

---

## What to Have Open Before the Call

- Tab 1: http://localhost:5178/merchant  ← dashboard (Scene 1, 3, 4, 5)
- Tab 2: http://localhost:5178/product/[hash]  ← ProductPage (Scene 2)
- Tab 3: Merchant email inbox  ← notification email (Scene 3)
- Stripe listener running in background terminal

---

Good luck. The build speaks for itself.
