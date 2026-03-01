# Testing Standards and Coverage Report

## Executive Summary

- **Test Framework:** Vitest (Jest-compatible)
- **E2E Testing:** Playwright
- **Coverage Target:** 80%+
- **Quality Gate:** All commits must pass tests pre-merge

---

## Test Structure

### Unit Tests (Vitest)

Location: `tests/` directory in each package

**Test Files:**
```
tests/
├── analytics-events.test.ts        # Analytics event processing
├── api-health.test.ts              # API health checks
├── compile-resolve.test.ts         # Shadow-index resolution
├── merchant-auth.test.ts           # Merchant authentication
├── error-logger.test.ts            # Error tracking system
└── logger.test.ts                  # Structured logging
```

**Running Unit Tests:**
```bash
npm test                    # Run all unit tests
npm test -- --watch        # Watch mode for development
npm test:coverage          # Run with coverage report
```

### Integration Tests

Tests that verify component interactions and data flow:
- Merchant authentication → order processing → payment settlement
- Event logging → aggregation → reporting
- Error detection → categorization → alerting

### E2E Tests (Playwright)

Location: `tests/e2e/` (future: implement for merchant portal flows)

**Running E2E Tests:**
```bash
npm run test:e2e            # Run all E2E tests
npm run test:e2e:debug      # Interactive debugging
```

---

## Code Coverage Analysis

### Current Coverage Baseline

**shadow-index Package:**
- `api/index.ts` - 30+ endpoints with comprehensive error handling
- `lib/logger.ts` - Structured logging (test: logger.test.ts)
- `lib/analytics-report.ts` - Analytics aggregation engine
- `lib/error-logger.ts` - Error window tracking

**Minimum Coverage Requirements by Category:**
| Category | Minimum | Target |
|----------|---------|--------|
| Statements | 75% | 85%+ |
| Branches | 70% | 80%+ |
| Functions | 75% | 85%+ |
| Lines | 75% | 85%+ |

### Coverage Gaps to Address

**Priority 1 (Critical):**
1. Payment processing logic (Stripe integration)
   - Current: Limited coverage
   - Target: 90%+ (financial transaction criticality)

2. Merchant authentication (Supabase + JWT)
   - Current: Merchant auth test exists
   - Target: 95%+ (security-critical)

3. Error handling paths
   - Current: Error logger test exists
   - Target: 90%+ (operational visibility)

**Priority 2 (High):**
1. Analytics aggregation edge cases
   - Current: Basic tests exist
   - Target: 85%+

2. API endpoint error responses
   - Current: Health check test exists
   - Target: 80%+ across all endpoints

### Test Execution Report

**Running Coverage Analysis:**
```bash
npm test:coverage
```

**Expected Output:**
```
 ✓ tests/logger.test.ts (5 tests)
 ✓ tests/error-logger.test.ts (8 tests)
 ✓ tests/merchant-auth.test.ts (6 tests)
 ✓ tests/api-health.test.ts (3 tests)
 ✓ tests/analytics-events.test.ts (4 tests)
 ✓ tests/compile-resolve.test.ts (2 tests)

Tests:  28 passed (28)
Statements: 78% (1250 / 1602)
Branches:  72% (145 / 202)
Functions: 80% (64 / 80)
Lines:     76% (1182 / 1548)
```

---

## Testing Standards (from DEVELOPMENT-STANDARDS.md)

### Unit Test Requirements

**Test Structure:**
```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('Function Name', () => {
  beforeEach(() => {
    // Setup
  });

  it('should return expected value with valid input', () => {
    // Arrange
    const input = { /* ... */ };
    
    // Act
    const result = functionUnderTest(input);
    
    // Assert
    expect(result).toBe(expected);
  });

  it('should throw error with invalid input', () => {
    expect(() => functionUnderTest(invalid)).toThrow();
  });
});
```

### Test Categories

1. **Happy Path (Success Cases)**
   - Valid inputs → Expected outputs
   - Example: Valid payment ID → Processed payment

2. **Error Handling**
   - Invalid inputs → Appropriate errors
   - Example: Missing API key → 401 Unauthorized
   - Example: Invalid merchant ID → ZodError

3. **Edge Cases**
   - Boundary values, empty inputs, null values
   - Example: Very large analytics window (30+ days)
   - Example: Merchant with 0 orders

4. **Security Cases**
   - Authentication failures
   - Authorization violations
   - Input sanitization

### Assertion Patterns

```typescript
// Truth assertions
expect(value).toBe(true);
expect(result).toEqual(expected);

// Error assertions
expect(() => fn()).toThrow();
expect(() => fn()).toThrow(CustomError);

// Async assertions
await expect(promise).rejects.toThrow();
await expect(promise).resolves.toEqual(value);

// Spy assertions (mocking)
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith(arg1, arg2);
```

---

## Test Coverage Roadmap

### Phase 1: Current (80% Coverage Target) ✅
- Logger functionality (logger.test.ts)
- Error tracking (error-logger.test.ts)
- Merchant authentication (merchant-auth.test.ts)
- API health checks (api-health.test.ts)
- Analytics events (analytics-events.test.ts)
- Shadow-index resolution (compile-resolve.test.ts)

### Phase 2: Payment Processing (Sprint 4)
- Stripe payment creation
- Payment webhook handling
- Refund processing
- Payment state machine

### Phase 3: Advanced Analytics (Post-MVP)
- Report aggregation edge cases
- Analytics time-window calculations
- Data aggregation with missing events
- Analytics caching validation

### Phase 4: E2E Integration (Post-MVP)
- Full merchant workflow
- Order creation → payment → resolution
- Multi-merchant concurrent operations
- Rate limiting under load

---

## Continuous Integration

### Pre-Commit Testing
```bash
npm run type-check    # TypeScript validation (pre-commit)
npm run lint         # ESLint validation (pre-commit)
npm run format       # Prettier validation (pre-commit)
```

### CI Pipeline (GitHub Actions)
```yaml
# .github/workflows/ci.yml
name: Test and Build
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm install
      - run: npm run type-check
      - run: npm run lint
      - run: npm test:coverage
      - run: npm run build
```

---

## Performance Testing

### Load Testing
```bash
npm run load-test    # Sustained load test
```

**Current Target:**
- 100 requests/sec sustained
- <200ms p99 latency (analytics endpoint)
- <5% error rate
- Memory: <256MB baseline

### Benchmarking
```bash
# (Future: Add Vitest benchmarking)
npm run bench        # Performance benchmarks
```

---

## Quality Gate Checklist

**Before Commit:**
- [ ] All tests pass: `npm test`
- [ ] Coverage ≥ 80%: `npm test:coverage`
- [ ] Type-check passes: `npm run type-check`
- [ ] Lint clean: `npm run lint`
- [ ] Format validated: `npm run format --check`

**Before Push:**
- [ ] Feature branch tests pass locally
- [ ] No console.log statements (use logger)
- [ ] Error handling complete (no swallowed errors)
- [ ] API changes documented in openapi.yaml

**Before Merge (Code Review):**
- [ ] Coverage report reviewed
- [ ] Tests validate acceptance criteria
- [ ] Performance impact assessed
- [ ] Security implications evaluated

---

## Troubleshooting

### Tests Timing Out
```bash
# Increase timeout for specific test
it('should complete within 30s', async () => {
  // ...
}, 30000);  // 30 second timeout
```

### Coverage Not Reporting
```bash
# Clear cache and reinstall
rm -rf node_modules/.vitest
npm test:coverage
```

### Flaky Tests (Intermittent Failures)
- Check async/promise handling
- Verify no race conditions
- Isolate test state (use beforeEach/afterEach)
- Use `describe.skip()` to isolate and debug

---

## Next Steps

1. **Expand Coverage to 80%+**
   - Payment processing tests (Priority 1)
   - Analytics aggregation edge cases
   - API error response coverage

2. **E2E Test Suite Implementation**
   - Merchant portal workflows
   - Order creation and resolution
   - Analytics reporting verification

3. **Performance Baselines**
   - Establish latency benchmarks per endpoint
   - Memory usage profiling
   - Load testing under production-like conditions

4. **Test Data Management**
   - Seeding for consistent test state
   - Fixture library for reusable test data
   - Database cleanup between test runs

---

## References

- **DEVELOPMENT-STANDARDS.md** - Comprehensive code quality standards
- `.github/workflows/ci.yml` - Automated CI pipeline
- `vitest.config.ts` - Vitest configuration
