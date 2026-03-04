@echo off
REM Smoke Test for Things That Matter Cloud Setup
REM Run this after starting both servers
REM Usage: smoke-test.bat

cls
echo ==========================================
echo Cloud Setup Smoke Test
echo ==========================================
echo.

setlocal enabledelayedexpansion
set PASSED=0
set FAILED=0

REM Test API Health
echo Testing API Health Endpoint...
curl -s http://localhost:3000/health >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo ✓ API health check passed
    set /a PASSED+=1
) else (
    echo ✗ API health check failed
    set /a FAILED+=1
)

REM Test Frontend Availability
echo Testing Frontend Availability...
curl -s http://localhost:5178 >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo ✓ Frontend is accessible
    set /a PASSED+=1
) else (
    echo ✗ Frontend not accessible
    set /a FAILED+=1
)

REM Test API Response
echo Checking API Response...
curl -s http://localhost:3000/health >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo ✓ API responding
    set /a PASSED+=1
) else (
    echo ✗ API not responding
    set /a FAILED+=1
)

echo.
echo ==========================================
echo Test Results: %PASSED% passed, %FAILED% failed
echo ==========================================

if %FAILED% equ 0 (
    echo ✓ All checks passed!
    exit /b 0
) else (
    echo ✗ Some checks failed
    exit /b 1
)
