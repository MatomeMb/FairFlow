param(
  [string]$SnapshotName = ""
)

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$snapshotsRoot = Join-Path $root 'demo/snapshots'
$dataRoot = Join-Path $root 'packages/shadow-index/data'

if ([string]::IsNullOrWhiteSpace($SnapshotName)) {
  $SnapshotName = (Get-Date).ToString('yyyy-MM-dd_HHmm') + '-lock'
}

$snapshotPath = Join-Path $snapshotsRoot $SnapshotName
New-Item -Path $snapshotPath -ItemType Directory -Force | Out-Null

$files = @(
  'orders.json',
  'notifications.json',
  'merchant_accounts.json',
  'payout_logs.json'
)

foreach ($file in $files) {
  $source = Join-Path $dataRoot $file
  $dest = Join-Path $snapshotPath $file

  if (-not (Test-Path $source)) {
    throw "Missing source file: $source"
  }

  Copy-Item -Path $source -Destination $dest -Force
}

Write-Host "Demo snapshot created: $snapshotPath"
Write-Host "Files captured: $($files -join ', ')"