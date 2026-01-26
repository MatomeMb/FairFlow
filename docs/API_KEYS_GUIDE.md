# API Keys Setup Guide

This guide will help you obtain all the API keys and credentials needed for the `.things that Matter` project.

## Required Services

You need accounts and API keys from the following services:

1. **Supabase** - Database and backend services
2. **Cloudflare R2** - Object storage for .thing files
3. **Replicate** - CLIP model API for semantic vectorization
4. **Ed25519 Keys** - Cryptographic signing keys (generate locally)

---

## 1. Supabase Setup

### Step 1: Create Account
1. Go to: https://supabase.com
2. Click "Start your project" or "Sign up"
3. Sign up with GitHub, Google, or email

### Step 2: Create Project
1. Click "New Project"
2. Fill in:
   - **Name:** `things-that-matter` (or your preferred name)
   - **Database Password:** Create a strong password (save it!)
   - **Region:** Choose closest to you
   - **Pricing Plan:** Free tier is sufficient for development

3. Click "Create new project"
4. Wait 2-3 minutes for project to initialize

### Step 3: Get API Keys
1. Once project is ready, go to **Settings** (gear icon) → **API**
2. You'll find:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon/public key:** `eyJhbGc...` (starts with `eyJ`)
   - **service_role key:** `eyJhbGc...` (⚠️ Keep this secret!)

3. Copy these values to your `.env` file:
   ```
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_ANON_KEY=eyJhbGc...
   SUPABASE_SERVICE_KEY=eyJhbGc...
   ```

**Free Tier Limits:**
- 500 MB database
- 2 GB file storage
- 2 million API requests/month
- Perfect for development and Phase 0 testing

---

## 2. Cloudflare R2 Setup

### Step 1: Create Account
1. Go to: https://dash.cloudflare.com/sign-up
2. Sign up (free account works)

### Step 2: Enable R2
1. In Cloudflare dashboard, go to **R2** in the left sidebar
2. Click "Get started" or "Enable R2"
3. Accept terms and enable R2

### Step 3: Create Bucket
1. Click "Create bucket"
2. Name it: `matter-artifacts` (or your preferred name)
3. Click "Create bucket"

### Step 4: Create API Token
1. Go to **Manage R2 API Tokens** (or click "Manage API Tokens" in R2 dashboard)
2. Click "Create API token"
3. Fill in:
   - **Token name:** `matter-artifacts-token`
   - **Permissions:** 
     - ✅ Object Read & Write
     - ✅ Admin Read (optional, for bucket management)
   - **TTL:** Leave blank (no expiration) or set expiration date
   - **Buckets:** Select `matter-artifacts` bucket

4. Click "Create API Token"
5. **IMPORTANT:** Copy the credentials immediately (you won't see them again!)
   - **Access Key ID:** `xxxxx...`
   - **Secret Access Key:** `xxxxx...`

### Step 5: Get Account ID
1. In Cloudflare dashboard, go to any page
2. Look at the right sidebar - your **Account ID** is displayed there
3. Or go to **R2** → **Overview** → Account ID is shown

### Step 6: Create Public URL (Optional but Recommended)
1. In R2 dashboard, go to your bucket
2. Click "Settings" tab
3. Under "Public Access", click "Allow Access"
4. This creates a public URL like: `https://pub-xxxxx.r2.dev`

### Step 7: Add to .env
```
CLOUDFLARE_R2_ACCOUNT_ID=your-account-id
CLOUDFLARE_R2_ACCESS_KEY_ID=your-access-key-id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-secret-access-key
CLOUDFLARE_R2_BUCKET_NAME=matter-artifacts
CLOUDFLARE_R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
```

**Pricing:**
- First 10 GB storage: **FREE**
- After that: $0.015/GB/month
- Egress (downloads): $0.09/GB
- For Phase 0 (10K products): ~R630/month estimated

---

## 3. Replicate API Setup

### Step 1: Create Account
1. Go to: https://replicate.com
2. Click "Sign up" or "Get started"
3. Sign up with GitHub, Google, or email

### Step 2: Get API Key
1. After signing up, go to: https://replicate.com/account/api-tokens
2. You'll see your API token (starts with `r8_...`)
3. Click "Copy" to copy it

### Step 3: Add to .env
```
REPLICATE_API_KEY=r8_xxxxx...
```

**Pricing:**
- Pay-as-you-go
- CLIP model: ~$0.0025 per image (~R0.40 per image)
- For Phase 0 (10K products): ~R540/month estimated
- Free tier: $10 credit to start

**Model to Use:**
- Model: `openai/clip-vit-base-patch32`
- This is the CLIP model for semantic vectorization

---

## 4. Ed25519 Signing Keys (Generate Locally)

These keys are used for cryptographic signing of .thing files. You need to generate them locally.

### Option 1: Using Rust (Recommended - Once matter-core is built)

```bash
# This will be implemented later, but for now use OpenSSL
```

### Option 2: Using OpenSSL

1. **Install OpenSSL** (if not already installed):
   - Windows: Download from https://slproweb.com/products/Win32OpenSSL.html
   - Or use Git Bash (comes with OpenSSL)

2. **Generate Ed25519 key pair:**
   ```bash
   # Generate private key
   openssl genpkey -algorithm Ed25519 -out private_key.pem
   
   # Extract public key
   openssl pkey -in private_key.pem -pubout -out public_key.pem
   
   # Convert to base64 for .env file
   # Windows PowerShell:
   $private = [Convert]::ToBase64String([IO.File]::ReadAllBytes("private_key.pem"))
   $public = [Convert]::ToBase64String([IO.File]::ReadAllBytes("public_key.pem"))
   Write-Host "SIGNING_PRIVATE_KEY=$private"
   Write-Host "SIGNING_PUBLIC_KEY=$public"
   ```

3. **Add to .env:**
   ```
   SIGNING_PRIVATE_KEY=base64-encoded-private-key
   SIGNING_PUBLIC_KEY=base64-encoded-public-key
   ```

### Option 3: Using Online Tool (Temporary - for testing only)

⚠️ **Warning:** Only use for development/testing. Never use online tools for production keys.

1. Go to: https://8gwifi.org/ed25519functions.jsp
2. Click "Generate Key"
3. Copy the keys (they're already in the right format)

### Option 4: Using Python (If you have Python installed)

```python
from cryptography.hazmat.primitives.asymmetric import ed25519
from cryptography.hazmat.primitives import serialization
import base64

# Generate key pair
private_key = ed25519.Ed25519PrivateKey.generate()
public_key = private_key.public_key()

# Serialize private key
private_pem = private_key.private_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PrivateFormat.PKCS8,
    encryption_algorithm=serialization.NoEncryption()
)

# Serialize public key
public_pem = public_key.public_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PublicFormat.SubjectPublicKeyInfo
)

# Convert to base64
private_b64 = base64.b64encode(private_pem).decode('utf-8')
public_b64 = base64.b64encode(public_pem).decode('utf-8')

print(f"SIGNING_PRIVATE_KEY={private_b64}")
print(f"SIGNING_PUBLIC_KEY={public_b64}")
```

**Security Notes:**
- ⚠️ **Never commit private keys to git!**
- ✅ Private keys are in `.gitignore`
- ✅ Keep private key secure - if compromised, regenerate keys
- ✅ Public key can be shared (used for verification)

---

## 5. Redis (Optional - for Caching)

Redis is optional but recommended for production. For development, you can skip this.

### Option 1: Redis Cloud (Free Tier)
1. Go to: https://redis.com/try-free/
2. Sign up for free account
3. Create free database
4. Get connection URL: `redis://default:password@host:port`

### Option 2: Local Redis
1. Install Redis locally
2. Use: `redis://localhost:6379`

### Option 3: Skip for Now
- Leave `REDIS_URL` empty or use placeholder
- The API will work without Redis (just no caching)

---

## Quick Checklist

- [ ] Supabase account created
- [ ] Supabase project created
- [ ] Supabase URL, anon key, and service key copied
- [ ] Cloudflare account created
- [ ] Cloudflare R2 enabled
- [ ] R2 bucket created (`matter-artifacts`)
- [ ] R2 API token created (access key ID + secret)
- [ ] Cloudflare account ID found
- [ ] Replicate account created
- [ ] Replicate API key copied
- [ ] Ed25519 keys generated
- [ ] All keys added to `.env` file

---

## Testing Your Keys

After adding all keys to `.env`, test them:

### Test Supabase Connection
```bash
cd packages/shadow-index
pnpm dev
# Try making a request to test Supabase connection
```

### Test Cloudflare R2
```bash
# Will be tested when you upload first .thing file
```

### Test Replicate API
```bash
# Will be tested when you compile first product
```

---

## Security Best Practices

1. ✅ **Never commit `.env` file** - It's in `.gitignore`
2. ✅ **Use different keys for development and production**
3. ✅ **Rotate keys periodically** (especially if exposed)
4. ✅ **Use environment variables in production** (not .env files)
5. ✅ **Keep service keys secret** (Supabase service key, R2 secret key)
6. ✅ **Monitor API usage** to avoid unexpected charges

---

## Cost Summary (Phase 0 Estimates)

| Service | Free Tier | Estimated Cost (10K products) |
|---------|-----------|-------------------------------|
| Supabase | ✅ Free | R0/month |
| Cloudflare R2 | 10 GB free | ~R630/month |
| Replicate | $10 credit | ~R540/month |
| **Total** | | **~R1,170/month** |

---

## Need Help?

- **Supabase Docs:** https://supabase.com/docs
- **Cloudflare R2 Docs:** https://developers.cloudflare.com/r2/
- **Replicate Docs:** https://replicate.com/docs
- **Ed25519 Info:** https://ed25519.cr.yp.to/

---

**Last Updated:** January 21, 2026
