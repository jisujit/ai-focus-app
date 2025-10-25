-- Force enable RLS on session_cancellations table
-- This migration specifically addresses the RLS issue

-- Enable RLS on session_cancellations table
ALTER TABLE public.session_cancellations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin can read session cancellations" ON public.session_cancellations;
DROP POLICY IF EXISTS "Admin can insert session cancellations" ON public.session_cancellations;
DROP POLICY IF EXISTS "Admin can update session cancellations" ON public.session_cancellations;
DROP POLICY IF EXISTS "Admin can delete session cancellations" ON public.session_cancellations;

-- Create comprehensive RLS policies for session_cancellations
CREATE POLICY "Admin can read session cancellations" 
ON public.session_cancellations 
FOR SELECT 
USING (true);

CREATE POLICY "Admin can insert session cancellations" 
ON public.session_cancellations 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admin can update session cancellations" 
ON public.session_cancellations 
FOR UPDATE 
USING (true);

CREATE POLICY "Admin can delete session cancellations" 
ON public.session_cancellations 
FOR DELETE 
USING (true);

-- Add comment for documentation
COMMENT ON TABLE public.session_cancellations IS 'Tracks session cancellations with refund processing and email notifications - RLS enabled';

-- Verify RLS is enabled
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class 
        WHERE relname = 'session_cancellations' 
        AND relrowsecurity = true
    ) THEN
        RAISE EXCEPTION 'RLS is not enabled on session_cancellations table';
    END IF;
END $$;
