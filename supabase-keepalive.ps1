# Supabase Project Keepalive Script
# This script prevents Supabase projects from being deactivated due to inactivity

param(
    [string]$Environment = "production",  # "development" or "production"
    [int]$IntervalMinutes = 60,          # How often to ping (in minutes)
    [switch]$RunOnce = $false,            # Run once instead of continuously
    [switch]$TestMode = $false            # Test mode - don't actually make requests
)

Write-Host "=== Supabase Project Keepalive ===" -ForegroundColor Green
Write-Host "Environment: $Environment" -ForegroundColor Cyan
Write-Host "Interval: $IntervalMinutes minutes" -ForegroundColor Cyan
Write-Host "Test Mode: $TestMode" -ForegroundColor Cyan

# Get environment configuration
$envFile = if ($Environment -eq "development") { ".env.development" } else { ".env.production" }

if (-not (Test-Path $envFile)) {
    Write-Host "[ERROR] Environment file not found: $envFile" -ForegroundColor Red
    Write-Host "Run ./switch-to-dev.ps1 or ./switch-to-prod.ps1 first" -ForegroundColor Yellow
    exit 1
}

# Read environment variables
$envContent = Get-Content $envFile
$supabaseUrl = ($envContent | Select-String "VITE_SUPABASE_URL").Line.Split("=")[1].Trim('"')
$supabaseKey = ($envContent | Select-String "VITE_SUPABASE_PUBLISHABLE_KEY").Line.Split("=")[1].Trim('"')

Write-Host "Supabase URL: $supabaseUrl" -ForegroundColor White
Write-Host "Project ID: $($supabaseUrl.Split('/')[2].Split('.')[0])" -ForegroundColor White

# Keepalive function with detailed logging
function Invoke-Keepalive {
    param([string]$Url, [string]$Key, [bool]$Test)
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logFile = "keepalive-log.txt"
    
    if ($Test) {
        Write-Host "[$timestamp] [TEST] Would ping: $Url" -ForegroundColor Yellow
        return $true
    }
    
    try {
        # Simple health check - query a lightweight table
        $headers = @{
            "apikey" = $Key
            "Authorization" = "Bearer $Key"
            "Content-Type" = "application/json"
        }
        
        # Query the services table (lightweight, always exists)
        $queryUrl = "$Url/rest/v1/services?select=id&limit=1"
        
        $response = Invoke-RestMethod -Uri $queryUrl -Method GET -Headers $headers -TimeoutSec 30
        
        Write-Host "[$timestamp] [OK] Keepalive successful - Project is active" -ForegroundColor Green
        
        # Log success to file
        $logEntry = "[$timestamp] [SUCCESS] Keepalive completed successfully - Project active"
        Add-Content -Path $logFile -Value $logEntry
        
        return $true
        
    } catch {
        Write-Host "[$timestamp] [ERROR] Keepalive failed: $($_.Exception.Message)" -ForegroundColor Red
        
        # Log error to file
        $logEntry = "[$timestamp] [ERROR] Keepalive failed: $($_.Exception.Message)"
        Add-Content -Path $logFile -Value $logEntry
        
        # Try alternative health check
        try {
            $healthUrl = "$Url/rest/v1/"
            $healthResponse = Invoke-RestMethod -Uri $healthUrl -Method GET -Headers $headers -TimeoutSec 10
            Write-Host "[$timestamp] [OK] Alternative health check passed" -ForegroundColor Yellow
            
            $logEntry = "[$timestamp] [SUCCESS] Alternative health check passed"
            Add-Content -Path $logFile -Value $logEntry
            return $true
        } catch {
            Write-Host "[$timestamp] [ERROR] All health checks failed" -ForegroundColor Red
            
            $logEntry = "[$timestamp] [ERROR] All health checks failed: $($_.Exception.Message)"
            Add-Content -Path $logFile -Value $logEntry
            return $false
        }
    }
}

# Database activity function (more comprehensive)
function Invoke-DatabaseActivity {
    param([string]$Url, [string]$Key, [bool]$Test)
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    if ($Test) {
        Write-Host "[$timestamp] [TEST] Would perform database activity" -ForegroundColor Yellow
        return $true
    }
    
    try {
        $headers = @{
            "apikey" = $Key
            "Authorization" = "Bearer $Key"
            "Content-Type" = "application/json"
        }
        
        # Perform lightweight database operations
        $operations = @(
            @{ url = "$Url/rest/v1/services?select=id,title&limit=5"; name = "Query services" },
            @{ url = "$Url/rest/v1/sessions?select=id,session_id&limit=5"; name = "Query sessions" },
            @{ url = "$Url/rest/v1/training_registrations?select=id&limit=1"; name = "Query registrations" }
        )
        
        $successCount = 0
        foreach ($op in $operations) {
            try {
                $response = Invoke-RestMethod -Uri $op.url -Method GET -Headers $headers -TimeoutSec 15
                Write-Host "[$timestamp] [OK] $($op.name) - $($response.Count) records" -ForegroundColor Green
                $successCount++
            } catch {
                Write-Host "[$timestamp] [WARN] $($op.name) failed: $($_.Exception.Message)" -ForegroundColor Yellow
            }
        }
        
        if ($successCount -gt 0) {
            Write-Host "[$timestamp] [OK] Database activity completed ($successCount/$($operations.Count) operations)" -ForegroundColor Green
            return $true
        } else {
            Write-Host "[$timestamp] [ERROR] All database operations failed" -ForegroundColor Red
            return $false
        }
        
    } catch {
        Write-Host "[$timestamp] [ERROR] Database activity failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Main execution
if ($RunOnce) {
    Write-Host "`n=== Running Single Keepalive ===" -ForegroundColor Yellow
    
    # Simple keepalive
    $keepaliveResult = Invoke-Keepalive -Url $supabaseUrl -Key $supabaseKey -Test $TestMode
    
    if (-not $TestMode) {
        # Database activity
        Start-Sleep -Seconds 2
        $activityResult = Invoke-DatabaseActivity -Url $supabaseUrl -Key $supabaseKey -Test $TestMode
    }
    
    Write-Host "`n=== Keepalive Complete ===" -ForegroundColor Green
    if ($TestMode) {
        Write-Host "Test mode - no actual requests made" -ForegroundColor Yellow
    } else {
        Write-Host "Keepalive requests sent to prevent project deactivation" -ForegroundColor Green
    }
    
} else {
    Write-Host "`n=== Starting Continuous Keepalive ===" -ForegroundColor Yellow
    Write-Host "Press Ctrl+C to stop" -ForegroundColor Cyan
    Write-Host "Will ping every $IntervalMinutes minutes" -ForegroundColor Cyan
    
    $runCount = 0
    $lastSuccess = $true
    
    while ($true) {
        $runCount++
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        
        Write-Host "`n[$timestamp] === Keepalive Run #$runCount ===" -ForegroundColor Cyan
        
        # Simple keepalive
        $keepaliveResult = Invoke-Keepalive -Url $supabaseUrl -Key $supabaseKey -Test $TestMode
        
        if (-not $TestMode) {
            # Database activity every 3rd run
            if ($runCount % 3 -eq 0) {
                Start-Sleep -Seconds 2
                $activityResult = Invoke-DatabaseActivity -Url $supabaseUrl -Key $supabaseKey -Test $TestMode
            }
        }
        
        # Status summary
        if ($keepaliveResult) {
            Write-Host "[$timestamp] [STATUS] Project is active and responsive" -ForegroundColor Green
            $lastSuccess = $true
        } else {
            Write-Host "[$timestamp] [STATUS] Project may have issues - check Supabase dashboard" -ForegroundColor Red
            $lastSuccess = $false
        }
        
        # Next run info
        $nextRun = (Get-Date).AddMinutes($IntervalMinutes).ToString("yyyy-MM-dd HH:mm:ss")
        Write-Host "[$timestamp] [NEXT] Next keepalive at: $nextRun" -ForegroundColor Cyan
        
        # Wait for next interval
        Start-Sleep -Seconds ($IntervalMinutes * 60)
    }
}

Write-Host "`n=== Keepalive Script Complete ===" -ForegroundColor Green
