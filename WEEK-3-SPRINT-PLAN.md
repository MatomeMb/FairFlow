# Week 3 Sprint Plan: First Real Merchant
## Post-Audit Execution Plan for Controlled Beta Onboarding

**Planning Date:** February 22, 2026  
**Sprint Window:** February 24–28, 2026 (Week 3)  
**Owner:** Matome Mbowene (CTO)  
**Business Lead:** Sobuhle Nyambali (Merchant onboarding + MoR readiness)  
**Reference Inputs:**
- `PIVOT-EXECUTION-ANALYSIS.md` §3.3 (Post-Weekend Priorities)
- `CTO-AUDIT-REPORT.md` (P2 backlog)
- Zoom agreement: Merchant of Record (MoR) bank account model (platform-holds-funds then releases)

---

## Executive Summary

Week 3 has one objective: **enable first real merchant onboarding with zero developer intervention** while preserving the SHIP WITH CAVEATS posture.

**Primary outcome by Friday EOD:** Sobuhle can share one onboarding link and a real merchant can:
1. Register account
2. Complete merchant KYC with low-friction platform flow (no per-merchant Stripe onboarding)
3. Publish products
4. Receive paid orders
5. Fulfill orders and trigger consumer communications
6. See payout state without Matome running manual steps

**Total estimated effort:** **31–40 hours**

**Critical path:**
`MoR payout rail confirmation (Wise vs alternative)` → `merchant self-serve registration/auth` → `payout execution wiring`.

**Monday 13:30 Decision Gate (Blocker):**
Feature 1 implementation is blocked until Sobuhle confirms:
1. Final transfer rail (Wise vs alternative)
2. MoR account readiness and API credentials for selected rail

---

## 1. Feature Delivery Plan

### 1.1 Feature 1 — MoR Payout Wiring via Wise API (Revised)

**Goal:** Execute real merchant payouts from the MoR account to merchant bank accounts through an automated transfer rail.

**Current State:**
- KYC is manual form data in `merchant_accounts.json`
- Payout accounting exists (`pending_payout`, `payout_logs`, commission deduction)
- No real external transfer execution from MoR account

**Target State:**
- Merchant registers payout destination once (recipient mapping)
- `POST /v1/admin/payouts/batch` executes real transfer API calls
- Payout logs progress `pending` → `processing` → `completed`
- Merchant `pending_payout` is cleared after successful transfer
- Next payout cycle date is updated

**Data model additions (MerchantAccount):**
```ts
wise_recipient_id?: string;
next_payout_date?: string;
```

**Required API endpoints:**
- `POST /v1/merchant/wise/register-recipient`
- `POST /v1/admin/payouts/batch` (executes transfer calls)

**Implementation Tasks:**
1. Add payout recipient storage (`wise_recipient_id`) and migration-safe defaults
2. Implement recipient registration endpoint for merchant bank details
3. Implement payout transfer execution in admin batch endpoint
4. Persist transfer IDs and reconcile payout log state transitions
5. Clear `pending_payout` on successful transfer and set `next_payout_date`
6. Add idempotency keying with payout log ID
7. Add failure handling + retry-safe behavior for failed transfers

**Dependencies:**
- **Hard blocker:** Sobuhle confirmation of final payout rail at Monday 13:30 call
- MoR account linked and ready for outbound transfers
- `WISE_API_KEY` (or equivalent provider secret) available in environment

**Estimate:** **8–10 hours**

**Definition of Done:**
- [ ] Merchant can register payout recipient and store recipient ID
- [ ] Payout batch sends real transfer calls from MoR account
- [ ] `payout_logs` state transitions are accurate and auditable
- [ ] `pending_payout` resets only on successful transfer confirmation
- [ ] Failure and retry path is idempotent

---

### 1.2 Feature 2 — Consumer Delivery Tracking Notifications (Fulfillment Email)

**Goal:** Notify consumers after merchant fulfillment so post-payment flow is transparent.

**Current State:**
- Merchant can mark fulfilled
- Consumer receives no shipment/fulfillment communication

**Target State:**
- Fulfillment action triggers SendGrid email to consumer within 30s
- Includes order summary + delivery address + merchant contact

**Backend insertion point:**
- `PATCH /v1/merchant/orders/:id/fulfill` post-status update hook

**Implementation Tasks:**
1. Create `sendConsumerFulfillmentEmail` helper
2. Build template (subject/body + fallback text)
3. Add reply-to merchant email
4. Add non-blocking failure handling (fulfill still succeeds, email failure logged)
5. Add test fixture for fulfilled order email payload

**Dependencies:**
- SendGrid integration already present
- Merchant business email present in merchant account

**Estimate:** **4–5 hours**

**Definition of Done:**
- [ ] Fulfill action dispatches consumer email automatically
- [ ] Email includes order ID short hash, product, delivery address, merchant name
- [ ] Delivery occurs within 30 seconds under normal conditions
- [ ] Failure path is logged without blocking fulfillment mutation

---

### 1.3 Feature 3 — P2: KYC Data Encryption at Rest

**Goal:** Eliminate plaintext KYC persistence risk in storage.

**Current State:**
- KYC payloads are still persisted as readable data on disk

**Target State:**
- AES-256-GCM encryption before write
- Decryption only server-side when required
- API responses remain redacted

**Implementation Tasks:**
1. Add crypto utility (`encryptKycData`, `decryptKycData`)
2. Introduce `KYC_ENCRYPTION_KEY` env requirement and boot-time guard
3. Update KYC write path to encrypted blob storage
4. Add migration routine for existing plaintext records
5. Ensure account responses never expose decrypted payload
6. Add corruption/invalid-key handling path

**Dependencies:**
- `KYC_ENCRYPTION_KEY` provisioned securely per environment
- One-time migration window for existing records

**Estimate:** **4–6 hours**

**Definition of Done:**
- [ ] `merchant_accounts.json` stores encrypted KYC payloads only
- [ ] Existing plaintext records are migrated or flagged for migration
- [ ] API does not expose decrypted fields
- [ ] Invalid-key/decryption failures are handled safely and logged

---

### 1.4 Feature 4 — P2: Write Lock on JSON Files

**Goal:** Prevent race-condition data loss during concurrent writes.

**Current State:**
- Multiple read-modify-write operations can interleave
- Webhook bursts can clobber order/payout/notification updates

**Target State:**
- In-process async mutex applied to all critical JSON write paths

**Implementation Tasks:**
1. Add `FileLock` utility
2. Wrap write operations for:
   - `orders.json`
   - `payout_logs.json`
   - `merchant-products.json`
   - `notifications.json`
3. Add stress test script for concurrent webhook and payout write pressure
4. Add instrumentation around lock wait time

**Dependencies:**
- Single-process runtime assumption for MVP

**Estimate:** **3–4 hours**

**Definition of Done:**
- [ ] Concurrent webhook replay test shows no data loss or malformed JSON
- [ ] Writes are serialized per file key
- [ ] Lock failures/timeouts are observable in logs

---

### 1.5 Feature 5 — Merchant Self-Serve Registration Flow (Critical Path)

**Goal:** Allow first merchant onboarding without Matome creating accounts manually.

**Current State:**
- No `/merchant/register` self-serve path
- Merchant access still operationally developer-mediated

**Target State:**
- `/merchant/register` supports account creation and first-login entry into merchant dashboard
- New merchant defaults to `kyc_status: 'not_started'`
- Merchant is prompted to complete platform KYC immediately after first login

**Implementation Tasks:**
1. Build `/merchant/register` page and validation
2. Add password hashing with bcrypt (or delegated secure auth provider path)
3. Persist merchant account record + role assignment
4. Establish merchant session auth flow for portal routes
5. Remove dependency on hardcoded `VITE_API_KEY` for merchant-facing authentication
6. Add post-registration redirect into dashboard + verification CTA

**Dependencies:**
- Auth model update for merchant sessions
- Route guards updated to support new merchant identity path

**Estimate:** **10–12 hours**

**Definition of Done:**
- [ ] Merchant can register without developer intervention
- [ ] Merchant can log in and access dashboard
- [ ] Merchant record initialized with `kyc_status: 'not_started'`
- [ ] Merchant portal does not require shared hardcoded API key for merchant auth

---

### 1.6 Feature 6 — Basic Fraud Prevention (New)

**Goal:** Add minimal fraud controls for controlled beta without introducing heavy operational overhead.

**Current State:**
- No order velocity control by buyer
- No high-value manual review gate
- No webhook source anomaly logging policy

**Target State:**
- Checkout rate-limits same buyer email to max 5 orders/hour
- Orders above R500 (50000 cents) are flagged for manual review
- Webhook origin metadata is logged and anomalies flagged

**Implementation Tasks:**
1. Add buyer email hourly counter in checkout path
2. Add high-value order flag in order record and merchant notifications
3. Add webhook source logging and non-Stripe-origin warning markers
4. Add basic test coverage for rate-limit + high-value flag paths

**Dependencies:**
- None external; uses existing backend paths

**Estimate:** **2–3 hours**

**Definition of Done:**
- [ ] More than 5 checkout attempts/hour per email are blocked
- [ ] High-value orders are flagged for manual review before fulfillment
- [ ] Webhook source logging is available for audit review

---

## 2. Day-by-Day Execution Plan

| Day | Focus | Deliverables | Hours |
|---|---|---|---|
| **Mon Feb 24** | Sprint kickoff + MoR payout decision gate | Confirm Wise (or final rail), provision credentials, scaffold recipient + payout interfaces | **4–6** |
| **Tue Feb 25** | MoR payout integration | Recipient registration endpoint, payout batch execution, log state transitions | **8–10** |
| **Wed Feb 26** | Merchant self-serve registration/auth | `/merchant/register` flow, bcrypt hashing, merchant session auth, dashboard access without dev action | **10–12** |
| **Thu Feb 27** | Fulfillment email + KYC encryption | Consumer fulfillment email live; KYC encryption utilities + migration implemented | **8–10** |
| **Fri Feb 28** | Write lock + fraud controls + integration retest | File mutex, fraud checks, full Week 3 E2E, P2 retest + report update | **6–8** |

**Total:** **31–40 hours**

---

## 3. Dependencies and Sequencing

### 3.1 External Dependencies
- MoR transfer rail confirmation (Wise vs alternative) at Monday 13:30 call
- MoR account + payout provider credentials provisioned
- SendGrid operational credentials
- Production-safe `KYC_ENCRYPTION_KEY` generation and storage

### 3.2 Internal Dependencies
1. Transfer rail decision before coding payout API integration
2. Merchant registration/auth before true no-developer onboarding
3. KYC encryption before broad beta exposure
4. Write-lock rollout before load/retry-heavy real transactions

### 3.3 Sequence Risk Notes
- If MoR transfer rail decision slips, Feature 1 is blocked
- If merchant session auth slips, onboarding remains developer-dependent
- If encryption migration fails, beta launch risks compliance debt

---

## 4. Week 3 Definition of Done (Global)

### MoR Payout Wiring
- [ ] Merchant payout recipient can be registered and persisted
- [ ] Admin payout batch executes real transfer calls
- [ ] `payout_logs` move through valid lifecycle states
- [ ] `pending_payout` clears only after successful transfer

### Consumer Fulfillment Email
- [ ] Fulfillment triggers consumer email in <30 seconds
- [ ] Email includes product, address, merchant identity, short order ID

### KYC Encryption
- [ ] KYC data encrypted at rest
- [ ] API responses remain redacted
- [ ] Migration path for existing plaintext records complete

### Write Locks
- [ ] Concurrent webhook/payout write tests pass without corruption

### Merchant Registration
- [ ] Merchant can self-register and log in
- [ ] Dashboard access succeeds without developer setup
- [ ] Merchant prompted to complete platform KYC immediately

### Fraud Prevention
- [ ] Checkout rate-limit by buyer email is active
- [ ] High-value orders are flagged for manual review
- [ ] Webhook source anomalies are logged for operations

### P2 Audit Retest
- [ ] `CTO-AUDIT-REPORT.md` updated with Week 3 outcomes
- [ ] P2 items targeted in this sprint marked resolved or explicitly deferred with owner/date
- [ ] Verdict eligible to move from SHIP WITH CAVEATS to SHIP-READY after retest evidence

---

## 5. First Real Merchant Readiness Checklist

Before Sobuhle shares the onboarding link:

```markdown
- [ ] Merchant can register without developer help
- [ ] Merchant can create products and get matter:// URIs
- [ ] Merchant completes platform KYC (no per-merchant Stripe verification)
- [ ] Consumer can buy via ProductPage with delivery address
- [ ] Merchant receives order email + in-app notification
- [ ] Merchant can mark order fulfilled
- [ ] Consumer receives fulfillment email
- [ ] Merchant earnings tracked; payout schedule visible
- [ ] No developer action required at any step
```

---

## 6. Acceptance Gate (Friday EOD)

**GO (Beta Merchant #1):** All checklist items green, no blocking regressions, payout path validated in test mode.  
**NO-GO:** Any failure in merchant self-serve registration, MoR payout execution, or fulfillment communications.

---

## 7. Monday 13:30 Decision Checklist (Feature 1 Blocker)

Before coding MoR payout integration:

- [ ] Sobuhle confirms MoR account setup is complete
- [ ] Sobuhle confirms payout rail (Wise vs alternative provider)
- [ ] Matome receives provider credentials for sandbox/test execution
- [ ] Transfer API constraints for ZAR payouts are documented

If GO criteria are met, Week 3 objective is complete and controlled merchant onboarding begins.
