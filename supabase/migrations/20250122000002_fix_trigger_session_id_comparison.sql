-- Fix trigger function to properly compare TEXT session_id with sessions table
-- The training_registrations.session_id is TEXT, but sessions.id is UUID
-- We need to compare training_registrations.session_id with sessions.session_id (both TEXT)

DROP TRIGGER IF EXISTS update_session_availability_trigger ON public.training_registrations;
DROP FUNCTION IF EXISTS public.update_session_availability();

-- Create the fixed function with proper session_id comparison
CREATE OR REPLACE FUNCTION public.update_session_availability()
RETURNS trigger AS $$
BEGIN
  -- Update current_registrations count for the specific session that was affected
  IF TG_OP = 'DELETE' THEN
    -- For DELETE operations, update the session that was referenced
    UPDATE public.sessions 
    SET current_registrations = (
      SELECT COUNT(*) 
      FROM public.training_registrations 
      WHERE training_registrations.session_id = OLD.session_id 
        AND payment_status = 'paid'
    )
    WHERE sessions.session_id = OLD.session_id;  -- Compare TEXT with TEXT
  ELSE
    -- For INSERT/UPDATE operations, update the session that was referenced
    UPDATE public.sessions 
    SET current_registrations = (
      SELECT COUNT(*) 
      FROM public.training_registrations 
      WHERE training_registrations.session_id = NEW.session_id 
        AND payment_status = 'paid'
    )
    WHERE sessions.session_id = NEW.session_id;  -- Compare TEXT with TEXT
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER update_session_availability_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.training_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_session_availability();
