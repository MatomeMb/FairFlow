# Developer Setup Guide

## Prerequisites

| Tool | Minimum Version | Purpose |
|---|---|---|
| Node.js | 18.0+ | API server and portal |
| npm | 9.0+ | Package management |
| Rust | 1.70+ | Commerce compiler (matter-core) |
| Git | 2.30+ | Version control |
| Chrome | 116+ | Extension development (Manifest V3) |

## Clone and Install

```bash
git clone https://github.com/MatomeMb/.Things-That-Matter.git
cd fairflow

# Install dependencies (from repo root)
cd packages/shadow-index && npm install
cd ../auth-portal && npm install
```

## Environment Variables

### shadow-index

Create `packages/shadow-index/.env`:

```env
PORT=3000
JWT_SECRET=your-dev-jwt-secret
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
R2_ACCOUNT_ID=your-r2-account-id
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
STORAGE_MODE=local
```

Set `STORAGE_MODE=local` for development to use file-based storage instead of R2.

### auth-portal

Create `packages/auth-portal/.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_API_BASE_URL=http://localhost:3000
```

## Starting Dev Servers

```bash
# Terminal 1: API server (http://localhost:3000)
cd packages/shadow-index && npm run dev

# Terminal 2: Portal (http://localhost:5178)
cd packages/auth-portal && npm run dev
```

Both servers support hot reload. See [docs/API_KEYS_GUIDE.md](./docs/API_KEYS_GUIDE.md) for full environment configuration.

## Running Tests

```bash
# Unit/integration (shadow-index)
cd packages/shadow-index && npm test
cd packages/shadow-index && npm run test:watch   # watch mode

# E2E (run from repo root; start dev servers first)
npx playwright install   # first time only
npm run test:e2e
```

Run each block from the repository root.

## Building for Production

```bash
# API build
cd packages/shadow-index
npm run build

# Portal static build (outputs to dist/)
cd packages/auth-portal
npm run build

# Compiler binary
cd packages/matter-core
cargo build --release

# Extension package
cd packages/lens-extension
npm run build   # produces a zip for Chrome Web Store
```

## Common Issues

**Port 3000 already in use**
Kill the existing process or set a different port: `PORT=3001 npm run dev`.

**Supabase auth not working locally**
Verify that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set correctly. Check that your Supabase project has the site URL `http://localhost:5178` in the auth redirect allowlist.

**Stripe webhooks not received in dev**
Use the Stripe CLI to forward events locally: `stripe listen --forward-to localhost:3000/webhooks/stripe`.

**Rust compiler fails to build**
Ensure Rust 1.70+ is installed (`rustup update`). Run `cargo clean` before retrying the build.

**Extension not loading in Chrome**
Navigate to `chrome://extensions`, enable Developer mode, and load the `packages/lens-extension/dist` directory as an unpacked extension.
