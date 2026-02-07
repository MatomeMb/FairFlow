# VITEST CONFIGURATION DEBUG PROMPT — Professional Diagnostic Guide

**Issue:** Vitest cannot find test suites in test files  
**Error:** "No test suite found in file"  
**Status:** Investigation & Resolution Guide  

---

## ROOT CAUSE ANALYSIS

The error "No test suite found" means vitest is successfully loading the file, but the test collection phase is failing to find `describe()` or `it()` calls.

**Possible causes (in order of likelihood):**

1. **Module/Import Resolution Issues** — vitest can't resolve ES module imports
2. **Test File Structure** — Test suite definitions are not being recognized
3. **Configuration Mismatch** — Config settings conflicting with file format
4. **Vitest Version Compatibility** — Version issues with browser extension setup
5. **File Encoding/Formatting** — File encoding or formatting issues

---

## SYSTEMATIC DEBUGGING STEPS

### Step 1: Verify Test File Syntax (2 minutes)

**Action:** Check if the test file is valid JavaScript

```bash
cd packages/lens-extension
node --check tests/cache.test.js
```

**What to look for:**
- ✅ No syntax errors should be reported
- ❌ If errors: There's a syntax problem in the test file

**If errors found:**
- Check line numbers in error message
- Look for missing brackets, quotes, or semicolons
- Verify JSDoc comments don't break parsing

---

### Step 2: Verify Module Import Works (3 minutes)

**Action:** Test if vitest can import the modules

```bash
# Try importing vitest directly
node -e "import('vitest').then(() => console.log('✓ vitest imports OK')).catch(e => console.error('✗ Import error:', e.message))"
```

**Expected output:**
```
✓ vitest imports OK
```

**If error:**
- Vitest may not be properly installed
- Run: `npm install --save-dev vitest`

---

### Step 3: Create Minimal Test File (5 minutes)

**Action:** Create the simplest possible test file to isolate the issue

```bash
cat > tests/minimal.test.js << 'EOF'
import { describe, it, expect } from 'vitest';

describe('Minimal', () => {
  it('works', () => {
    expect(true).toBe(true);
  });
});
EOF
```

**Then run:**
```bash
npm run test -- tests/minimal.test.js
```

**Expected:** Test should pass or fail with clear output (not "No test suite found")

**If still "No test suite found":**
- Issue is with vitest configuration or environment
- Go to Step 4

---

### Step 4: Check Vitest Config (5 minutes)

**Action:** Verify vitest.config.js is correct

**Current config should be:**
```javascript
export default {
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.js'],
    testTimeout: 10000,
  },
};
```

**Verify:**
- ✅ File exists at `packages/lens-extension/vitest.config.js`
- ✅ Config is valid JavaScript
- ✅ No syntax errors

**Test the config:**
```bash
node --check vitest.config.js
```

**If errors:**
- Fix syntax in the config file
- Then retry test

---

### Step 5: Run Vitest with Debug Flag (5 minutes)

**Action:** Run vitest with verbose output to see what it's doing

```bash
npm run test -- --reporter=verbose 2>&1 | head -50
```

**What to look for:**
- `[collect]` output showing file collection
- Errors during transformation/parsing
- Module resolution messages

**Example output that shows the problem:**
```
[collect] tests/cache.test.js
[error] Failed to transform: ...
```

---

### Step 6: Check Environment Variables (3 minutes)

**Action:** Ensure Node.js environment is set up correctly

```bash
# Check Node version (should be 18+)
node --version

# Check npm version (should be 8+)
npm --version

# Check if vitest is installed
npm ls vitest
```

**Expected:**
```
node: v18.0.0 or higher
npm: 8.0.0 or higher
@thingsthatmatter/lens-extension@0.1.0 vitest@^1.0.0
```

---

### Step 7: Clear Cache & Reinstall (5 minutes)

**Action:** Clear vitest cache and reinstall dependencies

```bash
# Remove vitest cache
rm -rf node_modules/.vite

# Clean npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules
npm install

# Try test again
npm run test
```

---

### Step 8: Check File Encoding (2 minutes)

**Action:** Verify test files use UTF-8 encoding

```bash
# Check file encoding (Linux/Mac)
file tests/cache.test.js

# Check file encoding (Windows PowerShell)
Get-Item tests/cache.test.js | % {$_.FullName}
```

**For Windows, if encoding is wrong:**
- Open file in VS Code
- Bottom right: Click encoding selector
- Change to "UTF-8"
- Save

---

## RECOMMENDED SOLUTION PATH

If Step 3 (minimal test) works but Step 2 (cache.test.js) fails:

**Problem:** The cache.test.js file structure is broken

**Solution:**
1. Backup cache.test.js
2. Start fresh with working test structure:

```bash
cat > tests/cache.test.js << 'EOF'
import { describe, it, expect, beforeEach } from 'vitest';

// Mock IndexedDB
class MockIndexedDB {
  constructor() {
    this.stores = new Map();
    this.stores.set('resolve', new Map());
  }

  transaction(storeNames, mode) {
    return {
      objectStore: (storeName) => {
        const store = this.stores.get(storeName);
        return {
          get: (key) => ({
            result: store.get(key),
            onsuccess: null,
            onerror: null,
          }),
          put: (value) => {
            store.set(value.hash, value);
            return { onsuccess: null, onerror: null };
          },
          delete: (key) => {
            store.delete(key);
            return { onsuccess: null, onerror: null };
          },
          clear: () => {
            store.clear();
            return { onsuccess: null, onerror: null };
          },
        };
      },
    };
  }
}

describe('MVP-13: Extension Cache', () => {
  let mockDb;

  beforeEach(() => {
    mockDb = new MockIndexedDB();
  });

  describe('AC1: Cache-on-read', () => {
    it('should return cached entry on hit', () => {
      const hash = 'test-hash-123';
      const entry = {
        hash,
        gist: { title: 'Test', price: 1999, currency: 'USD' },
        thing_url: 'http://localhost:3000/thing/test',
        fetchedAt: Date.now(),
      };

      const store = mockDb.stores.get('resolve');
      store.set(hash, entry);

      const transaction = mockDb.transaction(['resolve'], 'readonly');
      const objectStore = transaction.objectStore('resolve');
      const result = objectStore.get(hash).result;

      expect(result).toBeDefined();
      expect(result.gist.title).toBe('Test');
    });

    it('should return null on cache miss', () => {
      const transaction = mockDb.transaction(['resolve'], 'readonly');
      const objectStore = transaction.objectStore('resolve');
      const result = objectStore.get('nonexistent').result;

      expect(result).toBeUndefined();
    });
  });
});
EOF
```

3. Run test:
```bash
npm run test
```

4. If this works, rebuild cache.test.js gradually, testing after each section

---

## ALTERNATIVE: Use Jest Instead of Vitest

If vitest issues persist, use Jest (more compatible with browser extensions):

```bash
npm install --save-dev jest @babel/preset-env babel-jest

cat > jest.config.js << 'EOF'
export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  testMatch: ['**/tests/**/*.test.js'],
};
EOF

cat > babel.config.js << 'EOF'
export default {
  presets: [['@babel/preset-env', {targets: {node: 'current'}}]],
};
EOF
```

Update package.json:
```json
"test": "jest",
"test:watch": "jest --watch"
```

---

## DIAGNOSTIC COMMAND SEQUENCE

Run these in order and note the output:

```bash
# 1. Check syntax
node --check tests/cache.test.js
echo "Status: $?"

# 2. Check vitest works
node -e "import('vitest').then(() => console.log('✓')).catch(e => console.error('✗', e.message))"

# 3. Create minimal test
echo "import { describe, it, expect } from 'vitest'; describe('X', () => { it('y', () => { expect(true).toBe(true); }); });" > tests/x.test.js

# 4. Run minimal test
npm run test -- tests/x.test.js

# 5. Check node/npm versions
node --version && npm --version

# 6. List vitest
npm ls vitest

# 7. Run with debug
npm run test -- --reporter=verbose
```

---

## WHEN TO ESCALATE

If none of the above works, the issue may be:

1. **Vitest version incompatibility** with browser extension setup
   - Solution: Try Jest instead (see Alternative section)

2. **Global vitest installation conflict**
   - Solution: `npm cache clean --force && npm install`

3. **Package.json type: "module" conflict**
   - Solution: Create wrapper or use Jest instead

4. **Development environment issue**
   - Solution: Try from a clean terminal or different machine

---

## SUCCESS CRITERIA

Tests are working when you see:

```
✓ tests/cache.test.js (17 tests)
  ✓ AC1: Cache-on-read (2)
  ✓ AC2: Cache-on-success (2)
  ✓ ...

Test Files  1 passed (1)
Tests      17 passed (17)
Duration   245ms
```

Not:
```
✗ No test suite found in file
```

---

## DEBUGGING CHECKLIST

- [ ] Step 1: `node --check tests/cache.test.js` passes
- [ ] Step 2: vitest imports successfully
- [ ] Step 3: minimal.test.js runs and passes
- [ ] Step 4: vitest.config.js is valid
- [ ] Step 5: verbose output shows file collection
- [ ] Step 6: Node 18+ and npm 8+ installed
- [ ] Step 7: Cache cleared, dependencies reinstalled
- [ ] Step 8: File encoding is UTF-8

---

**Next Action:** Run Step 1 and report the output.

