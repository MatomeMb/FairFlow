# Document Index

Overview of all project documentation. Primary status: [PROGRESS-AND-VERSION.md](./PROGRESS-AND-VERSION.md).

---

## Core Documents

| Document | Description |
|----------|-------------|
| [01-PROJECT-CHARTER.md](./01-PROJECT-CHARTER.md) | Vision, objectives, scope, governance |
| [02-TECHNICAL-ARCHITECTURE.md](./02-TECHNICAL-ARCHITECTURE.md) | System design and component architecture |
| [03-PRODUCT-REQUIREMENTS-DOCUMENT.md](./03-PRODUCT-REQUIREMENTS-DOCUMENT.md) | Functional and non-functional requirements |
| [04-DEVELOPMENT-ROADMAP.md](./04-DEVELOPMENT-ROADMAP.md) | Sprint breakdown and milestones |
| [05-RISK-ASSESSMENT.md](./05-RISK-ASSESSMENT.md) | Risk analysis and mitigation |
| [06-BUDGET-FINANCIAL-PROJECTIONS.md](./06-BUDGET-FINANCIAL-PROJECTIONS.md) | Financial planning |
| [07-SYSTEM-DIAGRAMS.md](./07-SYSTEM-DIAGRAMS.md) | UML and system diagrams |
| [08-CTO-NEXT-STEPS.md](./08-CTO-NEXT-STEPS.md) | CTO action plan |
| [09-SCRUM-OPERATING-MODEL.md](./09-SCRUM-OPERATING-MODEL.md) | Scrum framework and ceremonies |
| [10-MVP-BACKLOG.md](./10-MVP-BACKLOG.md) | Prioritized product backlog |

---

## Status and Planning

| Document | Description |
|----------|-------------|
| [PROGRESS-AND-VERSION.md](./PROGRESS-AND-VERSION.md) | **Single source of truth** - version, sprint status, next steps |
| [15-DELIVERY-TIMELINE.md](./15-DELIVERY-TIMELINE.md) | 8-sprint Feb-May 2026 schedule |
| [16-WEEKLY-WORK-PLAN.md](./16-WEEKLY-WORK-PLAN.md) | Day-by-day work estimates |

---

## Sprint Plans

| Document | Description |
|----------|-------------|
| [11-SPRINT-1-PLAN.md](./11-SPRINT-1-PLAN.md) | Sprint 1 (Jan 20 - Feb 5) |
| [12-SPRINT-2-PLAN.md](./12-SPRINT-2-PLAN.md) | Sprint 2 (Feb 6 - 19) |
| [13-SPRINT-3-PLAN.md](./13-SPRINT-3-PLAN.md) | Sprint 3 (Feb 20 - Mar 5) - Analytics MVP-14 |
| [14-SPRINT-4-PLAN.md](./14-SPRINT-4-PLAN.md) | Sprint 4 (Mar 6 - 19) - Beta readiness |

---

## Setup and Operations

| Document | Description |
|----------|-------------|
| [API_KEYS_GUIDE.md](./API_KEYS_GUIDE.md) | API key setup for shadow-index and auth-portal |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Production deployment procedures |
| [11-DEPLOYMENT-RUNBOOK.md](./11-DEPLOYMENT-RUNBOOK.md) | Step-by-step deployment with pre-checks, rollback |
| [STAGING-DEPLOYMENT-RUNBOOK.md](./STAGING-DEPLOYMENT-RUNBOOK.md) | Staging deployment steps |
| [DEVELOPMENT-STANDARDS.md](./DEVELOPMENT-STANDARDS.md) | Code quality, testing, error handling standards |
| [GIT-WORKFLOW-STANDARDS.md](./GIT-WORKFLOW-STANDARDS.md) | Commit format, branch strategy, PR requirements |
| [RUST_WINDOWS_SETUP.md](./RUST_WINDOWS_SETUP.md) | Rust installation on Windows |

---

## Analytics (MVP-14)

| Document | Description |
|----------|-------------|
| [MVP-14-EVENT-SPEC-AND-STORAGE.md](./MVP-14-EVENT-SPEC-AND-STORAGE.md) | Event schema and storage design |
| [ANALYTICS-REPORTING-ENGINE-SPEC.md](./ANALYTICS-REPORTING-ENGINE-SPEC.md) | GET /v1/analytics/report specification |
| [ANALYTICS-PRODUCTION-READINESS.md](./ANALYTICS-PRODUCTION-READINESS.md) | Analytics deployment checklist |
| [19-PERFORMANCE-AND-OBSERVABILITY.md](./19-PERFORMANCE-AND-OBSERVABILITY.md) | Monitoring, profiling, performance targets |
| [20-SECURITY-HARDENING.md](./20-SECURITY-HARDENING.md) | Security principles, hardening, compliance |

---

## MVP and Release

| Document | Description |
|----------|-------------|
| [17-MVP-13-ACCEPTANCE-AND-SCHEMA.md](./17-MVP-13-ACCEPTANCE-AND-SCHEMA.md) | IndexedDB cache design |
| [MVP-13-CROSS-BROWSER.md](./MVP-13-CROSS-BROWSER.md) | Chrome/Edge/Brave/Firefox compatibility |
| [RELEASE-NOTES-v0.6.0.md](./RELEASE-NOTES-v0.6.0.md) | v0.6.0 release notes |

---

## OpenAPI

The Shadow Index API is documented in OpenAPI 3.0.3 format:

- `packages/shadow-index/openapi.yaml` - Full spec with 30+ endpoints
