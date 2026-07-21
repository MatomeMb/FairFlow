# Security Policy

## Supported versions

| Version | Supported |
|---------|-----------|
| `main` (latest) | ✅ |
| Older tags | Best effort only |

## Reporting a vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Email the maintainers using a private channel associated with the repository owner, or use GitHub **Private vulnerability reporting** if enabled on this repository:

1. Describe the issue and impact  
2. Include steps to reproduce  
3. Share affected versions / commit SHA if known  
4. Allow reasonable time for a fix before public disclosure  

We aim to acknowledge reports within **7 days** and provide a remediation plan within **30 days** for confirmed high-severity issues.

## Secrets and credentials

- Never commit `.env` files, private keys, or live API credentials  
- Use `.env.example` placeholders only  
- Rotate any credential that may have appeared in git history before a public release  

## Security features in Fairflow

- Merchant passwords hashed with PBKDF2 (SHA-256, high iteration count)  
- JWT-based merchant sessions; Supabase sessions for staff  
- Admin secret kept server-side (`/v1/admin-proxy` for browser staff actions)  
- Paystack webhook HMAC verification  
- Configurable rate limiting  
- Supabase RLS on role tables  

Details: [docs/SECURITY.md](./docs/SECURITY.md) and [docs/20-SECURITY-HARDENING.md](./docs/20-SECURITY-HARDENING.md).
