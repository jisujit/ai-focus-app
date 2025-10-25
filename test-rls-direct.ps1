# Direct RLS Test Script
# This will test RLS by attempting operations that should fail if RLS is properly enabled

param(
    [string]$Environment = "development"
)

Write-Host "=== Direct RLS Test ===" -ForegroundColor Green

# Load environment variables
if (Test-Path ".env") {
    $envContent = Get-Content ".env"
    $supabaseUrl = ($envContent | Select-String "VITE_SUPABASE_URL").Line.Split("=")[1].Trim('"')
    $supabaseKey = ($envContent | Select-String "VITE_SUPABASE_PUBLISHABLE_KEY").Line.Split("=")[1].Trim('"')
    
    Write-Host "Environment: $Environment" -ForegroundColor Cyan
    Write-Host "Supabase URL: $supabaseUrl" -ForegroundColor Cyan
    
    $headers = @{
        "apikey" = $supabaseKey
        "Authorization" = "Bearer $supabaseKey"
        "Content-Type" = "application/json"
    }
    
    # Test 1: Try to access the table without proper authentication
    Write-Host "`n=== Test 1: Anonymous Access Test ===" -ForegroundColor Yellow
    try {
        $anonHeaders = @{
            "apikey" = $supabaseKey
            "Content-Type" = "application/json"
        }
        
        $queryUrl = "$supabaseUrl/rest/v1/session_cancellations?select=id&limit=1"
        $response = Invoke-RestMethod -Uri $queryUrl -Method GET -Headers $anonHeaders -TimeoutSec 30
        
        Write-Host "[WARNING] Anonymous access succeeded - RLS might be disabled" -ForegroundColor Red
        Write-Host "Response: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor White
        
    } catch {
        Write-Host "[GOOD] Anonymous access failed: $($_.Exception.Message)" -ForegroundColor Green
        if ($_.Exception.Message -like "*permission*" -or $_.Exception.Message -like "*policy*") {
            Write-Host "This indicates RLS is working correctly" -ForegroundColor Green
        }
    }
    
    # Test 2: Try to insert with anonymous access
    Write-Host "`n=== Test 2: Anonymous Insert Test ===" -ForegroundColor Yellow
    try {
        $insertData = @{
            session_id = "test-rls-check-$(Get-Date -Format 'yyyyMMddHHmmss')"
            cancellation_reason = "RLS test"
            cancellation_message = "Testing RLS with anonymous access"
        } | ConvertTo-Json
        
        $insertUrl = "$supabaseUrl/rest/v1/session_cancellations"
        $insertResponse = Invoke-RestMethod -Uri $insertUrl -Method POST -Headers $anonHeaders -Body $insertData -TimeoutSec 30
        
        Write-Host "[CRITICAL] Anonymous insert succeeded - RLS is definitely disabled!" -ForegroundColor Red
        Write-Host "Response: $($insertResponse | ConvertTo-Json -Depth 2)" -ForegroundColor White
        
    } catch {
        Write-Host "[GOOD] Anonymous insert failed: $($_.Exception.Message)" -ForegroundColor Green
        if ($_.Exception.Message -like "*permission*" -or $_.Exception.Message -like "*policy*") {
            Write-Host "This indicates RLS is working correctly" -ForegroundColor Green
        }
    }
    
    Write-Host "`n=== RLS Status Summary ===" -ForegroundColor Green
    Write-Host "If anonymous access succeeded:" -ForegroundColor White
    Write-Host "- RLS is DISABLED (security issue)" -ForegroundColor Red
    Write-Host "- You need to manually enable RLS in Supabase dashboard" -ForegroundColor Yellow
    Write-Host "`nIf anonymous access failed with permission errors:" -ForegroundColor White
    Write-Host "- RLS is ENABLED and working correctly" -ForegroundColor Green
    Write-Host "- Dashboard might have a display issue" -ForegroundColor Yellow
    
} else {
    Write-Host "[ERROR] .env file not found" -ForegroundColor Red
}

Write-Host "`n=== Manual RLS Enable Instructions ===" -ForegroundColor Green
Write-Host "If RLS is actually disabled, you can enable it manually:" -ForegroundColor White
Write-Host "1. Go to: https://supabase.com/dashboard/project/vcxfwxrnrskvsgqxqrsz" -ForegroundColor White
Write-Host "2. Navigate to: Database → Tables → session_cancellations" -ForegroundColor White
Write-Host "3. Click on the 'Row Level Security' toggle" -ForegroundColor White
Write-Host "4. Enable RLS and create policies" -ForegroundColor White
