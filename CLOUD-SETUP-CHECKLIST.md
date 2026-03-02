# Cursor Cloud Setup Verification Checklist

Use this checklist after running `bash scripts/setup-cloud.sh`.

## Files

- [ ] `/workspace/.env` exists
- [ ] `/workspace/packages/shadow-index/.env` exists
- [ ] `/workspace/packages/auth-portal/.env` exists

## Required defaults

- [ ] Root `.env` has `NODE_ENV=development`
- [ ] Root `.env` has `API_PORT=3000`
- [ ] Root `.env` has `API_URL=http://localhost:3000` // pragma: allowlist secret
- [ ] Shadow `.env` has `GOOGLE_OAUTH_MODE=dev`
- [ ] Auth portal `.env` has `VITE_API_BASE_URL=http://localhost:3000` // pragma: allowlist secret

## Dependencies

- [ ] `pnpm install` completes in `/workspace`
- [ ] `npm install --prefix packages/shadow-index` completes
- [ ] `npm install --prefix packages/auth-portal` completes
- [ ] `npm install --prefix packages/lens-extension` completes

## Validation

- [ ] `bash scripts/setup-check.sh` reports all checks passed
- [ ] `npm run build --prefix packages/shadow-index` succeeds
- [ ] `npm run build --prefix packages/auth-portal` succeeds
- [ ] `npm run build --prefix packages/lens-extension` succeeds

## Optional runtime smoke test

- [ ] API starts on local port `3000`
- [ ] Frontend starts on `http://localhost:5178`
- [ ] API health endpoint responds at `/health`
