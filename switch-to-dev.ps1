# Switch to Development Environment
Write-Host "=== Switching to Development Environment ===" -ForegroundColor Green

# Step 1: Backup current .env if it exists
if (Test-Path ".env") {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    Copy-Item ".env" ".env.backup.$timestamp" -Force
    Write-Host "[OK] Backed up current .env to .env.backup.$timestamp" -ForegroundColor Yellow
}

# Step 2: Copy dev environment
if (Test-Path ".env.development") {
    Copy-Item ".env.development" ".env" -Force
    Write-Host "[OK] Switched to development environment (.env.development -> .env)" -ForegroundColor Green
} else {
    Write-Host "[ERROR] .env.development file not found!" -ForegroundColor Red
    Write-Host "Please create .env.development with your dev credentials" -ForegroundColor Red
    exit 1
}

# Step 3: Verify the switch worked
Write-Host "`n=== Verifying Environment Switch ===" -ForegroundColor Yellow
if (Test-Path ".env") {
    $envContent = Get-Content ".env"
    $supabaseUrl = ($envContent | Select-String "VITE_SUPABASE_URL").Line.Split("=")[1].Trim('"')
    
    if ($supabaseUrl -like "*vcxfwxrnrskvsgqxqrsz*") {
        Write-Host "[OK] Successfully switched to DEVELOPMENT environment" -ForegroundColor Green
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
Write-Host "`n=== Development Environment Details ===" -ForegroundColor Cyan
Write-Host "[DEV] Supabase Project: ai-focus-app-dev (vcxfwxrnrskvsgqxqrsz)" -ForegroundColor White
Write-Host "[TEST] Stripe Mode: TEST (pk_test_...)" -ForegroundColor White
Write-Host "[EMAIL] Email Redirect: All emails -> gsujit@gmail.com" -ForegroundColor White
Write-Host "[AUTH] Admin Password: admin123" -ForegroundColor White

# Step 5: Next steps
Write-Host "`n=== Next Steps ===" -ForegroundColor Yellow
Write-Host "1. Set TEST_MODE=true in Supabase Edge Functions" -ForegroundColor White
Write-Host "2. Run: npm run dev" -ForegroundColor White
Write-Host "3. Or run: ./dev-test.ps1" -ForegroundColor White
Write-Host "4. Validate: ./validate-env.ps1" -ForegroundColor White

Write-Host "`n[OK] Development environment is ready!" -ForegroundColor Green
