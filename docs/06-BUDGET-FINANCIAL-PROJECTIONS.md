# .things that Matter
## Budget & Financial Projections

---

| **Document Information** | |
|--------------------------|---|
| **Company Name** | .things that Matter |
| **Document Type** | Budget & Financial Projections |
| **Version** | 1.1 |
| **Date** | February 2026 |
| **Author** | Matome Mbowene, CTO |

---

## 1. Executive Financial Summary

### 1.1 Year 1 Overview

| Metric | Value |
|--------|-------|
| **Total Budget** | R82,000 ZAR (revised) |
| **Timeline** | 11 months (Feb - Dec 2026) |
| **Monthly Tech Baseline** | R5,800 (Jan 2026 actual) |
| **Monthly Average** | ~R7,450 |
| **Buffer** | 5% (R3,900) |

*Revision (Feb 2026): Budget updated to reflect realistic sole-developer costs. Jan 2026 development spend: R5,800 (invoiced 10 Jan). Previous R72,000 assumed lean tiers; enterprise-grade infra requires higher baseline.*

### 1.2 Budget Philosophy

**Internal document — CTO execution budget.** This budget is calibrated to support enterprise-grade platform delivery by a sole technical lead. Baseline technical spend is R5,800 per month (validated January 2026).

- Technical allocation covers development tooling, APIs, infrastructure, and operations
- Tier selection prioritises delivery velocity; free tiers used where sufficient
- Detailed line items are for internal planning; external reporting uses aggregate figures

---

## 2. Detailed Budget Breakdown

### 2.1 Development Tools - R33,000/year

| Item | Tier | Monthly (USD) | Monthly (ZAR) | Annual (ZAR) |
|------|------|---------------|---------------|--------------|
| Cursor AI | Business/Ultra | $120 | R2,220 | R26,640 |
| GitHub Copilot | Business | $19 | R350 | R4,200 |
| ngrok, Postman, misc | As needed | $10 | R185 | R2,220 |
| VS Code, rust-analyzer | Free | $0 | R0 | R0 |
| **Subtotal** | | **~$149** | **~R2,755** | **~R33,060** |

*Note: Enterprise tiers required for sole developer building full-stack enterprise infra. Cursor Ultra/Business avoids limit bottlenecks; Copilot Business for team-ready tooling. Based on Jan 2026 actual spend pattern.*

### 2.2 AI & ML APIs - R26,400/year

| Item | Tier | Monthly (USD) | Monthly (ZAR) | Annual (ZAR) |
|------|------|---------------|---------------|--------------|
| Anthropic Claude | API | $38 | R700 | R8,400 |
| GROQ Llama 3.1 | API | $49 | R900 | R10,800 |
| Replicate CLIP | Pay-per-use | $32 | R600 | R7,200 |
| **Subtotal** | | **~$119** | **~R2,200** | **~R26,400** |

**CLIP Cost Projections:**

| Products/Month | Cost/Image | Monthly Cost | Annual Cost |
|----------------|------------|--------------|-------------|
| 100 | R0.40 | R40 | R480 |
| 500 | R0.40 | R200 | R2,400 |
| 1,000 | R0.40 | R400 | R4,800 |
| 2,500 | R0.40 | R1,000 | R12,000 |

**Budget assumes:** ~1,500 products/month average; higher API use during active development. Based on Jan 2026 actual spend.

### 2.3 Infrastructure & Hosting - R7,800/year

| Item | Tier | Monthly (USD) | Monthly (ZAR) | Annual (ZAR) |
|------|------|---------------|---------------|--------------|
| Cloudflare R2 | Pay-as-you-go | $22 | R400 | R4,800 |
| Vercel | Pro (if commercial) | $11 | R200 | R2,400 |
| Supabase | Free | $0 | R0 | R0 |
| Domains, SSL, misc | Annual amortized | $3 | R60 | R600 |
| **Subtotal** | | **~$36** | **~R650** | **~R7,800** |

**Cloudflare R2 Cost Projections:**

| Storage | Egress/Month | Monthly Cost | Annual Cost |
|---------|--------------|--------------|-------------|
| 1 GB | 10 GB | R27 | R324 |
| 5 GB | 50 GB | R135 | R1,620 |
| 10 GB | 100 GB | R270 | R3,240 |
| 25 GB | 250 GB | R675 | R8,100 |

**Budget assumes:** Enterprise-grade hosting; R2 scaling with product catalog; Vercel Pro when staging/commercial required.

### 2.4 Monitoring & Operations - R2,400/year

| Item | Tier | Monthly (USD) | Monthly (ZAR) | Annual (ZAR) |
|------|------|---------------|---------------|--------------|
| Sentry / error tracking | Team (if needed) | $11 | R200 | R2,400 |
| UptimeRobot, Better Stack | Free | $0 | R0 | R0 |
| Vercel Analytics | Free | $0 | R0 | R0 |
| **Subtotal** | | **~$11** | **~R200** | **~R2,400** |

*Note: Sentry Team tier when production error volume demands; otherwise free tier.*

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

### 2.8 Contingency Buffer - R3,900

| Calculation | Value |
|-------------|-------|
| Base costs | ~R78,100 |
| Buffer rate | 5% |
| Buffer amount | ~R3,900 |
| **Rounded** | **R3,900** |

---

## 3. Monthly Cash Flow

### 3.1 Monthly Breakdown (Revised — Realistic Sole-Developer Costs)

*Baseline: R5,800/month tech spend (Jan 2026 actual). Dev tools R2,755 + AI R2,200 + Infra R650 + Monitoring R200.*

| Month | Dev Tools | AI APIs | Infra | Monitor | Payments | One-Time | Total | Cumulative |
|-------|-----------|---------|-------|---------|----------|----------|-------|------------|
| Feb | R2,755 | R2,200 | R650 | R200 | R0 | R2,300 | R8,105 | R8,105 |
| Mar | R2,755 | R2,200 | R650 | R200 | R0 | R0 | R5,805 | R13,910 |
| Apr | R2,755 | R2,200 | R650 | R200 | R450 | R0 | R6,255 | R20,165 |
| May | R2,755 | R2,200 | R650 | R200 | R675 | R0 | R6,480 | R26,645 |
| Jun | R2,755 | R2,200 | R650 | R200 | R900 | R300 | R7,005 | R33,650 |
| Jul | R2,755 | R2,200 | R650 | R200 | R900 | R0 | R6,705 | R40,355 |
| Aug | R2,755 | R2,200 | R650 | R200 | R900 | R200 | R6,905 | R47,260 |
| Sep | R2,755 | R2,200 | R650 | R200 | R900 | R0 | R6,705 | R53,965 |
| Oct | R2,755 | R2,200 | R650 | R200 | R1,125 | R0 | R6,930 | R60,895 |
| Nov | R2,755 | R2,200 | R650 | R200 | R1,350 | R0 | R7,155 | R68,050 |
| Dec | R2,755 | R2,200 | R650 | R200 | R1,800 | R0 | R7,605 | R75,655 |
| **Buffer** | | | | | | | R3,900 | **R79,555** |
| **Domains** | | | | | | R500 | R500 | **R80,055** |

**Note:** Tech subtotal ~R63,800; payments ~R10,800; one-time R2,800; buffer R3,900; domains R500. Total ~R81,800. R82,000 budget accommodates this.

### 3.2 Revised Monthly Allocation

| Month | Amount | Cumulative | Phase |
|-------|--------|------------|-------|
| Feb | R8,100 | R8,100 | Phase 0 + Setup |
| Mar | R5,800 | R13,900 | Phase 0 completion |
| Apr | R6,300 | R20,200 | Foundation |
| May | R6,500 | R26,700 | Foundation |
| Jun | R7,000 | R33,700 | Core development |
| Jul | R6,700 | R40,400 | Core development |
| Aug | R6,900 | R47,300 | Core development |
| Sep | R6,700 | R54,000 | Distribution |
| Oct | R6,900 | R60,900 | Distribution |
| Nov | R7,200 | R68,100 | Launch |
| Dec | R7,600 | R75,700 | Launch |
| Buffer + domains | R6,300 | **R82,000** | |
| **Total** | **R82,000** | | |

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
| Development Tools | R2,755 |
| AI APIs | R2,200 |
| Infrastructure | R650 |
| Monitoring | R200 |
| Support/Operations | R1,000 |
| **Total** | **R6,805** |

### 5.2 Break-Even Calculation

| Pricing Model | Price/Merchant | Merchants to Break-Even |
|---------------|----------------|-------------------------|
| R500/month | R500 | 14 merchants |
| R1,000/month | R1,000 | 7 merchants |
| R2,000/month | R2,000 | 4 merchants |

### 5.3 Path to Profitability

```
Year 1 (2026): Investment phase
  - R82,000 budget (revised for realistic sole-developer tech costs)
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
| Founder investment | R82,000 | Required |
| **Total Required** | **R82,000** | |

*Revised Feb 2026 to reflect realistic sole-developer tech costs (R5,800/mo baseline).*

### 6.2 Contingency Funding

| Scenario | Additional Required | Trigger |
|----------|---------------------|---------|
| Budget overrun (20%) | R16,400 | Costs exceed projections |
| Extended timeline (+3 months) | R24,600 | Delays |
| Upgrade to paid tiers | R5,000–10,000 | Scale demands |

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
| Dev tools (Cursor/Copilot) | R3,000/month | Verify tier, usage |
| Total monthly tech | R6,500 | Budget review if exceeded |

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
| CTO | Matome Mbowene | _________________ | ___/___/2026 |

---

**Document Version:** 1.1  
**Last Updated:** February 2026  
**Next Review:** Monthly  
**Revision note:** Budget revised to reflect Jan 2026 actual spend (R5,800 development, 10 Jan). Realistic sole-developer enterprise-grade infra costs.
