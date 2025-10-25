# Setup GitHub Actions Keepalive
# This script helps you set up the GitHub Actions-based keepalive system

param(
    [switch]$CheckGit = $false,
    [switch]$CreateWorkflow = $false,
    [switch]$ShowInstructions = $false
)

Write-Host "=== GitHub Actions Keepalive Setup ===" -ForegroundColor Green

if ($CheckGit) {
    Write-Host "`n=== Checking Git Repository Status ===" -ForegroundColor Yellow
    
    try {
        $gitStatus = git status --porcelain
        $gitRemote = git remote -v
        
        Write-Host "[OK] Git repository detected" -ForegroundColor Green
        Write-Host "Remote: $gitRemote" -ForegroundColor Cyan
        
        if ($gitStatus) {
            Write-Host "[WARN] Uncommitted changes detected:" -ForegroundColor Yellow
            Write-Host $gitStatus -ForegroundColor White
        } else {
            Write-Host "[OK] Working directory clean" -ForegroundColor Green
        }
        
    } catch {
        Write-Host "[ERROR] Not a git repository or git not available" -ForegroundColor Red
        Write-Host "Please initialize git repository first:" -ForegroundColor Yellow
        Write-Host "  git init" -ForegroundColor White
        Write-Host "  git remote add origin <your-github-repo-url>" -ForegroundColor White
    }
}

if ($CreateWorkflow) {
    Write-Host "`n=== Creating GitHub Actions Workflow ===" -ForegroundColor Yellow
    
    # Check if .github/workflows directory exists
    if (-not (Test-Path ".github/workflows")) {
        New-Item -ItemType Directory -Path ".github/workflows" -Force
        Write-Host "[OK] Created .github/workflows directory" -ForegroundColor Green
    }
    
    # Check if workflow file exists
    $workflowFile = ".github/workflows/supabase-keepalive.yml"
    if (Test-Path $workflowFile) {
        Write-Host "[OK] Workflow file already exists: $workflowFile" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Workflow file not found: $workflowFile" -ForegroundColor Red
        Write-Host "Please ensure the workflow file is created first" -ForegroundColor Yellow
    }
}

if ($ShowInstructions) {
    Write-Host "`n=== GitHub Actions Setup Instructions ===" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. ENABLE GITHUB ACTIONS:" -ForegroundColor White
    Write-Host "   - Go to your GitHub repository" -ForegroundColor Cyan
    Write-Host "   - Click 'Actions' tab" -ForegroundColor Cyan
    Write-Host "   - Click 'I understand my workflows, go ahead and enable them'" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2. ADD SECRETS TO GITHUB:" -ForegroundColor White
    Write-Host "   - Go to Settings → Secrets and variables → Actions" -ForegroundColor Cyan
    Write-Host "   - Click 'New repository secret'" -ForegroundColor Cyan
    Write-Host "   - Add these secrets:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   SUPABASE_URL = https://fvazftacytreklsmmbcr.supabase.co" -ForegroundColor Green
    Write-Host "   SUPABASE_ANON_KEY = [your-anon-key]" -ForegroundColor Green
    Write-Host "   NOTIFICATION_EMAIL = gsujit@gmail.com" -ForegroundColor Green
    Write-Host "   RESEND_API_KEY = [your-resend-api-key]" -ForegroundColor Green
    Write-Host ""
    Write-Host "3. COMMIT AND PUSH:" -ForegroundColor White
    Write-Host "   git add .github/workflows/supabase-keepalive.yml" -ForegroundColor Cyan
    Write-Host "   git commit -m 'Add Supabase keepalive GitHub Action'" -ForegroundColor Cyan
    Write-Host "   git push origin main" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "4. TEST THE WORKFLOW:" -ForegroundColor White
    Write-Host "   - Go to Actions tab in GitHub" -ForegroundColor Cyan
    Write-Host "   - Click 'Supabase Keepalive' workflow" -ForegroundColor Cyan
    Write-Host "   - Click 'Run workflow' → 'Run workflow'" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "5. MONITOR:" -ForegroundColor White
    Write-Host "   - Check Actions dashboard for runs" -ForegroundColor Cyan
    Write-Host "   - View logs for success/failure" -ForegroundColor Cyan
    Write-Host "   - Verify Supabase dashboard shows activity" -ForegroundColor Cyan
}

# Default: Show all options
if (-not $CheckGit -and -not $CreateWorkflow -and -not $ShowInstructions) {
    Write-Host "`n=== Available Commands ===" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Check Git Status:" -ForegroundColor White
    Write-Host "  .\setup-github-keepalive.ps1 -CheckGit" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Create Workflow:" -ForegroundColor White
    Write-Host "  .\setup-github-keepalive.ps1 -CreateWorkflow" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Show Instructions:" -ForegroundColor White
    Write-Host "  .\setup-github-keepalive.ps1 -ShowInstructions" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Complete Setup:" -ForegroundColor White
    Write-Host "  .\setup-github-keepalive.ps1 -CheckGit -CreateWorkflow -ShowInstructions" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "=== Why GitHub Actions is Better ===" -ForegroundColor Green
    Write-Host "✅ Survives system re-imaging" -ForegroundColor Green
    Write-Host "✅ Runs on GitHub's servers (not your machine)" -ForegroundColor Green
    Write-Host "✅ Free and reliable" -ForegroundColor Green
    Write-Host "✅ Easy monitoring via GitHub interface" -ForegroundColor Green
    Write-Host "✅ Automatic setup (no local configuration)" -ForegroundColor Green
}

Write-Host "`n=== Setup Complete ===" -ForegroundColor Green
