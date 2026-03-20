# Engineering review: Fairflow user manuals (`docs/manuals/`)

## Update — March 2026

**PDFs v1.1** in this directory incorporated the bulk of the corrections below (fulfilment wording, notifications, admin login path, security hygiene, portability / `matter://` where applicable).  
**Code** now matches the manuals on major audit items (e.g. merchant routes + `MerchantPortalGuard`, soft archive, `price_cents`, admin KYC field mapping, payouts dual-auth headers).

Treat the remainder of this document as a **historical review record** and checklist for the next PDF revision cycle—not as a list of current production blockers.

---

**Original scope:** `fairflow_merchant_manual.pdf`, `fairflow_beta_manual_v2.pdf`  
**Reviewed against:** `packages/auth-portal` routes/UI, `packages/shadow-index` merchant JWT (`issueMerchantToken`).

---

## Executive summary (historical)

| Document | Strengths | Critical gaps |
|----------|-----------|----------------|
| **Merchant manual** | Clear IA, URLs match SPA routes, 7-day merchant JWT matches code | Order fulfilment steps **do not match the live UI**; omits **Notifications**; no portable product (`.thing` / `matter://`) story |
| **Beta tester manual** | End-to-end script; good checkpoints; webhook/email failure notes | **Security hygiene** (shared test password in PDF); admin entry path imprecise; order UI steps slightly wrong |

**Portability proof:** Both manuals prove the **hosted web** merchant/admin journey (`/product/:hash`, dashboards). They do **not** yet document **data portability** (Matter URI, `.thing`, compiling links) that the product surface exposes in the merchant UI.

---

## Functional accuracy vs codebase

### Confirmed correct

- Routes: `/merchant/register`, `/merchant/login`, `/dashboard/merchant`, `/dashboard/admin`, `/product/:hash` align with `PortalRouter.tsx`.
- Merchant JWT lifetime **7 days** matches `issueMerchantToken` (`exp: now + 7d`) in `packages/shadow-index/api/index.ts`.
- Beta flow: Paystack test card + incognito consumer matches intended separation of roles.
- Admin nav: **KYC Approvals** and **Payouts** exist (`useAdminNavigation.ts`: `kyc-management` → label “KYC Approvals”, `payouts` → “Payouts”). Order in sidebar: Financials then Payouts — matches manual.

### Merchant manual — must fix (high)

1. **Order fulfilment**  
   - Manual: “Mark **Fulfilled**”, optional slip.  
   - **Actual UI** (`MerchantOrders.tsx`): merchants **upload a shipment slip**, then **“Mark as Shipped”** (disabled until slip exists). There is no visible “Mark Fulfilled” button; `onMarkAsFulfilled` is wired but unused in the orders UI.  
   - **Action:** Rewrite §6 to: upload slip → Mark as Shipped; describe payout/held states as shown in UI (payment/fulfilment), not only “Pending / Fulfilled / Cancelled”.

2. **Notifications**  
   - Portal tabs include **Notifications** (`MerchantPortal.tsx`).  
   - Manual TOC / “you are in when” list omits it.  
   - **Action:** Add Notifications to tab overview (optional: note bell shortcut in header).

3. **Tab labels**  
   - UI uses **“My Products”** and **“My Account”**, not “Products” / “My Account” only. Align wording.

### Beta manual — should fix (medium)

1. **§4 — Open order**  
   - Orders are **cards**, not necessarily “click the row”. Say “find the order card for R150” / “review details on the card”.

2. **§6 — Admin login**  
   - Going to `/dashboard/admin` unauthenticated typically hits **role guard / redirect to login**. Prefer: open `/login`, sign in as CEO/CTO, confirm redirect to `/dashboard/admin`.

3. **§3 — Paystack**  
   - Product flow may show **“Continue to Payment”** before address step (`ProductPage.tsx`). Mention both button labels if testers get stuck.

---

## Security & compliance

| Issue | Risk | Recommendation |
|-------|------|----------------|
| **Hard-coded test password** `TestPassword123!` in beta manual Quick Reference | Credential reuse, leakage if PDF is shared | Replace with “generate a **unique** strong password per tester; do not reuse across environments.” Remove literal password from distributable PDF or rotate and treat as throwaway only. |
| **Synthetic SA ID** `8001015009087` | Looks like a valid-format ID; POPIA/realism concerns | Label explicitly as **fictitious test data only**; never use a real person’s ID. Prefer stating “use sandbox-only dummy values approved by compliance.” |
| **Admin credentials** (“you already have these”) | OK if 1:1 beta; avoid implying shared accounts | Prefer per-tester admin invites or SSO; document **no shared production admin**. |
| **“Confidential” footer** | Good | Keep; ensure PDFs are not in public repos without redaction if they contain internal names (already present). |

---

## Quality & clarity (both manuals)

- **Consistency:** Merchant manual uses “fairflow” / “Fairflow” mixed; pick one for customer-facing copy.
- **Beta scorecard:** Strong; add rows for **shipment slip + Mark as Shipped** and **order confirmation URL** (`/order/confirmation` vs success) if you see confusion in the field.
- **Email steps:** Accurate to note Resend/`RESEND_API_KEY` / env — already hinted in §7 note; keep.

---

## Portability narrative (merchant + admin)

To **prove portability** beyond “works on fairflow.co.za”, add a short subsection to the **merchant** manual:

- Each product can expose a **`matter://…` URI** and/or compiled **`.thing`** artifact (when compilation succeeds) — merchants can copy from the dashboard alongside the **HTTPS product link**.
- **Web checkout** remains the primary beta path; **Matter URI** is the portable identity for listings outside the portal.

Admin manual section (or beta doc): optional line that **approving KYC / releasing payouts** is the same workflow regardless of where the product link was shared (proves **platform** portability, not consumer client).

---

## Suggested verification checklist (for next PDF revision)

- [ ] Merchant §6 matches: **Upload slip → Mark as Shipped**; describe **Held / Shipped / Released**-style badges if shown.  
- [ ] Mention **Notifications** tab (and bell).  
- [ ] Tab names match UI: **My Products**, **KYC & Payouts**, **My Account**.  
- [ ] Beta §6: login via **`/login`** then admin dashboard.  
- [ ] Remove or generalize **literal** test password; mark KYC ID as **fictitious**.  
- [ ] Optional **one paragraph** on `matter://` / shareable HTTPS link for portability.

---

*Review generated from extracted PDF text and repository state; re-validate after major UI changes.*
