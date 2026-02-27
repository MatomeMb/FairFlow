# Cross-Browser Validation - Lens Extension (MVP-13)
# Run this script to prepare for manual browser validation.
# Validates: Chrome, Edge, Brave (Firefox optional)

param(
    [switch]$SkipStart,
    [switch]$Chrome,
    [switch]$Edge,
    [switch]$Brave,
    [switch]$Firefox
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

Write-Host ''
Write-Host '=== fairflow - Cross-Browser Validation ===' -ForegroundColor Cyan
Write-Host ''

# 1. Check prerequisites
Write-Host '1. Checking prerequisites...' -ForegroundColor Yellow
$nodeOk = Get-Command node -ErrorAction SilentlyContinue
$pythonOk = Get-Command python -ErrorAction SilentlyContinue

if (-not $nodeOk) { Write-Host '   [X] Node.js not found. Install from https://nodejs.org' -ForegroundColor Red; exit 1 }
if (-not $pythonOk) { Write-Host '   [X] Python not found. Needed for demo server. Install from https://python.org' -ForegroundColor Red; exit 1 }
Write-Host '   [OK] Node.js and Python found' -ForegroundColor Green

# 2. Extension path
$extPath = Join-Path $root 'packages\lens-extension'
if (-not (Test-Path $extPath)) { Write-Host ('   [X] Extension not found: ' + $extPath) -ForegroundColor Red; exit 1 }
Write-Host ('   [OK] Extension path: ' + $extPath) -ForegroundColor Green

# 3. Start services (unless -SkipStart)
if (-not $SkipStart) {
    Write-Host ''
    Write-Host '2. Starting services (use -SkipStart if already running)...' -ForegroundColor Yellow

    Write-Host '   Starting Shadow Index API (new window)...'
    Start-Process powershell -ArgumentList '-NoExit', '-Command', "cd '$root\packages\shadow-index'; npm run start"
    Start-Sleep -Seconds 4
    Write-Host '   Starting demo server (new window)...'
    Start-Process powershell -ArgumentList '-NoExit', '-Command', "cd '$root'; python -m http.server 5177 --directory demo"
    Start-Sleep -Seconds 2
    Write-Host '   [OK] Services started. If ports are in use, stop existing processes first.' -ForegroundColor Green
} else {
    Write-Host '   Skipping service start (-SkipStart)' -ForegroundColor Gray
}

# 4. Instructions
Write-Host ''
Write-Host '3. Load extension and test:' -ForegroundColor Yellow
Write-Host ('   Extension path: ' + $extPath) -ForegroundColor White
Write-Host ''
Write-Host ('   Chrome:  chrome://extensions  -> Developer mode ON -> Load unpacked -> ' + $extPath) -ForegroundColor Cyan
Write-Host ('   Edge:    edge://extensions    -> Developer mode ON -> Load unpacked -> ' + $extPath) -ForegroundColor Cyan
Write-Host ('   Brave:   brave://extensions   -> Developer mode ON -> Load unpacked -> ' + $extPath) -ForegroundColor Cyan
Write-Host ''
Write-Host '   Test URL: http://localhost:5177/matter-demo.html' -ForegroundColor White
Write-Host ''

# 5. Checklist
Write-Host '4. Validation checklist (per browser):' -ForegroundColor Yellow
Write-Host '   [ ] Extension loads without errors'
Write-Host '   [ ] Navigate to http://localhost:5177/matter-demo.html'
Write-Host '   [ ] Click matter:// link -> overlay appears (first click ~200ms, second ~30ms)'
Write-Host '   [ ] Overlay shows: image, title, price, Buy Now'
Write-Host '   [ ] Second click on same link -> no new API request (cache hit)'
Write-Host '   [ ] Invalid hash -> error message, no crash'
Write-Host ''
Write-Host 'Done. Record results in docs\BROWSER-VALIDATION-RESULTS.md' -ForegroundColor Green
Write-Host ''
