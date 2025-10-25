# Force RLS Check Script
# This script will attempt to verify RLS status by testing different scenarios

param(
    [string]$Environment = "development"
)

Write-Host "=== Force RLS Status Check ===" -ForegroundColor Green

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
    
    # Test 1: Try to insert a record (this should fail if RLS is enabled without proper policies)
    Write-Host "`n=== Test 1: Insert Test ===" -ForegroundColor Yellow
    try {
        $insertData = @{
            session_id = "test-session-123"
            cancellation_reason = "RLS test"
            cancellation_message = "Testing RLS status"
        } | ConvertTo-Json
        
        $insertUrl = "$supabaseUrl/rest/v1/session_cancellations"
        $insertResponse = Invoke-RestMethod -Uri $insertUrl -Method POST -Headers $headers -Body $insertData -TimeoutSec 30
        
        Write-Host "[SUCCESS] Insert succeeded - RLS might be disabled or has permissive policies" -ForegroundColor Yellow
        Write-Host "Response: $($insertResponse | ConvertTo-Json -Depth 2)" -ForegroundColor White
        
    } catch {
        Write-Host "[INFO] Insert failed: $($_.Exception.Message)" -ForegroundColor Cyan
        if ($_.Exception.Message -like "*permission*" -or $_.Exception.Message -like "*policy*") {
            Write-Host "This suggests RLS is enabled and working correctly" -ForegroundColor Green
        }
    }
    
    # Test 2: Try to update a record
    Write-Host "`n=== Test 2: Update Test ===" -ForegroundColor Yellow
    try {
        $updateData = @{
            cancellation_reason = "RLS update test"
        } | ConvertTo-Json
        
        $updateUrl = "$supabaseUrl/rest/v1/session_cancellations?id=eq.test-session-123"
        $updateResponse = Invoke-RestMethod -Uri $updateUrl -Method PATCH -Headers $headers -Body $updateData -TimeoutSec 30
        
        Write-Host "[SUCCESS] Update succeeded" -ForegroundColor Yellow
        
    } catch {
        Write-Host "[INFO] Update failed: $($_.Exception.Message)" -ForegroundColor Cyan
    }
    
    # Test 3: Try to delete a record
    Write-Host "`n=== Test 3: Delete Test ===" -ForegroundColor Yellow
    try {
        $deleteUrl = "$supabaseUrl/rest/v1/session_cancellations?id=eq.test-session-123"
        $deleteResponse = Invoke-RestMethod -Uri $deleteUrl -Method DELETE -Headers $headers -TimeoutSec 30
        
        Write-Host "[SUCCESS] Delete succeeded" -ForegroundColor Yellow
        
    } catch {
        Write-Host "[INFO] Delete failed: $($_.Exception.Message)" -ForegroundColor Cyan
    }
    
    Write-Host "`n=== RLS Status Analysis ===" -ForegroundColor Green
    Write-Host "If all operations succeeded without permission errors:" -ForegroundColor White
    Write-Host "- RLS might be disabled (security issue)" -ForegroundColor Red
    Write-Host "- Or RLS is enabled with very permissive policies" -ForegroundColor Yellow
    Write-Host "`nIf operations failed with permission errors:" -ForegroundColor White
    Write-Host "- RLS is enabled and working correctly" -ForegroundColor Green
    
} else {
    Write-Host "[ERROR] .env file not found" -ForegroundColor Red
}

Write-Host "`n=== Dashboard Check Instructions ===" -ForegroundColor Green
Write-Host "1. Close ALL browser windows completely" -ForegroundColor White
Write-Host "2. Clear browser cache and cookies for Supabase" -ForegroundColor White
Write-Host "3. Open new browser window in incognito/private mode" -ForegroundColor White
Write-Host "4. Go to: https://supabase.com/dashboard/project/vcxfwxrnrskvsgqxqrsz" -ForegroundColor White
Write-Host "5. Navigate to: Database → Tables → session_cancellations" -ForegroundColor White
Write-Host "6. Look for 'Row Level Security' toggle" -ForegroundColor White
