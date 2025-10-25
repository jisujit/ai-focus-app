# GitHub Actions Keepalive Setup Guide

## Why GitHub Actions is Better

### ✅ **Advantages over Windows Task Scheduler:**
- **Survives system re-imaging**: Runs on GitHub's servers
- **Always available**: Independent of your local machine
- **Free**: No cost for public repositories
- **Reliable**: GitHub's professional infrastructure
- **Easy monitoring**: View logs in GitHub interface
- **Automatic**: No local setup required

### ❌ **Windows Task Scheduler Problems:**
- **Lost on re-imaging**: Task disappears when system is rebuilt
- **Requires local machine**: Must be running and connected
- **Manual setup**: Need to recreate after system changes
- **Dependency issues**: PowerShell execution policies, paths, etc.

---

## **🚀 SETUP INSTRUCTIONS**

### **Step 1: Enable GitHub Actions**
1. Go to your GitHub repository
2. Click **"Actions"** tab
3. Click **"I understand my workflows, go ahead and enable them"**

### **Step 2: Add Secrets to GitHub**
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**
3. Add these secrets:

```
SUPABASE_URL = https://fvazftacytreklsmmbcr.supabase.co
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2YXpmdGFjeXRyZWtsc21tYmNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NTkwMDQsImV4cCI6MjA3MzEzNTAwNH0.ARVXgHGBzGNyn7IXleEg-ht1fBGN8WKOqMilLwJNQx8
NOTIFICATION_EMAIL = gsujit@gmail.com
SMTP_SERVER = smtp.gmail.com
SMTP_USERNAME = your-email@gmail.com
SMTP_PASSWORD = your-app-password
```

### **Step 3: Commit the Workflow**
```bash
# Add the workflow file
git add .github/workflows/supabase-keepalive.yml
git commit -m "Add Supabase keepalive GitHub Action"
git push origin main
```

### **Step 4: Test the Workflow**
1. Go to **Actions** tab in GitHub
2. Click **"Supabase Keepalive"** workflow
3. Click **"Run workflow"** → **"Run workflow"**
4. Watch it execute in real-time

---

## **📅 SCHEDULE CONFIGURATION**

### **Current Schedule: Every 15 Days**
```yaml
schedule:
  - cron: '0 2 */15 * *'  # Every 15 days at 2:00 AM UTC
```

### **Alternative Schedules:**
```yaml
# Every 7 days
- cron: '0 2 */7 * *'

# Every 10 days  
- cron: '0 2 */10 * *'

# Every 30 days
- cron: '0 2 1 * *'

# Every 14 days
- cron: '0 2 */14 * *'
```

---

## **📊 MONITORING AND VERIFICATION**

### **1. GitHub Actions Dashboard**
- Go to **Actions** tab
- Click **"Supabase Keepalive"** workflow
- View **run history** and **logs**
- See **success/failure** status

### **2. Workflow Logs**
- Click on any run to see detailed logs
- View **console output** from keepalive operations
- Check **success/failure** messages

### **3. Email Notifications (Optional)**
- Configure email sending in the workflow
- Receive notifications on success/failure
- Monitor project health remotely

---

## **🔧 CUSTOMIZATION OPTIONS**

### **1. Change Schedule**
Edit `.github/workflows/supabase-keepalive.yml`:
```yaml
schedule:
  - cron: '0 2 */10 * *'  # Every 10 days
```

### **2. Add More Database Operations**
Add more operations to the `operations` array in the workflow

### **3. Custom Notifications**
Add email sending logic or webhook notifications

### **4. Multiple Environments**
Create separate workflows for dev/prod environments

---

## **🛡️ SECURITY CONSIDERATIONS**

### **✅ Secure:**
- **API keys stored as secrets**: Not visible in code
- **Read-only operations**: Only queries, no data modification
- **Limited scope**: Only necessary permissions
- **GitHub security**: Professional-grade infrastructure

### **🔒 Best Practices:**
- Use **anon keys** (not service keys) for client operations
- **Rotate keys** periodically
- **Monitor access logs** in Supabase dashboard
- **Review workflow logs** regularly

---

## **📈 ADVANTAGES OVER LOCAL SOLUTIONS**

| Feature | GitHub Actions | Windows Task Scheduler |
|---------|----------------|----------------------|
| **Survives re-imaging** | ✅ Yes | ❌ No |
| **Independent of local machine** | ✅ Yes | ❌ No |
| **Free** | ✅ Yes | ✅ Yes |
| **Easy monitoring** | ✅ GitHub interface | ❌ Local only |
| **Reliable infrastructure** | ✅ GitHub servers | ❌ Your machine |
| **Automatic setup** | ✅ One-time | ❌ Manual recreation |
| **Version control** | ✅ Yes | ❌ No |
| **Easy backup** | ✅ Git repository | ❌ Manual backup |

---

## **🚀 IMMEDIATE NEXT STEPS**

### **1. Set Up GitHub Actions (Recommended)**
```bash
# Commit the workflow
git add .github/workflows/supabase-keepalive.yml
git commit -m "Add Supabase keepalive GitHub Action"
git push origin main
```

### **2. Configure Secrets**
- Add your Supabase credentials to GitHub secrets
- Test the workflow manually first

### **3. Verify It Works**
- Check GitHub Actions dashboard
- Verify database activity in Supabase
- Monitor for the first few runs

---

## **🔄 MIGRATION FROM WINDOWS TASK SCHEDULER**

If you already have Windows Task Scheduler set up:

### **1. Disable Windows Task**
```powershell
.\setup-windows-task-scheduler.ps1 -RemoveTask
```

### **2. Set Up GitHub Actions**
- Follow the setup instructions above
- Test the workflow

### **3. Verify Migration**
- Confirm GitHub Actions is working
- Remove local keepalive scripts (optional)

---

## **💡 PRO TIPS**

### **1. Test Before Going Live**
- Run workflow manually first
- Verify all operations succeed
- Check Supabase dashboard for activity

### **2. Monitor Regularly**
- Check GitHub Actions dashboard weekly
- Review workflow logs monthly
- Verify Supabase project status

### **3. Backup Configuration**
- Keep workflow file in version control
- Document any customizations
- Save secret values securely

---

**Your Supabase project will now be protected from deactivation with a robust, cloud-based solution that survives system re-imaging!** 🚀
