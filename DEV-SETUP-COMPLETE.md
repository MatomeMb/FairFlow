# DEV ENVIRONMENT SETUP GUIDE

**Last Updated:** March 2, 2026  
**Status:** Complete Setup Instructions  
**Target:** Cursor Cloud Agent & Local Development

---

## OVERVIEW

This guide provides complete setup instructions for the Things-That-Matter monorepo development environment. The repository is structured as a multi-package workspace with backend (Shadow Index), frontend (Auth Portal), and browser extension components.

---

## PREREQUISITES

Before starting setup, verify you have:

- [OK] Node.js v18+ (check: `node --version`)
- [OK] pnpm v8+ (check: `pnpm --version`)
- [OK] Rust & Cargo (check: `rustc --version && cargo --version`)
- [OK] Git (check: `git --version`)

If any are missing, install them first.

---

## QUICK START (5 Minutes)

```bash
cd c:\Users\matom\.cursor\worktrees\.Things-That-Matter\mcj

# 1. Install dependencies for all packages
pnpm install

# 2. Environment setup already complete (.env files ready)
# Just verify the .env files exist:
# - .env (root)
# - packages/shadow-index/.env
# - packages/auth-portal/.env.local

# 3. Start backend API
cd packages/shadow-index
npm run dev
# Server runs on http://localhost:3000

# 4. In new terminal, start frontend
cd packages/auth-portal
npm run dev
# Frontend runs on http://localhost:5178

# 5. Open browser
# Visit http://localhost:5178/dashboard/merchant
```

---

## DETAILED SETUP

### Step 1: Install Root Dependencies

```bash
cd mcj
pnpm install
```

This installs dependencies for all packages in the monorepo (managed by pnpm workspaces).

### Step 2: Environment Configuration

All .env files are already created. Verify they exist:

```bash
# Should exist (created):
ls -la .env
ls -la packages/shadow-index/.env
ls -la packages/auth-portal/.env.local
```

**What each .env contains:**

| File | Purpose | Status |
|------|---------|--------|
| `.env` | Root configuration (Supabase, Stripe, JWT) | [OK] Ready |
| `packages/shadow-index/.env` | Backend API configuration | [OK] Ready |
| `packages/auth-portal/.env.local` | Frontend configuration | [OK] Ready |

**Note:** All files are configured for **development mode** with placeholders where real credentials are needed.

### Step 3: Configure External Services (If Needed)

For full development features, you may need to add real credentials:

#### Supabase (Database)
1. Visit: https://app.supabase.com
2. Create project or use existing
3. Copy `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`
4. Update in `.env`:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_KEY=eyJhbGc...
   ```

#### Stripe (Payments)
1. Visit: https://dashboard.stripe.com/apikeys
2. Get test keys (starts with `pk_test_` and `sk_test_`)
3. Update in both `.env` and `packages/shadow-index/.env`:
   ```env
   STRIPE_SECRET_KEY=sk_test_xxx
   STRIPE_PUBLISHABLE_KEY=pk_test_xxx
   ```

#### Google OAuth (If Disabling Dev Mode)
By default, **dev mode is enabled** (`GOOGLE_OAUTH_MODE=dev`). To use real Google OAuth:
1. Create app at: https://console.cloud.google.com/apis/dashboard
2. Get Client ID and Secret
3. Update `.env`:
   ```env
   GOOGLE_OAUTH_MODE=production
   GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=xxx
   ```

**For now, leave in dev mode** - Google OAuth dev mode creates test merchant accounts automatically.

### Step 4: Start Backend API

```bash
cd packages/shadow-index
npm run dev
```

**Expected output:**
```
[INFO] Server starting
[INFO] Port 3000
[INFO] Storage mode: local
[OK] Ready for requests
```

Server will run on `http://localhost:3000`

Verify health:
```bash
curl http://localhost:3000/health
# Response: {"ok":true}
```

### Step 5: Start Frontend (New Terminal)

```bash
cd packages/auth-portal
npm run dev
```

**Expected output:**
```
VITE v7.3.1

Local: http://localhost:5178/
```

Frontend will run on `http://localhost:5178`

### Step 6: Access Dashboard

1. Open browser: `http://localhost:5178/dashboard/merchant`
2. Click "Sign in with Google"
3. Dev mode creates test account automatically
4. Dashboard loads with sample data

---

## VERIFICATION CHECKLIST

[OK] Dependencies installed
- Run: `pnpm list` (should show workspace packages)

[OK] Environment files configured
- Check: `.env`, `packages/shadow-index/.env`, `packages/auth-portal/.env.local` exist

[OK] Backend API running
- Test: `curl http://localhost:3000/health`
- Expected: `{"ok":true}`

[OK] Frontend running
- Test: `curl http://localhost:5178`
- Expected: HTML response (Vite dev server)

[OK] OAuth flow working
- Visit: `http://localhost:5178/login`
- Click: "Sign in with Google"
- Expected: Redirects to dashboard (no Google prompt in dev mode)

[OK] Merchant API accessible
- Test: `curl -H "Authorization: Bearer TOKEN" http://localhost:3000/v1/merchant/account`
- Expected: 200 OK with account data

---

## PROJECT STRUCTURE

```
mcj/
├── .env                          # Root environment variables
├── package.json                  # Root workspace definition
├── pnpm-workspace.yaml           # pnpm monorepo config
├── docs/                         # Complete documentation
│   ├── 00-INDEX.md              # Doc index (start here)
│   ├── 01-PROJECT-CHARTER.md    # Vision & scope
│   ├── 02-TECHNICAL-ARCHITECTURE.md
│   ├── DEVELOPMENT-STANDARDS.md
│   ├── SETUP.md                 # Comprehensive setup guide
│   ├── 11-DEPLOYMENT-RUNBOOK.md
│   └── ...
├── packages/
│   ├── shadow-index/            # Backend API (Hono.js)
│   │   ├── .env                 # Backend env vars
│   │   ├── package.json
│   │   ├── api/
│   │   │   └── index.ts         # API routes
│   │   └── src/
│   │       └── types/           # TypeScript types
│   ├── auth-portal/             # Frontend (React + Vite)
│   │   ├── .env.local           # Frontend env vars
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── pages/           # Page components
│   │   │   ├── components/      # React components
│   │   │   └── App.tsx
│   │   └── index.html
│   └── lens-extension/          # Browser extension
└── scripts/                      # Build/deploy scripts
    └── ...
```

---

## COMMON TASKS

### Run Tests
```bash
cd packages/shadow-index
npm run test

cd packages/auth-portal
npm run test
```

### Build for Production
```bash
cd packages/shadow-index
npm run build          # Creates dist/ folder

cd packages/auth-portal
npm run build          # Creates dist/ for deployment
```

### View API Documentation
Visit: `http://localhost:3000/api/docs` (when running in dev)

### Check Code Quality
```bash
# Lint
pnpm run lint

# Type check
pnpm run type-check
```

### Database Migrations
```bash
# If using Supabase migrations:
npm run migrate:dev
```

---

## TROUBLESHOOTING

### Port Already In Use

**Problem:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000                  # macOS/Linux
netstat -ano | findstr :3000   # Windows

# Kill the process
kill -9 <PID>                 # macOS/Linux
taskkill /PID <PID> /F        # Windows
```

### Dependencies Not Installing
```bash
# Clear pnpm cache
pnpm store prune

# Delete lock file and reinstall
rm pnpm-lock.yaml
pnpm install
```

### Environment Variables Not Loaded
```bash
# Verify .env file exists
ls -la .env

# Check syntax (no spaces around =)
grep "^[A-Z_]*=" .env

# Restart server after .env changes
# (Some servers require restart to reload env)
```

### API Returning 401 Unauthorized
```bash
# If accessing merchant routes without token:
# This is expected unless you have a valid JWT

# To get token, use OAuth flow:
# 1. Visit http://localhost:5178/login
# 2. Click "Sign in with Google"
# 3. Token is added to session storage automatically
```

### Frontend Can't Connect to Backend
```bash
# Check backend is running
curl http://localhost:3000/health

# Check VITE_API_BASE_URL in packages/auth-portal/.env.local
cat packages/auth-portal/.env.local | grep VITE_API_BASE_URL

# Should be: VITE_API_BASE_URL=http://localhost:3000
```

---

## NEXT STEPS

1. [OK] **Complete Setup:** All steps above are ready
2. **Read Documentation:** Start with `docs/00-INDEX.md`
3. **Run Tests:** `pnpm run test` to verify everything works
4. **Make Changes:** Edit files in packages/
5. **Submit PRs:** Follow DEVELOPMENT-STANDARDS.md

---

## USEFUL COMMANDS

```bash
# Install a new package to a specific workspace
pnpm add axios --filter shadow-index

# Run script in specific package
pnpm --filter auth-portal run dev

# List all workspaces
pnpm list -r --depth=0

# Clean all node_modules
pnpm clean

# Full reinstall
pnpm install --force
```

---

## GETTING HELP

- **Architecture Questions:** See `docs/02-TECHNICAL-ARCHITECTURE.md`
- **Deployment Issues:** See `docs/11-DEPLOYMENT-RUNBOOK.md`
- **Security Concerns:** See `docs/20-SECURITY-HARDENING.md`
- **Code Standards:** See `docs/DEVELOPMENT-STANDARDS.md`
- **Testing:** See `docs/TESTING-STANDARDS.md`

---

## ENVIRONMENT SUMMARY

Current configuration is **production-ready** for local development:

| Component | Port | Status | Notes |
|-----------|------|--------|-------|
| Backend API | 3000 | [OK] Ready | Hono.js, local storage |
| Frontend | 5178 | [OK] Ready | React + Vite |
| Database | Supabase | [OK] Configured | Update .env for real DB |
| Auth | OAuth Dev | [OK] Bypass Active | Auto-creates test accounts |
| Payments | Stripe Test | [OK] Ready | Use test keys from .env |

All packages ready for development. No additional setup required to start coding.

**Last verified:** March 2, 2026 - All components functional.
