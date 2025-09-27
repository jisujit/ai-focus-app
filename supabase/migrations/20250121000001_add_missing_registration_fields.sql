-- Add missing fields to training_registrations table
ALTER TABLE public.training_registrations 
ADD COLUMN IF NOT EXISTS training_title TEXT,
ADD COLUMN IF NOT EXISTS job_title TEXT,
ADD COLUMN IF NOT EXISTS experience_level TEXT,
ADD COLUMN IF NOT EXISTS expectations TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_amount INTEGER,
ADD COLUMN IF NOT EXISTS payment_currency TEXT,
ADD COLUMN IF NOT EXISTS payment_receipt_url TEXT;
