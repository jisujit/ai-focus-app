# Supabase CLI Setup Script
# Run this once to set up Supabase CLI for this project

Write-Host "Setting up Supabase CLI..." -ForegroundColor Green

# Check if already linked
$configFile = ".supabase/config.toml"
if (Test-Path $configFile) {
    Write-Host "Supabase CLI already configured for this project" -ForegroundColor Yellow
    Write-Host "Current configuration:" -ForegroundColor Cyan
    Get-Content $configFile | Select-String "project_id"
} else {
    Write-Host "Supabase CLI not configured. Please run:" -ForegroundColor Red
    Write-Host "npx supabase link --project-ref YOUR_PROJECT_ID" -ForegroundColor White
}

Write-Host ""
Write-Host "Available commands:" -ForegroundColor Cyan
Write-Host "npx supabase functions list" -ForegroundColor White
Write-Host "npx supabase functions deploy FUNCTION_NAME" -ForegroundColor White
Write-Host "npx supabase functions logs FUNCTION_NAME" -ForegroundColor White
