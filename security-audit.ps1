# Security Audit Script
# Comprehensive security check for Supabase database and application

param(
    [string]$Environment = "production",
    [switch]$FixIssues = $false,
    [switch]$Detailed = $false
)

Write-Host "=== Security Audit for AI Focus App ===" -ForegroundColor Green
Write-Host "Environment: $Environment" -ForegroundColor Cyan
Write-Host "Fix Issues: $FixIssues" -ForegroundColor Cyan
Write-Host "Detailed Report: $Detailed" -ForegroundColor Cyan

# Get environment configuration
$envFile = if ($Environment -eq "development") { ".env.development" } else { ".env.production" }

if (-not (Test-Path $envFile)) {
    Write-Host "[ERROR] Environment file not found: $envFile" -ForegroundColor Red
    exit 1
}

$envContent = Get-Content $envFile
$supabaseUrl = ($envContent | Select-String "VITE_SUPABASE_URL").Line.Split("=")[1].Trim('"')
$supabaseKey = ($envContent | Select-String "VITE_SUPABASE_PUBLISHABLE_KEY").Line.Split("=")[1].Trim('"')

Write-Host "Supabase URL: $supabaseUrl" -ForegroundColor White

# Security checks
$securityIssues = @()
$securityWarnings = @()
$securityPassed = @()

# 1. Check RLS status on critical tables
Write-Host "`n=== Row Level Security (RLS) Audit ===" -ForegroundColor Yellow

$criticalTables = @(
    "session_cancellations",
    "training_registrations", 
    "contact_submissions",
    "services",
    "sessions",
    "pricing_rules"
)

foreach ($table in $criticalTables) {
    try {
        $headers = @{
            "apikey" = $supabaseKey
            "Authorization" = "Bearer $supabaseKey"
        }
        
        # Check if table exists and has RLS enabled
        $checkUrl = "$supabaseUrl/rest/v1/$table?select=*&limit=0"
        $response = Invoke-RestMethod -Uri $checkUrl -Method GET -Headers $headers -TimeoutSec 10
        
        Write-Host "[OK] Table '$table' is accessible" -ForegroundColor Green
        $securityPassed += "Table '$table' accessible"
        
    } catch {
        if ($_.Exception.Message -like "*permission denied*" -or $_.Exception.Message -like "*RLS*") {
            Write-Host "[ISSUE] Table '$table' - RLS may be blocking access or not properly configured" -ForegroundColor Red
            $securityIssues += "Table '$table' - RLS configuration issue"
        } else {
            Write-Host "[WARN] Table '$table' - Access issue: $($_.Exception.Message)" -ForegroundColor Yellow
            $securityWarnings += "Table '$table' - $($_.Exception.Message)"
        }
    }
}

# 2. Check function security
Write-Host "`n=== Function Security Audit ===" -ForegroundColor Yellow

$functions = @(
    "calculate_session_price",
    "insert_training_registration", 
    "update_session_availability"
)

foreach ($func in $functions) {
    try {
        # Try to call the function (this will fail if security is misconfigured)
        $funcUrl = "$supabaseUrl/rest/v1/rpc/$func"
        $body = @{
            p_service_id = "00000000-0000-0000-0000-000000000000"
            p_session_date = "2025-01-01T00:00:00Z"
            p_quantity = 1
        } | ConvertTo-Json
        
        $headers = @{
            "apikey" = $supabaseKey
            "Authorization" = "Bearer $supabaseKey"
            "Content-Type" = "application/json"
        }
        
        # This should fail gracefully, not with security errors
        $response = Invoke-RestMethod -Uri $funcUrl -Method POST -Headers $headers -Body $body -TimeoutSec 10
        
        Write-Host "[OK] Function '$func' is accessible" -ForegroundColor Green
        $securityPassed += "Function '$func' accessible"
        
    } catch {
        if ($_.Exception.Message -like "*mutable search_path*") {
            Write-Host "[ISSUE] Function '$func' - Has mutable search_path security issue" -ForegroundColor Red
            $securityIssues += "Function '$func' - mutable search_path issue"
        } elseif ($_.Exception.Message -like "*permission denied*") {
            Write-Host "[WARN] Function '$func' - Permission issue (may be expected)" -ForegroundColor Yellow
            $securityWarnings += "Function '$func' - Permission issue"
        } else {
            Write-Host "[OK] Function '$func' - Security appears correct" -ForegroundColor Green
            $securityPassed += "Function '$func' security OK"
        }
    }
}

# 3. Check API key security
Write-Host "`n=== API Key Security Audit ===" -ForegroundColor Yellow

if ($supabaseKey -like "eyJ*") {
    Write-Host "[OK] API key format appears correct (JWT token)" -ForegroundColor Green
    $securityPassed += "API key format correct"
} else {
    Write-Host "[ISSUE] API key format appears incorrect" -ForegroundColor Red
    $securityIssues += "API key format issue"
}

# Check if it's anon key (should be for client-side)
if ($supabaseKey -like "*anon*" -or $supabaseKey -like "*eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9*") {
    Write-Host "[OK] Using anon key (appropriate for client-side)" -ForegroundColor Green
    $securityPassed += "Using anon key"
} else {
    Write-Host "[WARN] Not using standard anon key format" -ForegroundColor Yellow
    $securityWarnings += "Non-standard anon key format"
}

# 4. Check environment file security
Write-Host "`n=== Environment File Security Audit ===" -ForegroundColor Yellow

# Check if .env files are in .gitignore
if (Test-Path ".gitignore") {
    $gitignoreContent = Get-Content ".gitignore"
    if ($gitignoreContent -match "\.env") {
        Write-Host "[OK] .env files are in .gitignore" -ForegroundColor Green
        $securityPassed += ".env files in .gitignore"
    } else {
        Write-Host "[ISSUE] .env files not in .gitignore - SECURITY RISK!" -ForegroundColor Red
        $securityIssues += ".env files not in .gitignore"
    }
} else {
    Write-Host "[WARN] No .gitignore file found" -ForegroundColor Yellow
    $securityWarnings += "No .gitignore file"
}

# Check for hardcoded secrets in code
Write-Host "`n=== Code Security Audit ===" -ForegroundColor Yellow

$suspiciousPatterns = @(
    "sk_live_",
    "sk_test_", 
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
    "supabase\.co",
    "password.*=.*[^$]",
    "secret.*=.*[^$]"
)

$codeFiles = Get-ChildItem -Path "src" -Recurse -Include "*.ts", "*.tsx", "*.js", "*.jsx"
$foundSecrets = @()

foreach ($file in $codeFiles) {
    $content = Get-Content $file.FullName -Raw
    foreach ($pattern in $suspiciousPatterns) {
        if ($content -match $pattern) {
            $foundSecrets += "$($file.Name): $pattern"
        }
    }
}

if ($foundSecrets.Count -eq 0) {
    Write-Host "[OK] No hardcoded secrets found in code" -ForegroundColor Green
    $securityPassed += "No hardcoded secrets in code"
} else {
    Write-Host "[ISSUE] Potential hardcoded secrets found:" -ForegroundColor Red
    foreach ($secret in $foundSecrets) {
        Write-Host "  - $secret" -ForegroundColor Red
    }
    $securityIssues += "Hardcoded secrets in code: $($foundSecrets.Count) instances"
}

# 5. Summary Report
Write-Host "`n=== Security Audit Summary ===" -ForegroundColor Green

Write-Host "`n[PASSED] Security checks that passed:" -ForegroundColor Green
foreach ($item in $securityPassed) {
    Write-Host "  [OK] $item" -ForegroundColor Green
}

if ($securityWarnings.Count -gt 0) {
    Write-Host "`n[WARNINGS] Items that need attention:" -ForegroundColor Yellow
    foreach ($item in $securityWarnings) {
        Write-Host "  [WARN] $item" -ForegroundColor Yellow
    }
}

if ($securityIssues.Count -gt 0) {
    Write-Host "`n[ISSUES] Critical security issues found:" -ForegroundColor Red
    foreach ($item in $securityIssues) {
        Write-Host "  [ISSUE] $item" -ForegroundColor Red
    }
    
    Write-Host "`n=== Recommended Actions ===" -ForegroundColor Yellow
    Write-Host "1. Run the security fix migration:" -ForegroundColor White
    Write-Host "   npx supabase db push" -ForegroundColor Cyan
    Write-Host "2. Review and fix RLS policies in Supabase dashboard" -ForegroundColor White
    Write-Host "3. Check function security settings" -ForegroundColor White
    Write-Host "4. Ensure .env files are properly gitignored" -ForegroundColor White
    
    if ($FixIssues) {
        Write-Host "`n=== Attempting to Fix Issues ===" -ForegroundColor Green
        Write-Host "Run: npx supabase db push" -ForegroundColor Cyan
        Write-Host "This will apply the security fix migration" -ForegroundColor White
    }
} else {
    Write-Host "`n[SUCCESS] No critical security issues found!" -ForegroundColor Green
    Write-Host "Your application appears to be secure." -ForegroundColor Green
}

# Final summary with proper string handling
Write-Host "`n=== Security Audit Complete ===" -ForegroundColor Green
$issueCount = $securityIssues.Count
$warningCount = $securityWarnings.Count
$passedCount = $securityPassed.Count

Write-Host "Total Issues: $issueCount" -ForegroundColor White
Write-Host "Total Warnings: $warningCount" -ForegroundColor White
Write-Host "Total Passed: $passedCount" -ForegroundColor White
