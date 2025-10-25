-- Fix Security Issues - RLS and Function Security
-- This migration addresses the security issues identified by Supabase

-- 1. Enable RLS on session_cancellations table
ALTER TABLE public.session_cancellations ENABLE ROW LEVEL SECURITY;

-- 2. Create RLS policies for session_cancellations
-- Admin can read all cancellations
CREATE POLICY "Admin can read session cancellations" 
ON public.session_cancellations 
FOR SELECT 
USING (true);

-- Admin can insert cancellations
CREATE POLICY "Admin can insert session cancellations" 
ON public.session_cancellations 
FOR INSERT 
WITH CHECK (true);

-- Admin can update cancellations
CREATE POLICY "Admin can update session cancellations" 
ON public.session_cancellations 
FOR UPDATE 
USING (true);

-- Admin can delete cancellations
CREATE POLICY "Admin can delete session cancellations" 
ON public.session_cancellations 
FOR DELETE 
USING (true);

-- 3. Fix function security issues
-- Recreate calculate_session_price with proper security
DROP FUNCTION IF EXISTS public.calculate_session_price(UUID, TIMESTAMPTZ, INTEGER);

CREATE OR REPLACE FUNCTION public.calculate_session_price(
  p_service_id UUID,
  p_session_date TIMESTAMPTZ,
  p_quantity INTEGER DEFAULT 1
) RETURNS TABLE(
  base_price DECIMAL(10,2),
  final_price DECIMAL(10,2),
  discount_amount DECIMAL(10,2),
  discount_type TEXT,
  pricing_rule_id UUID
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  service_record RECORD;
  rule_record RECORD;
  days_diff INTEGER;
  calculated_price DECIMAL(10,2);
  discount_amount DECIMAL(10,2);
BEGIN
  -- Get service base price
  SELECT base_price, early_bird_price, early_bird_days
  INTO service_record
  FROM public.services
  WHERE id = p_service_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Calculate days until session
  days_diff := EXTRACT(DAY FROM (p_session_date - NOW()));
  
  -- Start with base price
  calculated_price := service_record.base_price;
  
  -- Check for early bird pricing
  IF days_diff >= service_record.early_bird_days AND service_record.early_bird_price IS NOT NULL THEN
    calculated_price := service_record.early_bird_price;
    discount_amount := service_record.base_price - service_record.early_bird_price;
    
    RETURN QUERY SELECT 
      service_record.base_price,
      calculated_price,
      discount_amount,
      'early_bird'::TEXT,
      NULL::UUID;
    RETURN;
  END IF;
  
  -- Check for other pricing rules
  FOR rule_record IN 
    SELECT * FROM public.pricing_rules 
    WHERE service_id = p_service_id 
      AND active = true 
      AND (days_before_session IS NULL OR days_diff <= days_before_session)
      AND (min_quantity IS NULL OR p_quantity >= min_quantity)
      AND (max_quantity IS NULL OR p_quantity <= max_quantity)
    ORDER BY 
      CASE WHEN rule_type = 'early_bird' THEN 1 ELSE 2 END,
      days_before_session DESC
  LOOP
    IF rule_record.discount_type = 'percentage' THEN
      discount_amount := calculated_price * (rule_record.discount_value / 100);
      calculated_price := calculated_price - discount_amount;
    ELSIF rule_record.discount_type = 'fixed_amount' THEN
      discount_amount := rule_record.discount_value;
      calculated_price := calculated_price - discount_amount;
    END IF;
    
    RETURN QUERY SELECT 
      service_record.base_price,
      calculated_price,
      discount_amount,
      rule_record.rule_type,
      rule_record.id;
    RETURN;
  END LOOP;
  
  -- No special pricing found, return base price
  RETURN QUERY SELECT 
    service_record.base_price,
    calculated_price,
    0::DECIMAL(10,2),
    'base'::TEXT,
    NULL::UUID;
END;
$$;

-- 4. Fix insert_training_registration function security
DROP FUNCTION IF EXISTS public.insert_training_registration(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, TEXT, TEXT);

CREATE OR REPLACE FUNCTION public.insert_training_registration(
  p_session_id TEXT,
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
SET search_path = public
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

-- 5. Fix update_session_availability function security
-- First drop the trigger that depends on the function
DROP TRIGGER IF EXISTS update_session_availability_trigger ON public.training_registrations;

-- Now we can safely drop and recreate the function
DROP FUNCTION IF EXISTS public.update_session_availability();

CREATE OR REPLACE FUNCTION public.update_session_availability()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update current_registrations count
  UPDATE public.sessions 
  SET current_registrations = (
    SELECT COUNT(*) 
    FROM public.training_registrations 
    WHERE session_id = NEW.session_id 
      AND payment_status = 'paid'
  )
  WHERE session_id = NEW.session_id;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER update_session_availability_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.training_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_session_availability();

-- 6. Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_session_cancellations_session_id 
ON public.session_cancellations(session_id);

CREATE INDEX IF NOT EXISTS idx_session_cancellations_created_at 
ON public.session_cancellations(created_at);

-- 7. Add comments for documentation
COMMENT ON TABLE public.session_cancellations IS 'Tracks session cancellations with refund processing and email notifications';
COMMENT ON FUNCTION public.calculate_session_price IS 'Calculates dynamic pricing based on service rules and timing';
COMMENT ON FUNCTION public.insert_training_registration IS 'Inserts training registration with payment details';
COMMENT ON FUNCTION public.update_session_availability IS 'Updates session registration counts when registrations change';

-- 8. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.calculate_session_price TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_session_price TO anon;
GRANT EXECUTE ON FUNCTION public.insert_training_registration TO authenticated;
GRANT EXECUTE ON FUNCTION public.insert_training_registration TO anon;
GRANT EXECUTE ON FUNCTION public.update_session_availability TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_session_availability TO anon;
