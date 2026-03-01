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
| **docs** | `docs/` | 80+ documentation files covering architecture, protocols, and guides |
| **scripts** | `scripts/` | Utility scripts for development, deployment, and maintenance |

## Quick Start

```bash
git clone https://github.com/fairflow/fairflow.git
cd fairflow

# Install dependencies for the API and portal
cd packages/shadow-index && npm install
cd ../auth-portal && npm install

# Start the API server (port 3000)
cd ../shadow-index && npm run dev

# In a separate terminal, start the portal (port 5178)
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

### shadow-index (`packages/shadow-index/.env`)

| Variable | Purpose |
|---|---|
| `PORT` | API server port (default: 3000) |
| `STRIPE_SECRET_KEY` | Stripe API secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `R2_ACCOUNT_ID` | Cloudflare R2 account identifier |
| `R2_ACCESS_KEY_ID` | R2 access key |
| `R2_SECRET_ACCESS_KEY` | R2 secret key |
| `JWT_SECRET` | Signing secret for merchant JWTs |

### auth-portal (`packages/auth-portal/.env`)

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `VITE_API_URL` | shadow-index API base URL |

## Testing

```bash
# Unit and integration tests (shadow-index)
cd packages/shadow-index && npm test

# Run tests in watch mode
cd packages/shadow-index && npm run test:watch

# End-to-end tests (auth-portal)
cd packages/auth-portal && npx playwright test
```

## Deployment

- **shadow-index** deploys as a standard Node.js service. Build with `npm run build` and run the compiled output.
- **auth-portal** produces a static build via `npm run build`, suitable for any static hosting provider or CDN.
- **lens-extension** is packaged as a `.zip` for Chrome Web Store submission.
- **matter-core** compiles to a native binary via `cargo build --release`.

Artifact storage uses Cloudflare R2 in production with local JSON fallback for development.

## Team

| Role | Name |
|---|---|
| CEO | Sobuhle Nyambali |
| CTO | Matome Mboweni |

**Company:** fairflow — [fairflow.co.za](https://fairflow.co.za)

## License

This project is licensed under the [MIT License](LICENSE).
