# Generate professional PDF from Technical Documentation
# Uses md-to-pdf with Chrome for high-quality rendering (diagrams, tables, typography)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$md = Join-Path $root "THINGS-THAT-MATTER-TECHNICAL-DOCUMENTATION.md"
$css = Join-Path $root "docs" "pdf-styles.css"
$out = Join-Path $root "THINGS-THAT-MATTER-TECHNICAL-DOCUMENTATION.pdf"

$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
if (-not (Test-Path $chrome)) {
    $chrome = "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
}
if (-not (Test-Path $chrome)) {
    Write-Error "Chrome not found. Install Chrome or set PUPPETEER_EXECUTABLE_PATH to your browser."
}

$env:PUPPETEER_EXECUTABLE_PATH = $chrome
Set-Location $root

npx md-to-pdf $md --stylesheet $css

Write-Host "PDF generated: $out" -ForegroundColor Green
