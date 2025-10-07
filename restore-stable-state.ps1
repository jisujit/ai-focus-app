# Quick Restoration Script for Stable State
# This script restores the application to the last known stable state

param(
    [string]$Version = "v1.0.0-stable"
)

Write-Host "=== Restoring to Stable State ===" -ForegroundColor Green
Write-Host "Target Version: $Version" -ForegroundColor Cyan

Write-Host "`nWARNING: This will restore to a previous state!" -ForegroundColor Red
Write-Host "Make sure you have a current backup before proceeding." -ForegroundColor Red
$confirm = Read-Host "Continue? (yes/no)"

if ($confirm -ne "yes") {
    Write-Host "Restoration cancelled." -ForegroundColor Yellow
    exit 0
}

# Step 1: Restore Code
Write-Host "`n1. Restoring code to $Version..." -ForegroundColor Green
try {
    git checkout $Version
    npm install
    Write-Host "✅ Code restored successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Code restoration failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Restore Database Schema
Write-Host "`n2. Restoring database schema..." -ForegroundColor Green
try {
    npx supabase db push
    Write-Host "✅ Database schema restored" -ForegroundColor Green
} catch {
    Write-Host "❌ Database schema restoration failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "You may need to manually apply migrations" -ForegroundColor Yellow
}

# Step 3: Restore Edge Functions
Write-Host "`n3. Restoring edge functions..." -ForegroundColor Green
$functions = @(
    "confirm-payment",
    "create-payment-intent", 
    "send-registration-confirmation",
    "submit-contact-form",
    "check-registration-status",
    "send-contact-confirmation",
    "send-session-cancellation",
    "delete-session-with-refunds"
)

foreach ($func in $functions) {
    try {
        Write-Host "Deploying $func..." -ForegroundColor Yellow
        npx supabase functions deploy $func
        Write-Host "✅ $func deployed" -ForegroundColor Green
    } catch {
        Write-Host "❌ $func deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Step 4: Build and Deploy Frontend
Write-Host "`n4. Building and deploying frontend..." -ForegroundColor Green
try {
    npm run build:prod
    docker build -t ghcr.io/jisujit/ai-focus:latest .
    docker push ghcr.io/jisujit/ai-focus:latest
    Write-Host "✅ Frontend deployed" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend deployment failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Restoration Complete ===" -ForegroundColor Green
Write-Host "Application restored to: $Version" -ForegroundColor Cyan
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Test the application functionality" -ForegroundColor White
Write-Host "2. Verify all services are working" -ForegroundColor White
Write-Host "3. Monitor logs for any issues" -ForegroundColor White
