# Payment Integration Setup Guide

This guide explains how to set up Stripe payment integration for the training registration system.

## Environment Variables Required

Add these environment variables to your `.env` file:

```bash
# Supabase Configuration (already configured)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration (NEW)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Supabase Edge Functions (for backend)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
```

## Stripe Account Setup

1. **Get Stripe Keys:**
   - Go to your Stripe Dashboard
   - Navigate to Developers > API Keys
   - Copy your Publishable key (starts with `pk_test_`)
   - Copy your Secret key (starts with `sk_test_`)

2. **Set Environment Variables:**
   - Add the keys to your Supabase project's Edge Functions environment variables
   - Add the publishable key to your frontend environment

## Database Migration

Run the database migration to add Stripe payment fields:

```bash
supabase db push
```

This will add the following fields to the `training_registrations` table:
- `stripe_payment_intent_id`
- `stripe_customer_id`
- `payment_amount`
- `payment_currency`
- `payment_method_id`
- `payment_receipt_url`

## Deploy Edge Functions

Deploy the new Supabase Edge Functions:

```bash
supabase functions deploy create-payment-intent
supabase functions deploy confirm-payment
```

## Testing

1. **Test Mode:** Use Stripe test cards:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - 3D Secure: `4000 0025 0000 3155`

2. **Test Flow:**
   - Fill out registration form
   - Click "Register & Pay ($75)"
   - Complete payment with test card
   - Verify registration is confirmed

## Payment Flow

1. User fills registration form
2. Clicks "Register & Pay" button
3. Stripe payment form appears
4. User enters card details
5. Payment is processed
6. Registration is completed and confirmed
7. Confirmation email is sent

## Security Notes

- All payment processing happens through Stripe's secure infrastructure
- Card details are never stored in your database
- Payment is verified server-side before completing registration
- PCI compliance is handled by Stripe

## Troubleshooting

- Check browser console for JavaScript errors
- Verify environment variables are set correctly
- Check Supabase Edge Functions logs
- Ensure Stripe keys are valid and active
