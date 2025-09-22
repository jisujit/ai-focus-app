-- Add function to update session availability
CREATE OR REPLACE FUNCTION public.update_session_availability()
RETURNS void AS $$
BEGIN
  -- Update current_registrations count for all sessions
  UPDATE public.sessions 
  SET current_registrations = (
    SELECT COUNT(*) 
    FROM public.training_registrations 
    WHERE training_registrations.session_id = sessions.session_id 
      AND payment_status = 'paid'
  );
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update availability when registrations change
DROP TRIGGER IF EXISTS update_session_availability_trigger ON public.training_registrations;

CREATE TRIGGER update_session_availability_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.training_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_session_availability();

-- Update all existing sessions
SELECT public.update_session_availability();
