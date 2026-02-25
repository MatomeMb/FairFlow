# Google OAuth + Merchant Portal — Diagnostic Results

## Step 1: Servers

- **Backend** (`mcj/packages/shadow-index`): expects `Listening on http://localhost:3000` (run `npm run dev`).
- **Frontend** (`mcj/packages/auth-portal`): expects `Local: http://localhost:5178` (run `npm run dev`).

Run both in separate terminals before testing.

---

## Step 2: Environment variables (from repo .env files)

### Backend (`mcj/packages/shadow-index`)

| Variable | Status |
|----------|--------|
| `SHADOW_INDEX_API_KEY` | ✓ set in `.env` (value present) |
| `JWT_SECRET` | ✗ **NOT SET** — backend uses code default `'dev-secret-key-change-in-production'` |
| `GOOGLE_CLIENT_ID` | ✓ set in `.env` |
| `GOOGLE_CLIENT_SECRET` | ✓ set in `.env` |
| `GOOGLE_REDIRECT_URI` | ✓ set in `.env` → `http://localhost:3000/v1/auth/google/callback` |
| `AUTH_PORTAL_BASE_URL` | ✓ set → `http://localhost:5178` |

Note: Backend loads env from `.env` then `.env.local` (custom loader in `api/index.ts`), not the `dotenv` package.

### Frontend (`mcj/packages/auth-portal`)

| Variable | Status |
|----------|--------|
| `VITE_API_KEY` | ✓ set in `.env` (same value as backend `SHADOW_INDEX_API_KEY` for fallback) |
| `VITE_GOOGLE_CLIENT_ID` | ✗ not in .env (not required for merchant flow; Google OAuth is backend-only) |
| `VITE_API_BASE_URL` | not set → frontend uses **proxy** (relative URLs to same origin) |

---

## Step 3: OAuth routes and auth endpoints

- **Google OAuth start:** `GET /v1/auth/google` (redirects to Google).
- **Google OAuth callback:** `GET /v1/auth/google/callback` (exchanges code, issues JWT, redirects to portal with `?token=...`).
- **No** `/v1/auth/health` endpoint in code.
- **No** `/auth/google` — correct path is **`/v1/auth/google`**.

Redirect URI to configure in Google Cloud Console (must match exactly):

```text
http://localhost:3000/v1/auth/google/callback
```

Backend uses **`GOOGLE_REDIRECT_URI`**, not `GOOGLE_CALLBACK_URL`.

---

## Step 4: Network (what to check in DevTools)

After signing in with Google you should see:

1. **Redirect:** `http://localhost:5178/merchant?token=<jwt>`
2. **API calls:** Same-origin (via Vite proxy), e.g. `http://localhost:5178/v1/merchant/account` → proxied to backend.
3. **Request headers:** `Authorization: Bearer <jwt>` on `/v1/merchant/*` requests.
4. **If 401:** Backend rejected the JWT (wrong/absent secret or malformed token).

Check the **failed** request: URL, status code, and whether `Authorization` is present and starts with `Bearer `.

---

## Step 5: Root cause

From Steps 2–4, the applicable cause is one of:

### Cause A — JWT_SECRET not set or mismatched

- **Observed:** `JWT_SECRET` is **not** in backend `.env`. Backend uses the in-code default. If the server was ever run with a different env (or default changed), existing tokens would 401.
- **Fix:** Set a stable secret in backend only (no need in frontend; JWT is verified only on backend):

```bash
# Generate once
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add to `mcj/packages/shadow-index/.env`:

```env
JWT_SECRET=<paste-generated-value>
```

Restart the backend. Re-sign-in with Google so a new token is issued with this secret.

---

### Cause B — Token not used (redirect race)

- **Observed:** On landing at `/merchant?token=...`, one effect reads the token and calls `setAuthToken(urlToken)`; another effect runs with `authToken` still `null` (state not updated yet) and redirects to `/merchant/login`. So the user is sent to login immediately and may never “see” the portal with the new token; token is in `sessionStorage` but the page has already navigated away.
- **Fix:** In the “redirect if no token” effect, treat URL and storage as authoritative so we don’t redirect when a token is present in the URL or in `sessionStorage` (see code fix below).

---

### Cause C — Google OAuth credentials missing

- **Observed:** `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REDIRECT_URI` are all set in backend `.env`. So this is **not** the blocker.
- **Reminder:** In Google Cloud Console, the authorized redirect URI must be exactly:

  `http://localhost:3000/v1/auth/google/callback`

  (Backend uses `GOOGLE_REDIRECT_URI`; there is no `GOOGLE_CALLBACK_URL` in the code.)

---

## Step 6: Recommended fixes (in order)

1. **Fix Cause B (redirect race)** in `MerchantPortal.tsx` so we don’t redirect when the URL has `token` or storage has a token.
2. **Fix Cause A (JWT_SECRET)** by adding `JWT_SECRET` to `mcj/packages/shadow-index/.env` and restarting the backend.
3. Confirm in browser: after Google sign-in, you remain on `/merchant` (or return to it) and API calls show `Authorization: Bearer <token>` and return 200.

---

## Paste template for your run

If you re-run the diagnostic, paste:

- **Step 2:** Which of the variables above are set/missing in your actual `.env` / `.env.local` (you can redact values).
- **Step 3:** Output of `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health` and whether `GET http://localhost:3000/v1/auth/google` redirects (302).
- **Step 4:** For a failed request: URL, status code, and whether `Authorization` header is present.

That will confirm which of A/B/C applies and that the fixes above are sufficient.
