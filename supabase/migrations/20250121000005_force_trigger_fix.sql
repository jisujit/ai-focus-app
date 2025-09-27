-- Force fix the trigger with proper WHERE clause
-- This will definitely apply the fix

-- Drop the existing trigger and function completely
DROP TRIGGER IF EXISTS update_session_availability_trigger ON public.training_registrations;
DROP FUNCTION IF EXISTS public.update_session_availability();

-- Create the fixed function with proper WHERE clause
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
    WHERE sessions.id = OLD.session_id;
  ELSE
    -- For INSERT/UPDATE operations, update the session that was referenced
    UPDATE public.sessions 
    SET current_registrations = (
      SELECT COUNT(*) 
      FROM public.training_registrations 
      WHERE training_registrations.session_id = NEW.session_id 
        AND payment_status = 'paid'
    )
    WHERE sessions.id = NEW.session_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER update_session_availability_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.training_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_session_availability();
