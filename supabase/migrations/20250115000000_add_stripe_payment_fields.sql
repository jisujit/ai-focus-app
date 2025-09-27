-- Create training_registrations table with Stripe payment fields
CREATE TABLE IF NOT EXISTS public.training_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  session_id UUID NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  stripe_customer_id TEXT,
  payment_method_id TEXT,
  payment_receipt_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.training_registrations ENABLE ROW LEVEL SECURITY;

-- Create policies for training registrations
CREATE POLICY "Anyone can insert training registrations" 
ON public.training_registrations 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admin can read training registrations" 
ON public.training_registrations 
FOR SELECT 
USING (true);

CREATE POLICY "Admin can update training registrations" 
ON public.training_registrations 
FOR UPDATE 
USING (true);

-- Add index for customer lookups (if not exists)
CREATE INDEX IF NOT EXISTS idx_training_registrations_customer 
ON public.training_registrations(stripe_customer_id);

-- Add index for payment intent lookups (if not exists)
CREATE INDEX IF NOT EXISTS idx_training_registrations_payment_intent 
ON public.training_registrations(stripe_payment_intent_id);
