param(
  [string]$SnapshotName = "",
  [string]$DemoMerchantUserId = $env:DEMO_MERCHANT_USER_ID
)

$ErrorActionPreference = 'Stop'

function Import-EnvFile {
  param(
    [string]$Path
  )

  if (-not (Test-Path $Path)) {
    return
  }

  Get-Content -Path $Path | ForEach-Object {
    $line = $_.Trim()
    if ([string]::IsNullOrWhiteSpace($line) -or $line.StartsWith('#')) {
      return
    }

    $parts = $line -split '=', 2
    if ($parts.Count -ne 2) {
      return
    }

    $key = $parts[0].Trim()
    $value = $parts[1].Trim()
    $value = $value.Trim("'")
    $value = $value.Trim('"')
    if (-not [string]::IsNullOrWhiteSpace($key) -and [string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($key))) {
      [Environment]::SetEnvironmentVariable($key, $value)
    }
  }
}

function Get-NextMondayIso {
  $now = [DateTimeOffset]::UtcNow
  $daysUntilMonday = (8 - [int]$now.DayOfWeek) % 7
  if ($daysUntilMonday -eq 0) {
    $daysUntilMonday = 7
  }

  $nextMondayUtc = [DateTimeOffset]::new($now.UtcDateTime.Date.AddDays($daysUntilMonday), [TimeSpan]::Zero)
  return $nextMondayUtc.ToString('o')
}

function Invoke-MerchantPatch {
  param(
    [string]$SupabaseUrl,
    [string]$ServiceKey,
    [string]$FilterColumn,
    [string]$FilterValue,
    [string]$Payload
  )

  $encodedValue = [System.Uri]::EscapeDataString($FilterValue)
  $uri = "{0}/rest/v1/merchant_accounts?{1}=eq.{2}" -f $SupabaseUrl.TrimEnd('/'), $FilterColumn, $encodedValue
  $headers = @{
    apikey        = $ServiceKey
    Authorization = "Bearer $ServiceKey"
    Prefer        = 'return=representation'
    'Content-Type' = 'application/json'
  }

  return Invoke-RestMethod -Method Patch -Uri $uri -Headers $headers -Body $Payload
}

$root = Split-Path -Parent $PSScriptRoot
$snapshotsRoot = Join-Path $root 'demo/snapshots'
$dataRoot = Join-Path $root 'packages/shadow-index/data'
$shadowIndexRoot = Join-Path $root 'packages/shadow-index'

Import-EnvFile -Path (Join-Path $shadowIndexRoot '.env')
Import-EnvFile -Path (Join-Path $shadowIndexRoot '.env.local')

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

$supabaseUrl = [Environment]::GetEnvironmentVariable('SUPABASE_URL')
$supabaseServiceKey = [Environment]::GetEnvironmentVariable('SUPABASE_SERVICE_KEY')

if ([string]::IsNullOrWhiteSpace($DemoMerchantUserId)) {
  throw 'DEMO_MERCHANT_USER_ID must be set to patch the demo merchant payout state.'
}

if ([string]::IsNullOrWhiteSpace($supabaseUrl) -or [string]::IsNullOrWhiteSpace($supabaseServiceKey)) {
  throw 'SUPABASE_URL and SUPABASE_SERVICE_KEY must be set to patch demo merchant_accounts state.'
}

$nextMondayIso = Get-NextMondayIso
$merchantPatchBody = @{
  pending_payout   = 29100
  total_earnings   = 29100
  commission_rate  = 0.03
  payout_frequency = 'weekly'
  payout_eligible  = $true
  kyc_status       = 'approved'
  next_payout_date = $nextMondayIso
} | ConvertTo-Json

$patchedMerchant = Invoke-MerchantPatch `
  -SupabaseUrl $supabaseUrl `
  -ServiceKey $supabaseServiceKey `
  -FilterColumn 'user_id' `
  -FilterValue $DemoMerchantUserId `
  -Payload $merchantPatchBody

if (-not $patchedMerchant -or $patchedMerchant.Count -eq 0) {
  $patchedMerchant = Invoke-MerchantPatch `
    -SupabaseUrl $supabaseUrl `
    -ServiceKey $supabaseServiceKey `
    -FilterColumn 'id' `
    -FilterValue $DemoMerchantUserId `
    -Payload $merchantPatchBody
}

if (-not $patchedMerchant -or $patchedMerchant.Count -eq 0) {
  throw "No merchant_accounts row matched DEMO_MERCHANT_USER_ID '$DemoMerchantUserId' via user_id or id."
}

Write-Host "Demo data restored from: $snapshotPath"
Write-Host "Files restored: $($files -join ', ')"
Write-Host "Demo merchant payout state patched to R291.00 with approved KYC."