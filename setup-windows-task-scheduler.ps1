# Setup Windows Task Scheduler for Supabase Keepalive
# This script creates a scheduled task to run keepalive every 15 days

param(
    [string]$TaskName = "Supabase Keepalive 15 Days",
    [string]$ScriptPath = ".\supabase-keepalive-15days.ps1",
    [string]$Environment = "production",
    [switch]$CreateTask = $false,
    [switch]$RemoveTask = $false,
    [switch]$ListTasks = $false
)

Write-Host "=== Windows Task Scheduler Setup for Supabase Keepalive ===" -ForegroundColor Green

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin) {
    Write-Host "[WARNING] This script should be run as Administrator for full functionality" -ForegroundColor Yellow
    Write-Host "Some operations may require elevated privileges" -ForegroundColor Yellow
}

# Get current directory and script path
$currentDir = Get-Location
$fullScriptPath = Join-Path $currentDir $ScriptPath

Write-Host "Current Directory: $currentDir" -ForegroundColor Cyan
Write-Host "Script Path: $fullScriptPath" -ForegroundColor Cyan
Write-Host "Task Name: $TaskName" -ForegroundColor Cyan

if ($ListTasks) {
    Write-Host "`n=== Existing Scheduled Tasks ===" -ForegroundColor Yellow
    
    $existingTasks = Get-ScheduledTask | Where-Object { $_.TaskName -like "*Supabase*" -or $_.TaskName -like "*Keepalive*" }
    
    if ($existingTasks.Count -gt 0) {
        foreach ($task in $existingTasks) {
            Write-Host "Task: $($task.TaskName)" -ForegroundColor White
            Write-Host "  State: $($task.State)" -ForegroundColor Gray
            Write-Host "  Last Run: $($task.LastRunTime)" -ForegroundColor Gray
            Write-Host "  Next Run: $($task.NextRunTime)" -ForegroundColor Gray
            Write-Host ""
        }
    } else {
        Write-Host "No existing Supabase keepalive tasks found" -ForegroundColor Yellow
    }
    
    return
}

if ($RemoveTask) {
    Write-Host "`n=== Removing Scheduled Task ===" -ForegroundColor Yellow
    
    try {
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction Stop
        Write-Host "[OK] Task '$TaskName' removed successfully" -ForegroundColor Green
    } catch {
        Write-Host "[ERROR] Failed to remove task: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    return
}

if ($CreateTask) {
    Write-Host "`n=== Creating Scheduled Task ===" -ForegroundColor Yellow
    
    # Verify script exists
    if (-not (Test-Path $fullScriptPath)) {
        Write-Host "[ERROR] Script not found: $fullScriptPath" -ForegroundColor Red
        Write-Host "Please ensure the keepalive script exists" -ForegroundColor Yellow
        exit 1
    }
    
    try {
        # Create action (what to run)
        $action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-ExecutionPolicy Bypass -File `"$fullScriptPath`" -Environment $Environment -RunOnce"
        
        # Create trigger (when to run - every 15 days)
        $trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Days 15) -RepetitionDuration (New-TimeSpan -Days 3650)  # 10 years
        
        # Create settings
        $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RunOnlyIfNetworkAvailable -WakeToRun
        
        # Create principal (run as current user)
        $principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType InteractiveToken -RunLevel Highest
        
        # Register the task
        Register-ScheduledTask -Action $action -Trigger $trigger -Settings $settings -Principal $principal -TaskName $TaskName -Description "Supabase project keepalive - runs every 15 days to prevent project deactivation"
        
        Write-Host "[OK] Scheduled task '$TaskName' created successfully" -ForegroundColor Green
        Write-Host "  Runs every 15 days" -ForegroundColor Cyan
        Write-Host "  Script: $fullScriptPath" -ForegroundColor Cyan
        Write-Host "  Environment: $Environment" -ForegroundColor Cyan
        
        # Show task details
        $task = Get-ScheduledTask -TaskName $TaskName
        Write-Host "`nTask Details:" -ForegroundColor Yellow
        Write-Host "  State: $($task.State)" -ForegroundColor White
        Write-Host "  Next Run: $($task.NextRunTime)" -ForegroundColor White
        
    } catch {
        Write-Host "[ERROR] Failed to create scheduled task: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Try running as Administrator" -ForegroundColor Yellow
    }
    
    return
}

# Default: Show help and options
Write-Host "`n=== Task Scheduler Options ===" -ForegroundColor Yellow
Write-Host ""
Write-Host "Available commands:" -ForegroundColor White
Write-Host "  -CreateTask    : Create the scheduled task" -ForegroundColor Cyan
Write-Host "  -RemoveTask    : Remove the scheduled task" -ForegroundColor Cyan
Write-Host "  -ListTasks     : List existing tasks" -ForegroundColor Cyan
Write-Host ""
Write-Host "Examples:" -ForegroundColor White
Write-Host "  .\setup-windows-task-scheduler.ps1 -CreateTask" -ForegroundColor Green
Write-Host "  .\setup-windows-task-scheduler.ps1 -ListTasks" -ForegroundColor Green
Write-Host "  .\setup-windows-task-scheduler.ps1 -RemoveTask" -ForegroundColor Green
Write-Host ""
Write-Host "Parameters:" -ForegroundColor White
Write-Host "  -TaskName      : Name of the scheduled task (default: 'Supabase Keepalive 15 Days')" -ForegroundColor Gray
Write-Host "  -ScriptPath    : Path to the keepalive script (default: '.\supabase-keepalive-15days.ps1')" -ForegroundColor Gray
Write-Host "  -Environment   : Environment to use (default: 'production')" -ForegroundColor Gray
Write-Host ""
Write-Host "IMPORTANT NOTES:" -ForegroundColor Red
Write-Host "1. Run as Administrator for full functionality" -ForegroundColor Yellow
Write-Host "2. The task will run every 15 days automatically" -ForegroundColor Yellow
Write-Host "3. Check Task Scheduler in Windows to verify the task" -ForegroundColor Yellow
Write-Host "4. The task will send email notifications if configured" -ForegroundColor Yellow
