# Getting Started with fairflow

## Prerequisites

- Node.js 18+
- npm 9+
- Git 2.30+
- (Optional) Rust 1.70+ for matter-core compiler development
- (Optional) Chrome 116+ for extension development

## Clone and Install

```bash
git clone https://github.com/MatomeMb/.Things-That-Matter.git
cd .Things-That-Matter
cd packages/shadow-index && npm install
cd ../auth-portal && npm install
```

**CI note:** GitHub Actions uses a nested `mcj/packages/...` layout in some workflows; treat it as the same packages with a different path prefix.

## Environment Setup

Configure `.env` per package — see [API_KEYS_GUIDE.md](./API_KEYS_GUIDE.md) (typically `packages/shadow-index/.env` and `packages/auth-portal/.env` from each package’s `.env.example`).

### Required Variables

**Authentication & API:**
- `GOOGLE_CLIENT_ID` — Google OAuth application ID
- `GOOGLE_CLIENT_SECRET` — Google OAuth secret
- `GOOGLE_REDIRECT_URI` — OAuth callback URL (e.g., `http://localhost:3000/v1/auth/google/callback`)
- `JWT_SECRET` — Random 32+ character string for signing merchant tokens
- `ADMIN_SECRET_KEY` — Admin operations secret

**Payments:**
- `PAYSTACK_SECRET_KEY` — Paystack API secret key
- `PAYSTACK_PUBLIC_KEY` — Paystack public key
- `PAYSTACK_CALLBACK_URL` — Callback URL for payment confirmation

**Database & Storage:**
- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_SERVICE_KEY` — Supabase service role key

## Running Locally

Start the development servers in two terminal windows:

```bash
# Terminal 1: Start API server (http://localhost:3000)
cd packages/shadow-index
npm run dev
```

```bash
# Terminal 2: Start Frontend (http://localhost:5178)
cd packages/auth-portal
npm run dev
```

Both servers support hot reload. Changes will reflect immediately.

## Project Packages

| Package | Tech | Purpose |
|---------|------|---------|
| **auth-portal** | React + Vite + TypeScript + Tailwind | Merchant portal, admin dashboard, consumer shop, authentication UI |
| **shadow-index** | Node.js + Hono + TypeScript | REST API, webhooks, payment processing, KYC workflows, payouts |
| **matter-core** | Rust | `.thing` file compiler, content addressing, cryptographic signing |
| **lens-extension** | JavaScript + Chrome MV3 | Browser extension for product discovery overlay |

## Running Tests

```bash
# Auth Portal tests
cd packages/auth-portal
npm run test                # Run once
npm run test:watch         # Watch mode
npm run test:coverage      # With coverage report

# Shadow Index tests
cd packages/shadow-index
npm run test
npm run test:watch
npm test:coverage

# Matter Core tests (if working on compiler)
cd packages/matter-core
cargo test
```

## Building for Production

```bash
# Auth Portal (outputs to dist/)
cd packages/auth-portal
npm run build

# Shadow Index (outputs to dist/)
cd packages/shadow-index
npm run build

# Matter Core (outputs compiled binary)
cd packages/matter-core
cargo build --release

# Lens Extension (packaged for Chrome Web Store)
cd packages/lens-extension
npm run build
```

## Project Structure

```
.
├── packages/
│   ├── auth-portal/           — Frontend application
│   │   ├── src/
│   │   │   ├── pages/         — Page components (login, merchant portal, etc.)
│   │   │   ├── portals/       — Multi-role portal pages
│   │   │   ├── components/    — Reusable UI components
│   │   │   ├── features/      — Feature modules (KYC, analytics, etc.)
│   │   │   ├── router/        — Route definitions
│   │   │   ├── context/       — React context (auth, theme, etc.)
│   │   │   ├── hooks/         — Custom React hooks
│   │   │   ├── lib/           — Utility functions
│   │   │   └── design-system/ — Design tokens, typography, colors
│   │   └── package.json
│   │
│   ├── shadow-index/          — Backend API
│   │   ├── src/
│   │   │   ├── api/           — Route handlers
│   │   │   ├── lib/           — Business logic, storage, analytics
│   │   │   ├── types/         — TypeScript definitions
│   │   │   └── index.ts       — Application entry point
│   │   └── package.json
│   │
│   ├── matter-core/           — Rust compiler
│   │   ├── src/
│   │   │   ├── compiler/      — Compilation logic
│   │   │   ├── schema/        — Thing file schemas
│   │   │   └── lib.rs         — Library entry point
│   │   └── Cargo.toml
│   │
│   └── lens-extension/        — Chrome extension
│       ├── src/
│       │   ├── manifest.json  — Extension manifest v3
│       │   ├── content.ts     — Content script
│       │   ├── background.ts  — Service worker
│       │   └── popup.tsx      — Extension popup UI
│       └── package.json
│
├── docs/                      — Documentation (this directory)
│   ├── 02-TECHNICAL-ARCHITECTURE.md
│   ├── API_KEYS_GUIDE.md
│   ├── DEPLOYMENT.md
│   └── ... (see docs/README.md for full index)
│
├── demo/                      — Static demo assets
├── scripts/                   — Utility scripts
├── mcj/                       — Optional mirror / CI checkout (same package layout)
├── README.md
└── package.json               — Root scripts (e2e, demo helpers)
```

## Deployment

For full deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

The platform is deployed to Vercel:
- **Frontend:** https://portal.fairflow.co.za
- **API:** https://api.fairflow.co.za
- **Domain:** fairflow.co.za

## Common Commands

Run these **inside** `packages/auth-portal` or `packages/shadow-index` (each package has its own `package.json`):

```bash
# Type checking & lint (example: auth-portal)
npm run type-check
npm run lint
npm run format

# Tests
npm test -- --run
npm run test:watch
npm run test:coverage
```

## Troubleshooting

**Port 3000 or 5178 already in use?**
- Kill the process: `lsof -ti:3000 | xargs kill -9` (macOS/Linux)
- Or specify a different port: `PORT=3001 npm run dev`

**Environment variables not loading?**
- Ensure `.env` exists in `packages/shadow-index` and/or `packages/auth-portal` as described in [API_KEYS_GUIDE.md](./API_KEYS_GUIDE.md)
- Restart dev servers after updating `.env`
- Check for typos in variable names

**Node modules issues?**
- Clear cache: `npm cache clean --force`
- Reinstall: `rm -rf node_modules && npm install`

**Supabase connection errors?**
- Verify `SUPABASE_URL` and service key are correct
- Check Supabase project is running and publicly accessible

## Next Steps

1. **Explore the docs:** Read [02-TECHNICAL-ARCHITECTURE.md](./02-TECHNICAL-ARCHITECTURE.md) to understand the system design
2. **Set up keys:** Follow [API_KEYS_GUIDE.md](./API_KEYS_GUIDE.md) to get your development keys
3. **Check the API:** See [packages/shadow-index/README.md](../packages/shadow-index/README.md) for API documentation
4. **View deployment:** [DEPLOYMENT.md](./DEPLOYMENT.md) for staging/production procedures

## Getting Help

- Check the [docs/README.md](./README.md) for all available documentation
- Review error logs in the browser console or server terminal
- See [DEVELOPMENT-STANDARDS.md](./DEVELOPMENT-STANDARDS.md) for code quality guidelines
