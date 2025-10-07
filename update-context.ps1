# Context Update Script for AI Focus App
# This script automatically updates your context files with current project state

param(
    [string]$SessionNote = "",
    [switch]$QuickUpdate = $false
)

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$dateOnly = Get-Date -Format "yyyy-MM-dd"

Write-Host "=== Updating Project Context ===" -ForegroundColor Green
Write-Host "Timestamp: $timestamp" -ForegroundColor Cyan

# Create session log file if it doesn't exist
$sessionFile = "WORK_SESSION_$dateOnly.md"
if (!(Test-Path $sessionFile)) {
    @"
# Work Session - $dateOnly

## Today's Focus
- 

## Issues Encountered
- 

## Solutions Found
- 

## Files Modified
- 

## Next Steps
- 

## Context Updates
"@ | Out-File $sessionFile -Encoding UTF8
    Write-Host "Created new session file: $sessionFile" -ForegroundColor Yellow
}

# Update session file with current activity
if ($SessionNote -ne "") {
    Add-Content $sessionFile "`n### $timestamp`n$SessionNote`n"
    Write-Host "Added session note: $SessionNote" -ForegroundColor Green
}

# Update CHAT_CONTEXT.md with current project state
$contextFile = "CHAT_CONTEXT.md"

# Get current git information
$currentBranch = git branch --show-current
$lastCommit = git log -1 --oneline
$gitStatus = git status --porcelain

# Get current Supabase project info
$supabaseProject = "fvazftacytreklsmmbcr" # Your production project

# Get current Docker image info
$dockerImages = docker images ghcr.io/jisujit/ai-focus --format "table {{.Tag}}\t{{.CreatedAt}}" 2>$null

# Create updated context content
$contextUpdate = @"

## Last Updated: $timestamp

### Current Git State
- **Branch**: $currentBranch
- **Last Commit**: $lastCommit
- **Uncommitted Changes**: $(if ($gitStatus) { $gitStatus.Count } else { "None" })

### Current Container Images
$($dockerImages -join "`n")

### Recent Activity
$($SessionNote)

"@

# Update the context file
if (Test-Path $contextFile) {
    # Find the "Last Updated" section and replace it
    $content = Get-Content $contextFile -Raw
    $pattern = '(?s)## Last Updated:.*?(?=##|$)'
    if ($content -match $pattern) {
        $content = $content -replace $pattern, $contextUpdate
        $content | Out-File $contextFile -Encoding UTF8
        Write-Host "Updated CHAT_CONTEXT.md" -ForegroundColor Green
    } else {
        # Append if pattern not found
        Add-Content $contextFile $contextUpdate
        Write-Host "Appended to CHAT_CONTEXT.md" -ForegroundColor Yellow
    }
} else {
    Write-Host "CHAT_CONTEXT.md not found - please create it first" -ForegroundColor Red
}

# Quick update mode - just update timestamps
if ($QuickUpdate) {
    Write-Host "Quick update completed" -ForegroundColor Cyan
    exit 0
}

# Full update - get more detailed information
Write-Host "`n=== Full Context Update ===" -ForegroundColor Green

# Check edge function status
Write-Host "Checking Supabase Edge Functions..." -ForegroundColor Yellow
try {
    $functions = npx supabase functions list --output json 2>$null
    if ($functions) {
        Add-Content $sessionFile "`n### Edge Functions Status`n$functions`n"
        Write-Host "✅ Edge functions status logged" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Could not get edge functions status" -ForegroundColor Yellow
}

# Check package.json for current dependencies
if (Test-Path "package.json") {
    $packageInfo = Get-Content "package.json" | ConvertFrom-Json
    Add-Content $sessionFile "`n### Current Dependencies`n- Node: $(node --version)`n- npm: $(npm --version)`n"
    Write-Host "✅ Package information logged" -ForegroundColor Green
}

# Create a summary of recent changes
$recentCommits = git log --oneline -5
Add-Content $sessionFile "`n### Recent Commits`n$($recentCommits -join "`n")`n"

Write-Host "`n=== Context Update Complete ===" -ForegroundColor Green
Write-Host "Files updated:" -ForegroundColor Cyan
Write-Host "- $sessionFile" -ForegroundColor White
Write-Host "- $contextFile" -ForegroundColor White

Write-Host "`nNext time you start a chat, reference these updated files!" -ForegroundColor Yellow
