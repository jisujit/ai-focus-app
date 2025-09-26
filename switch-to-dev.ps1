# Switch to Development Environment
Write-Host "Switching to Development Environment..." -ForegroundColor Green

# Backup current .env if it exists
if (Test-Path ".env") {
    Copy-Item ".env" ".env.backup" -Force
    Write-Host "Backed up current .env to .env.backup" -ForegroundColor Yellow
}

# Copy dev environment
if (Test-Path ".env.development") {
    Copy-Item ".env.development" ".env" -Force
    Write-Host "Switched to development environment (.env.development -> .env)" -ForegroundColor Green
} else {
    Write-Host "ERROR: .env.development file not found!" -ForegroundColor Red
    Write-Host "Please create .env.development with your dev credentials" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Development Environment Setup:" -ForegroundColor Cyan
Write-Host "- Supabase: ai-focus-app-dev" -ForegroundColor White
Write-Host "- Stripe: TEST mode" -ForegroundColor White
Write-Host "- Emails: Redirected to gsujit@gmail.com" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Set TEST_MODE=true in Supabase Edge Functions" -ForegroundColor White
Write-Host "2. Run: npm run dev" -ForegroundColor White
Write-Host "3. Or run: ./dev-test.ps1" -ForegroundColor White
