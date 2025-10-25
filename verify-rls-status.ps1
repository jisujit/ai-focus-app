# Verify RLS Status Script
# This script checks if RLS is actually enabled on the session_cancellations table

param(
    [string]$Environment = "development"
)

Write-Host "=== RLS Status Verification ===" -ForegroundColor Green

# Load environment variables
if (Test-Path ".env") {
    $envContent = Get-Content ".env"
    $supabaseUrl = ($envContent | Select-String "VITE_SUPABASE_URL").Line.Split("=")[1].Trim('"')
    $supabaseKey = ($envContent | Select-String "VITE_SUPABASE_PUBLISHABLE_KEY").Line.Split("=")[1].Trim('"')
    
    Write-Host "Environment: $Environment" -ForegroundColor Cyan
    Write-Host "Supabase URL: $supabaseUrl" -ForegroundColor Cyan
    
    # Test RLS by trying to access session_cancellations table
    try {
        Write-Host "`n=== Testing RLS Status ===" -ForegroundColor Yellow
        
        # Try to query session_cancellations table
        $headers = @{
            "apikey" = $supabaseKey
            "Authorization" = "Bearer $supabaseKey"
            "Content-Type" = "application/json"
        }
        
        $queryUrl = "$supabaseUrl/rest/v1/session_cancellations?select=id&limit=1"
        
        Write-Host "Testing query: $queryUrl" -ForegroundColor White
        
        $response = Invoke-RestMethod -Uri $queryUrl -Method GET -Headers $headers -TimeoutSec 30
        
        Write-Host "[SUCCESS] Query executed successfully" -ForegroundColor Green
        Write-Host "Response: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor White
        
        # If we get here, RLS is working (either enabled with policies or disabled)
        Write-Host "`n=== RLS Status Check ===" -ForegroundColor Yellow
        Write-Host "The query succeeded, which means:" -ForegroundColor White
        Write-Host "1. Either RLS is enabled with proper policies" -ForegroundColor Green
        Write-Host "2. Or RLS is disabled (which would be a security issue)" -ForegroundColor Red
        Write-Host "`nPlease check the Supabase dashboard to confirm RLS status" -ForegroundColor Yellow
        
    } catch {
        Write-Host "[ERROR] Query failed: $($_.Exception.Message)" -ForegroundColor Red
        
        if ($_.Exception.Message -like "*404*") {
            Write-Host "This might indicate RLS is enabled but no policies allow access" -ForegroundColor Yellow
        } elseif ($_.Exception.Message -like "*permission*") {
            Write-Host "This indicates RLS is enabled and working correctly" -ForegroundColor Green
        }
    }
    
} else {
    Write-Host "[ERROR] .env file not found" -ForegroundColor Red
    Write-Host "Please run ./switch-to-dev.ps1 or ./switch-to-prod.ps1 first" -ForegroundColor Yellow
}

Write-Host "`n=== Next Steps ===" -ForegroundColor Green
Write-Host "1. Check Supabase dashboard after clearing browser cache" -ForegroundColor White
Write-Host "2. Look for 'Row Level Security' toggle on session_cancellations table" -ForegroundColor White
Write-Host "3. Verify policies are created and enabled" -ForegroundColor White
