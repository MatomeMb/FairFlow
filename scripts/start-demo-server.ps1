param(
  [string]$Port = "5177",
  [string]$Root = "demo"
)

if (-not (Test-Path $Root)) {
  Write-Error "Demo root not found: $Root"
  exit 1
}

Write-Host "Starting demo server at http://localhost:$Port"
Write-Host "Serving folder: $Root"
Write-Host "Press Ctrl+C to stop."

python -m http.server $Port --directory $Root
