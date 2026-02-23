param(
  [string]$SnapshotName = ""
)

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$snapshotsRoot = Join-Path $root 'demo/snapshots'
$dataRoot = Join-Path $root 'packages/shadow-index/data'

if (-not (Test-Path $snapshotsRoot)) {
  throw "Snapshots folder not found: $snapshotsRoot"
}

if ([string]::IsNullOrWhiteSpace($SnapshotName)) {
  $latest = Get-ChildItem -Path $snapshotsRoot -Directory | Sort-Object LastWriteTime -Descending | Select-Object -First 1
  if (-not $latest) {
    throw "No snapshots found in: $snapshotsRoot"
  }
  $snapshotPath = $latest.FullName
} else {
  $snapshotPath = Join-Path $snapshotsRoot $SnapshotName
  if (-not (Test-Path $snapshotPath)) {
    throw "Snapshot not found: $snapshotPath"
  }
}

$files = @(
  'orders.json',
  'notifications.json',
  'merchant_accounts.json',
  'payout_logs.json'
)

foreach ($file in $files) {
  $source = Join-Path $snapshotPath $file
  $dest = Join-Path $dataRoot $file

  if (-not (Test-Path $source)) {
    throw "Missing file in snapshot: $source"
  }

  Copy-Item -Path $source -Destination $dest -Force
}

Write-Host "Demo data restored from: $snapshotPath"
Write-Host "Files restored: $($files -join ', ')"