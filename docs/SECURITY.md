# Security

Portfolio- and production-oriented security notes for Fairflow.

---

## Principles

1. **Defense in depth** — authn, authz, validation, rate limits, TLS  
2. **Least privilege** — service role and admin secrets never in the browser  
3. **Fail closed** — missing prod secrets throw; webhooks reject bad signatures  
4. **No secrets in git** — examples use placeholders only  
5. **Assume breach of history** — rotate keys if the repo was ever private with real env files  

---

## Secret inventory

| Secret | Where it belongs | Public repo? |
|--------|------------------|--------------|
| `JWT_SECRET` | API host env | ❌ |
| `ADMIN_SECRET_KEY` | API host env | ❌ |
| `SHADOW_INDEX_API_KEY` | API + portal build env | ❌ |
| `SUPABASE_SERVICE_KEY` | API only | ❌ |
| `VITE_SUPABASE_ANON_KEY` | Portal build (anon/public) | ⚠️ public by design; lock with RLS |
| `PAYSTACK_SECRET_KEY` | API only | ❌ |
| `GOOGLE_CLIENT_SECRET` | API only | ❌ |
| `SUMSUB_*` secrets | API only | ❌ |
| `R2_SECRET_ACCESS_KEY` | API only | ❌ |
| `RESEND_API_KEY` | API only | ❌ |
| Ed25519 signing private key | Secure store / API | ❌ |

---

## Git history hygiene

This checkout may contain a **shallow or single-commit** history. Before making any fork **public**:

1. Search history for secrets:

```bash
git log -p --all -S 'sk_live' | head
git log -p --all -S 'SUPABASE_SERVICE' | head
git rev-list --all | xargs git grep -n 'BEGIN PRIVATE' || true
```

2. If secrets were ever committed, **rewrite history** and **rotate every key**:

### git-filter-repo (recommended)

```bash
pip install git-filter-repo
# Example: remove a leaked file from all history
git filter-repo --path path/to/leaked.env --invert-paths
# Or replace leaked strings:
# git filter-repo --replace-text expressions.txt
```

### BFG Repo Cleaner

```bash
bfg --delete-files .env
bfg --replace-text passwords.txt
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

3. Force-push only to a branch you control after coordination; treat old SHAs as compromised.  
4. Document the rotation in your private ops notes (not necessarily public).

---

## Application controls

| Control | Implementation |
|---------|----------------|
| Password hashing | PBKDF2-SHA256 |
| Merchant JWT | HS256 + `JWT_SECRET` |
| Staff elevation | Supabase roles + optional `VITE_ADMIN_EMAILS` |
| Admin browser path | `/v1/admin-proxy` |
| Webhooks | HMAC verification |
| Input validation | Zod |
| Rate limiting | Middleware + env knobs |
| CORS | Configured origins |
| Storage | No service keys in client bundles |

---

## Data protection

- **PII** in orders (email, address, phone) — minimize retention; sanitize fixtures  
- **KYC / bank data** — treat as highly sensitive; encrypt at rest when `KYC_ENCRYPTION_KEY` is set  
- **Logs** — avoid logging Authorization headers, raw card data (Paystack should never send PAN to you), or secrets  

Committed demo data must be **anonymized** (`customer@example.com`, fake phones, zeroed account numbers).

---

## Dependency security

- GitHub Dependabot config: `.github/dependabot.yml`  
- Run `npm audit` in each package before releases  
- Prefer lockfiles committed for apps (see CONTRIBUTING)  

---

## Disclosure

See root [SECURITY.md](../SECURITY.md).

---

## Related

- [20-SECURITY-HARDENING.md](./20-SECURITY-HARDENING.md)  
- [AUTHENTICATION.md](./AUTHENTICATION.md)  
- [OPEN-SOURCE-READINESS-REPORT.md](./OPEN-SOURCE-READINESS-REPORT.md)  
