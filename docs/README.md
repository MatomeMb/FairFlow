# fairflow Documentation

This directory contains the canonical written documentation for engineering, deployment, beta operations, and release readiness.

## Portfolio / open-source entry points

| Document | Purpose |
|----------|---------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System architecture and design decisions |
| [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) | Components, boundaries, failure modes |
| [DATABASE.md](./DATABASE.md) | Schema, ER diagram, migrations |
| [AUTHENTICATION.md](./AUTHENTICATION.md) | Auth actors and flows |
| [API_REFERENCE.md](./API_REFERENCE.md) | Endpoint catalogue |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Vercel + Docker deployment |
| [SECURITY.md](./SECURITY.md) | Security controls and history scrubbing |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Contribution guide |
| [ROADMAP.md](./ROADMAP.md) | Near-term plan |
| [OPEN-SOURCE-READINESS-REPORT.md](./OPEN-SOURCE-READINESS-REPORT.md) | Public release audit |

**Internal** (charter, demo scripts): [internal/README.md](./internal/README.md).

## Start Here

| Document | Purpose |
|----------|---------|
| [GETTING-STARTED.md](./GETTING-STARTED.md) | Local development setup and first-run workflow |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Staging and production deployment model |
| [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md) | Pre-deploy and post-deploy verification |
| [API_KEYS_GUIDE.md](./API_KEYS_GUIDE.md) | API key, admin secret, and environment configuration |

## Beta Operations

| Document | Purpose |
|----------|---------|
| [BETA-LAUNCH-READINESS-REPORT.md](./BETA-LAUNCH-READINESS-REPORT.md) | Single summary: beta readiness, config matrix, final manual gate |
| [BETA-TESTING-GUIDE.md](./BETA-TESTING-GUIDE.md) | End-to-end beta verification flow for merchant and admin journeys |
| [BETA-USER-ONBOARDING.md](./BETA-USER-ONBOARDING.md) | Beta tester onboarding process |

## Product, Architecture, and Standards

| Document | Purpose |
|----------|---------|
| [02-TECHNICAL-ARCHITECTURE.md](./02-TECHNICAL-ARCHITECTURE.md) | System architecture and integration boundaries |
| [03-PRODUCT-REQUIREMENTS-DOCUMENT.md](./03-PRODUCT-REQUIREMENTS-DOCUMENT.md) | Product requirements and operating assumptions |
| [DEVELOPMENT-STANDARDS.md](./DEVELOPMENT-STANDARDS.md) | Engineering conventions and code quality expectations |
| [GIT-WORKFLOW-STANDARDS.md](./GIT-WORKFLOW-STANDARDS.md) | Branching, commits, and review workflow |
| [20-SECURITY-HARDENING.md](./20-SECURITY-HARDENING.md) | Security posture and hardening guidance |
| [22-TESTING-STANDARDS-AND-COVERAGE.md](./22-TESTING-STANDARDS-AND-COVERAGE.md) | Test expectations and coverage guidance |

## Analytics

| Document | Purpose |
|----------|---------|
| [ANALYTICS.md](./ANALYTICS.md) | Hub: events, flow, storage, links to deep specs |
| [ANALYTICS-OVERVIEW.md](./ANALYTICS-OVERVIEW.md) | Pipeline overview, APIs, dashboards |
| [ANALYTICS-EVENT-SCHEMA.md](./ANALYTICS-EVENT-SCHEMA.md) | Event schema and validation detail |

## Manuals

| Document | Purpose |
|----------|---------|
| [manuals/fairflow_merchant_manual.pdf](./manuals/fairflow_merchant_manual.pdf) | Merchant manual (PDF, v1.1) |
| [manuals/fairflow_beta_manual_v2.pdf](./manuals/fairflow_beta_manual_v2.pdf) | Beta tester manual (PDF, v1.1) |
| [manuals/BETA_MERCHANT_MANUAL_ERRATA.md](./manuals/BETA_MERCHANT_MANUAL_ERRATA.md) | Optional Markdown supplement for engineers (PDFs remain canonical) |

## Reference

| Document | Purpose |
|----------|---------|
| [05-RISK-ASSESSMENT.md](./05-RISK-ASSESSMENT.md) | Program and delivery risks |
| [07-SYSTEM-DIAGRAMS.md](./07-SYSTEM-DIAGRAMS.md) | Supporting system diagrams |
| [17-MVP-13-ACCEPTANCE-AND-SCHEMA.md](./17-MVP-13-ACCEPTANCE-AND-SCHEMA.md) | IndexedDB schema and acceptance notes |
| [19-PERFORMANCE-AND-OBSERVABILITY.md](./19-PERFORMANCE-AND-OBSERVABILITY.md) | Performance and observability guidance |
| [21-PRE-COMMIT-HOOKS-SETUP.md](./21-PRE-COMMIT-HOOKS-SETUP.md) | Local hook setup |
| [SECURITY-VERIFICATION-REPORT.md](./SECURITY-VERIFICATION-REPORT.md) | Security verification evidence |
| [VERCEL-UPTIME-RUNBOOK.md](./VERCEL-UPTIME-RUNBOOK.md) | Runtime incident handling for hosted environments |
| [INSTALL-LENS.md](./INSTALL-LENS.md) | Local install and dev workflow for the Lens extension |
| [CHROME-WEB-STORE-CHECKLIST.md](./CHROME-WEB-STORE-CHECKLIST.md) | Chrome Web Store submission and release checklist |

## Maintaining this folder

- Prefer **one** canonical doc per topic; link instead of copying.
- New top-level `.md` files should be listed in this README (or nested under `internal/` with a clear purpose).
- Run `node scripts/validate-system-config.mjs` from the repo root to sanity-check core doc paths.