-- Add function to update session availability
DROP TRIGGER IF EXISTS update_session_availability_trigger ON public.training_registrations;
DROP FUNCTION IF EXISTS public.update_session_availability();
CREATE FUNCTION public.update_session_availability()
RETURNS trigger AS $$
BEGIN
  -- Update current_registrations count for all sessions
  UPDATE public.sessions 
  SET current_registrations = (
    SELECT COUNT(*) 
    FROM public.training_registrations 
    WHERE training_registrations.session_id = sessions.id 
      AND payment_status = 'paid'
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update availability when registrations change
DROP TRIGGER IF EXISTS update_session_availability_trigger ON public.training_registrations;

CREATE TRIGGER update_session_availability_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.training_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_session_availability();
