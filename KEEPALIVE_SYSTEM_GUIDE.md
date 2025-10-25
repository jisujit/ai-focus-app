# Supabase Keepalive System - Complete Guide

## Overview
This system prevents your Supabase project from being deactivated due to inactivity by running comprehensive database operations every 15 days using **GitHub Actions** - a cloud-based, reliable solution that survives system re-imaging.

## 🚀 Why GitHub Actions is the Best Solution

### ✅ **Advantages:**
- **Survives system re-imaging** - Runs on GitHub's servers, not your local machine
- **Always available** - Independent of your local machine being on/off
- **Free and reliable** - Professional infrastructure
- **Easy monitoring** - View logs in GitHub interface
- **One-time setup** - No recreation needed after system changes
- **Version controlled** - Workflow is in your git repository

### ❌ **Windows Task Scheduler Problems:**
- **Lost on re-imaging** - Task disappears when system is rebuilt
- **Requires local machine** - Must be running and connected
- **Manual recreation** - Need to recreate after system changes
- **Dependency issues** - PowerShell, paths, execution policies

## How It Works

### 1. **Comprehensive Database Activity**
The keepalive system performs **7 different database operations** every 15 days:

1. **Health Check** - Tests basic Supabase connectivity
2. **Services Table Query** - Reads from your services table
3. **Sessions Table Query** - Reads from your sessions table  
4. **Training Registrations Query** - Reads from training_registrations table
5. **Session Cancellations Query** - Reads from session_cancellations table
6. **Pricing Rules Query** - Reads from pricing_rules table
7. **Edge Functions Test** - Calls your check-registration-status function

### 2. **15-Day Interval**
- **Production**: Every 15 days at 2:00 AM UTC
- **Development**: Every 15 days at 2:30 AM UTC (30 minutes later)
- **Why 15 days**: Supabase typically considers projects inactive after 30+ days of no activity
- **Safety margin**: 15 days provides a good buffer while not being too frequent

### 3. **Success Indicators**
You'll know the keepalive ran successfully when you see:
- ✅ **GitHub Actions**: Green checkmark in the Actions dashboard
- ✅ **Console output**: "KEEPALIVE SUCCESS - Project is active"
- ✅ **Email notification**: Professional HTML email via Resend
- ✅ **Database activity**: Visible in Supabase dashboard

## 🛡️ How This Prevents Supabase Deactivation

### **Supabase's Activity Monitoring**
Supabase tracks **database activity** to determine if a project is "active":
- ✅ **Database queries** = Activity
- ✅ **API calls** = Activity  
- ✅ **Edge function calls** = Activity
- ❌ **No activity** = Inactive project

### **What Supabase Sees**
```
Date: 2025-01-15 02:00:00 UTC
Activity: SELECT id FROM services LIMIT 1
Activity: SELECT session_id FROM sessions LIMIT 1  
Activity: SELECT registration_id FROM training_registrations LIMIT 1
Activity: SELECT id FROM session_cancellations LIMIT 1
Activity: SELECT id FROM pricing_rules LIMIT 1
Activity: Edge function call to check-registration-status
Status: Project is ACTIVE
```

## 📁 Files Created

### 1. **`.github/workflows/supabase-keepalive.yml`**
- **Production keepalive workflow**
- Runs every 15 days at 2:00 AM UTC
- Comprehensive database operations
- Professional email notifications via Resend

### 2. **`.github/workflows/supabase-keepalive-dev.yml`**
- **Development keepalive workflow**
- Runs every 15 days at 2:30 AM UTC
- Same comprehensive testing as production
- Separate email notifications

### 3. **`setup-github-keepalive.ps1`**
- Helper script for GitHub Actions setup
- Validates git repository status
- Shows setup instructions

## 🔧 Setup Instructions

### Step 1: Enable GitHub Actions
1. **Go to**: https://github.com/jisujit/ai-focus-app
2. **Click "Actions"** tab
3. **Click "I understand my workflows, go ahead and enable them"**

### Step 2: Add Secrets to GitHub
Go to: https://github.com/jisujit/ai-focus-app/settings/secrets/actions

**Add these secrets:**

#### **Production Secrets:**
- **Name**: `SUPABASE_URL`
- **Value**: `https://fvazftacytreklsmmbcr.supabase.co`

- **Name**: `SUPABASE_ANON_KEY`
- **Value**: `[your-production-anon-key]`

#### **Development Secrets:**
- **Name**: `SUPABASE_URL_DEV`
- **Value**: `https://vcxfwxrnrskvsgqxqrsz.supabase.co`

- **Name**: `SUPABASE_ANON_KEY_DEV`
- **Value**: `[your-development-anon-key]`

#### **Email Configuration:**
- **Name**: `NOTIFICATION_EMAIL`
- **Value**: `sujit@ai-focus.org`

- **Name**: `RESEND_API_KEY`
- **Value**: `[your-resend-api-key]`

### Step 3: Test Both Workflows
1. **Go to**: https://github.com/jisujit/ai-focus-app/actions
2. **Click "Supabase Keepalive"** (Production)
3. **Click "Run workflow"** → **"Run workflow"**
4. **Click "Supabase Keepalive (Development)"** (Development)
5. **Click "Run workflow"** → **"Run workflow"**

## 📊 Monitoring and Verification

### 1. **GitHub Actions Dashboard**
- **URL**: https://github.com/jisujit/ai-focus-app/actions
- **Look for**: Green checkmarks for successful runs
- **Scheduled runs**: Will show "schedule" in the Event column
- **Manual runs**: Show "workflow_dispatch" in the Event column

### 2. **Email Notifications**
You'll receive professional HTML emails:
- ✅ **Success**: "Supabase Keepalive SUCCESS - [timestamp]"
- ✅ **Development Success**: "Supabase Keepalive SUCCESS (DEV) - [timestamp]"
- ❌ **Failure**: "Supabase Keepalive FAILURE - [timestamp]"
- ❌ **Development Failure**: "Supabase Keepalive FAILURE (DEV) - [timestamp]"

### 3. **Supabase Dashboard**
- Go to your Supabase project dashboard
- Check **Database** → **Logs** for recent activity
- Look for queries to your tables around keepalive time

## 📅 Schedule Details

### **Production Schedule:**
- **Frequency**: Every 15 days
- **Time**: 2:00 AM UTC
- **Cron**: `0 2 */15 * *`
- **Project**: ai-focus-app-prod

### **Development Schedule:**
- **Frequency**: Every 15 days  
- **Time**: 2:30 AM UTC (30 minutes after production)
- **Cron**: `30 2 */15 * *`
- **Project**: ai-focus-app-dev

### **How to Verify Schedule:**
1. **Check workflow files** for cron expressions
2. **Look for "Scheduled" runs** in GitHub Actions
3. **Use Event filter** to see only scheduled runs
4. **Monitor email notifications** every 15 days

## 🔍 Troubleshooting

### **If Workflow Fails:**
1. **Check GitHub Actions logs** for specific error details
2. **Verify secrets** are correctly added to GitHub
3. **Test Supabase connection** manually
4. **Check Supabase project status** (not paused)

### **If No Email Notifications:**
1. **Check Resend API key** is correct
2. **Verify email address** in secrets
3. **Check spam folder**
4. **Test Resend connection** manually

### **If Scheduled Runs Don't Appear:**
1. **Check GitHub Actions** is enabled
2. **Verify cron syntax** in workflow files
3. **Wait for scheduled time** (runs are automatic)
4. **Check workflow file** is in `.github/workflows/` directory

## 🎯 Why This System is Superior

### **✅ Reliability:**
- **GitHub's infrastructure** - Professional, reliable servers
- **No local dependencies** - Runs independently of your machine
- **Automatic scheduling** - No manual intervention needed
- **Version controlled** - Workflow is in your git repository

### **✅ Monitoring:**
- **GitHub Actions dashboard** - Easy to view logs and status
- **Email notifications** - Professional HTML emails via Resend
- **Detailed logging** - Comprehensive operation logs
- **Success/failure tracking** - Clear status indicators

### **✅ Maintenance:**
- **One-time setup** - No recreation needed
- **Survives system changes** - Independent of local machine
- **Easy updates** - Modify workflow files in git
- **Professional infrastructure** - GitHub handles the scheduling

## 📧 Email Notification Details

### **Success Email Features:**
- **Professional HTML formatting** - Matches your app's branding
- **Detailed status information** - Project, time, environment
- **Clear success indicators** - What the success means
- **No action required** - Reassuring message

### **Failure Email Features:**
- **Immediate action required** - Clear urgency
- **Detailed troubleshooting steps** - Step-by-step guidance
- **Links to GitHub Actions** - Direct access to logs
- **Professional formatting** - Consistent with your brand

## 🚀 Success Criteria

Your keepalive system is working correctly when:
- ✅ **GitHub Actions shows green checkmarks** for both workflows
- ✅ **Email notifications arrive** every 15 days
- ✅ **Supabase dashboard shows recent activity** around scheduled times
- ✅ **No project deactivation warnings** in Supabase
- ✅ **Scheduled runs appear** in GitHub Actions with "schedule" event type

## 🎉 Final Status

Your Supabase projects are now **fully protected** with:
- ✅ **Production environment** protected (every 15 days at 2:00 AM UTC)
- ✅ **Development environment** protected (every 15 days at 2:30 AM UTC)
- ✅ **Professional email notifications** for both environments
- ✅ **Survives system re-imaging** (runs on GitHub's servers)
- ✅ **Easy monitoring** via GitHub Actions dashboard
- ✅ **Automatic operation** every 15 days

**Your Supabase projects will never be deactivated due to inactivity!** 🚀

## 📞 Support

If you need help:
1. **Check GitHub Actions logs** for detailed error information
2. **Review this guide** for troubleshooting steps
3. **Test workflows manually** to verify functionality
4. **Monitor email notifications** for status updates

The system is designed to be completely autonomous and reliable! 🎯