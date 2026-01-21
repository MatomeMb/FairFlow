# .things that Matter
## Budget & Financial Projections

---

| **Document Information** | |
|--------------------------|---|
| **Company Name** | .things that Matter |
| **Document Type** | Budget & Financial Projections |
| **Version** | 1.0 |
| **Date** | January 21, 2026 |
| **Author** | Matome Mboweni, CTO |

---

## 1. Executive Financial Summary

### 1.1 Year 1 Overview

| Metric | Value |
|--------|-------|
| **Total Budget** | R72,000 ZAR |
| **Timeline** | 11 months (Feb - Dec 2026) |
| **Monthly Average** | R6,545 |
| **Buffer** | 5% (R3,600) |

### 1.2 Budget Philosophy

This is a **lean startup budget** optimized for:
- Maximum runway with minimum capital
- Free tiers wherever possible
- Pay-as-you-go over subscriptions
- Upgrade only when growth demands

---

## 2. Detailed Budget Breakdown

### 2.1 Development Tools - R6,048/year

| Item | Tier | Monthly (USD) | Monthly (ZAR) | Annual (ZAR) |
|------|------|---------------|---------------|--------------|
| Cursor AI | Pro | $20 | R360 | R4,320 |
| GitHub Copilot | Individual | $10 | R180 | R2,160 |
| ngrok | Free | $0 | R0 | R0 |
| Postman | Free | $0 | R0 | R0 |
| VS Code | Free | $0 | R0 | R0 |
| rust-analyzer | Free | $0 | R0 | R0 |
| **Subtotal** | | **$30** | **R540** | **R6,048*** |

*Note: Assumes 11.2 months of subscriptions (some tools paused during setup)

### 2.2 AI & ML APIs - R21,600/year

| Item | Tier | Monthly (USD) | Monthly (ZAR) | Annual (ZAR) |
|------|------|---------------|---------------|--------------|
| GROQ Llama 3.1 | API | $50 | R900 | R10,800 |
| Replicate CLIP | Pay-per-use | $30-50 | R540-900 | R6,480 |
| Anthropic Claude | Pay-as-you-go | $20 | R360 | R4,320 |
| **Subtotal** | | **$100-120** | **R1,800-2,160** | **R21,600** |

**CLIP Cost Projections:**

| Products/Month | Cost/Image | Monthly Cost | Annual Cost |
|----------------|------------|--------------|-------------|
| 100 | R0.40 | R40 | R480 |
| 500 | R0.40 | R200 | R2,400 |
| 1,000 | R0.40 | R400 | R4,800 |
| 2,500 | R0.40 | R1,000 | R12,000 |

**Budget assumes:** ~1,500 products/month average over year

### 2.3 Infrastructure & Hosting - R7,560/year

| Item | Tier | Monthly (USD) | Monthly (ZAR) | Annual (ZAR) |
|------|------|---------------|---------------|--------------|
| Supabase | Free | $0 | R0 | R0 |
| Vercel | Hobby | $0 | R0 | R0 |
| Cloudflare R2 | Pay-as-you-go | $10-50 | R180-900 | R7,560 |
| Redis Cloud | Free | $0 | R0 | R0 |
| **Subtotal** | | **$10-50** | **R180-900** | **R7,560** |

**Cloudflare R2 Cost Projections:**

| Storage | Egress/Month | Monthly Cost | Annual Cost |
|---------|--------------|--------------|-------------|
| 1 GB | 10 GB | R27 | R324 |
| 5 GB | 50 GB | R135 | R1,620 |
| 10 GB | 100 GB | R270 | R3,240 |
| 25 GB | 250 GB | R675 | R8,100 |

**Budget assumes:** Growing from 1GB to 25GB over year

### 2.4 Monitoring & Operations - R0/year

| Item | Tier | Monthly (USD) | Monthly (ZAR) | Annual (ZAR) |
|------|------|---------------|---------------|--------------|
| Sentry | Free | $0 | R0 | R0 |
| UptimeRobot | Free | $0 | R0 | R0 |
| Better Stack | Free | $0 | R0 | R0 |
| Vercel Analytics | Free | $0 | R0 | R0 |
| **Subtotal** | | **$0** | **R0** | **R0** |

### 2.5 Payments & Financial - R10,800/year

| Item | Tier | Monthly (USD) | Monthly (ZAR) | Annual (ZAR) |
|------|------|---------------|---------------|--------------|
| Stripe | Standard | Variable | R900 | R10,800 |
| **Subtotal** | | | **R900** | **R10,800** |

**Note:** Stripe costs scale with revenue. R10,800 assumes ~R370,000 annual transaction volume at 2.9%.

### 2.6 Domains & Publishing - R500/year

| Item | Type | Cost (ZAR) |
|------|------|------------|
| thingsthatmatter.com | Annual | R400 |
| Chrome Web Store | One-time | R100 |
| **Subtotal** | | **R500** |

### 2.7 One-Time Costs - R2,800

| Item | Timing | Cost (ZAR) |
|------|--------|------------|
| Phase 0 Prototype | Feb 2026 | R2,000 |
| Browser Extension Assets | Jun 2026 | R300 |
| WASM Build Tools | Aug 2026 | R200 |
| Contingency | As needed | R300 |
| **Subtotal** | | **R2,800** |

### 2.8 Contingency Buffer - R3,600

| Calculation | Value |
|-------------|-------|
| Base costs | R68,400 |
| Buffer rate | 5% |
| Buffer amount | R3,420 |
| **Rounded** | **R3,600** |

---

## 3. Monthly Cash Flow

### 3.1 Monthly Breakdown

| Month | Dev Tools | AI APIs | Infra | Payments | One-Time | Total | Cumulative |
|-------|-----------|---------|-------|----------|----------|-------|------------|
| Feb | R540 | R1,200 | R180 | R0 | R2,300 | R4,220 | R4,220 |
| Mar | R540 | R1,500 | R270 | R0 | R0 | R2,310 | R6,530 |
| Apr | R540 | R1,800 | R360 | R450 | R0 | R3,150 | R9,680 |
| May | R540 | R1,800 | R450 | R675 | R0 | R3,465 | R13,145 |
| Jun | R540 | R1,800 | R540 | R900 | R300 | R4,080 | R17,225 |
| Jul | R540 | R2,000 | R630 | R900 | R0 | R4,070 | R21,295 |
| Aug | R540 | R2,000 | R720 | R900 | R200 | R4,360 | R25,655 |
| Sep | R540 | R2,200 | R810 | R900 | R0 | R4,450 | R30,105 |
| Oct | R540 | R2,200 | R900 | R1,125 | R0 | R4,765 | R34,870 |
| Nov | R540 | R2,400 | R900 | R1,350 | R0 | R5,190 | R40,060 |
| Dec | R540 | R2,700 | R900 | R1,800 | R0 | R5,940 | R46,000 |
| **Buffer** | | | | | | R3,600 | **R49,600** |

**Note:** This projection totals R49,600, leaving R22,400 operating reserve from the R72,000 budget.

### 3.2 Revised Monthly Allocation

Given the projection above, here is the recommended monthly allocation:

| Month | Amount | Cumulative | Phase |
|-------|--------|------------|-------|
| Feb | R8,000 | R8,000 | Phase 0 + Setup |
| Mar | R6,500 | R14,500 | Phase 0 completion |
| Apr | R6,000 | R20,500 | Foundation |
| May | R6,000 | R26,500 | Foundation |
| Jun | R6,300 | R32,800 | Core development |
| Jul | R6,000 | R38,800 | Core development |
| Aug | R6,200 | R45,000 | Core development |
| Sep | R6,000 | R51,000 | Distribution |
| Oct | R6,000 | R57,000 | Distribution |
| Nov | R7,500 | R64,500 | Launch |
| Dec | R7,500 | R72,000 | Launch |
| **Total** | **R72,000** | | |

---

## 4. Revenue Projections (Phase 1)

### 4.1 Revenue Model Options

| Model | Description | Phase 1 Viability |
|-------|-------------|-------------------|
| **API Access** | Charge per compilation | Possible (beta pricing) |
| **SaaS Subscription** | Monthly merchant fee | Requires adoption |
| **Transaction Fee** | % of sales via .thing | Requires volume |
| **Enterprise Licensing** | White-label compiler | Requires enterprise demand |

### 4.2 Conservative Revenue Projection

**Assumptions:**
- 5-10 beta merchants by end of Phase 1
- Free beta access (no revenue from compilation)
- Focus on adoption over monetization in Year 1

| Quarter | Merchants | Products | Revenue | Notes |
|---------|-----------|----------|---------|-------|
| Q1 2026 | 0 | 0 | R0 | Development |
| Q2 2026 | 2 | 200 | R0 | Beta starts |
| Q3 2026 | 5 | 1,000 | R0 | Beta grows |
| Q4 2026 | 10 | 5,000 | R0 | Public launch |
| **Year 1** | **10** | **5,000** | **R0** | **Adoption focus** |

### 4.3 Year 2 Revenue Scenarios

**Scenario A: Conservative**
- 50 merchants at R500/month = R25,000/month = R300,000/year

**Scenario B: Moderate**
- 100 merchants at R1,000/month = R100,000/month = R1.2M/year

**Scenario C: Optimistic**
- 500 merchants at R2,000/month = R1M/month = R12M/year

---

## 5. Break-Even Analysis

### 5.1 Monthly Operating Costs (Post-Launch)

| Category | Monthly (ZAR) |
|----------|---------------|
| Development Tools | R540 |
| AI APIs | R3,000 |
| Infrastructure | R1,000 |
| Support/Operations | R2,000 |
| **Total** | **R6,540** |

### 5.2 Break-Even Calculation

| Pricing Model | Price/Merchant | Merchants to Break-Even |
|---------------|----------------|-------------------------|
| R500/month | R500 | 14 merchants |
| R1,000/month | R1,000 | 7 merchants |
| R2,000/month | R2,000 | 4 merchants |

### 5.3 Path to Profitability

```
Year 1 (2026): Investment phase
  - R72,000 budget
  - R0 revenue
  - Focus: Build product, gain adoption

Year 2 (2027): Early revenue
  - Target: R300,000 - R1.2M revenue
  - Covers operations + growth investment
  - Focus: Monetization, scale

Year 3 (2028+): Profitability
  - Target: R2M+ revenue
  - Positive cash flow
  - Focus: Phase 3 decentralization
```

---

## 6. Funding Requirements

### 6.1 Year 1 Funding

| Source | Amount | Status |
|--------|--------|--------|
| Founder investment | R72,000 | Required |
| **Total Required** | **R72,000** | |

### 6.2 Contingency Funding

| Scenario | Additional Required | Trigger |
|----------|---------------------|---------|
| Budget overrun (20%) | R14,400 | Costs exceed projections |
| Extended timeline (+3 months) | R20,000 | Delays |
| Upgrade to paid tiers | R30,000 | Scale demands |

### 6.3 Year 2 Funding Options

| Option | Amount | Use |
|--------|--------|-----|
| Revenue-funded | Variable | Operations |
| Seed round | R500K - R2M | Growth, team |
| Grants | R50K - R200K | Development |

---

## 7. Financial Controls

### 7.1 Budget Tracking

| Control | Frequency | Owner |
|---------|-----------|-------|
| Expense logging | Daily | CTO |
| Weekly spend review | Weekly | CTO |
| Monthly budget report | Monthly | CTO → CEO |
| Quarterly financial review | Quarterly | CEO + CTO |

### 7.2 Spending Thresholds

| Amount | Approval Required |
|--------|-------------------|
| <R500 | CTO discretion |
| R500 - R2,000 | CTO with CEO notification |
| R2,000 - R5,000 | CEO approval |
| >R5,000 | CEO + documented justification |

### 7.3 Cost Alerts

| Service | Alert Threshold | Action |
|---------|-----------------|--------|
| Cloudflare R2 | R500/month | Review usage |
| Replicate CLIP | R1,000/month | Optimize batching |
| Stripe | R2,000/month | Verify transaction volume |
| Total monthly | R7,000 | Budget review meeting |

---

## 8. Financial Risks

### 8.1 Cost Overrun Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| CLIP API cost spike | Medium | High | Cache results, batch requests |
| Storage costs exceed estimate | Low | Medium | Compression, cleanup policies |
| Need paid tiers earlier | Medium | Medium | Delay until critical |
| Currency fluctuation (USD) | Medium | Low | Budget in ZAR with margin |

### 8.2 Exchange Rate Sensitivity

| USD/ZAR Rate | Monthly Impact | Annual Impact |
|--------------|----------------|---------------|
| 18.00 | R3,240 | R38,880 |
| **18.50** (budgeted) | R3,330 | R39,960 |
| 19.00 | R3,420 | R41,040 |
| 20.00 | R3,600 | R43,200 |

**Buffer covers:** Up to R1.50 exchange rate movement

---

## 9. Upgrade Decision Framework

### 9.1 When to Upgrade Services

| Service | Current Tier | Upgrade Trigger | New Cost |
|---------|--------------|-----------------|----------|
| Cursor | Pro | Hitting limits every month | +R38,880/year |
| Supabase | Free | >500MB database | +R5,400/year |
| Vercel | Hobby | Commercial traffic | +R4,320/year |
| Sentry | Free | >5K errors/month | +R5,616/year |

### 9.2 Upgrade Priority Order

1. **Supabase** (if database limit hit) - Critical for functionality
2. **Vercel** (if commercial use required) - Legal compliance
3. **Cursor** (if productivity significantly impacted) - Developer efficiency
4. **Sentry** (if error visibility needed) - Quality

---

## 10. Financial Summary

### 10.1 Year 1 P&L Projection

| Line Item | Amount (ZAR) |
|-----------|--------------|
| **Revenue** | R0 |
| **Expenses** | |
| Development Tools | (R6,048) |
| AI & ML APIs | (R21,600) |
| Infrastructure | (R7,560) |
| Payments & Financial | (R10,800) |
| Domains & Publishing | (R500) |
| One-Time Costs | (R2,800) |
| Buffer | (R3,600) |
| **Total Expenses** | **(R52,908)** |
| **Operating Reserve** | **R19,092** |
| **Net Position** | **(R72,000)** investment |

### 10.2 Key Metrics

| Metric | Target |
|--------|--------|
| Monthly burn rate | <R6,500 average |
| Runway | 11 months |
| Operating reserve | >R15,000 |
| Break-even merchants | 7-14 (depending on pricing) |

---

## 11. Document Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| CEO | Sobuhle Nyambali | _________________ | ___/___/2026 |
| CTO | Matome Mboweni | _________________ | ___/___/2026 |

---

**Document Version:** 1.0  
**Last Updated:** January 21, 2026  
**Next Review:** Monthly
