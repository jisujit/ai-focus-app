import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Production mode indicator
if (import.meta.env.PROD) {
  console.log('🚀 AI Focus Academy - Production Mode');
  console.log('🔗 Supabase:', import.meta.env.VITE_SUPABASE_URL);
  console.log('💳 Stripe:', import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.substring(0, 20) + '...');
  console.log('🔒 Environment: Production');
}

createRoot(document.getElementById("root")!).render(<App />);
