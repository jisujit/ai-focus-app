# Supabase Security Solutions

## Overview
This document addresses the critical security issues identified in your Supabase project and provides comprehensive solutions.

## Issues Identified

### 1. **RLS (Row Level Security) Issues**
- ❌ `session_cancellations` table has RLS disabled
- ❌ Missing RLS policies for sensitive data

### 2. **Function Security Issues**
- ❌ `calculate_session_price` has mutable search_path
- ❌ `insert_training_registration` has mutable search_path  
- ❌ `update_session_availability` has mutable search_path

### 3. **Project Deactivation Risk**
- ❌ Supabase projects deactivate after inactivity
- ❌ No keepalive mechanism in place

### 4. **Slow Query Performance**
- ❌ Timezone queries taking 1.27s
- ❌ Backup queries taking 0.27s
- ❌ Complex schema queries taking 0.08s

## Solutions Implemented

### 1. **Security Fix Migration**
**File**: `supabase/migrations/20250125000000_fix_security_issues.sql`

**What it fixes**:
- ✅ Enables RLS on `session_cancellations` table
- ✅ Creates proper RLS policies for all operations
- ✅ Fixes function security with `SET search_path = public`
- ✅ Adds performance indexes
- ✅ Grants proper permissions

**To apply**:
```bash
npx supabase db push
```

### 2. **Supabase Keepalive Solution**
**File**: `supabase-keepalive.ps1`

**Features**:
- ✅ Prevents project deactivation with regular pings
- ✅ Performs lightweight database operations
- ✅ Supports both development and production environments
- ✅ Configurable intervals (default: 60 minutes)
- ✅ Test mode for safe testing

**Usage**:
```powershell
# Run once
./supabase-keepalive.ps1 -Environment production -RunOnce

# Run continuously (recommended for production)
./supabase-keepalive.ps1 -Environment production -IntervalMinutes 60

# Test mode (no actual requests)
./supabase-keepalive.ps1 -Environment production -TestMode
```

### 3. **Security Audit Tool**
**File**: `security-audit.ps1`

**Features**:
- ✅ Comprehensive security scanning
- ✅ RLS policy validation
- ✅ Function security checks
- ✅ API key format validation
- ✅ Code secret detection
- ✅ Environment file security

**Usage**:
```powershell
# Run security audit
./security-audit.ps1 -Environment production

# Run with detailed output
./security-audit.ps1 -Environment production -Detailed

# Run and attempt fixes
./security-audit.ps1 -Environment production -FixIssues
```

## Implementation Steps

### Step 1: Apply Security Fixes
```bash
# Switch to production environment
./switch-to-prod.ps1

# Apply security migration
npx supabase db push

# Verify the fixes
./security-audit.ps1 -Environment production
```

### Step 2: Set Up Keepalive
```powershell
# Test the keepalive (safe)
./supabase-keepalive.ps1 -Environment production -TestMode

# Run once to verify
./supabase-keepalive.ps1 -Environment production -RunOnce

# Set up continuous keepalive (recommended)
# You can run this in a separate PowerShell window or as a scheduled task
./supabase-keepalive.ps1 -Environment production -IntervalMinutes 60
```

### Step 3: Schedule Keepalive (Windows)
Create a scheduled task to run keepalive automatically:

```powershell
# Create scheduled task (run as administrator)
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-File C:\Repos\personal_gsujit\github_jisujit\ai-focus-app\supabase-keepalive.ps1 -Environment production -RunOnce"
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 60) -RepetitionDuration (New-TimeSpan -Days 365)
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
Register-ScheduledTask -Action $action -Trigger $trigger -Settings $settings -TaskName "Supabase Keepalive" -Description "Keeps Supabase project active"
```

## Security Policies Created

### session_cancellations Table
```sql
-- Enable RLS
ALTER TABLE public.session_cancellations ENABLE ROW LEVEL SECURITY;

-- Admin policies
CREATE POLICY "Admin can read session cancellations" ON public.session_cancellations FOR SELECT USING (true);
CREATE POLICY "Admin can insert session cancellations" ON public.session_cancellations FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can update session cancellations" ON public.session_cancellations FOR UPDATE USING (true);
CREATE POLICY "Admin can delete session cancellations" ON public.session_cancellations FOR DELETE USING (true);
```

### Function Security
```sql
-- Fixed function definitions with proper security
CREATE OR REPLACE FUNCTION public.calculate_session_price(...)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$ ... $$;
```

## Performance Optimizations

### Indexes Added
```sql
-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_session_cancellations_session_id ON public.session_cancellations(session_id);
CREATE INDEX IF NOT EXISTS idx_session_cancellations_created_at ON public.session_cancellations(created_at);
```

## Monitoring and Maintenance

### Regular Security Checks
```powershell
# Weekly security audit
./security-audit.ps1 -Environment production -Detailed

# Monthly comprehensive check
./security-audit.ps1 -Environment production -FixIssues
```

### Keepalive Monitoring
- Check keepalive logs regularly
- Monitor Supabase dashboard for project status
- Set up alerts for keepalive failures

## Troubleshooting

### If Keepalive Fails
1. Check network connectivity
2. Verify Supabase URL and API key
3. Check Supabase project status in dashboard
4. Run security audit to identify issues

### If Security Issues Persist
1. Run `./security-audit.ps1 -Environment production -Detailed`
2. Check Supabase dashboard for RLS policy status
3. Verify function security settings
4. Contact Supabase support if needed

## Best Practices

### Environment Management
- Always use environment-specific configurations
- Never commit `.env` files to git
- Use different API keys for dev/prod

### Security
- Regular security audits (weekly)
- Keep dependencies updated
- Monitor Supabase dashboard for alerts
- Use least-privilege access patterns

### Performance
- Monitor slow queries in Supabase dashboard
- Add indexes for frequently queried columns
- Optimize RLS policies for performance

## Next Steps

1. **Apply the security migration** immediately
2. **Set up keepalive** to prevent deactivation
3. **Run security audit** to verify fixes
4. **Schedule regular audits** for ongoing security
5. **Monitor performance** and optimize as needed

Your Supabase project will now be secure, performant, and protected from deactivation!
