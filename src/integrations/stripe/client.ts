import { loadStripe } from '@stripe/stripe-js';

// Lazy load Stripe only when needed
let stripePromise: Promise<any> | null = null;

export const getStripePromise = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

// Stripe configuration
export const STRIPE_CONFIG = {
  currency: 'usd',
  paymentMethodTypes: ['card'],
};
