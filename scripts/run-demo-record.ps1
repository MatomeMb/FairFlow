# Run fairflow demo and produce fairflow-demo.webm
# Usage: .\scripts\run-demo-record.ps1
#
# Prerequisites: Run in two separate terminals first:
#   Terminal 1: cd mcj && npm run start:api
#   Terminal 2: cd mcj/packages/auth-portal && npm run dev
#
# Then run this script.

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

Write-Host "Checking API (localhost:3000)..." -ForegroundColor Cyan
try {
    $null = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing -TimeoutSec 3
    Write-Host "  API OK" -ForegroundColor Green
} catch {
    Write-Host "  API not running. Start with: npm run start:api" -ForegroundColor Red
    exit 1
}

Write-Host "Checking Portal (localhost:5178)..." -ForegroundColor Cyan
try {
    $null = Invoke-WebRequest -Uri "http://localhost:5178" -UseBasicParsing -TimeoutSec 3
    Write-Host "  Portal OK" -ForegroundColor Green
} catch {
    Write-Host "  Portal not running. Start with: cd packages/auth-portal && npm run dev" -ForegroundColor Red
    exit 1
}

Write-Host "`nRunning Playwright demo..." -ForegroundColor Cyan
npm run demo:record

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nDone. Video saved to fairflow-demo.webm" -ForegroundColor Green
} else {
    Write-Host "`nDemo failed. If you see ERR_ABORTED, try running from a regular terminal (outside Cursor)." -ForegroundColor Yellow
    exit 1
}
