# Risk Assessment

Risk analysis and mitigation for fairflow.

---

## Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Chrome extension rejection | Medium | High | Follow store policies, test thoroughly |
| Stripe compliance (PCI) | Low | High | Use Stripe-hosted checkout |
| R2 outage | Low | Medium | Local fallback, retry logic |
| JSON file storage limits | Medium | Medium | Migrate to DB at scale |

---

## Operational Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Key leakage | Low | High | .env in .gitignore, secrets in platform |
| POPIA (SA data privacy) | Medium | High | Document data flows, minimal collection |

---

## Business Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Merchant adoption slow | Medium | Medium | Beta outreach, feedback loops |
| Competitor timing | Low | Low | Focus on differentiation |
