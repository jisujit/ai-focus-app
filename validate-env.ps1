# Environment Validation Script
# Comprehensive validation to ensure correct environment variables are set

Write-Host "=== Environment Validation ===" -ForegroundColor Green

# Define environment signatures
$devSignatures = @{
    supabaseUrl = "vcxfwxrnrskvsgqxqrsz"
    stripeKey = "pk_test_"
    projectId = "vcxfwxrnrskvsgqxqrsz"
}

$prodSignatures = @{
    supabaseUrl = "fvazftacytreklsmmbcr"
    stripeKey = "pk_live_"
    projectId = "fvazftacytreklsmmbcr"
}

# Check if .env exists
if (Test-Path ".env") {
    Write-Host "✅ .env file exists" -ForegroundColor Green
    $envContent = Get-Content ".env"
    
    # Extract key values
    $supabaseUrl = ($envContent | Select-String "VITE_SUPABASE_URL" | Select-Object -First 1).Line.Split("=")[1].Trim('"')
    $stripeKey = ($envContent | Select-String "VITE_STRIPE_PUBLISHABLE_KEY" | Select-Object -First 1).Line.Split("=")[1].Trim('"')
    $projectId = ($envContent | Select-String "VITE_SUPABASE_PROJECT_ID" | Select-Object -First 1).Line.Split("=")[1].Trim('"')
    
    # Determine which environment is active
    $currentEnv = $null
    if ($supabaseUrl -like "*$($devSignatures.supabaseUrl)*") {
        $currentEnv = "DEVELOPMENT"
    } elseif ($supabaseUrl -like "*$($prodSignatures.supabaseUrl)*") {
        $currentEnv = "PRODUCTION"
    } else {
        $currentEnv = "UNKNOWN"
    }
    
    Write-Host "`n=== Current Active Environment ===" -ForegroundColor Cyan
    Write-Host "Environment: $currentEnv" -ForegroundColor White
    
    # Validate required variables presence
    Write-Host "`n=== Required Variables Check ===" -ForegroundColor Yellow
    $requiredVars = @("VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY", "VITE_STRIPE_PUBLISHABLE_KEY", "VITE_SUPABASE_PROJECT_ID")
    
    $allVarsPresent = $true
    foreach ($var in $requiredVars) {
        if ($envContent -match $var) {
            Write-Host "✅ $var is set" -ForegroundColor Green
        } else {
            Write-Host "❌ $var is MISSING" -ForegroundColor Red
            $allVarsPresent = $false
        }
    }
    
    # Validate environment-specific values
    Write-Host "`n=== Environment Correctness Check ===" -ForegroundColor Yellow
    
    if ($currentEnv -eq "DEVELOPMENT") {
        Write-Host "🔧 Validating DEVELOPMENT environment..." -ForegroundColor Cyan
        
        $devChecks = @(
            @{ check = "Supabase Project ID"; actual = $projectId; expected = $devSignatures.projectId; },
            @{ check = "Supabase URL"; actual = $supabaseUrl; expected = "vcxfwxrnrskvsgqxqrsz.supabase.co"; },
            @{ check = "Stripe Key"; actual = $stripeKey; expected = "pk_test_"; type = "prefix" }
        )
        
        foreach ($check in $devChecks) {
            if ($check.type -eq "prefix") {
                if ($check.actual -like "$($check.expected)*") {
                    Write-Host "✅ $($check.check): $($check.actual)" -ForegroundColor Green
                } else {
                    Write-Host "❌ $($check.check): Expected prefix '$($check.expected)', got '$($check.actual)'" -ForegroundColor Red
                }
            } else {
                if ($check.actual -like "*$($check.expected)*") {
                    Write-Host "✅ $($check.check): Contains expected value" -ForegroundColor Green
                } else {
                    Write-Host "❌ $($check.check): Expected to contain '$($check.expected)', got '$($check.actual)'" -ForegroundColor Red
                }
            }
        }
        
    } elseif ($currentEnv -eq "PRODUCTION") {
        Write-Host "🚀 Validating PRODUCTION environment..." -ForegroundColor Cyan
        
        $prodChecks = @(
            @{ check = "Supabase Project ID"; actual = $projectId; expected = $prodSignatures.projectId; },
            @{ check = "Supabase URL"; actual = $supabaseUrl; expected = "fvazftacytreklsmmbcr.supabase.co"; },
            @{ check = "Stripe Key"; actual = $stripeKey; expected = "pk_live_"; type = "prefix" }
        )
        
        foreach ($check in $prodChecks) {
            if ($check.type -eq "prefix") {
                if ($check.actual -like "$($check.expected)*") {
                    Write-Host "✅ $($check.check): $($check.actual)" -ForegroundColor Green
                } else {
                    Write-Host "❌ $($check.check): Expected prefix '$($check.expected)', got '$($check.actual)'" -ForegroundColor Red
                }
            } else {
                if ($check.actual -like "*$($check.expected)*") {
                    Write-Host "✅ $($check.check): Contains expected value" -ForegroundColor Green
                } else {
                    Write-Host "❌ $($check.check): Expected to contain '$($check.expected)', got '$($check.actual)'" -ForegroundColor Red
                }
            }
        }
        
    } else {
        Write-Host "❌ UNKNOWN environment detected!" -ForegroundColor Red
        Write-Host "Current Supabase URL: $supabaseUrl" -ForegroundColor Yellow
    }
    
    # Check environment files
    Write-Host "`n=== Environment Files Status ===" -ForegroundColor Green
    $envFiles = @(".env", ".env.development", ".env.production")
    foreach ($file in $envFiles) {
        if (Test-Path $file) {
            Write-Host "✅ $file exists" -ForegroundColor Green
        } else {
            Write-Host "❌ $file missing" -ForegroundColor Red
        }
    }
    
    # Final status
    Write-Host "`n=== Final Status ===" -ForegroundColor Green
    if ($allVarsPresent -and $currentEnv -ne "UNKNOWN") {
        Write-Host "✅ Environment is correctly configured for $currentEnv!" -ForegroundColor Green
    } else {
        Write-Host "❌ Environment has issues - see details above" -ForegroundColor Red
    }
    
} else {
    Write-Host "❌ .env file not found" -ForegroundColor Red
    Write-Host "Run ./switch-to-dev.ps1 or ./switch-to-prod.ps1 to set up environment" -ForegroundColor Yellow
}

# Quick reference
Write-Host "`n=== Quick Commands ===" -ForegroundColor Yellow
Write-Host "Switch to Development: ./switch-to-dev.ps1" -ForegroundColor White
Write-Host "Switch to Production: ./switch-to-prod.ps1" -ForegroundColor White
Write-Host "Fix Environment Access: ./fix-env-access.ps1" -ForegroundColor White
Write-Host "Validate Environment: ./validate-env.ps1" -ForegroundColor White

