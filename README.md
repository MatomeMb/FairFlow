# fairflow

> Commerce infrastructure for South African merchants, with merchant operations, public checkout, and portable product links.

## Overview

fairflow is a monorepo for the merchant portal, public product and checkout experience, admin operations, and the supporting API. The current beta scope includes:

- Merchant onboarding, product management, orders, notifications, KYC, and payouts
- Public product pages and Paystack checkout
- Admin KYC review, payout release, and platform health monitoring
- `matter://` identifiers and compiled `.thing` artifacts for portable product distribution

## Beta launch status

fairflow is in controlled beta launch hardening. The recommended rollout model is a small cohort (3-5 friendly merchants) with active monitoring and incident response.

- Readiness snapshot: [Beta launch readiness report](./docs/BETA-LAUNCH-READINESS-REPORT.md)
- Operations response: [Operations runbook](./docs/OPERATIONS-RUNBOOK.md)
- Merchant-facing onboarding handover: [Beta merchant handover](./docs/BETA-MERCHANT-HANDOVER.md)

## Repository layout

The top-level workspace contains the active packages used in this worktree. The `mcj/` directory mirrors the broader project layout used in other workflows and historical references.

```text
.
├── packages/
│   ├── auth-portal/        React + TypeScript frontend
│   ├── shadow-index/       Hono + Node.js API
│   ├── matter-core/        Rust compiler for `.thing` artifacts
│   └── lens-extension/     Browser extension
├── docs/                   Project documentation and manuals
├── demo/                   Static demo assets
└── mcj/                    Mirrored project structure
```

## Quick start

```bash
cd packages/shadow-index
npm install

cd ../auth-portal
npm install
```

Set the required environment variables before running the applications:

- API configuration: `docs/API_KEYS_GUIDE.md`
- Local setup: `docs/GETTING-STARTED.md`
- Deployment expectations: `docs/DEPLOYMENT.md`

Default local ports:

- Frontend: `http://localhost:5178`
- API: `http://localhost:3000`

## Documentation

- [Documentation index](./docs/README.md)
- [Getting started](./docs/GETTING-STARTED.md)
- [Analytics](./docs/ANALYTICS.md)
- [Technical architecture](./docs/02-TECHNICAL-ARCHITECTURE.md)
- [Deployment guide](./docs/DEPLOYMENT.md)
- [Deployment checklist](./docs/DEPLOYMENT-CHECKLIST.md)
- [Operations runbook](./docs/OPERATIONS-RUNBOOK.md)
- [Internal docs](./docs/internal/README.md) (charter, demo scripts)
- [Beta launch readiness report](./docs/BETA-LAUNCH-READINESS-REPORT.md)
- [Beta merchant handover](./docs/BETA-MERCHANT-HANDOVER.md)
- [Merchant manual](./docs/manuals/fairflow_merchant_manual.pdf)
- [Beta tester manual](./docs/manuals/fairflow_beta_manual_v2.pdf)

## Live site

[fairflow.co.za](https://fairflow.co.za)

## License

MIT
