# Roadmap

Living plan for Fairflow after open-source readiness. Priorities may shift with beta feedback.

---

## Now (beta hardening)

- [ ] Complete controlled merchant cohort (3–5) with ops monitoring  
- [ ] Raise automated coverage on checkout + webhook idempotency  
- [ ] Production R2-first defaults and backup verification  
- [ ] Public screenshot/GIF set for README  
- [ ] Enable GitHub private vulnerability reporting  

## Next

- [ ] Shared rate-limit store (Redis) for multi-instance  
- [ ] Stronger merchant token revocation story  
- [ ] Docs site (VitePress or GitHub Pages) generated from `/docs`  
- [ ] Structured logging + error tracking (e.g. Sentry) in production  
- [ ] Catalog CSV import UX polish  

## Later

- [ ] Multi-currency expansion beyond ZAR-primary flows  
- [ ] Deeper investor analytics  
- [ ] Mobile-friendly merchant PWA  
- [ ] Plugin model for additional payment providers  
- [ ] Formal threat model document (STRIDE)  

## Non-goals (near term)

- Rewriting the API in another language for its own sake  
- Supporting every regional payment provider on day one  
- Building a full ERP  

---

## Versioning intent

| Package | Current | Intent |
|---------|---------|--------|
| shadow-index | 0.6.x | Stabilize `/v1` contracts |
| auth-portal | 0.1.x | UX iteration OK with care |
| matter-core | 0.3.x | Artifact format compatibility notes in CHANGELOG |

See [CHANGELOG.md](../CHANGELOG.md) and [BETA-LAUNCH-READINESS-REPORT.md](./BETA-LAUNCH-READINESS-REPORT.md).
