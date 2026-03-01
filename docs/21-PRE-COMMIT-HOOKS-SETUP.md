# Pre-Commit Hooks Setup Guide

## Overview
This guide establishes automated code quality enforcement at commit time. Pre-commit hooks ensure that all code pushed to the repository meets development standards for type safety, linting, and formatting.

## Installation

### 1. Initialize Husky Framework
```bash
npm install husky --save-dev
npx husky install
```

### 2. Add Pre-Commit Hook
Husky will check for `.husky/pre-commit` file and execute it automatically before each commit.

**File Location:** `.husky/pre-commit`

**Hook Execution:**
- Type-check: `npm run type-check` (TypeScript strict mode validation)
- Lint: `npm run lint` (ESLint rules enforcement)
- Format: `npm run format --check` (Prettier code formatting)

### 3. Make Hook Executable
```bash
chmod +x .husky/pre-commit
```

## Pre-Commit Validation Flow

### Stage 1: Type Checking (TypeScript)
```bash
npm run type-check
```
- Validates: All TypeScript syntax and type safety
- Enforces: Strict mode, no implicit `any`, full type coverage
- Fails if: Type errors, missing type annotations
- Exit code: 0 (success) or 1 (failure → commit blocked)

### Stage 2: ESLint Verification
```bash
npm run lint
```
- Validates: Code style, best practices, security patterns
- Enforces: Development standards from `DEVELOPMENT-STANDARDS.md`
- Fails if: Rule violations (see `.eslintrc.cjs`)
- Exit code: 0 (success) or 1 (failure → commit blocked)

### Stage 3: Prettier Formatting
```bash
npm run format --check
```
- Validates: Code formatting consistency
- Enforces: Prettier config (`.prettierrc`)
- Auto-fixes: If issues detected, runs `npm run format` to auto-format
- Fails if: Non-fixable issues remain
- Exit code: 0 (success) or 1 (failure → commit blocked)

## Expected Behavior

### ✅ Successful Commit
```
$ git commit -m "feat: add payment verification"

running type-check...
(no output = success)

running eslint...
(no output = success)

running prettier format check...
(no output = success)

pre-commit checks passed ✓
[sprint-3-analytics-mvp-14 a1b2c3d] feat: add payment verification
 2 files changed, 45 insertions(+)
```

### ❌ Failed Type Check
```
$ git commit -m "feat: add payment verification"

running type-check...
src/lib/payments.ts:42:12 - error TS2345: 
  Argument of type 'string' is not assignable to parameter of type 'number'.

pre-commit checks failed ✗
(commit is blocked until error is fixed)
```

### ❌ Failed Lint
```
$ git commit -m "feat: add payment logic"

running type-check...
(success)

running eslint...
src/api/payments.ts:89:1  error  Unsafe member access .amount on an any typed value  @typescript-eslint/no-unsafe-member-access

pre-commit checks failed ✗
```

### ❌ Format Auto-Fix
```
$ git commit -m "feat: add payment logic"

running type-check...
(success)

running eslint...
(success)

running prettier format check...
formatting issues detected, attempting auto-fix...
(files auto-formatted)

pre-commit checks passed ✓
(files were updated, commit proceeds with formatted code)
```

## Configuration Files Reference

### .eslintrc.cjs
Located in project root. Enforces:
- TypeScript strict rules
- No implicit `any` types
- Consistent error handling
- Security patterns (no eval, no dangerous DOM methods)

### .prettierrc
Located in project root. Enforces:
- 2-space indentation
- Single quotes for strings
- Trailing commas (ES5)
- 100-character line length

### tsconfig.json
Located in root. Enforces:
- `strict: true` (all strict type checks)
- `noImplicitAny: true` (explicit type annotations required)
- `noUnusedLocals: true` (unused variables forbidden)
- `noUnusedParameters: true`
- `noImplicitReturns: true`

## Bypassing Pre-Commit Hooks

**⚠️ Use ONLY in emergencies** (e.g., critical hotfix). Normal workflow never bypasses.

```bash
# Skip pre-commit hooks (NOT RECOMMENDED)
git commit --no-verify -m "emergency: hotfix critical bug"
```

**Always run validation after bypassing:**
```bash
npm run type-check && npm run lint && npm run format
```

## Integration with IDE

### VS Code Configuration
Add to `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "eslint.validate": ["typescript"],
  "eslint.autoFixOnSave": true
}
```

## Continuous Integration

Pre-commit hooks ensure that only validated code reaches GitHub. CI pipeline (`.github/workflows/ci.yml`) performs additional checks:
- Full test suite execution
- Coverage reporting (80%+ target)
- Security scanning
- Performance benchmarking

## Troubleshooting

### Hook Not Executing
```bash
# Verify Husky is initialized
ls -la .husky/

# Re-initialize if needed
npx husky install
```

### Permission Denied (MacOS/Linux)
```bash
chmod +x .husky/pre-commit
chmod +x .husky/prepare-commit-msg
```

### Node Modules Not Available
```bash
# Ensure dependencies installed
npm install

# Clear npm cache if issues persist
npm cache clean --force
npm install
```

### TypeScript Errors in Pre-Commit
- Pre-commit hook enforces **strict mode**
- All type errors must be resolved before commit
- Use `npm run type-check` locally to validate before committing

## Standards Enforced

See related documentation:
- **DEVELOPMENT-STANDARDS.md** - Code quality requirements enforced by hooks
- **20-SECURITY-HARDENING.md** - Security patterns validated by ESLint
- **.eslintrc.cjs** - Complete linting rule set
- **.prettierrc** - Formatting standards

## Version Control

Pre-commit hooks are **version-controlled** in `.husky/` directory. When other developers clone the repository and run `npm install`, hooks are automatically initialized via Husky's `prepare` script in `package.json`.

All team members have identical pre-commit validation rules.
