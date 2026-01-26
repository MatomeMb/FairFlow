# API Keys Setup Helper Script
# Guides you through obtaining all required API keys

Write-Host "`n=== API Keys Setup Helper ===" -ForegroundColor Cyan
Write-Host "This script will help you find and add all required API keys.`n" -ForegroundColor Yellow

$envFile = ".env"
if (-not (Test-Path $envFile)) {
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" $envFile
}

Write-Host "Required Services:" -ForegroundColor Green
Write-Host "  1. Supabase (Database)" -ForegroundColor White
Write-Host "  2. Cloudflare R2 (Storage)" -ForegroundColor White
Write-Host "  3. Replicate (CLIP API)" -ForegroundColor White
Write-Host "  4. Ed25519 Keys (Generate locally)`n" -ForegroundColor White

Write-Host "Let's check what you already have...`n" -ForegroundColor Cyan

# Check current .env file
$envContent = Get-Content $envFile -ErrorAction SilentlyContinue
$missing = @()

if ($envContent -notmatch "SUPABASE_URL=https://.*\.supabase\.co") {
    $missing += "Supabase"
}
if ($envContent -notmatch "CLOUDFLARE_R2_ACCOUNT_ID=.*[^x]") {
    $missing += "Cloudflare R2"
}
if ($envContent -notmatch "REPLICATE_API_KEY=r8_.*") {
    $missing += "Replicate"
}
if ($envContent -notmatch "SIGNING_PRIVATE_KEY=.*[^x]") {
    $missing += "Ed25519 Keys"
}

if ($missing.Count -eq 0) {
    Write-Host "[OK] All API keys appear to be configured!`n" -ForegroundColor Green
} else {
    Write-Host "[MISSING] You need to set up:" -ForegroundColor Yellow
    foreach ($service in $missing) {
        Write-Host "  - $service" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "=== Step-by-Step Guide ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. SUPABASE" -ForegroundColor Yellow
Write-Host "   a) Go to: https://supabase.com" -ForegroundColor White
Write-Host "   b) Sign up and create a new project" -ForegroundColor White
Write-Host "   c) Go to Settings > API" -ForegroundColor White
Write-Host "   d) Copy: Project URL, anon key, service_role key`n" -ForegroundColor White

Write-Host "2. CLOUDFLARE R2" -ForegroundColor Yellow
Write-Host "   a) Go to: https://dash.cloudflare.com" -ForegroundColor White
Write-Host "   b) Enable R2 in dashboard" -ForegroundColor White
Write-Host "   c) Create bucket: 'matter-artifacts'" -ForegroundColor White
Write-Host "   d) Create API token (Manage R2 API Tokens)" -ForegroundColor White
Write-Host "   e) Copy: Account ID, Access Key ID, Secret Access Key`n" -ForegroundColor White

Write-Host "3. REPLICATE" -ForegroundColor Yellow
Write-Host "   a) Go to: https://replicate.com" -ForegroundColor White
Write-Host "   b) Sign up for account" -ForegroundColor White
Write-Host "   c) Go to: https://replicate.com/account/api-tokens" -ForegroundColor White
Write-Host "   d) Copy your API token (starts with r8_)`n" -ForegroundColor White

Write-Host "4. ED25519 KEYS" -ForegroundColor Yellow
Write-Host "   a) Generate locally using OpenSSL or Python" -ForegroundColor White
Write-Host "   b) See docs/API_KEYS_GUIDE.md for detailed instructions`n" -ForegroundColor White

Write-Host "=== Quick Actions ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Would you like me to:" -ForegroundColor Yellow
Write-Host "  [1] Open Supabase in browser" -ForegroundColor White
Write-Host "  [2] Open Cloudflare R2 in browser" -ForegroundColor White
Write-Host "  [3] Open Replicate in browser" -ForegroundColor White
Write-Host "  [4] Open API Keys Guide" -ForegroundColor White
Write-Host "  [5] Open .env file for editing" -ForegroundColor White
Write-Host "  [0] Exit`n" -ForegroundColor White

$choice = Read-Host "Enter choice (0-5)"

switch ($choice) {
    "1" { Start-Process "https://supabase.com" }
    "2" { Start-Process "https://dash.cloudflare.com" }
    "3" { Start-Process "https://replicate.com" }
    "4" { Start-Process "docs\API_KEYS_GUIDE.md" }
    "5" { 
        if (Test-Path $envFile) {
            notepad $envFile
        } else {
            Write-Host ".env file not found. Creating from template..." -ForegroundColor Yellow
            Copy-Item ".env.example" $envFile
            notepad $envFile
        }
    }
    default { Write-Host "Exiting..." -ForegroundColor Gray }
}

Write-Host "`nRemember:" -ForegroundColor Yellow
Write-Host "  - Never commit .env file to git!" -ForegroundColor White
Write-Host "  - Keep service keys secret" -ForegroundColor White
Write-Host "  - See docs/API_KEYS_GUIDE.md for detailed instructions`n" -ForegroundColor White
