# Switch to Production Environment
Write-Host "=== Switching to Production Environment ===" -ForegroundColor Green

# Step 1: Backup current .env if it exists
if (Test-Path ".env") {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    Copy-Item ".env" ".env.dev.backup.$timestamp" -Force
    Write-Host "[OK] Backed up current .env to .env.dev.backup.$timestamp" -ForegroundColor Yellow
}

# Step 2: Copy production environment
if (Test-Path ".env.production") {
    Copy-Item ".env.production" ".env" -Force
    Write-Host "[OK] Switched to production environment (.env.production -> .env)" -ForegroundColor Green
} else {
    Write-Host "[ERROR] .env.production file not found!" -ForegroundColor Red
    Write-Host "Please create .env.production with your prod credentials" -ForegroundColor Red
    exit 1
}

# Step 3: Verify the switch worked
Write-Host "`n=== Verifying Environment Switch ===" -ForegroundColor Yellow
if (Test-Path ".env") {
    $envContent = Get-Content ".env"
    $supabaseUrl = ($envContent | Select-String "VITE_SUPABASE_URL").Line.Split("=")[1].Trim('"')
    
    if ($supabaseUrl -like "*fvazftacytreklsmmbcr*") {
        Write-Host "[OK] Successfully switched to PRODUCTION environment" -ForegroundColor Green
        Write-Host "     Supabase URL: $supabaseUrl" -ForegroundColor Cyan
    } else {
        Write-Host "[WARN] Environment switch may not have worked correctly" -ForegroundColor Yellow
        Write-Host "       Current URL: $supabaseUrl" -ForegroundColor Yellow
    }
} else {
    Write-Host "[ERROR] .env file not found after switch" -ForegroundColor Red
    exit 1
}

# Step 4: Display environment details
Write-Host "`n=== Production Environment Details ===" -ForegroundColor Cyan
Write-Host "[PROD] Supabase Project: ai-focus-app-prod (fvazftacytreklsmmbcr)" -ForegroundColor White
Write-Host "[LIVE] Stripe Mode: LIVE (pk_live_...)" -ForegroundColor White
Write-Host "[EMAIL] Email Mode: Real recipients (no redirect)" -ForegroundColor White
Write-Host "[AUTH] Admin Password: ath@rvaL0kam" -ForegroundColor White

# Step 5: Safety warnings
Write-Host "`n*** PRODUCTION WARNINGS ***" -ForegroundColor Red
Write-Host "*** This is LIVE PRODUCTION environment!" -ForegroundColor Red
Write-Host "*** Real payments will be processed!" -ForegroundColor Red
Write-Host "*** Real emails will be sent to customers!" -ForegroundColor Red
Write-Host "*** Make sure you're ready to go live!" -ForegroundColor Red

# Step 6: Next steps
Write-Host "`n=== Next Steps ===" -ForegroundColor Yellow
Write-Host "1. Set TEST_MODE=false in Supabase Edge Functions" -ForegroundColor White
Write-Host "2. Run: ./deploy.ps1" -ForegroundColor White
Write-Host "3. Validate: ./validate-env.ps1" -ForegroundColor White

Write-Host "`n[OK] Production environment is ready!" -ForegroundColor Green
Write-Host "*** Proceed with caution - this is LIVE!" -ForegroundColor Red
