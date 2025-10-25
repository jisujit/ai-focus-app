# Supabase Project Keepalive Script - 15 Day Interval
# This script prevents Supabase projects from being deactivated due to inactivity
# Runs every 15 days as requested

param(
    [string]$Environment = "production",
    [switch]$RunOnce = $false,
    [switch]$TestMode = $false,
    [switch]$SendEmail = $true
)

Write-Host "=== Supabase Project Keepalive (15-Day Interval) ===" -ForegroundColor Green
Write-Host "Environment: $Environment" -ForegroundColor Cyan
Write-Host "Test Mode: $TestMode" -ForegroundColor Cyan
Write-Host "Send Email: $SendEmail" -ForegroundColor Cyan

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

# Enhanced keepalive function with comprehensive activity
function Invoke-ComprehensiveKeepalive {
    param([string]$Url, [string]$Key, [bool]$Test)
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logFile = "keepalive-15day-log.txt"
    
    if ($Test) {
        Write-Host "[$timestamp] [TEST] Would perform comprehensive keepalive" -ForegroundColor Yellow
        return $true
    }
    
    $successCount = 0
    $totalOperations = 0
    
    try {
        $headers = @{
            "apikey" = $Key
            "Authorization" = "Bearer $Key"
            "Content-Type" = "application/json"
        }
        
        # Comprehensive database operations to ensure project activity
        $operations = @(
            @{ 
                url = "$Url/rest/v1/services?select=id,title,status&limit=10"; 
                name = "Query services table";
                description = "Basic table access test"
            },
            @{ 
                url = "$Url/rest/v1/sessions?select=id,session_id,date&limit=5"; 
                name = "Query sessions table";
                description = "Session data access test"
            },
            @{ 
                url = "$Url/rest/v1/training_registrations?select=id,email&limit=3"; 
                name = "Query registrations table";
                description = "Registration data access test"
            },
            @{ 
                url = "$Url/rest/v1/contact_submissions?select=id,email&limit=2"; 
                name = "Query contact submissions";
                description = "Contact form data access test"
            },
            @{ 
                url = "$Url/rest/v1/pricing_rules?select=id,rule_type&limit=5"; 
                name = "Query pricing rules";
                description = "Pricing rules access test"
            }
        )
        
        Write-Host "[$timestamp] [INFO] Starting comprehensive keepalive operations..." -ForegroundColor Cyan
        
        foreach ($op in $operations) {
            try {
                $response = Invoke-RestMethod -Uri $op.url -Method GET -Headers $headers -TimeoutSec 20
                Write-Host "[$timestamp] [OK] $($op.name) - $($response.Count) records" -ForegroundColor Green
                $successCount++
                $totalOperations++
                
                # Log successful operation
                $logEntry = "[$timestamp] [SUCCESS] $($op.name) - $($op.description)"
                Add-Content -Path $logFile -Value $logEntry
                
            } catch {
                Write-Host "[$timestamp] [WARN] $($op.name) failed: $($_.Exception.Message)" -ForegroundColor Yellow
                $totalOperations++
                
                # Log failed operation
                $logEntry = "[$timestamp] [WARN] $($op.name) failed: $($_.Exception.Message)"
                Add-Content -Path $logFile -Value $logEntry
            }
        }
        
        # Test function calls (if available)
        $functions = @(
            @{ name = "calculate_session_price"; description = "Pricing calculation function" },
            @{ name = "insert_training_registration"; description = "Registration function" }
        )
        
        foreach ($func in $functions) {
            try {
                $funcUrl = "$Url/rest/v1/rpc/$($func.name)"
                $body = @{
                    p_service_id = "00000000-0000-0000-0000-000000000000"
                    p_session_date = "2025-01-01T00:00:00Z"
                    p_quantity = 1
                } | ConvertTo-Json
                
                # This will likely fail with parameter errors, but shows function access
                $response = Invoke-RestMethod -Uri $funcUrl -Method POST -Headers $headers -Body $body -TimeoutSec 15
                Write-Host "[$timestamp] [OK] Function $($func.name) accessible" -ForegroundColor Green
                $successCount++
                
            } catch {
                # Expected to fail with parameter errors, but shows function exists
                if ($_.Exception.Message -like "*parameter*" -or $_.Exception.Message -like "*invalid*") {
                    Write-Host "[$timestamp] [OK] Function $($func.name) exists (parameter error expected)" -ForegroundColor Green
                    $successCount++
                } else {
                    Write-Host "[$timestamp] [WARN] Function $($func.name) issue: $($_.Exception.Message)" -ForegroundColor Yellow
                }
            }
        }
        
        # Final status
        $successRate = [math]::Round(($successCount / $totalOperations) * 100, 2)
        Write-Host "[$timestamp] [SUMMARY] Operations: $successCount/$totalOperations successful ($successRate%)" -ForegroundColor Cyan
        
        if ($successCount -gt 0) {
            Write-Host "[$timestamp] [SUCCESS] Comprehensive keepalive completed - Project is active" -ForegroundColor Green
            
            $logEntry = "[$timestamp] [SUCCESS] Comprehensive keepalive completed - $successCount/$totalOperations operations successful"
            Add-Content -Path $logFile -Value $logEntry
            
            return $true
        } else {
            Write-Host "[$timestamp] [ERROR] All operations failed - Project may have issues" -ForegroundColor Red
            
            $logEntry = "[$timestamp] [ERROR] All operations failed - Project may have issues"
            Add-Content -Path $logFile -Value $logEntry
            
            return $false
        }
        
    } catch {
        Write-Host "[$timestamp] [ERROR] Comprehensive keepalive failed: $($_.Exception.Message)" -ForegroundColor Red
        
        $logEntry = "[$timestamp] [ERROR] Comprehensive keepalive failed: $($_.Exception.Message)"
        Add-Content -Path $logFile -Value $logEntry
        
        return $false
    }
}

# Main execution
if ($RunOnce) {
    Write-Host "`n=== Running Single 15-Day Keepalive ===" -ForegroundColor Yellow
    
    $keepaliveResult = Invoke-ComprehensiveKeepalive -Url $supabaseUrl -Key $supabaseKey -Test $TestMode
    
    if ($keepaliveResult) {
        Write-Host "`n=== Keepalive SUCCESS ===" -ForegroundColor Green
        Write-Host "Project is active and healthy" -ForegroundColor Green
        
        if ($SendEmail -and -not $TestMode) {
            Write-Host "`n=== Sending Success Notification ===" -ForegroundColor Cyan
            & ".\send-keepalive-notification.ps1" -Status "success" -Message "15-day keepalive completed successfully"
        }
    } else {
        Write-Host "`n=== Keepalive FAILURE ===" -ForegroundColor Red
        Write-Host "Project may have issues - check Supabase dashboard" -ForegroundColor Red
        
        if ($SendEmail -and -not $TestMode) {
            Write-Host "`n=== Sending Failure Notification ===" -ForegroundColor Cyan
            & ".\send-keepalive-notification.ps1" -Status "failure" -Message "15-day keepalive failed - manual intervention may be required"
        }
    }
    
} else {
    Write-Host "`n=== Starting 15-Day Keepalive Schedule ===" -ForegroundColor Yellow
    Write-Host "This will run every 15 days (360 hours)" -ForegroundColor Cyan
    Write-Host "Press Ctrl+C to stop" -ForegroundColor Cyan
    
    $runCount = 0
    $intervalHours = 360  # 15 days
    
    while ($true) {
        $runCount++
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        
        Write-Host "`n[$timestamp] === 15-Day Keepalive Run #$runCount ===" -ForegroundColor Cyan
        
        $keepaliveResult = Invoke-ComprehensiveKeepalive -Url $supabaseUrl -Key $supabaseKey -Test $TestMode
        
        if ($keepaliveResult) {
            Write-Host "[$timestamp] [STATUS] Project is active and healthy" -ForegroundColor Green
            
            if ($SendEmail -and -not $TestMode) {
                & ".\send-keepalive-notification.ps1" -Status "success" -Message "15-day keepalive completed successfully"
            }
        } else {
            Write-Host "[$timestamp] [STATUS] Project may have issues" -ForegroundColor Red
            
            if ($SendEmail -and -not $TestMode) {
                & ".\send-keepalive-notification.ps1" -Status "failure" -Message "15-day keepalive failed"
            }
        }
        
        # Next run info
        $nextRun = (Get-Date).AddHours($intervalHours).ToString("yyyy-MM-dd HH:mm:ss")
        Write-Host "[$timestamp] [NEXT] Next keepalive in 15 days: $nextRun" -ForegroundColor Cyan
        
        # Wait for next interval (15 days = 360 hours = 1,296,000 seconds)
        $waitSeconds = $intervalHours * 3600
        Write-Host "[$timestamp] [WAIT] Waiting $intervalHours hours ($waitSeconds seconds)..." -ForegroundColor Yellow
        Start-Sleep -Seconds $waitSeconds
    }
}

Write-Host "`n=== 15-Day Keepalive Complete ===" -ForegroundColor Green
