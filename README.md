# fairflow

**Object-Oriented Commerce Platform**

fairflow reimagines digital commerce by treating every product, service, and transaction as a structured object compiled into a verifiable `.thing` artifact. The platform provides a complete pipeline — from merchant onboarding and product compilation to hash-based resolution and in-browser display — enabling trustless, transparent commerce where every artifact is cryptographically signed, content-addressed, and instantly resolvable from any web page.

## Monorepo Structure

| Package | Path | Description |
|---|---|---|
| **shadow-index** | `packages/shadow-index/` | Node.js/Hono API (v0.6.0) for hash-to-artifact resolution, analytics, merchant auth, and Stripe payments |
| **auth-portal** | `packages/auth-portal/` | React/Vite frontend with Supabase auth and role-based portals (CEO, CTO, merchant, investor, consumer) |
| **lens-extension** | `packages/lens-extension/` | Chrome Manifest V3 browser extension for in-page artifact overlay |
| **matter-core** | `packages/matter-core/` | Rust commerce compiler for the `.thing` file format |
| **docs** | `docs/` | Architecture, deployment, beta, and standards |
| **scripts** | `scripts/` | Utility scripts for development, deployment, and maintenance |

## Quick Start

```bash
git clone https://github.com/fairflow/fairflow.git
cd fairflow

# Install dependencies
cd packages/shadow-index && npm install
cd ../auth-portal && npm install

# Terminal 1: Start API (http://localhost:3000)
cd packages/shadow-index && npm run dev

# Terminal 2: Start portal (http://localhost:5178)
cd packages/auth-portal && npm run dev
```

## Tech Stack

| Layer | Technology |
|---|---|
| API Runtime | Node.js, Hono, TypeScript |
| Frontend | React, Vite, Tailwind CSS |
| Auth | Supabase (portal), JWT (merchants), API keys (services) |
| Payments | Stripe |
| Testing | Vitest, Playwright |
| Compiler | Rust, FlatBuffers, Ed25519, Zstd |
| Storage | Local JSON, Cloudflare R2 |
| Extension | Chrome Manifest V3 |

## Environment Variables

Copy `.env.example` to `.env` in each package. See [docs/API_KEYS_GUIDE.md](./docs/API_KEYS_GUIDE.md) for full setup.

### shadow-index

| Variable | Purpose |
|---|---|
| `PORT` | API server port (default: 3000) |
| `JWT_SECRET` | Merchant JWT signing (≥32 chars) |
| `ADMIN_SECRET_KEY` | Admin API access |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Stripe |
| `STORAGE_MODE` | `local` or `r2` |
| `PUBLIC_API_BASE_URL` | Production API URL for thing_url |

### auth-portal

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Supabase |
| `VITE_API_BASE_URL` | shadow-index API URL |
| `VITE_ADMIN_SECRET` | Must match ADMIN_SECRET_KEY (for KYC) |

## Testing

```bash
# Unit and integration tests (shadow-index)
cd packages/shadow-index && npm test

# Run tests in watch mode
cd packages/shadow-index && npm run test:watch

# End-to-end tests (from repo root)
npm run test:e2e
```

## Setup & Deployment

- **Development:** [SETUP.md](./SETUP.md)
- **Deployment:** [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)

## Team

| Role | Name |
|---|---|
| CEO | Sobuhle Nyambali |
| CTO | Matome Mboweni |

**Company:** fairflow — [fairflow.co.za](https://fairflow.co.za)

## License

This project is licensed under the [MIT License](LICENSE).
