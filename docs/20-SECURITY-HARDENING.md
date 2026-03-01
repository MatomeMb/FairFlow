# Security Hardening & Compliance

**Security guidelines, compliance frameworks, and vulnerability management for fairflow.**

---

## Security Principles

1. **Defense in Depth** — Multiple layers of protection
2. **Least Privilege** — Minimal permissions required
3. **Fail Secure** — Errors default to denying access
4. **Security by Default** — Secure settings without manual configuration
5. **Regular Audits** — Continuous monitoring and testing

---

## Authentication Security

### Password Requirements

| Requirement | Specification | Rationale |
|-------------|---------------|-----------|
| Minimum length | 8 characters | Adequate entropy |
| Hashing algorithm | PBKDF2-SHA256 | OWASP-approved |
| Iterations | 100,000 | Slows brute force attacks |
| Salt | Random 16 bytes | Prevents rainbow tables |
| Storage | Hashed only, never plain | Zero recovery risk |

**Implementation:**
```typescript
// Correct:
const salt = crypto.randomBytes(16).toString('hex');
const derived = crypto.pbkdf2Sync(password, salt, 100_000, 32, 'sha256').toString('hex');
const storedHash = `${salt}:${derived}`;

// Incorrect:
const storedHash = password;  // ❌ Plain text
const storedHash = Buffer.from(password).toString('base64');  // ❌ Easily reversible
```

### JWT Security

| Config | Value | Reason |
|--------|-------|--------|
| Algorithm | HS256 | Symmetric HMAC (sufficient for internal use) |
| Secret | ≥ 32 characters | Adequate key space |
| Expiry | 7 days | Short-lived tokens |
| Signature verification | Always | Prevent tampering |
| Claim validation | Subject, type | Prevent token reuse |

**Implementation:**
```typescript
// Correct:
const token = signJwt({
  sub: account.id,
  email: account.email,
  typ: 'merchant_auth',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60
}, jwtSecret);

// Incorrect:
const token = signJwt({ email: account.email }, jwtSecret);  // Missing expiry
```

### Google OAuth Flow

```
1. Merchant clicks "Sign in with Google"
2. → Generate state token (JWT with nonce, validates immediately)
3. → Redirect to Google auth endpoint
4. → User grants permission
5. → Google redirects to /v1/auth/google/callback with code + state
6. → Verify state signature (prevents CSRF)
7. → Exchange code for access token via Google API
8. → Fetch user profile from Google
9. → Create/update local account
10. → Issue merchant JWT
11. → Redirect to merchant portal with token in URL
```

**Security Points:**
- [ ] State token signed with JWT secret
- [ ] State token has short expiry (10 min)
- [ ] Code exchanged server-side only (never client-side)
- [ ] Redirect URI whitelist checked
- [ ] Access token never stored (one-time use)

---

## API Security

### Rate Limiting

**Configuration:**
```env
RATE_LIMIT_WINDOW_MS=60000    # 1 minute window
RATE_LIMIT_MAX=100            # 100 requests per window
```

**Enforcement:**
```
GET /health          → Not rate limited (observability)
GET /v1/analytics/dashboard → Not rate limited (internal)
POST /v1/auth/merchant/login → Stricter (see below)
All others           → 100 req/min per IP
```

**Login Endpoint (Abuse Prevention):**
```
POST /v1/auth/merchant/login
- Hard limit: 10 failed attempts per email per hour
- Auto-block: Lock account for 15 minutes after 10 failures
- Logging: Log all failed attempts with timestamp and IP
```

**Implementation:**
```typescript
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

// Before login:
const email = body.email.toLowerCase();
const attempt = loginAttempts.get(email);
if (attempt && Date.now() < attempt.resetAt && attempt.count >= 10) {
  return c.json(err('too_many_attempts', 'Account locked for 15 minutes'), 429);
}
```

### API Key Management

**Static API Keys (Optional for MVP):**
```env
# Single key (deprecated):
SHADOW_INDEX_API_KEY=sk_live_xxx

# Multiple keys (preferred):
SHADOW_INDEX_API_KEYS=sk_live_xxxx,sk_live_yyyy,sk_live_zzzz
SHADOW_INDEX_REVOKED_KEYS=sk_live_xxxx   # Revoked key
```

**Validation:**
```typescript
function isApiKeyValid(key: string | null | undefined): boolean {
  if (!key) return false;
  
  // Check revoked list
  const revoked = (process.env.SHADOW_INDEX_REVOKED_KEYS ?? '').split(',');
  if (revoked.includes(key)) return false;
  
  // Check allowed list
  const allowed = (process.env.SHADOW_INDEX_API_KEYS ?? '').split(',');
  return allowed.includes(key);
}
```

**Best Practices:**
- [ ] Never commit API keys to git
- [ ] Rotate keys quarterly
- [ ] Store keys in secrets manager (e.g., HashiCorp Vault)
- [ ] Log all API key usage
- [ ] Revoke compromised keys immediately

### CORS Configuration

```typescript
app.use('*', cors());  // Current: Allow all origins

// Better for production:
app.use('*', cors({
  origin: ['https://fairflow.app', 'http://localhost:5178'],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  headers: ['Content-Type', 'Authorization']
}));
```

---

## Data Protection

### Sensitive Data Handling

| Data Type | Storage | Encryption | Access |
|-----------|---------|-----------|--------|
| Passwords | DB hash | PBKDF2 | Never logged |
| Auth tokens | Memory | HS256 signed | Auth middleware |
| Payment info | Never | - | Stripe only |
| KYC data | File system | AES-256 | Admin only |
| API keys | Env var | - | Process only |
| Customer email | Plain text | Acceptable | Needed for contact |

**Never log:**
```typescript
// ❌ Wrong:
console.log('User login:', { email, password });

// ✅ Right:
log.info('Login attempt', { email });
```

### Encryption at Rest

**For sensitive fields (KYC data):**
```typescript
import crypto from 'crypto';

function encryptKYC(data: object, key: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(data), 'utf8'),
    cipher.final()
  ]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decryptKYC(encrypted: string, key: string): object {
  const [ivHex, dataHex] = encrypted.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataHex, 'hex')),
    decipher.final()
  ]);
  return JSON.parse(decrypted.toString('utf8'));
}
```

**Environment Configuration:**
```env
KYC_ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
# Generated: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Database Security (Future)

When migrating to PostgreSQL:
- [ ] Use parameterized queries (prevent SQL injection)
- [ ] Row-level security (merchants see only their data)
- [ ] Encrypted connections (SSL/TLS)
- [ ] Audit logging (who changed what, when)
- [ ] Data masking in logs (never log sensitive fields)

---

## Error Handling Security

### Do Not Leak Information

```typescript
// ❌ Dangerous: Reveals database structure
return c.json(err('db_error', 'Column "email" not found'), 500);

// ✅ Safe: Generic error
return c.json(err('internal_error', 'Failed to process request'), 500);

// ✅ Safe for dev: Detailed error only in logs
log.error('Database error', { error: err.message, query, columns });
return c.json(err('internal_error', 'Database unavailable'), 500);
```

### Specific vs. Generic Errors

**Information Leakage Risk:**

```typescript
// ❌ Reveals user exists
POST /v1/auth/merchant/forgot-password
return c.json(err('account_exists', 'Email registered'), 200);

// ✅ Safe: Same response either way
if (!account) {
  // Account doesn't exist, but say success anyway
}
return c.json({ ok: true, message: 'If account exists, reset sent' }, 200);
```

---

## Compliance Frameworks

### OWASP Top 10 (API Security)

| Topic | Status | Implementation |
|-------|--------|---|
| Injection | ✅ | Zod schema validation, parameterized queries |
| Broken Authentication | ✅ | JWT + password hashing |
| Sensitive Data Exposure | ⚠️ | Implement TLS in production |
| XML External Entities | ✅ | No XML parsing |
| Broken Access Control | ✅ | Merchant auth middleware |
| Security Misconfiguration | ✅ | Environment validation |
| Cross-Site Scripting | ✅ | No user input in DOM |
| Insecure Deserialization | ✅ | Only JSON parsing |
| Using Components with Known Vuln | ⚠️ | Regular `npm audit` |
| Insufficient Logging | ✅ | Structured logging |

### PCI DSS (Payment Security)

Since fairflow uses Stripe Checkout (no card storage):
- ✅ No cardholder data stored
- ✅ No direct payment processing
- ✅ PCI compliance delegated to Stripe

**Still requires:**
- [ ] HTTPS for auth portal
- [ ] Secure JWT handling
- [ ] Order PII protection
- [ ] Regular security audits

---

## Vulnerability Management

### Regular Audits

```bash
# Weekly
npm audit                    # Check for known vulnerabilities
npm outdated                 # Review outdated packages

# Monthly
npm run security-check       # Custom security checks
# Manual code review: auth, payment, analytics endpoints

# Quarterly
penetration-test.sh         # External pen test (if applicable)
```

### Incident Response

**If vulnerability found:**

1. **Assess** (1 hour)
   - Severity: Low/Medium/High/Critical
   - Affected systems
   - Exploitability
   
2. **Contain** (2 hours)
   - Disable affected feature if critical
   - Revoke affected keys if needed
   - Enable verbose logging
   
3. **Fix** (24 hours)
   - Write patch
   - Test thoroughly
   - Deploy to staging
   
4. **Deploy** (4 hours after fix)
   - Follow deployment runbook
   - Monitor closely
   - Check logs for exploitation attempts
   
5. **Review** (next week)
   - Post-mortem: what allowed vulnerability
   - Process improvement: how to catch earlier
   - Documentation: update security guide

---

## Security Checklist

- [ ] All passwords hashed with PBKDF2 (100k iterations)
- [ ] JWTs signed and validated
- [ ] API keys validated on every request
- [ ] Rate limiting active (10/min for auth, 100/min for others)
- [ ] Error messages don't leak information
- [ ] Sensitive data never logged
- [ ] CORS configured for specific origins
- [ ] Dependencies scanned for vulnerabilities (`npm audit`)
- [ ] HTTPS enabled in production
- [ ] Environment variables for all secrets
- [ ] Database queries parameterized (when using DB)
- [ ] Audit logging for sensitive operations

---
