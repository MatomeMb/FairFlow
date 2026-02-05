# Free port 3000 (e.g. so Shadow Index API can start).
# Run from repo root: .\scripts\kill-port-3000.ps1

$targetPid = $null
try {
  $conn = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($conn) { $targetPid = $conn.OwningProcess }
} catch { }

if (-not $targetPid) {
  $line = netstat -ano | Select-String ":\s*3000\s" | Select-Object -First 1
  if ($line -match "\s+(\d+)\s*$") { $targetPid = [int]$Matches[1] }
}

if ($targetPid) {
  Stop-Process -Id $targetPid -Force -ErrorAction SilentlyContinue
  Write-Host "Stopped process on port 3000 (PID $targetPid)."
} else {
  Write-Host "Nothing is listening on port 3000."
}
