# Environment Variables Setup

## Required Environment Variables

Create a `.env` file in your project root with the following variables:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

# Admin Configuration
VITE_ADMIN_PASSWORD=your-secure-admin-password
VITE_ADMIN_EMAIL=admin@ai-focus.org

# Development Settings
NODE_ENV=development
```

## Security Notes

### Development:
- Default admin password: `admin123`
- Admin email: `admin@ai-focus.org`
- Test tools visible

### Production:
- Use strong admin password
- Use production email
- Test tools hidden
- Admin authentication required

## Admin Access

1. **Go to** `/admin` in your browser
2. **Enter** the admin password
3. **Access** the admin dashboard
4. **Logout** when done

## Security Features

- ✅ **Password protection** for admin access
- ✅ **Session-based authentication**
- ✅ **Environment-specific passwords**
- ✅ **Test tools hidden in production**
- ✅ **Logout functionality**
