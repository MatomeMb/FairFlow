# Setup Verification Script
# Checks if development environment is properly configured

Write-Host "Checking development environment setup..." -ForegroundColor Cyan
Write-Host ""

$errors = 0

# Check Rust
Write-Host "Checking Rust..." -NoNewline
try {
    $null = Get-Command rustc -ErrorAction Stop
    $rustVersion = rustc --version
    Write-Host " [OK]" -ForegroundColor Green
    Write-Host "  $rustVersion" -ForegroundColor Gray
} catch {
    Write-Host " [FAIL]" -ForegroundColor Red
    Write-Host "  Rust not found. Install from https://rustup.rs/" -ForegroundColor Yellow
    $errors++
}

# Check Cargo
Write-Host "Checking Cargo..." -NoNewline
try {
    $null = Get-Command cargo -ErrorAction Stop
    $cargoVersion = cargo --version
    Write-Host " [OK]" -ForegroundColor Green
    Write-Host "  $cargoVersion" -ForegroundColor Gray
} catch {
    Write-Host " [FAIL]" -ForegroundColor Red
    Write-Host "  Cargo not found. Install Rust toolchain." -ForegroundColor Yellow
    $errors++
}

# Check Node.js
Write-Host "Checking Node.js..." -NoNewline
try {
    $null = Get-Command node -ErrorAction Stop
    $nodeVersion = node --version
    Write-Host " [OK]" -ForegroundColor Green
    Write-Host "  $nodeVersion" -ForegroundColor Gray
    $nodeMajor = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($nodeMajor -lt 18) {
        Write-Host "  WARNING: Node.js 18+ recommended" -ForegroundColor Yellow
    }
} catch {
    Write-Host " [FAIL]" -ForegroundColor Red
    Write-Host "  Node.js not found. Install from https://nodejs.org/" -ForegroundColor Yellow
    $errors++
}

# Check pnpm (optional)
Write-Host "Checking pnpm..." -NoNewline
try {
    $null = Get-Command pnpm -ErrorAction Stop
    $pnpmVersion = pnpm --version
    Write-Host " [OK]" -ForegroundColor Green
    Write-Host "  $pnpmVersion" -ForegroundColor Gray
} catch {
    Write-Host " [WARN]" -ForegroundColor Yellow
    Write-Host "  pnpm not found (optional). Install with: npm install -g pnpm" -ForegroundColor Gray
}

# Check Git
Write-Host "Checking Git..." -NoNewline
try {
    $null = Get-Command git -ErrorAction Stop
    $gitVersion = git --version
    Write-Host " [OK]" -ForegroundColor Green
    Write-Host "  $gitVersion" -ForegroundColor Gray
} catch {
    Write-Host " [FAIL]" -ForegroundColor Red
    Write-Host "  Git not found. Install from https://git-scm.com/" -ForegroundColor Yellow
    $errors++
}

# Check .env file
Write-Host "Checking .env file..." -NoNewline
if (Test-Path ".env") {
    Write-Host " [OK]" -ForegroundColor Green
    Write-Host "  .env file exists" -ForegroundColor Gray
} else {
    Write-Host " [WARN]" -ForegroundColor Yellow
    Write-Host "  .env file not found. Copy .env.example to .env and fill in values." -ForegroundColor Yellow
}

# Check project structure
Write-Host "Checking project structure..." -NoNewline
$requiredDirs = @("packages\matter-core", "packages\shadow-index", "packages\lens-extension")
$allExist = $true
foreach ($dir in $requiredDirs) {
    if (-not (Test-Path $dir)) {
        $allExist = $false
        break
    }
}
if ($allExist) {
    Write-Host " [OK]" -ForegroundColor Green
} else {
    Write-Host " [FAIL]" -ForegroundColor Red
    Write-Host "  Some required directories are missing. Run setup again." -ForegroundColor Yellow
    $errors++
}

Write-Host ""
if ($errors -eq 0) {
    Write-Host "[SUCCESS] All checks passed! Development environment is ready." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Copy .env.example to .env and fill in your API keys" -ForegroundColor White
    Write-Host "  2. Install dependencies: cd packages\shadow-index; pnpm install" -ForegroundColor White
    Write-Host "  3. Read SETUP.md for detailed instructions" -ForegroundColor White
} else {
    Write-Host "[ERROR] Found $errors issue(s). Please fix them before continuing." -ForegroundColor Red
    exit 1
}
