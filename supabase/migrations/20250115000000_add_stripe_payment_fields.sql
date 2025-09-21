-- Add missing Stripe payment fields to training_registrations table
-- Note: Most fields already exist, only adding the missing ones

ALTER TABLE public.training_registrations 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS payment_method_id TEXT,
ADD COLUMN IF NOT EXISTS payment_receipt_url TEXT;

-- Add index for customer lookups (if not exists)
CREATE INDEX IF NOT EXISTS idx_training_registrations_customer 
ON public.training_registrations(stripe_customer_id);

-- Add index for payment intent lookups (if not exists)
CREATE INDEX IF NOT EXISTS idx_training_registrations_payment_intent 
ON public.training_registrations(stripe_payment_intent_id);
