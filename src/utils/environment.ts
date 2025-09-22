// Environment detection utilities
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

// Show test tools only in development
export const showTestTools = isDevelopment;

// Environment-specific configurations
export const ENV_CONFIG = {
  isDevelopment,
  isProduction,
  showTestTools,
  apiUrl: import.meta.env.VITE_SUPABASE_URL,
  stripeKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
} as const;
