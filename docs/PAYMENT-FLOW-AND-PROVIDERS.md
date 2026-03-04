# Payment Flow & Provider Options for fairflow

**Prepared for:** Sobuhle Nyambali  
**Date:** Monday, 2 March 2026  
**Context:** Routing payments while waiting for CIPC and business banking

---

## 1. How Stripe Payment Flow Works

### The Journey of Money

```
Customer pays → Stripe (holds funds) → Your bank account (payout)
```

**Step by step:**

1. **Customer initiates payment** – Card/checkout on your site
2. **Authorization** – Customer's bank verifies funds and approves
3. **Capture** – Stripe captures the payment; funds move from customer's bank into **Stripe's merchant account** (Stripe holds the money)
4. **Settlement** – Card networks settle (typically 1–3 business days)
5. **Payout** – Stripe transfers from their account to **your bank account** on your payout schedule (daily/weekly/monthly)

### Key points

- **Stripe holds the funds** between capture and payout. It acts as the intermediary.
- **Payout speed:** Usually T+2 or T+3 (transaction date + 2–3 business days). First payout often 7–14 days.
- **Payout schedule:** You choose daily, weekly, or monthly automatic payouts.
- **No extra payout fee** – included in Stripe’s 2.9% + R5 per transaction.

### Wiring to a personal card/account

- Stripe can pay out to a **personal bank account** for sole proprietors.
- You add bank details in Stripe Dashboard → Settings → Bank accounts.
- For **Instant Payouts** (funds in ~30 min), you need a supported debit card – currently US, Canada, UK, Singapore. Not available in South Africa yet.
- In South Africa, standard payouts go to a linked bank account (personal or business).

---

## 2. South African Providers (Stripe Alternatives)

These can work while you wait for CIPC and business banking:

| Provider | CIPC required? | Monthly fee | Transaction fee | Notes |
|----------|----------------|-------------|-----------------|-------|
| **Yoco** | **No** (optional) | None | 2.5% | 200k+ businesses, payment links, online checkout, API. Fast signup. |
| **Payfast** | Varies | None | Per transaction | 18+ methods, Instant EFT, QR. Established SA gateway. |
| **iKhokha** | Varies | None | Per transaction | Payment links, invoicing, webstore, API. |
| **SnapScan** | Varies | None | Per transaction | Next-day settlement (Standard Bank). WooCommerce, Shopify. |
| **ZakPay** | Varies | None | Per transaction | Mobile-first, QR, payment links. No website needed. |

### Recommended first check: **Yoco**

- CIPC registration is **not mandatory** for signup.
- Signup in ~5 minutes.
- Profile completion: ID, address, bank details, business details.
- Many merchants verified within ~15 minutes.
- Must be sole owner, director, partner, or trustee.
- 2.5% per transaction, no monthly fees.
- Supports payment links, online checkout, and e‑commerce integrations.

---

## 3. Suggested Next Steps

1. **Today:** Try Yoco signup with Sobuhle’s details (personal bank account, ID, address).
2. **If Yoco needs more docs:** Try Payfast and iKhokha with the same approach.
3. **If none work without CIPC:** Use Stripe with Sobuhle’s personal bank account for payouts.
4. **fairflow integration:** Your stack already uses Stripe (see `API_KEYS_GUIDE.md`). If you switch to Yoco/Payfast, you’ll need to update the payment integration in `shadow-index`.

---

## 4. Summary for Sobuhle

**Payment flow:** Customer pays → Stripe (or provider) holds funds → Payout to your bank on a schedule. You don’t “pull” money out; the provider pushes it to your account.

**Options:** Yoco first (no CIPC required), then Payfast/iKhokha. If needed, Stripe with a personal bank account.

**Timeline:** Can start accepting payments this week if Yoco or Stripe + personal account works.
