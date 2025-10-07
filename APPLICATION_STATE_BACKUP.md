# Application State Backup & Version Management

## Current Stable State: v1.0.0
**Date**: 2025-01-22  
**Status**: Production Ready ✅  
**UUID/TEXT Issue**: RESOLVED ✅

## What to Backup

### 1. Code Repository
- ✅ Git commit with all current changes
- ✅ Tagged version (v1.0.0)
- ✅ All source files and configurations

### 2. Database Schema
- ✅ All migration files in `supabase/migrations/`
- ✅ Current database structure
- ✅ Functions, triggers, policies

### 3. Database Data
- ✅ Production data backup
- ✅ Test data (if needed)

### 4. Edge Functions
- ✅ All deployed function versions
- ✅ Function environment variables

### 5. Configuration
- ✅ Environment variables
- ✅ Docker configurations
- ✅ Deployment settings

### 6. Container Images
- ✅ Docker image versions
- ✅ Container registry tags
- ✅ Runtime configurations

## Backup Commands

### Code Backup
```bash
# Tag current stable state
git add .
git commit -m "Stable state v1.0.0 - UUID/TEXT issue resolved"
git tag v1.0.0-stable
git push origin main --tags
```

### Database Backup
```bash
# Backup schema (migrations already in git)
# Backup production data
npx supabase db dump --data-only --file=backup_v1.0.0_data.sql

# Full database backup
npx supabase db dump --file=backup_v1.0.0_full.sql
```

### Edge Functions Backup
```bash
# List all function versions
npx supabase functions list

# Download function code (already in git)
# Note: Environment variables need manual backup
```

### Configuration Backup
```bash
# Backup environment files (remove secrets)
cp .env.production .env.production.backup.v1.0.0
cp .env.development .env.development.backup.v1.0.0
```

### Container Backup
```bash
# Tag current container with version
docker tag ghcr.io/jisujit/ai-focus:latest ghcr.io/jisujit/ai-focus:v1.0.0

# Push versioned container
docker push ghcr.io/jisujit/ai-focus:v1.0.0

# Keep latest tag for current deployment
docker push ghcr.io/jisujit/ai-focus:latest
```

## Restoration Process

### Restore Code
```bash
git checkout v1.0.0-stable
npm install
```

### Restore Database
```bash
# Apply migrations
npx supabase db push

# Restore data (if needed)
npx supabase db reset
psql -f backup_v1.0.0_data.sql
```

### Restore Edge Functions
```bash
npx supabase functions deploy confirm-payment
npx supabase functions deploy create-payment-intent
# ... deploy all functions
```

### Restore Configuration
```bash
cp .env.production.backup.v1.0.0 .env.production
```

## Version Naming Convention

### Semantic Versioning
- **v1.0.0** - Major.Minor.Patch
- **v1.0.0-stable** - Stable release
- **v1.0.0-hotfix** - Emergency fix

### Backup Naming
- **backup_v1.0.0_full.sql** - Complete database
- **backup_v1.0.0_data.sql** - Data only
- **.env.production.backup.v1.0.0** - Environment config

## Automated Backup Scripts

See `backup-stable-state.ps1` for automated backup process.

## Current State Checklist

### Code ✅
- [x] All files committed to git
- [x] UUID/TEXT issue resolved
- [x] Payment flow working
- [x] No linting errors

### Database ✅
- [x] Schema migrations applied
- [x] Triggers working correctly
- [x] Functions updated
- [x] Data integrity maintained

### Edge Functions ✅
- [x] confirm-payment deployed (v11)
- [x] All functions working
- [x] Environment variables set

### Configuration ✅
- [x] Production environment configured
- [x] Stripe keys configured
- [x] Supabase linked

## Next Steps

1. **Create backup now** using provided scripts
2. **Test restoration** in dev environment
3. **Document any issues** found during restoration
4. **Schedule regular backups** (weekly/monthly)

## Emergency Rollback

If you need to rollback to this stable state:

```bash
# 1. Stop current deployment
# 2. Restore code
git checkout v1.0.0-stable
# 3. Restore database
npx supabase db reset
# 4. Restore functions
npx supabase functions deploy --all
# 5. Restart deployment
```

## Monitoring

- **Backup verification**: Test restoration monthly
- **Version tracking**: Keep detailed changelog
- **Health checks**: Monitor after each deployment
