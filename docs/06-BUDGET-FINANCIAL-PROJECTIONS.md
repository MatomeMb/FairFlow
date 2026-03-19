# Budget and Financial Projections

Comprehensive financial planning for fairflow from bootstrap phase through Series A profitability.

---

## Executive Summary

**Current Status:** Self-funded MVP, targeting break-even by Month 9.

**Key Metrics:**
- **Current Burn Rate:** ~R 2,500/month (free tier infrastructure)
- **Target Monthly Revenue (Month 12):** R 180,000 (6% commission on R 3M GMV)
- **Break-Even Point:** Month 9 with 200+ active merchants, R 2.5M monthly GMV
- **Funding Required for Scale:** R 500K for Year 2 (marketing, infrastructure, team)

---

## Current Cost Structure (MVP Phase - Months 1-3)

### Infrastructure Costs

| Service | Tier | Monthly Cost | Notes |
|---------|------|-------------|-------|
| **Supabase** | Free | R 0 | 500 MB DB, auth, realtime |
| **Cloudflare R2** | Free tier | R 0 | ≤ 50GB storage, CAP |
| **Vercel** | Hobby (Free) | R 0 | Shadow API + Auth Portal, 100 GB bandwidth |
| **PayStack** | Per transaction | ~R 500 | 2.5% + R 5 per transaction (assumes R 20K GMV) |
| **Custom Domain** | Annual | R 25 | fairflow.co.za registration |
| **Development Tools** | — | R 0 | GitHub (free), VS Code, local development |
| **Total Monthly** | — | **~R 525** | (Domain amortized to ~R 42/month) |

### Personnel Costs

| Role | Allocation | Monthly | Notes |
|------|-----------|---------|-------|
| **Founder/CTO** | 50% | R 0 | Sweat equity, deferred salary |
| **Founder/CEO** | 50% | R 0 | Sweat equity, deferred salary |
| **Total** | 100% | **R 0** | Bootstrap phase |

### Operating Costs

| Item | Monthly | Notes |
|------|---------|-------|
| Server infrastructure | R 500 | Vercel, Supabase, R2 |
| Domain & utilities | R 50 | Email, domain, tools |
| Marketing | R 0 | Organic, bootstrapped |
| Legal/Compliance | R 0 | (Deferred to Series A) |
| **Total Operating** | **R 550** | Minimal operational overhead |

**Total Burn Rate (MVP):** ~R 550/month

---

## Revenue Model

### Commission Structure

fairflow earns **6% transaction commission** on all purchases processed through the platform.

**Example Transaction:**

```
Product Price:        R 500.00
Commission (6%):      R 30.00
Merchant Receives:    R 470.00

fairflow Payout:      R 30.00
PayStack Fee (2.5%):  R 12.50
fairflow Net:         R 17.50
```

### Unit Economics (Per Transaction)

| Metric | Amount | % of Sale |
|--------|--------|-----------|
| Gross Sale | R 500 | 100% |
| fairflow Commission | R 30 | 6% |
| PayStack Gateway Fee | R 12.50 | 2.5% |
| Platform Margin (fairflow) | R 17.50 | 3.5% |

**Key Insight:** Platform margin is effectively **3.5% of GMV** after payment processor fees.

### Revenue by Merchant Cohort

Projections assume 50 new merchants onboard each month, with varying sales velocity:

| Cohort | Merchants | Avg GMV/Month | fairflow Commission | Combined Revenue |
|--------|-----------|---------------|-------------------|------------------|
| **Month 1** | 10 | R 20K | R 1,200 | R 1,200 |
| **Month 2** | 10 (old) + 20 (new) | R 35K | R 2,100 | R 3,300 |
| **Month 3** | 30 + 30 | R 80K | R 4,800 | R 8,100 |
| **Month 6** | 150 merchants | R 400K | R 24,000 | R 32,400 |
| **Month 9** | 200 merchants | R 1.2M | R 72,000 | R 108,000 |
| **Month 12** | 250 merchants | R 2.5M | R 150,000 | R 225,000 |

**Assumptions:**
- Average merchant GMV ramps from R 2K (Month 1) to R 10K (Month 12)
- Retention: 85% month-over-month
- Churn mostly driven by low-performing merchants exiting after 3-6 months

---

## Break-Even Analysis

### Monthly Cost vs. Revenue

| Month | Merchants | GMV | Revenue (6% commission) | Operating Costs | Net Cash Flow | Cumulative |
|-------|-----------|-----|----------------------|-----------------|---------------|-----------|
| 1 | 10 | R 20K | R 1,200 | R 2,000 | (R 800) | (R 800) |
| 2 | 30 | R 60K | R 3,600 | R 2,000 | +R 1,600 | (R 800) |
| 3 | 60 | R 120K | R 7,200 | R 3,000 | +R 4,200 | R 3,400 |
| 4 | 100 | R 250K | R 15,000 | R 3,500 | +R 11,500 | R 14,900 |
| 5 | 140 | R 400K | R 24,000 | R 4,000 | +R 20,000 | R 34,900 |
| 6 | 180 | R 600K | R 36,000 | R 5,000 | +R 31,000 | R 65,900 |
| 7 | 210 | R 900K | R 54,000 | R 6,000 | +R 48,000 | R 113,900 |
| 8 | 240 | R 1.2M | R 72,000 | R 7,500 | +R 64,500 | R 178,400 |
| 9 | 270 | R 1.5M | R 90,000 | R 9,000 | +R 81,000 | R 259,400 |
| 10 | 290 | R 1.8M | R 108,000 | R 10,000 | +R 98,000 | R 357,400 |
| 11 | 310 | R 2.0M | R 120,000 | R 11,000 | +R 109,000 | R 466,400 |
| 12 | 330 | R 2.5M | R 150,000 | R 12,500 | +R 137,500 | R 603,900 |

**Break-Even Point: Month 6** (when monthly revenue exceeds monthly operating costs)

**Cumulative Profitability: Month 9** (cumulative cash flow becomes positive)

### Operating Cost Assumptions

**Month 1-3 (MVP Phase):**
- Infrastructure: R 500/month
- Founder salary: R 0 (sweat equity)
- Tools: R 50/month
- Marketing: R 500/month (bootstrap)

**Month 4-6 (Beta Growth):**
- Infrastructure: R 1,500/month (Supabase paid tier, Vercel upgrades)
- Part-time contractor: R 1,500/month (backend support)
- Marketing: R 2,000/month (paid acquisition test)

**Month 7-12 (Scale Phase):**
- Infrastructure: R 3,000-5,000/month (databases, CDN, API scaling)
- Team: R 5,000-7,000/month (2 junior developers)
- Marketing: R 3,000-5,000/month (content, paid ads)
- Legal/Compliance: R 1,000-2,000/month (regulatory, insurance)

---

## 12-Month Growth Projections

### Merchant Acquisition

```
Month 1:    10 merchants (founder networks)
Month 2:    +20 merchants (40 total)
Month 3:    +30 merchants (70 total)
Month 4:    +40 merchants (110 total)
Month 5:    +50 merchants (160 total)
Month 6:    +40 merchants (200 total)
Month 7:    +35 merchants (235 total) — retention leveling off
Month 8:    +30 merchants (265 total)
Month 9:    +25 merchants (290 total)
Month 10:   +20 merchants (310 total)
Month 11:   +20 merchants (330 total)
Month 12:   +20 merchants (350 total)
```

**Acquisition Strategy:**
- Months 1-3: Founder networks, LinkedIn outreach, Twitter
- Months 4-6: Influencer partnerships, user-generated content
- Months 7-12: Paid acquisition (Google Ads, social), referral program

### GMV Growth & Merchant Velocity

Average merchant GMV growth trajectory:

```
Month 1:    R 2,000/month per merchant
Month 3:    R 3,500/month per merchant
Month 6:    R 3,300/month per merchant (new cohorts drag down avg)
Month 9:    R 5,500/month per merchant
Month 12:   R 7,200/month per merchant
```

### Cash Runway & Funding

| Metric | Value |
|--------|-------|
| Initial Seed Capital | R 20,000 (personal) |
| Burn through Year 1 | R 40,000 (covers first 3-4 months @ R 2.5K/month) |
| Profitability Timeline | Month 9 cumulative break-even |
| Year 1 Net Profit | +R 603,900 (if projections hold) |

**Conclusion:** Platform reaches positive cash flow within 6-9 months; no external funding required to reach MVP viability.

---

## Funding Requirements (Year 2 & Beyond)

### Series A Round (Target: R 500K)

**Use of Funds:**

| Item | Amount | Percentage | Purpose |
|------|--------|-----------|---------|
| **Marketing & Growth** | R 250K | 50% | Paid user acquisition, content marketing, influencer partnerships |
| **Product Development** | R 150K | 30% | 2 FTE engineers, infrastructure, feature development |
| **Operations & Legal** | R 75K | 15% | Compliance, insurance, office, HR infrastructure |
| **Contingency** | R 25K | 5% | Buffer for unexpected costs |

**Hiring Plan (Year 2):**
- Backend Engineer (2 FTE): R 180K/year each
- Frontend Engineer (1 FTE): R 150K/year
- Product Manager (1 FTE): R 160K/year
- Operations Manager (1 FTE): R 120K/year

**Total Year 2 Payroll:** ~R 810K

---

## Risk Scenarios & Sensitivity

### Conservative Case (70% of Projections)

If merchant acquisition ramps more slowly or GMV/merchant is lower:

| Scenario | Month 9 GMV | Break-Even | Year 1 Net |
|----------|-------------|-----------|-----------|
| **Conservative** | R 1M | Month 10 | +R 150K |
| **Base Case** | R 1.5M | Month 9 | +R 604K |
| **Optimistic** | R 2.5M | Month 7 | +R 900K |

### Downside Risks

1. **Merchant churn > 20%** → Break-even delays to Month 12
2. **GMV per merchant 40% lower** → Revenue scales slower, requires Series A funding
3. **Platform fee pressure** → Competitors force commission below 5%
4. **Payment processor fees increase** → Margin compression (currently: 3.5% net)

### Upside Opportunities

1. **Network effects** → Referral-driven growth accelerates Year 2
2. **Enterprise merchants** → Large vendors with R 50K+ monthly GMV
3. **Value-added services** → Logistics integration, financing, insurance
4. **Geographic expansion** → Launch in Nigeria, Kenya (VISA processing, USSD)

---

## Financial Metrics Summary

### Profitability Timeline

- **Year 1:** +R 604K net profit (Month 9: break-even)
- **Year 2:** Projected +R 2.5M net profit (assuming Series A fully deployed)
- **Year 3:** Projected +R 6M net profit (300+ merchants, R 8M+ monthly GMV)

### Unit Economics

**Customer Acquisition Cost (CAC)**

```
Year 1: R 500 per merchant (organic, founder network)
Year 2: R 2,000 per merchant (paid ads, influencers)
Year 3: +R 3,500 per merchant (mature market)

CAC Payback Period: 3-4 months (based on R 15K avg GMV/merchant)
```

**Lifetime Value (LTV)**

```
Avg merchant tenure: 24 months
Avg monthly GMV: R 5,000
Commission: 6% = R 300/month
Total LTV: R 7,200

LTV:CAC Ratio = 7,200 / 2,000 = 3.6x (healthy economics)
```

### Valuation Approach

**Conservative (Year 2 Revenue Multiple):**
- Year 2 Projected Revenue: R 3.6M
- SaaS Valuation (8x multiple): R 28.8M

**Venture (GMV Multiple):**
- Year 2 Projected GMV: R 30M+
- Fintech GMV Multiple (2-5%): R 15M - R 30M valuation

---

## Comparison: Self-Funded vs. External Funding

### Self-Funded Path (Current)

**Pros:**
- 100% founder equity retention
- No VC dilution, board seats, or reporting requirements
- Full autonomy over product and hiring decisions

**Cons:**
- Slower team scaling (limited operational cash until profitability)
- Limited marketing budget vs. well-funded competitors
- Risk of being outcompeted by venture-backed alternatives

**Timeline:** Reach R 5M ARR by Year 2, Series A from position of strength

### Immediate Series A Path (Alternative)

**R 500K Series A (35% dilution):**
- Accelerate hiring (team of 8 by Month 6)
- 10x marketing spend for aggressive TAM capture
- Faster feature velocity and merchant onboarding
- Target: R 15M ARR by Year 2

**Trade-off:** Founder ownership drops from 100% to 65%, but potentially larger exit value

---

## Recommendation

**Execute self-funded path through Month 6-9 break-even, then raise Series A from position of traction.**

**Rationale:**
- Founders prove product-market fit with real merchant adoption
- Reduction in execution risk improves valuation
- Negotiating from profitability vs. burn rate strengthens terms
- Flexibility to pivot based on early learnings

---

## See Also

- [03-PRODUCT-REQUIREMENTS-DOCUMENT.md](./03-PRODUCT-REQUIREMENTS-DOCUMENT.md) — Feature roadmap and prioritization
- [05-RISK-ASSESSMENT.md](./05-RISK-ASSESSMENT.md) — Market and operational risks
- [20-SECURITY-HARDENING.md](./20-SECURITY-HARDENING.md) — Security and compliance costs

