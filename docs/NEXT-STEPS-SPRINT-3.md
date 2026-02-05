# Next Steps — Sprint 3 (R2 + Rust Compiler)

**Sprint 3 Plan:** [13-SPRINT-3-PLAN.md](./13-SPRINT-3-PLAN.md)  
**Day 1 Task List:** [13-SPRINT-3-DAY1-TASKS.md](./13-SPRINT-3-DAY1-TASKS.md)

This guide walks you through the remaining steps in order, with links and detailed instructions.

---

## Part A: Cloudflare R2 Setup (Day 1 — your steps)

### A1. Enable R2 and get to the dashboard

1. **Sign in to Cloudflare**  
   [Cloudflare Dashboard](https://dash.cloudflare.com/) → log in.

2. **Open R2**  
   In the left sidebar: **Storage & databases** → **R2** → **Overview**.  
   Or go directly: [R2 Overview](https://dash.cloudflare.com/?to=/:account/r2/overview) (replace `:account` with your account ID if the URL doesn’t auto-fill).

3. **Add R2 if needed**  
   If you see a prompt to add R2, complete the checkout. R2 has a free tier (e.g. 10 GB storage, 1M Class B operations/month).  
   Docs: [R2 Get started](https://developers.cloudflare.com/r2/get-started/).

---

### A2. Create an R2 bucket

1. In **R2** → **Overview**, click **Create bucket**.

2. **Bucket name:** e.g. `matter-artifacts-prod` (or `matter-artifacts` for dev).

3. **Location:** leave default (Automatic).

4. Click **Create bucket**.

5. Confirm the bucket appears in the bucket list.

**Docs:** [R2 — Create a bucket](https://developers.cloudflare.com/r2/buckets/create-buckets/) (dashboard flow may match this).

---

### A3. Create an R2 API token

1. In **R2**, click **Manage R2 API Tokens** (top right or in the R2 menu).

2. Click **Create API token**.

3. **Token name:** e.g. `matter-shadow-index`.

4. **Permissions:**  
   - **Object Read & Write** (required for upload and download).  
   - Optionally **Admin Read only** if you want to list buckets; not required for this project.

5. **Specify bucket (optional):** You can restrict the token to the bucket you created (e.g. `matter-artifacts-prod`).

6. Click **Create API token**.

7. **Copy and save immediately:**
   - **Access Key ID**
   - **Secret Access Key**  
   You will not see the Secret Access Key again.

**Docs:** [R2 — S3 API authentication (tokens)](https://developers.cloudflare.com/r2/api/tokens/).

---

### A4. Get your Account ID

1. In the Cloudflare dashboard, open any R2 or Workers page.

2. In the right sidebar (or URL), find **Account ID** (32-character hex string).

3. Copy and save it; you need it for the S3 endpoint and env vars.

**Alternative:** The R2 S3 endpoint is `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`. You can also find Account ID in **R2** → **Overview** or in the URL when you’re in your account.

---

### A5. Public URL for objects (choose one)

You need a base URL so the app can build public links to `.thing` files (e.g. `{PUBLIC_URL}/things/{hash}.thing`).

**Option 1 — R2.dev subdomain (quickest)**  
1. In **R2** → your bucket → **Settings**.  
2. Under **Public access**, enable **Allow Access** and choose **R2.dev subdomain**.  
3. Copy the subdomain URL (e.g. `https://pub-xxxx.r2.dev`).  
4. Use that as `CLOUDFLARE_R2_PUBLIC_URL` (no trailing slash).

**Option 2 — Custom domain**  
1. In bucket **Settings**, under **Public access**, add a custom domain (e.g. `cdn.thingsthatmatter.com`).  
2. Add the CNAME in your DNS as instructed by Cloudflare.  
3. Use `https://cdn.thingsthatmatter.com` as `CLOUDFLARE_R2_PUBLIC_URL`.

**Docs:** [R2 — Public bucket access](https://developers.cloudflare.com/r2/buckets/public-buckets/).

---

## Part B: Local environment (Day 1)

### B1. Create `.env` in shadow-index

1. Open the repo in your editor.

2. Go to `packages/shadow-index/`.

3. Copy the example file:
   - **Windows (PowerShell):**  
     `Copy-Item .env.example .env`  
   - **Or:** Duplicate `.env.example` and name the copy `.env`.

4. Open `.env` and set these (do **not** commit `.env`):

```env
# Storage: local = current behavior; r2 = use Cloudflare R2
STORAGE_MODE=local

# R2 (use the values from A2–A5)
CLOUDFLARE_R2_ACCOUNT_ID=your_32_char_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key_id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_access_key
CLOUDFLARE_R2_BUCKET_NAME=matter-artifacts-prod
CLOUDFLARE_R2_PUBLIC_URL=https://pub-xxxx.r2.dev
```

5. Replace:
   - `your_32_char_account_id` → Account ID from A4  
   - `your_access_key_id` → Access Key ID from A3  
   - `your_secret_access_key` → Secret Access Key from A3  
   - `matter-artifacts-prod` → your bucket name from A2  
   - `https://pub-xxxx.r2.dev` → your public URL from A5  

6. Save `.env`.

7. Confirm `.env` is in `.gitignore` (it should be from project setup).

---

### B2. Load `.env` when you run the API (optional but recommended)

The Node app reads `process.env`. To load `.env` automatically:

1. In `packages/shadow-index` run:
   ```bash
   npm install dotenv
   ```
2. At the very top of `packages/shadow-index/api/index.ts` (before other imports), add:
   ```ts
   import 'dotenv/config';
   ```
3. When you run `npm run start` or `npm run dev`, variables from `.env` will be set.

If you prefer not to use dotenv, export the variables in your shell before running the API (e.g. `$env:CLOUDFLARE_R2_ACCOUNT_ID='...'` in PowerShell).

---

### B3. Verify R2 upload/retrieve

1. In a terminal:
   ```bash
   cd packages/shadow-index
   npm run build
   npm run verify-r2
   ```

2. **If R2 is configured:** You should see `Uploaded: <url>` and `Retrieved: ... bytes — OK`.

3. **If not:** You’ll see “R2 not configured” and the list of env vars to set. Double-check A1–B1 and that the app (or shell) has access to the same `.env`.

4. After this works, you can switch to R2 when you want: set `STORAGE_MODE=r2` in `.env` and proceed to Part C (Day 2).

---

## Part C: Day 2 — Use R2 in the API

Once R2 is verified (Part B3), wire the API to use R2 when `STORAGE_MODE=r2`.

**Reference:** [13-SPRINT-3-PLAN.md](./13-SPRINT-3-PLAN.md) — Section 2.1, Day 2.

### C1. Import storage and helpers

In `packages/shadow-index/api/index.ts`:

1. At the top (with other imports), add:
   ```ts
   import { isR2Configured, uploadThing, getThing } from '../lib/storage.js';
   ```

2. After the existing constants (e.g. after `indexFile`), add:
   ```ts
   const storageMode = process.env.STORAGE_MODE || 'local';
   const useR2 = storageMode === 'r2' && isR2Configured();
   ```

---

### C2. POST /compile — write to R2 when `useR2` is true

1. Find where the `.thing` file is written (e.g. `await fs.writeFile(thingPath, ...)`).

2. After building `thingPayload` and before updating the index:
   - If `useR2`:
     - Serialize the payload to a buffer (e.g. `Buffer.from(JSON.stringify(thingPayload), 'utf8')`).
     - Call `thingUrl = await uploadThing(hash, buffer)`.
     - Do **not** write to `thingPath` on disk when using R2 (or keep a local write for dev if you prefer).
   - If not `useR2`:
     - Keep the current logic: write to `thingPath`, set `thingUrl` from local base URL (e.g. `http://localhost:3000/thing/${hash}`).

3. When updating the index entry, always set `thing_url` to the value you just computed (R2 URL or local URL).

4. Keep `thing_path` for local mode only if you still use it elsewhere; otherwise you can set it to `thingUrl` when R2.

---

### C3. GET /thing/:hash — read from R2 when `useR2` is true

1. Find the handler for `GET /thing/:hash`.

2. At the start of the handler:
   - If `useR2`:
     - `const data = await getThing(hash)`.
     - If `data === null`, return 404 with your usual error shape.
     - Otherwise return the body with `Content-Type: application/octet-stream` and status 200.
   - If not `useR2`:
     - Keep the current logic: read from `thingsDir` and serve the file (or 404).

---

### C4. Test with R2

1. Set `STORAGE_MODE=r2` in `packages/shadow-index/.env`.

2. Restart the API: `npm run start` (or `npm run dev`).

3. From repo root, create a demo thing and hit resolve:
   ```powershell
   powershell scripts/create-mvp-demo.ps1
   ```
   Then open the demo page or call `GET /resolve/<hash>` and confirm `thing_url` is your R2 public URL.

4. Open the `thing_url` in a browser (or `Invoke-RestMethod` with the URL); you should get the `.thing` content from R2.

5. Run Vitest: `npm run test` (or `npx vitest run`). Fix any failing tests (e.g. mock R2 or skip when R2 is enabled).

6. When done testing R2, you can set `STORAGE_MODE=local` again for local-only development.

---

## Part D: After Day 2 — Rust compiler (Sprint 3 plan)

Day 2 completes R2 integration. Next in Sprint 3 is the Rust compiler and optional CLI.

- **Rust compiler:** [13-SPRINT-3-PLAN.md](./13-SPRINT-3-PLAN.md) — Section 2.2 (Compiler::compile(), hash algorithm, tests).  
- **CLI:** Same doc — Section 2.2, Day 6 (`matter compile` binary).  
- **Rust compiler code:** `packages/matter-core/src/compiler/mod.rs` — replace `todo!()` with the logic described in the plan; keep hash algorithm identical to the Shadow Index API (stable key order, same stringify).

---

## Quick reference links

| Step | Link |
|------|------|
| Cloudflare Dashboard | [dash.cloudflare.com](https://dash.cloudflare.com/) |
| R2 Overview | [R2 Get started](https://developers.cloudflare.com/r2/get-started/) |
| R2 S3 API (we use this) | [R2 with S3 API](https://developers.cloudflare.com/r2/get-started/s3/) |
| R2 API tokens | [R2 API tokens](https://developers.cloudflare.com/r2/api/tokens/) |
| R2 public access | [R2 public buckets](https://developers.cloudflare.com/r2/buckets/public-buckets/) |
| Day 1 task list | [13-SPRINT-3-DAY1-TASKS.md](./13-SPRINT-3-DAY1-TASKS.md) |
| Sprint 3 plan | [13-SPRINT-3-PLAN.md](./13-SPRINT-3-PLAN.md) |

---

## Checklist summary

- [ ] **A1–A5** — R2 enabled, bucket created, API token created, Account ID and public URL noted  
- [ ] **B1** — `.env` created in `packages/shadow-index` with all R2 vars and `STORAGE_MODE=local`  
- [ ] **B2** — (Optional) dotenv installed and loaded in `api/index.ts`  
- [ ] **B3** — `npm run verify-r2` succeeds  
- [ ] **C1–C3** — API uses `uploadThing` / `getThing` when `STORAGE_MODE=r2`  
- [ ] **C4** — Demo flow and tests pass with R2  
- [ ] **Part D** — Rust compiler and CLI per Sprint 3 plan  

When you’re done with A and B, Day 1 is complete. When you’re done with C, Day 2 (R2 integration) is complete.
