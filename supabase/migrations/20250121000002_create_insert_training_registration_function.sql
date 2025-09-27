-- Create function to insert training registration with proper UUID handling
CREATE OR REPLACE FUNCTION insert_training_registration(
  p_session_id UUID,
  p_training_title TEXT,
  p_first_name TEXT,
  p_last_name TEXT,
  p_email TEXT,
  p_company TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_job_title TEXT DEFAULT NULL,
  p_experience_level TEXT DEFAULT NULL,
  p_expectations TEXT DEFAULT NULL,
  p_status TEXT DEFAULT 'confirmed',
  p_payment_status TEXT DEFAULT 'paid',
  p_stripe_payment_intent_id TEXT DEFAULT NULL,
  p_stripe_customer_id TEXT DEFAULT NULL,
  p_payment_amount INTEGER DEFAULT NULL,
  p_payment_currency TEXT DEFAULT NULL,
  p_payment_receipt_url TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  registration_id UUID;
BEGIN
  INSERT INTO public.training_registrations (
    session_id,
    training_title,
    first_name,
    last_name,
    email,
    company,
    phone,
    job_title,
    experience_level,
    expectations,
    status,
    payment_status,
    stripe_payment_intent_id,
    stripe_customer_id,
    payment_amount,
    payment_currency,
    payment_receipt_url
  ) VALUES (
    p_session_id,
    p_training_title,
    p_first_name,
    p_last_name,
    p_email,
    p_company,
    p_phone,
    p_job_title,
    p_experience_level,
    p_expectations,
    p_status,
    p_payment_status,
    p_stripe_payment_intent_id,
    p_stripe_customer_id,
    p_payment_amount,
    p_payment_currency,
    p_payment_receipt_url
  ) RETURNING id INTO registration_id;
  
  RETURN registration_id;
END;
$$;
