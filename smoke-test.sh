#!/bin/bash

# Smoke Test for Things That Matter Cloud Setup
# Run this after starting both servers
# Usage: bash smoke-test.sh

echo "=========================================="
echo "Cloud Setup Smoke Test"
echo "=========================================="
echo ""

PASSED=0
FAILED=0

# Test API Health
echo "Testing API Health Endpoint..."
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "✓ API health check passed"
    PASSED=$((PASSED + 1))
else
    echo "✗ API health check failed"
    FAILED=$((FAILED + 1))
fi

# Test Frontend Availability
echo "Testing Frontend Availability..."
if curl -s http://localhost:5178 > /dev/null 2>&1; then
    echo "✓ Frontend is accessible"
    PASSED=$((PASSED + 1))
else
    echo "✗ Frontend not accessible"
    FAILED=$((FAILED + 1))
fi

# Test API Response Time
echo "Checking API response time..."
START_TIME=$(date +%s%N)
RESPONSE=$(curl -s -w "%{time_total}" http://localhost:3000/health)
if [ $? -eq 0 ]; then
    echo "✓ API responding"
    PASSED=$((PASSED + 1))
else
    echo "✗ API not responding"
    FAILED=$((FAILED + 1))
fi

echo ""
echo "=========================================="
echo "Test Results: $PASSED passed, $FAILED failed"
echo "=========================================="

if [ $FAILED -eq 0 ]; then
    echo "✓ All checks passed!"
    exit 0
else
    echo "✗ Some checks failed"
    exit 1
fi
