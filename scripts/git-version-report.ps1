param(
    [string]$OutputRoot = "reports/git",
    [string]$Since = "30 days ago",
    [int]$MaxCommits = 200,
    [switch]$NoFetch
)

$ErrorActionPreference = "Stop"

function Write-Section {
    param([string]$Title)
    Write-Host ""
    Write-Host "=== $Title ===" -ForegroundColor Cyan
}

function Get-CommandOutput {
    param([string]$Command)
    $result = cmd /c $Command 2>&1
    return ($result -join [Environment]::NewLine)
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error "Git is not installed or not available in PATH."
}

$repoRoot = Get-CommandOutput "git rev-parse --show-toplevel"
if (-not $repoRoot) {
    Write-Error "Not inside a Git repository."
}

Set-Location $repoRoot

if (-not $NoFetch) {
    Write-Section "Refreshing remote references"
    cmd /c "git fetch --all --prune"
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$reportDir = Join-Path $repoRoot $OutputRoot
if (-not (Test-Path $reportDir)) {
    New-Item -ItemType Directory -Path $reportDir | Out-Null
}

$statusFile = Join-Path $reportDir "git-status-$timestamp.txt"
$historyFile = Join-Path $reportDir "git-history-$timestamp.txt"
$summaryFile = Join-Path $reportDir "git-summary-$timestamp.md"

Write-Section "Collecting repository status"
$statusContent = @()
$statusContent += "Repository: $repoRoot"
$statusContent += "Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss zzz")"
$statusContent += ""
$statusContent += "[git status -sb]"
$statusContent += Get-CommandOutput "git status -sb"
$statusContent += ""
$statusContent += "[git branch -vv]"
$statusContent += Get-CommandOutput "git branch -vv"
$statusContent += ""
$statusContent += "[git remote -v]"
$statusContent += Get-CommandOutput "git remote -v"
$statusContent += ""
$statusContent += "[git stash list]"
$statusContent += Get-CommandOutput "git stash list"

Set-Content -Path $statusFile -Value ($statusContent -join [Environment]::NewLine)

Write-Section "Collecting commit history and version markers"
$historyContent = @()
$historyContent += "Repository: $repoRoot"
$historyContent += "Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss zzz")"
$historyContent += ""
$historyContent += "[Recent graph ($MaxCommits commits)]"
$historyContent += Get-CommandOutput "git log --graph --decorate --oneline -n $MaxCommits"
$historyContent += ""
$historyContent += "[Recent commits since '$Since']"
$recentSinceCmd = ('git log --since="{0}" --date=iso --pretty=format:"%h|%ad|%an|%s"' -f $Since)
$historyContent += Get-CommandOutput $recentSinceCmd
$historyContent += ""
$historyContent += "[Tags (version history)]"
$historyContent += Get-CommandOutput "git tag --sort=-creatordate"
$historyContent += ""
$historyContent += "[Last 20 merge commits]"
$mergeCmd = 'git log --merges --date=iso --pretty=format:"%h|%ad|%an|%s" -n 20'
$historyContent += Get-CommandOutput $mergeCmd

Set-Content -Path $historyFile -Value ($historyContent -join [Environment]::NewLine)

Write-Section "Building executive summary"
$currentBranch = Get-CommandOutput "git rev-parse --abbrev-ref HEAD"
$headCommit = Get-CommandOutput "git rev-parse --short HEAD"
$dirty = (Get-CommandOutput "git status --porcelain")
$dirtyFlag = if ($dirty) { "Yes" } else { "No" }
$aheadBehind = Get-CommandOutput "git rev-list --left-right --count HEAD...@{upstream}"

$ahead = "N/A"
$behind = "N/A"
if ($aheadBehind -match "^(\d+)\s+(\d+)$") {
    $ahead = $Matches[1]
    $behind = $Matches[2]
}

$contributorsRaw = Get-CommandOutput "git shortlog -sn --all"
$contributors = ($contributorsRaw -split "`r?`n" | Select-Object -First 10) -join [Environment]::NewLine
if (-not $contributors) {
    $contributors = "No contributor data found."
}

$summary = @()
$summary += "# Git Version History Report"
$summary += ""
$summary += "- Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss zzz")"
$summary += "- Repository: $repoRoot"
$summary += "- Branch: $currentBranch"
$summary += "- HEAD: $headCommit"
$summary += "- Working Tree Dirty: $dirtyFlag"
$summary += "- Ahead of Upstream: $ahead"
$summary += "- Behind Upstream: $behind"
$summary += ""
$summary += "## Professional Git Health Checklist"
$summary += ""
$summary += "- [ ] Working tree clean before merge or release"
$summary += "- [ ] Branch synced with upstream before push"
$summary += "- [ ] Merge commits reviewed for conflict artifacts"
$summary += "- [ ] Tags applied for release points"
$summary += "- [ ] Commit messages follow conventional format"
$summary += ""
$summary += "## Top Contributors"
$summary += ""
$summary += '```'
$summary += $contributors
$summary += '```'
$summary += ""
$summary += "## Artifacts"
$summary += ""
$summary += "- Status Report: $statusFile"
$summary += "- History Report: $historyFile"
$summary += ""
$summary += "## Recommended Commands"
$summary += ""
$summary += '```bash'
$summary += "git status -sb"
$summary += "git log --graph --decorate --oneline -n 30"
$summary += "git fetch --all --prune"
$summary += "git branch -vv"
$summary += "git tag --sort=-creatordate"
$summary += '```'

Set-Content -Path $summaryFile -Value ($summary -join [Environment]::NewLine)

Write-Section "Complete"
Write-Host "Status report:  $statusFile" -ForegroundColor Green
Write-Host "History report: $historyFile" -ForegroundColor Green
Write-Host "Summary report: $summaryFile" -ForegroundColor Green
