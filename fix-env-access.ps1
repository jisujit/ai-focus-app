# Fix Environment File Access Issues
# This script ensures Cursor IDE can properly access environment files

Write-Host "=== Fixing Environment File Access Issues ===" -ForegroundColor Green

# Step 1: Check current environment files
Write-Host "`n1. Checking current environment files..." -ForegroundColor Yellow
$envFiles = Get-ChildItem -Path . -Name ".env*" -Force
Write-Host "Found environment files:" -ForegroundColor Cyan
$envFiles | ForEach-Object { Write-Host "  - $_" -ForegroundColor White }

# Step 2: Remove any hidden/system attributes that might block IDE access
Write-Host "`n2. Fixing file attributes..." -ForegroundColor Yellow
$envFiles | ForEach-Object {
    try {
        # Remove hidden/system attributes
        attrib -H -S $_
        Write-Host "  ✅ Fixed attributes for: $_" -ForegroundColor Green
    } catch {
        Write-Host "  ⚠️  Could not fix attributes for: $_" -ForegroundColor Yellow
    }
}

# Step 3: Verify file contents are accessible
Write-Host "`n3. Verifying file contents..." -ForegroundColor Yellow
$envFiles | ForEach-Object {
    try {
        $content = Get-Content $_ -ErrorAction Stop
        Write-Host "  ✅ $_ - $($content.Count) lines" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ $_ - Cannot read content" -ForegroundColor Red
    }
}

# Step 4: Create environment status report
Write-Host "`n4. Creating environment status report..." -ForegroundColor Yellow

$currentEnv = if (Test-Path ".env") { Get-Content ".env" | Select-String "VITE_SUPABASE_URL" | ForEach-Object { $_.Line.Split("=")[1].Trim('"') } } else { "No .env file" }
$devEnv = if (Test-Path ".env.development") { Get-Content ".env.development" | Select-String "VITE_SUPABASE_URL" | ForEach-Object { $_.Line.Split("=")[1].Trim('"') } } else { "No .env.development file" }
$prodEnv = if (Test-Path ".env.production") { Get-Content ".env.production" | Select-String "VITE_SUPABASE_URL" | ForEach-Object { $_.Line.Split("=")[1].Trim('"') } } else { "No .env.production file" }

Write-Host "`n=== Environment Status ===" -ForegroundColor Cyan
Write-Host "Current Active (.env): $currentEnv" -ForegroundColor White
Write-Host "Development (.env.development): $devEnv" -ForegroundColor White  
Write-Host "Production (.env.production): $prodEnv" -ForegroundColor White

# Step 5: Test environment switching
Write-Host "`n5. Testing environment switching..." -ForegroundColor Yellow
Write-Host "Testing switch to development..." -ForegroundColor Cyan
if (Test-Path ".env.development") {
    Copy-Item ".env.development" ".env" -Force
    Write-Host "  ✅ Switched to development environment" -ForegroundColor Green
} else {
    Write-Host "  ❌ .env.development not found" -ForegroundColor Red
}

Write-Host "Testing switch to production..." -ForegroundColor Cyan
if (Test-Path ".env.production") {
    Copy-Item ".env.production" ".env" -Force
    Write-Host "  ✅ Switched to production environment" -ForegroundColor Green
} else {
    Write-Host "  ❌ .env.production not found" -ForegroundColor Red
}

# Step 6: Create IDE-friendly environment files
Write-Host "`n6. Creating IDE-friendly environment files..." -ForegroundColor Yellow

# Create a visible .env.example file for reference
$envExample = @"
# Environment Configuration Example
# Copy this file to .env and update with your actual values

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id

# Stripe Configuration  
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-key

# Admin Configuration
VITE_ADMIN_PASSWORD=your-admin-password
VITE_ADMIN_EMAIL=admin@your-domain.com

# Environment
NODE_ENV=development
"@

$envExample | Out-File ".env.example" -Encoding UTF8
Write-Host "  ✅ Created .env.example for reference" -ForegroundColor Green

# Step 7: Create environment validation script
Write-Host "`n7. Creating environment validation script..." -ForegroundColor Yellow

$validationScript = @"
# Environment Validation Script
# Run this to check if your environment is properly configured

Write-Host "=== Environment Validation ===" -ForegroundColor Green

# Check if .env exists
if (Test-Path ".env") {
    Write-Host "✅ .env file exists" -ForegroundColor Green
    `$envContent = Get-Content ".env"
    
    # Check required variables
    `$requiredVars = @("VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY", "VITE_STRIPE_PUBLISHABLE_KEY")
    
    foreach (`$var in `$requiredVars) {
        if (`$envContent -match `$var) {
            Write-Host "✅ `$var is set" -ForegroundColor Green
        } else {
            Write-Host "❌ `$var is missing" -ForegroundColor Red
        }
    }
} else {
    Write-Host "❌ .env file not found" -ForegroundColor Red
    Write-Host "Run ./switch-to-dev.ps1 or ./switch-to-prod.ps1 to set up environment" -ForegroundColor Yellow
}
"@

$validationScript | Out-File "validate-env.ps1" -Encoding UTF8
Write-Host "  ✅ Created validate-env.ps1" -ForegroundColor Green

Write-Host "`n=== Environment Access Fix Complete ===" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Restart Cursor IDE to refresh file access" -ForegroundColor White
Write-Host "2. Run ./validate-env.ps1 to check your environment" -ForegroundColor White
Write-Host "3. Use ./switch-to-dev.ps1 or ./switch-to-prod.ps1 to switch environments" -ForegroundColor White
Write-Host "4. Check that .env files are now visible in Cursor IDE file explorer" -ForegroundColor White
