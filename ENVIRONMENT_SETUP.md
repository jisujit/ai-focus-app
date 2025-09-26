# Environment Management Guide

## Overview
This project uses two environments: **Development** and **Production**

## Environment Files
- `.env` - Active environment (Vite reads this)
- `.env.development` - Development credentials
- `.env.production` - Production credentials

## Quick Commands

### Switch to Development
```bash
./switch-to-dev.ps1
```

### Switch to Production  
```bash
./switch-to-prod.ps1
```

## Development Environment

### Local Development
```bash
# 1. Switch to dev environment
./switch-to-dev.ps1

# 2. Set Supabase Edge Functions
# Go to ai-focus-app-dev → Settings → Edge Functions
# Add: TEST_MODE = true

# 3. Run locally
npm run dev
```

### Docker Testing (Dev Database)
```bash
# 1. Switch to dev environment
./switch-to-dev.ps1

# 2. Build and test with Docker
npm run build:dev
./dev-test.ps1
```

## Production Environment

### Production Deployment
```bash
# 1. Switch to production environment
./switch-to-prod.ps1

# 2. Set Supabase Edge Functions
# Go to ai-focus-app-prod → Settings → Edge Functions  
# Add: TEST_MODE = false (or remove it)

# 3. Deploy to production
./deploy.ps1
```

## Environment Variables

### Development (.env.development)
```
VITE_SUPABASE_URL=https://your-dev-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-dev-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_STRIPE_SECRET_KEY=sk_test_...
```

### Production (.env.production)
```
VITE_SUPABASE_URL=https://your-prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-prod-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_STRIPE_SECRET_KEY=sk_live_...
```

## Supabase Edge Functions

### Development (ai-focus-app-dev)
- `TEST_MODE` = `true`
- `RESEND_API_KEY` = your-resend-key
- `STRIPE_SECRET_KEY` = sk_test_...

### Production (ai-focus-app-prod)
- `TEST_MODE` = `false` (or not set)
- `RESEND_API_KEY` = your-resend-key  
- `STRIPE_SECRET_KEY` = sk_live_...

## Email Behavior

### Development
- All emails → `gsujit@gmail.com`
- Database saves original email addresses
- Logs show "(test mode)"

### Production
- Emails → Original recipient addresses
- Normal production behavior

## Workflow Summary

### Daily Development
1. `./switch-to-dev.ps1`
2. `npm run dev`
3. Test with dev database

### Testing with Docker
1. `./switch-to-dev.ps1`
2. `./dev-test.ps1`
3. Test at http://localhost:3001

### Production Deployment
1. `./switch-to-prod.ps1`
2. `./deploy.ps1`
3. Monitor production

## Safety Notes
- Always backup `.env` before switching
- Test thoroughly in dev before production
- Verify Stripe keys match environment
- Check Supabase project URLs