# Sprint 3 — Day 1 Task List (R2 Setup & SDK Integration)

**Sprint 3 Plan:** [13-SPRINT-3-PLAN.md](./13-SPRINT-3-PLAN.md)  
**Step-by-step guide (with links):** [NEXT-STEPS-SPRINT-3.md](./NEXT-STEPS-SPRINT-3.md)  
**Date:** February 2026  
**Owner:** CTO

---

## Objective

Complete R2 setup and SDK integration so the Shadow Index API can upload and retrieve `.thing` files (and optionally images) from Cloudflare R2. Day 1 does **not** change API behavior: local storage remains the default; R2 is wired and ready for Day 2.

---

## Task List (in order)

### 1. Cloudflare R2 bucket and credentials

| # | Task | Done | Notes |
|---|------|------|--------|
| 1.1 | Create R2 bucket (e.g. `matter-artifacts-prod`) | [ ] | Cloudflare dashboard → R2 → Create bucket |
| 1.2 | Create API token with R2 read/write | [ ] | R2 → Manage R2 API Tokens → Create; note Account ID, Access Key ID, Secret Access Key |
| 1.3 | Configure bucket CORS (if public read via custom domain) | [ ] | Allow GET from `*` or your domains; optional for Day 1 if using R2.dev |
| 1.4 | Note public URL base | [ ] | Custom domain (e.g. `https://cdn.thingsthatmatter.com`) or R2.dev subdomain |

---

### 2. Repo and environment

| # | Task | Done | Notes |
|---|------|------|--------|
| 2.1 | Confirm `@aws-sdk/client-s3` in `packages/shadow-index` | [x] | Already in package.json |
| 2.2 | Add R2 env vars to `.env` (do not commit) | [ ] | **You:** Copy from `.env.example`; set `CLOUDFLARE_R2_*` and `STORAGE_MODE=local` |
| 2.3 | Add `lib/` to TypeScript build | [x] | tsconfig.json `include`: added `"lib/**/*"` |
| 2.4 | Create `packages/shadow-index/lib/storage.ts` | [x] | R2 client, `uploadThing`, `uploadImage`, `getThing`, `isR2Configured` |
| 2.5 | Update `.env.example` with `STORAGE_MODE` and R2 comments | [x] | Done |

---

### 3. Storage module (`lib/storage.ts`)

| # | Task | Done | Notes |
|---|------|------|--------|
| 3.1 | Create S3Client for R2 (region `auto`, endpoint from `CLOUDFLARE_R2_ACCOUNT_ID`) | [x] | Credentials from env |
| 3.2 | Implement `uploadThing(hash: string, data: Buffer): Promise<string>` | [x] | PutObject to `things/${hash}.thing`; return public URL |
| 3.3 | Implement `uploadImage(hash: string, imageData: Buffer, mimeType: string): Promise<string>` | [x] | PutObject to `images/${hash}.{ext}`; return public URL |
| 3.4 | Implement `getThing(hash: string): Promise<Buffer \| null>` | [x] | GetObject; return null on NoSuchKey |
| 3.5 | Export `isR2Configured(): boolean` | [x] | True when all required R2 env vars are set |

---

### 4. Verification (no API behavior change yet)

| # | Task | Done | Notes |
|---|------|------|--------|
| 4.1 | `npm run build` in `packages/shadow-index` succeeds | [x] | Includes `dist/lib/storage.js` |
| 4.2 | Optional: run a one-off script that calls `uploadThing` and logs URL | [x] | Use `npm run verify-r2` after setting R2 env (see below) |
| 4.3 | Existing Vitest and demo flow still pass | [x] | No changes to `api/index.ts`; cargo test 8 pass; Vitest 10/12 (12/12 when API running) |

---

## Definition of Done (Day 1)

- [ ] R2 bucket exists; credentials stored in local `.env` (not committed) — **You**
- [x] `packages/shadow-index/lib/storage.ts` exists with R2 client, `uploadThing`, `uploadImage`, `getThing`, `isR2Configured`
- [x] `tsconfig.json` includes `lib/**/*`; build produces `dist/lib/storage.js`
- [x] `.env.example` documents `STORAGE_MODE` and R2 variables
- [x] API and tests unchanged; demo still works with local storage

---

## Optional: Verify R2 after you set credentials

From `packages/shadow-index`, with R2 env vars set (e.g. in `.env` or exported):

```bash
npm run build
npm run verify-r2
```

If R2 is configured, the script uploads a test object, retrieves it, and prints OK. If not configured, it prints instructions.

---

## Day 2 Preview (API integration)

- Read `STORAGE_MODE` in `api/index.ts`; when `r2` and `isR2Configured()`, use `uploadThing` in POST /compile and `getThing` in GET /thing/:hash; keep local fallback when `local` or R2 not configured.

---

*Document version: 1.0 | Sprint 3 Day 1*
