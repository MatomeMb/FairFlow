# Create R2 API Token — Step-by-Step

You have the bucket **matter-artifacts-prod**. Follow these steps to create an API token so the Shadow Index can upload and read `.thing` files.

**Official docs:** [Cloudflare R2 — Authentication (API tokens)](https://developers.cloudflare.com/r2/api/tokens/)

---

## 1. Open R2 in the dashboard

1. Go to **[Cloudflare Dashboard](https://dash.cloudflare.com/)** and log in.
2. In the left sidebar, click **R2** (under **Storage & databases**).  
   Or open: **https://dash.cloudflare.com** → select your account → **R2** → **Overview**.
3. You should see your bucket **matter-artifacts-prod** in the list.

---

## 2. Open “Manage R2 API Tokens”

1. On the R2 page, look for **Manage R2 API Tokens** (often in the top-right or under a **Settings** / **API** area).
2. Click **Manage R2 API Tokens**.  
   You may be taken to a dedicated “R2 API Tokens” or “Object Storage API Tokens” page.

---

## 3. Create a new token

1. Click **Create API token** (or **Create R2 API token**).
2. You may be asked to choose:
   - **Create Account API token** — tied to the account; good for servers/CI. (Only Super Administrators see this.)
   - **Create User API token** — tied to your user; good for local/dev.  
   Choose **Create User API token** if that’s what you see; otherwise use **Create Account API token**.

---

## 4. Name the token

1. **Token name:** e.g. `matter-shadow-index` or `matter-artifacts-prod`.
2. Leave any other optional fields as default unless you need something specific.

---

## 5. Set permissions

1. Under **Permissions**, choose:
   - **Object Read & Write**  
     This allows read, write, and list for the bucket(s) you’ll select. It’s what the Shadow Index needs.
2. If the UI asks to **specify buckets** (optional):
   - Choose **Apply to specific buckets only** (or similar).
   - Select **matter-artifacts-prod**.  
   This limits the token to that bucket. If you don’t see bucket scoping, the token will apply to all R2 buckets in the account.

---

## 6. Create and copy credentials immediately

1. Click **Create API token** (or **Create User API token**).
2. On the next screen you will see:
   - **Access Key ID** (long string)
   - **Secret Access Key** (long string)
3. **Copy both values now.**  
   Cloudflare will **not** show the Secret Access Key again. If you lose it, you must create a new token.
4. Store them somewhere safe (e.g. password manager or a local `.env` you never commit). You’ll paste them into `packages/shadow-index/.env` in the next step.

---

## 7. Get your Account ID (if you don’t have it)

You need the **Account ID** for the S3 endpoint and for `.env`:

1. In the Cloudflare dashboard, stay in **R2** or go to any product (e.g. **Workers**).
2. Look in the **right sidebar** for **Account ID** (32-character hex string).
3. Or check the URL when you’re in your account:  
   `https://dash.cloudflare.com/<ACCOUNT_ID>/r2/...`  
   The `<ACCOUNT_ID>` part is your Account ID.
4. Copy and save it; you’ll use it as `CLOUDFLARE_R2_ACCOUNT_ID` in `.env`.

**Docs:** [Find account and zone IDs](https://developers.cloudflare.com/fundamentals/account/find-account-and-zone-ids/)

---

## 8. Put the values in `.env`

1. Open **`packages/shadow-index/.env`** (create it from `.env.example` if it doesn’t exist).
2. Set (replace with your real values):

```env
STORAGE_MODE=local

CLOUDFLARE_R2_ACCOUNT_ID=your_32_char_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=paste_access_key_id_here
CLOUDFLARE_R2_SECRET_ACCESS_KEY=paste_secret_access_key_here
CLOUDFLARE_R2_BUCKET_NAME=matter-artifacts-prod
CLOUDFLARE_R2_PUBLIC_URL=https://your_public_url_here
```

3. **CLOUDFLARE_R2_PUBLIC_URL:**  
   - If you enabled the **R2.dev subdomain** for the bucket: use that URL (e.g. `https://pub-xxxx.r2.dev`), no trailing slash.  
   - If you use a **custom domain**: use that (e.g. `https://cdn.thingsthatmatter.com`), no trailing slash.
4. Save the file.  
   Ensure **`.env`** is in **`.gitignore`** and never commit it.

---

## 9. Verify the token

From the repo root:

```powershell
cd packages\shadow-index
npm run build
npm run verify-r2
```

- If you see **Uploaded:** and **Retrieved: ... bytes — OK**, the token and bucket are working.
- If you see **R2 not configured**, double-check that every variable in step 8 is set and that you’re running from `packages/shadow-index` (and, if you use one, that your app loads `.env`).

---

## Quick checklist

- [ ] Opened R2 → **Manage R2 API Tokens**
- [ ] Created token with **Object Read & Write**
- [ ] (Optional) Scoped token to bucket **matter-artifacts-prod**
- [ ] Copied **Access Key ID** and **Secret Access Key** immediately
- [ ] Noted **Account ID**
- [ ] Set **CLOUDFLARE_R2_PUBLIC_URL** (R2.dev subdomain or custom domain)
- [ ] Pasted all values into `packages/shadow-index/.env`
- [ ] Ran `npm run verify-r2` and saw success

---

**Reference:** [R2 — Authentication (API tokens)](https://developers.cloudflare.com/r2/api/tokens/)
