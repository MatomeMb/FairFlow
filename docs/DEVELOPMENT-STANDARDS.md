# Development Standards & Code Quality

**Establishes minimum professional standards for code quality, testing, performance, and security.**

---

## Code Quality Standards

### TypeScript Configuration

- **Strict mode enabled** — all compiler options enforced
- **No `any` types** — use `unknown` or specific unions instead
- **Explicit return types** — required on all functions
- **Unused variable detection** — `noUnusedLocals` and `noUnusedParameters` enabled

**Validation:**
```bash
npm run type-check  # Must pass without errors
```

### ESLint Rules

| Rule | Enforcement | Purpose |
|------|-------------|---------|
| `no-console` | Warn (except error/warn/info) | Prevent debug logs in production |
| `@typescript-eslint/no-explicit-any` | Warn | Encourage type safety |
| `@typescript-eslint/no-unused-vars` | Error | Clean codebase |
| `no-implicit-returns` | Error | Explicit function contracts |

**Validation:**
```bash
npm run lint  # Must pass without errors
```

---

## Testing Standards

### Minimum Coverage Requirements

| Category | Target | Status |
|----------|--------|--------|
| Statements | 80% | — |
| Branches | 75% | — |
| Functions | 80% | — |
| Lines | 80% | — |

### Test Organization

```
tests/
├── unit/          # Pure function tests (no I/O)
├── integration/   # Database + API route tests
├── e2e/           # End-to-end workflows
└── fixtures/      # Mock data and test utilities
```

### Test Naming Convention

```typescript
describe('Feature: <component>', () => {
  describe('when <condition>', () => {
    it('should <expected behavior>', () => {
      // 3-part: arrange, act, assert
    });
  });
});
```

### Critical Path Testing

**Must have tests:**
- [REQUIRED] Authentication flow (register, login, OAuth)
- [REQUIRED] Payment processing (checkout, webhook)
- [REQUIRED] Analytics ingestion & reporting
- [REQUIRED] Error handling & edge cases
- [REQUIRED] Rate limiting & abuse prevention

**Execution:**
```bash
npm test                              # Run all tests
npm test -- --coverage              # With coverage report
npm test -- --run                   # CI mode (no watch)
```

---

## Error Handling Standards

### Error Response Shape

All errors must use consistent structure:

```typescript
interface ErrorResponse {
  code: string;           // Machine-readable: 'invalid_request', 'not_found'
  message: string;        // Human-readable description
  details?: unknown;      // Optional validation or context data
}
```

### Error Codes (HTTP Status Mapping)

| Code | Status | Example |
|------|--------|---------|
| `invalid_request` | 400 | Malformed JSON, validation failure |
| `unauthorized` | 401 | Missing/invalid auth token |
| `forbidden` | 403 | Permission denied |
| `not_found` | 404 | Resource not found |
| `conflict` | 409 | Duplicate email, account exists |
| `rate_limit_exceeded` | 429 | Too many requests |
| `internal_error` | 500 | Database, filesystem, or unknown error |

### Error Handling Pattern

```typescript
try {
  // Business logic
  return c.json(result, 200);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  logError({ path, method }, message, error instanceof Error ? error.stack : undefined);
  return c.json(err('internal_error', message), 500);
}
```

---

## Logging Standards

### Structured Logging

Use `logger.ts` instead of `console.*`:

```typescript
import { log } from '../lib/logger.js';

// Correct:
log.info('Product compiled', { hash, merchant_id });
log.error('Stripe webhook failed', { status, reason }, error);

// Incorrect:
console.log('Product compiled');
console.error('Error:', error);
```

### Log Levels

| Level | Use Case | Example |
|-------|----------|---------|
| `debug` | Development verbosity | SQL queries, cache hits/misses |
| `info` | Normal operations | API calls, job completions |
| `warn` | Recoverable issues | Retry attempts, degraded service |
| `error` | Action required | Failed payments, data loss risk |

**Control via environment:**
```bash
LOG_LEVEL=debug npm run dev      # Verbose during development
LOG_LEVEL=error npm start         # Only errors in production
```

---

## Performance Standards

### API Response Time Targets

| Endpoint Class | Target | Acceptable |
|---|---|---|
| Compile product | < 50ms | < 100ms |
| Resolve hash | < 20ms | < 50ms |
| Analytics report | < 500ms (100 rows) | < 1000ms |
| Merchant auth | < 200ms | < 500ms |

### Benchmarking

Run performance tests:
```bash
npm run load-test              # Sustained load test
npm run pre-aggregate          # Pre-aggregation performance
```

### Caching Requirements

- View/click events: aggregated nightly
- Product metadata: 5-minute TTL
- Merchant tokens: runtime in-memory with expiry

---

## Security Standards

### Authentication

- **Passwords:** PBKDF2 with 100k iterations, random salt
- **JWT:** HS256 with 32+ char secret, 7-day expiry
- **Google OAuth:** HTTPS redirect URI, state token validation

### Rate Limiting

- **Default:** 100 req/min per IP
- **Stripe webhooks:** No limit (webhook secret required)
- **Auth endpoints:** Stricter limits (10 req/min for login attempts)

### Data Protection

- **Secrets:** Environment variables only, never commit
- **KYC data:** AES-256 encryption at rest (demo only)
- **Payment data:** Never stored, Stripe Checkout flow only

---

## Documentation Standards

### Code Comments

- **Why, not what** — explain design decisions
- **Public API:** JSDoc for all exported functions
- **Complex logic:** Inline comments for non-obvious steps

**Example:**
```typescript
/**
 * Hash product data deterministically.
 * Uses stable JSON stringification to ensure
 * identical inputs produce identical hashes.
 *
 * @param product Product object to hash
 * @returns SHA-256 hex digest (64 chars)
 */
function hashProduct(product: Record<string, unknown>): string {
  const payload = stableStringify(product);
  return crypto.createHash('sha256').update(payload).digest('hex');
}
```

### README Requirements

Every package must have:
- Clear purpose statement
- Tech stack summary
- Getting started guide
- API surface documentation
- Environment variables table

### Architecture Documentation

- System diagrams (ASCII Mermaid diagrams acceptable)
- Data flow explanations
- Deployment architecture
- Scaling considerations

---

## Git Workflow Standards

### Commit Message Format

```
<type>(<scope>): <subject>

<body (optional)>

<footer (optional)>
```

**Types:** feat, fix, docs, style, refactor, perf, test, chore  
**Scope:** Component affected (api, auth, analytics, extension)  
**Subject:** Imperative, present tense, <= 72 chars

**Examples:**
```
feat(analytics): add pre-aggregation for large datasets
fix(auth): handle OAuth state verification timeout
docs(setup): add Stripe webhook configuration steps
chore(deps): update Hono to v4.1.0
```

### Branch Protection Rules

`main` branch requires:
- [VERIFIED] All tests passing
- [VERIFIED] Code review approval
- [VERIFIED] Branch up-to-date with latest main
- [VERIFIED] No direct pushes (PRs only)

### Pull Request Checklist

- [ ] Tests added/updated
- [ ] Types pass (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)
- [ ] Documentation updated
- [ ] Changelog entry added (if applicable)
- [ ] Risk assessment (breaking changes, data migrations, etc.)

---

## Deployment Standards

### Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Build succeeds (`npm run build`)
- [ ] No security vulnerabilities (`npm audit`)
- [ ] Performance baseline met
- [ ] Environment variables documented
- [ ] Database migrations recorded (if applicable)
- [ ] Rollback procedure documented

### Monitoring Post-Deployment

- Error rate (target: < 0.1%)
- API latency (target: p95 < 500ms)
- Cache hit rate (target: > 80%)
- Payment success rate (target: > 99%)

---

## Enforcement

**Automated Checks:**
```bash
npm run pre-commit  # Runs lint + type-check + tests
```

**Manual Reviews:**
- Code architecture review: CTO
- Security review: For auth, payment, data handling
- Documentation review: All user-facing features

---
