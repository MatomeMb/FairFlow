# Test Setup Script
# Verifies all API keys and services are configured

Write-Host "`n=== Testing Development Environment ===" -ForegroundColor Cyan
Write-Host ""

$envFile = ".env"
if (-not (Test-Path $envFile)) {
    Write-Host "[ERROR] .env file not found!" -ForegroundColor Red
    exit 1
}

Write-Host "Checking API keys configuration..." -ForegroundColor Yellow
Write-Host ""

$envContent = Get-Content $envFile -Raw
$allConfigured = $true

# Check Supabase
if ($envContent -match "SUPABASE_URL=https://.*\.supabase\.co" -and 
    $envContent -match "SUPABASE_ANON_KEY=.*[^x]" -and
    $envContent -match "SUPABASE_SERVICE_KEY=.*[^x]") {
    Write-Host "[OK] Supabase - Configured" -ForegroundColor Green
} else {
    Write-Host "[MISSING] Supabase - Not fully configured" -ForegroundColor Red
    $allConfigured = $false
}

# Check Cloudflare R2
if ($envContent -match "CLOUDFLARE_R2_ACCOUNT_ID=.*[^x]" -and
    $envContent -match "CLOUDFLARE_R2_ACCESS_KEY_ID=.*[^x]" -and
    $envContent -match "CLOUDFLARE_R2_SECRET_ACCESS_KEY=.*[^x]") {
    Write-Host "[OK] Cloudflare R2 - Configured" -ForegroundColor Green
} else {
    Write-Host "[MISSING] Cloudflare R2 - Not fully configured" -ForegroundColor Red
    $allConfigured = $false
}

# Check Replicate
if ($envContent -match "REPLICATE_API_KEY=r8_.*") {
    Write-Host "[OK] Replicate - Configured" -ForegroundColor Green
} else {
    Write-Host "[MISSING] Replicate - Not configured" -ForegroundColor Red
    $allConfigured = $false
}

# Check Ed25519 Keys
if ($envContent -match "SIGNING_PRIVATE_KEY=.*[^x]" -and
    $envContent -match "SIGNING_PUBLIC_KEY=.*[^x]") {
    Write-Host "[OK] Ed25519 Keys - Configured" -ForegroundColor Green
} else {
    Write-Host "[MISSING] Ed25519 Keys - Not configured" -ForegroundColor Red
    $allConfigured = $false
}

Write-Host ""
if ($allConfigured) {
    Write-Host "[SUCCESS] All API keys are configured!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Start API: cd packages\shadow-index && pnpm dev" -ForegroundColor White
    Write-Host "  2. Test health: curl http://localhost:3000/health" -ForegroundColor White
    Write-Host "  3. Begin implementing API endpoints" -ForegroundColor White
} else {
    Write-Host "[WARNING] Some API keys are missing. See docs/API_KEYS_GUIDE.md" -ForegroundColor Yellow
}

Write-Host ""
