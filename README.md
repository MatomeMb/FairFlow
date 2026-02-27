# fairflow

fairflow is an object-oriented commerce platform that makes product data portable across web surfaces using `.thing` artifacts, `matter://` links, and a resolution API.

## Release status

- Current release: `v0.7.0`
- Mainline tag: `v0.7.0`
- Focus areas: Stripe checkout flow, merchant portal workflows, payout routing, and analytics reporting

## Repository layout

- `packages/shadow-index` - API service for product resolution, checkout, analytics, and merchant operations
- `packages/auth-portal` - React portal for merchant, CTO, CEO, investor, and consumer-facing flows
- `packages/lens-extension` - browser extension for `matter://` link interaction
- `packages/matter-core` - Rust core components and binaries
- `demo` - static demo pages and canonical extension privacy policy
- `docs` - active project documentation

## Prerequisites

- Node.js 18+
- npm 9+
- Rust toolchain (for `packages/matter-core` workflows)

## Quick start

Install dependencies:

```bash
npm install
npm --prefix packages/shadow-index install
npm --prefix packages/auth-portal install
npm --prefix packages/lens-extension install
```

Start the combined demo stack (API + demo server):

```bash
npm run demo
```

Primary local endpoints:

- Landing page: `http://localhost:5177/`
- Demo page: `http://localhost:5177/index.html`
- Catalog upload demo: `http://localhost:5177/catalog-upload.html`
- Matter link demo: `http://localhost:5177/matter-demo.html`
- API dashboard: `http://localhost:3000/v1/analytics/dashboard`

## Development commands

Root:

```bash
npm run demo
npm run start:api
npm run start:demo
npm run test:e2e
```

Auth portal:

```bash
npm --prefix packages/auth-portal run dev
npm --prefix packages/auth-portal run build
```

Shadow Index API:

```bash
npm --prefix packages/shadow-index run dev
npm --prefix packages/shadow-index run type-check
npm --prefix packages/shadow-index run test
```

Lens extension:

```bash
npm --prefix packages/lens-extension run build
npm --prefix packages/lens-extension run test
```

## Documentation

- `docs/README.md` - documentation index and quality rules
- `docs/GIT-WORKFLOW-STANDARDS.md` - branch, commit, merge, and release standards
- `demo/privacy-policy.html` - canonical extension privacy policy page

## License

MIT. See `LICENSE`.
