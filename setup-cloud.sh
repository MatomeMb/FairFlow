#!/bin/bash

# Cloud Setup Script for Things That Matter
# This script validates the cloud setup configuration

set -e

echo "=========================================="
echo "Things That Matter - Cloud Setup"
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found. Run from project root."
    exit 1
fi

echo ""
echo "1. Checking environment..."
if [ -f ".env" ]; then
    echo "✓ .env file exists"
else
    echo "✗ .env file missing"
    exit 1
fi

echo ""
echo "2. Checking API server..."
if [ -d "packages/shadow-index" ]; then
    echo "✓ API server directory exists"
    cd packages/shadow-index
    if [ -f "package.json" ]; then
        echo "✓ API package.json found"
    fi
    cd ../..
else
    echo "✗ API server directory not found"
    exit 1
fi

echo ""
echo "3. Checking frontend..."
if [ -d "packages/auth-portal" ]; then
    echo "✓ Frontend directory exists"
    cd packages/auth-portal
    if [ -f "package.json" ]; then
        echo "✓ Frontend package.json found"
    fi
    cd ../..
else
    echo "✗ Frontend directory not found"
    exit 1
fi

echo ""
echo "4. Dependencies check..."
echo "Run 'npm install' in each package directory:"
echo "  - packages/shadow-index"
echo "  - packages/auth-portal"

echo ""
echo "=========================================="
echo "Setup Check Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Start API:      cd packages/shadow-index && npm run dev"
echo "2. Start Frontend: cd packages/auth-portal && npm run dev"
echo "3. Test API:       curl http://localhost:3000/health"
echo "4. Test Frontend:  curl http://localhost:5178"
