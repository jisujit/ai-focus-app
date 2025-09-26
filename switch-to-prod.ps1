# Switch to Production Environment
Write-Host "Switching to Production Environment..." -ForegroundColor Green

# Backup current .env if it exists
if (Test-Path ".env") {
    Copy-Item ".env" ".env.dev.backup" -Force
    Write-Host "Backed up current .env to .env.dev.backup" -ForegroundColor Yellow
}

# Copy production environment
if (Test-Path ".env.production") {
    Copy-Item ".env.production" ".env" -Force
    Write-Host "Switched to production environment (.env.production -> .env)" -ForegroundColor Green
} else {
    Write-Host "ERROR: .env.production file not found!" -ForegroundColor Red
    Write-Host "Please create .env.production with your prod credentials" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Production Environment Setup:" -ForegroundColor Cyan
Write-Host "- Supabase: ai-focus-app-prod" -ForegroundColor White
Write-Host "- Stripe: LIVE mode" -ForegroundColor White
Write-Host "- Emails: Sent to actual recipients" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Set TEST_MODE=false in Supabase Edge Functions" -ForegroundColor White
Write-Host "2. Run: ./deploy.ps1" -ForegroundColor White
Write-Host ""
Write-Host "WARNING: This will deploy to PRODUCTION!" -ForegroundColor Red
Write-Host "Make sure you're ready to go live." -ForegroundColor Red
