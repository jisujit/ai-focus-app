-- Create services and sessions management tables

-- Services table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  duration TEXT NOT NULL,
  level TEXT NOT NULL,
  format TEXT NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  early_bird_price DECIMAL(10,2),
  early_bird_days INTEGER DEFAULT 7, -- Days before session when early bird ends
  features TEXT[] NOT NULL,
  session_outline TEXT[],
  icon TEXT NOT NULL, -- Lucide icon name
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sessions table
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL UNIQUE, -- Human readable ID like "102501"
  date TIMESTAMPTZ NOT NULL,
  time TEXT NOT NULL, -- "11:00 AM EST"
  max_capacity INTEGER NOT NULL DEFAULT 20,
  current_registrations INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active', -- active, cancelled, completed
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pricing rules table for dynamic pricing
CREATE TABLE public.pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  rule_type TEXT NOT NULL, -- 'early_bird', 'last_minute', 'group_discount'
  days_before_session INTEGER, -- For time-based rules
  discount_type TEXT NOT NULL, -- 'percentage', 'fixed_amount'
  discount_value DECIMAL(10,2) NOT NULL,
  min_quantity INTEGER DEFAULT 1, -- For group discounts
  max_quantity INTEGER, -- For group discounts
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;

-- Create policies for services (public read, admin write)
CREATE POLICY "Anyone can read services" 
ON public.services 
FOR SELECT 
USING (true);

CREATE POLICY "Admin can manage services" 
ON public.services 
FOR ALL 
USING (true);

-- Create policies for sessions (public read, admin write)
CREATE POLICY "Anyone can read sessions" 
ON public.sessions 
FOR SELECT 
USING (true);

CREATE POLICY "Admin can manage sessions" 
ON public.sessions 
FOR ALL 
USING (true);

-- Create policies for pricing rules (public read, admin write)
CREATE POLICY "Anyone can read pricing rules" 
ON public.pricing_rules 
FOR SELECT 
USING (true);

CREATE POLICY "Admin can manage pricing rules" 
ON public.pricing_rules 
FOR ALL 
USING (true);

-- Create function to calculate dynamic pricing
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
) AS $$
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
$$ LANGUAGE plpgsql;

-- Create function to update session availability
CREATE OR REPLACE FUNCTION public.update_session_availability()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger to update availability when registrations change
CREATE TRIGGER update_session_availability_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.training_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_session_availability();

-- Insert sample data
INSERT INTO public.services (
  title, description, duration, level, format, base_price, early_bird_price, early_bird_days,
  features, session_outline, icon, available
) VALUES (
  'AI Fundamentals & ChatGPT Mastery',
  'Get hands-on experience with AI tools in this comprehensive 3-hour instructor-led training session.',
  '3 hours',
  'All Levels',
  'Instructor-Led Training',
  150.00,
  75.00,
  7,
  ARRAY[
    'AI landscape overview and current trends',
    'ChatGPT and Claude basics with live demonstrations',
    'Safety considerations and AI limitations',
    'Hands-on practice with effective prompting techniques',
    'Real-world business use cases and applications',
    'Advanced features and workflow integration',
    'Building sustainable AI habits for productivity'
  ],
  ARRAY[
    'Hour 1: AI landscape overview, ChatGPT/Claude basics, safety and limitations',
    'Hour 2: Hands-on practice with prompting techniques, real-world use cases',
    'Hour 3: Advanced features, workflow integration, building AI habits'
  ],
  'Brain',
  true
);

-- Insert sample sessions
INSERT INTO public.sessions (service_id, session_id, date, time, max_capacity)
SELECT 
  s.id,
  '102501',
  '2025-10-11 11:00:00+00'::TIMESTAMPTZ,
  '11:00 AM EST',
  20
FROM public.services s WHERE s.title = 'AI Fundamentals & ChatGPT Mastery';

INSERT INTO public.sessions (service_id, session_id, date, time, max_capacity)
SELECT 
  s.id,
  '102502',
  '2025-10-18 11:00:00+00'::TIMESTAMPTZ,
  '11:00 AM EST',
  20
FROM public.services s WHERE s.title = 'AI Fundamentals & ChatGPT Mastery';
