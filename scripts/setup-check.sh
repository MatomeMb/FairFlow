#!/bin/bash
# Setup Verification Script
# Checks if development environment is properly configured

echo "Checking development environment setup..."
echo ""

ERRORS=0

# Check Rust
echo -n "Checking Rust... "
if command -v rustc &> /dev/null; then
    echo "✓"
    rustc --version | sed 's/^/  /'
else
    echo "✗"
    echo "  Rust not found. Install from https://rustup.rs/"
    ((ERRORS++))
fi

# Check Cargo
echo -n "Checking Cargo... "
if command -v cargo &> /dev/null; then
    echo "✓"
    cargo --version | sed 's/^/  /'
else
    echo "✗"
    echo "  Cargo not found. Install Rust toolchain."
    ((ERRORS++))
fi

# Check Node.js
echo -n "Checking Node.js... "
if command -v node &> /dev/null; then
    echo "✓"
    NODE_VERSION=$(node --version)
    echo "  $NODE_VERSION"
    NODE_MAJOR=$(echo $NODE_VERSION | sed 's/v\([0-9]*\).*/\1/')
    if [ "$NODE_MAJOR" -lt 18 ]; then
        echo "  ⚠ Warning: Node.js 18+ recommended"
    fi
else
    echo "✗"
    echo "  Node.js not found. Install from https://nodejs.org/"
    ((ERRORS++))
fi

# Check pnpm (optional)
echo -n "Checking pnpm... "
if command -v pnpm &> /dev/null; then
    echo "✓"
    pnpm --version | sed 's/^/  /'
else
    echo "⚠"
    echo "  pnpm not found (optional). Install with: npm install -g pnpm"
fi

# Check Git
echo -n "Checking Git... "
if command -v git &> /dev/null; then
    echo "✓"
    git --version | sed 's/^/  /'
else
    echo "✗"
    echo "  Git not found. Install from https://git-scm.com/"
    ((ERRORS++))
fi

# Check .env file
echo -n "Checking .env file... "
if [ -f ".env" ]; then
    echo "✓"
    echo "  .env file exists"
else
    echo "⚠"
    echo "  .env file not found. Copy .env.example to .env and fill in values."
fi

# Check project structure
echo -n "Checking project structure... "
if [ -d "packages/matter-core" ] && [ -d "packages/shadow-index" ] && [ -d "packages/lens-extension" ]; then
    echo "✓"
else
    echo "✗"
    echo "  Some required directories are missing. Run setup again."
    ((ERRORS++))
fi

echo ""
if [ $ERRORS -eq 0 ]; then
    echo "✓ All checks passed! Development environment is ready."
    echo ""
    echo "Next steps:"
    echo "  1. Copy .env.example to .env and fill in your API keys"
    echo "  2. Install dependencies: cd packages/shadow-index && pnpm install"
    echo "  3. Read SETUP.md for detailed instructions"
else
    echo "✗ Found $ERRORS issue(s). Please fix them before continuing."
    exit 1
fi
