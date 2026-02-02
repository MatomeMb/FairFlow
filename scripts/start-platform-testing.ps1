# Phase 0 Platform Testing - Interactive Guide
# This script helps you get started with platform testing

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Phase 0 Platform Testing Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if test data exists
$testImage = "test_data\test_product.jpg"
$testThing = "test_data\test_thing.bin"
$testOutput = "test_output"

Write-Host "Checking prerequisites..." -ForegroundColor Yellow

# Check for test image
if (Test-Path $testImage) {
    Write-Host "✓ Test image found: $testImage" -ForegroundColor Green
    $imageSize = (Get-Item $testImage).Length
    Write-Host "  Size: $([math]::Round($imageSize/1KB, 2)) KB" -ForegroundColor Gray
} else {
    Write-Host "✗ Test image NOT found: $testImage" -ForegroundColor Red
    Write-Host "  Please add a test product image (JPEG or PNG) to test_data/ directory" -ForegroundColor Yellow
    Write-Host "  Minimum size: 500x500px" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "You can:" -ForegroundColor Cyan
    Write-Host "  1. Copy any product image to test_data/test_product.jpg" -ForegroundColor White
    Write-Host "  2. Download from Unsplash: https://unsplash.com/s/photos/product" -ForegroundColor White
    Write-Host ""
}

# Check for test .thing file
if (Test-Path $testThing) {
    Write-Host "✓ Test .thing file found: $testThing" -ForegroundColor Green
    $thingSize = (Get-Item $testThing).Length
    Write-Host "  Size: $thingSize bytes" -ForegroundColor Gray
} else {
    Write-Host "✗ Test .thing file NOT found: $testThing" -ForegroundColor Red
    Write-Host "  Creating test .thing file..." -ForegroundColor Yellow
    Set-Location test_data
    .\create_test_thing.ps1
    Set-Location ..
}

# Check for output directory
if (Test-Path $testOutput) {
    Write-Host "✓ Test output directory exists: $testOutput" -ForegroundColor Green
} else {
    Write-Host "✗ Test output directory NOT found: $testOutput" -ForegroundColor Red
    Write-Host "  Creating directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path $testOutput | Out-Null
    Write-Host "✓ Created: $testOutput" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (Test-Path $testImage) {
    Write-Host "1. Generate test polyglot images:" -ForegroundColor Yellow
    Write-Host "   cd packages\matter-core" -ForegroundColor White
    Write-Host "   cargo run --bin platform-test -- create-test-images ..\..\test_data\test_product.jpg ..\..\test_data\test_thing.bin ..\..\test_output\" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Upload test images to platforms and download them" -ForegroundColor Yellow
    Write-Host "3. Test extraction:" -ForegroundColor Yellow
    Write-Host "   cargo run --bin platform-test -- test-extraction ..\..\test_output\platform_downloaded.jpg" -ForegroundColor Gray
    Write-Host ""
    Write-Host "4. Document results in test_output/platform_test_results.json" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "For detailed instructions, see:" -ForegroundColor Cyan
    Write-Host "   docs/PHASE0_TESTING_WALKTHROUGH.md" -ForegroundColor White
} else {
    Write-Host "1. Add a test product image to test_data/test_product.jpg" -ForegroundColor Yellow
    Write-Host "2. Then run this script again" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "For detailed instructions, see:" -ForegroundColor Cyan
    Write-Host "   docs/PHASE0_TESTING_WALKTHROUGH.md" -ForegroundColor White
}

Write-Host ""
