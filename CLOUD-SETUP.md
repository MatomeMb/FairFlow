# Cursor Cloud Setup Guide

This guide is for bootstrapping a fresh Cursor Cloud workspace at `/workspace`.

## One-command setup (recommended)

```bash
cd /workspace
bash scripts/setup-cloud.sh
```

The script is idempotent and will:

1. Create missing `.env` files from templates
2. Apply cloud dev defaults
3. Install dependencies for root and all packages
4. Run setup verification
5. Build all packages to confirm toolchain health

## Manual setup (if needed)

```bash
cd /workspace
cp .env.example .env
cp packages/shadow-index/.env.example packages/shadow-index/.env
cp packages/auth-portal/.env.example packages/auth-portal/.env

pnpm install
npm install --prefix packages/shadow-index
npm install --prefix packages/auth-portal
npm install --prefix packages/lens-extension

bash scripts/setup-check.sh
npm run build --prefix packages/shadow-index
npm run build --prefix packages/auth-portal
npm run build --prefix packages/lens-extension
```

## Expected cloud defaults

### `/workspace/.env`

- `NODE_ENV=development`
- `LOG_LEVEL=debug`
- `API_PORT=3000`
- `API_URL=http://localhost:3000` // pragma: allowlist secret
- `JWT_SECRET=dev-jwt-secret-change-me`
- `GOOGLE_OAUTH_MODE=dev`

### `/workspace/packages/shadow-index/.env`

- `NODE_ENV=development`
- `LOG_LEVEL=debug`
- `JWT_SECRET=dev-jwt-secret-change-me`
- `GOOGLE_OAUTH_MODE=dev`

### `/workspace/packages/auth-portal/.env`

- `VITE_API_BASE_URL=http://localhost:3000` // pragma: allowlist secret
- `NODE_ENV=development`

## Starting services (separate terminals)

```bash
cd /workspace/packages/shadow-index && npm run dev
```

```bash
cd /workspace/packages/auth-portal && npm run dev
```

## Notes

- `.env` files are ignored by git in this repository.
- Replace placeholder secrets with real credentials when needed.
- Keep development/test credentials separate from production.
