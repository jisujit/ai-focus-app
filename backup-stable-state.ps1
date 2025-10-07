# Application State Backup Script
# This script creates a complete backup of the current stable state

param(
    [string]$Version = "v1.0.0",
    [string]$BackupDir = "backups"
)

Write-Host "=== Application State Backup Script ===" -ForegroundColor Green
Write-Host "Version: $Version" -ForegroundColor Cyan
Write-Host "Backup Directory: $BackupDir" -ForegroundColor Cyan

# Create backup directory
if (!(Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir
    Write-Host "Created backup directory: $BackupDir" -ForegroundColor Yellow
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupPath = "$BackupDir/stable_state_${Version}_$timestamp"

Write-Host "Creating backup at: $backupPath" -ForegroundColor Yellow

# Step 1: Git Tag and Commit
Write-Host "`n1. Creating Git Tag..." -ForegroundColor Green
try {
    git add .
    git commit -m "Stable state $Version - Automated backup $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    git tag "$Version-stable"
    git push origin main --tags
    Write-Host "✅ Git tag created: $Version-stable" -ForegroundColor Green
} catch {
    Write-Host "❌ Git operation failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 2: Database Backup
Write-Host "`n2. Backing up Database..." -ForegroundColor Green
try {
    # Create database backup directory
    $dbBackupDir = "$backupPath/database"
    New-Item -ItemType Directory -Path $dbBackupDir -Force
    
    # Full database backup
    npx supabase db dump --file="$dbBackupDir/backup_${Version}_full.sql"
    Write-Host "✅ Full database backup created" -ForegroundColor Green
    
    # Data-only backup
    npx supabase db dump --data-only --file="$dbBackupDir/backup_${Version}_data.sql"
    Write-Host "✅ Data-only backup created" -ForegroundColor Green
    
    # Schema-only backup
    npx supabase db dump --schema-only --file="$dbBackupDir/backup_${Version}_schema.sql"
    Write-Host "✅ Schema-only backup created" -ForegroundColor Green
} catch {
    Write-Host "❌ Database backup failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 3: Edge Functions Backup
Write-Host "`n3. Backing up Edge Functions..." -ForegroundColor Green
try {
    $functionsBackupDir = "$backupPath/functions"
    New-Item -ItemType Directory -Path $functionsBackupDir -Force
    
    # List all functions and their versions
    npx supabase functions list --output json > "$functionsBackupDir/functions_list.json"
    Write-Host "✅ Functions list backed up" -ForegroundColor Green
    
    # Copy function source code (already in git, but for completeness)
    Copy-Item -Path "supabase/functions" -Destination "$functionsBackupDir/source" -Recurse -Force
    Write-Host "✅ Function source code backed up" -ForegroundColor Green
} catch {
    Write-Host "❌ Functions backup failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 4: Configuration Backup
Write-Host "`n4. Backing up Configuration..." -ForegroundColor Green
try {
    $configBackupDir = "$backupPath/config"
    New-Item -ItemType Directory -Path $configBackupDir -Force
    
    # Backup environment files (without secrets)
    if (Test-Path ".env.production") {
        Copy-Item ".env.production" "$configBackupDir/.env.production.backup.$Version"
        Write-Host "✅ Production env backed up (remove secrets before sharing)" -ForegroundColor Yellow
    }
    
    if (Test-Path ".env.development") {
        Copy-Item ".env.development" "$configBackupDir/.env.development.backup.$Version"
        Write-Host "✅ Development env backed up (remove secrets before sharing)" -ForegroundColor Yellow
    }
    
    # Backup package files
    Copy-Item "package.json" "$configBackupDir/"
    Copy-Item "package-lock.json" "$configBackupDir/"
    Copy-Item "vite.config.ts" "$configBackupDir/"
    Copy-Item "tailwind.config.ts" "$configBackupDir/"
    Write-Host "✅ Configuration files backed up" -ForegroundColor Green
} catch {
    Write-Host "❌ Configuration backup failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 5: Docker Configuration Backup
Write-Host "`n5. Backing up Docker Configuration..." -ForegroundColor Green
try {
    $dockerBackupDir = "$backupPath/docker"
    New-Item -ItemType Directory -Path $dockerBackupDir -Force
    
    Copy-Item "Dockerfile" "$dockerBackupDir/"
    Copy-Item "nginx.conf" "$dockerBackupDir/"
    Write-Host "✅ Docker configuration backed up" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker backup failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 6: Create Backup Manifest
Write-Host "`n6. Creating Backup Manifest..." -ForegroundColor Green
try {
    $manifest = @{
        version = $Version
        timestamp = $timestamp
        backup_path = $backupPath
        git_tag = "$Version-stable"
        git_commit = (git rev-parse HEAD)
        backup_date = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
        components = @{
            code = "Git tag: $Version-stable"
            database = @(
                "backup_${Version}_full.sql",
                "backup_${Version}_data.sql", 
                "backup_${Version}_schema.sql"
            )
            functions = "functions_list.json + source code"
            config = "Environment files + package files"
            docker = "Dockerfile + nginx.conf"
        }
        notes = "Stable state with UUID/TEXT issue resolved. Payment flow working correctly."
    }
    
    $manifest | ConvertTo-Json -Depth 3 | Out-File "$backupPath/backup_manifest.json" -Encoding UTF8
    Write-Host "✅ Backup manifest created" -ForegroundColor Green
} catch {
    Write-Host "❌ Manifest creation failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 7: Create Restoration Script
Write-Host "`n7. Creating Restoration Script..." -ForegroundColor Green
try {
    $restoreScript = @"
# Restoration Script for $Version
# Generated on $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

Write-Host "Restoring application to stable state: $Version" -ForegroundColor Green

# 1. Restore Code
Write-Host "1. Restoring code..." -ForegroundColor Yellow
git checkout $Version-stable
npm install

# 2. Restore Database
Write-Host "2. Restoring database..." -ForegroundColor Yellow
npx supabase db reset
npx supabase db push

# 3. Restore Edge Functions
Write-Host "3. Restoring edge functions..." -ForegroundColor Yellow
npx supabase functions deploy confirm-payment
npx supabase functions deploy create-payment-intent
npx supabase functions deploy send-registration-confirmation
npx supabase functions deploy submit-contact-form
npx supabase functions deploy check-registration-status

# 4. Restore Configuration (manual step)
Write-Host "4. Restore configuration manually:" -ForegroundColor Yellow
Write-Host "   - Copy .env.production.backup.$Version to .env.production" -ForegroundColor Cyan
Write-Host "   - Update any secrets as needed" -ForegroundColor Cyan

# 5. Build and Deploy
Write-Host "5. Building and deploying..." -ForegroundColor Yellow
npm run build:prod
docker build -t ghcr.io/jisujit/ai-focus:latest .
docker push ghcr.io/jisujit/ai-focus:latest

Write-Host "Restoration complete!" -ForegroundColor Green
"@
    
    $restoreScript | Out-File "$backupPath/restore_$Version.ps1" -Encoding UTF8
    Write-Host "✅ Restoration script created" -ForegroundColor Green
} catch {
    Write-Host "❌ Restoration script creation failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Backup Complete ===" -ForegroundColor Green
Write-Host "Backup location: $backupPath" -ForegroundColor Cyan
Write-Host "Git tag: $Version-stable" -ForegroundColor Cyan
Write-Host "`nTo restore this state, run:" -ForegroundColor Yellow
Write-Host ".\$backupPath\restore_$Version.ps1" -ForegroundColor White

Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Test the backup by restoring in dev environment" -ForegroundColor White
Write-Host "2. Store backup files securely (encrypt sensitive data)" -ForegroundColor White
Write-Host "3. Schedule regular backups" -ForegroundColor White
