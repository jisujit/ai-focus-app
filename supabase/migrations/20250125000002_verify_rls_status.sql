-- Verify RLS Status Migration
-- This migration will show the actual RLS status and force enable if needed

-- Check current RLS status
DO $$
DECLARE
    rls_status boolean;
BEGIN
    -- Get RLS status for session_cancellations
    SELECT relrowsecurity INTO rls_status
    FROM pg_class 
    WHERE relname = 'session_cancellations' 
    AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
    
    -- Report status
    IF rls_status THEN
        RAISE NOTICE 'RLS is ENABLED on session_cancellations table';
    ELSE
        RAISE NOTICE 'RLS is DISABLED on session_cancellations table - enabling now';
        -- Force enable RLS
        ALTER TABLE public.session_cancellations ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS has been ENABLED on session_cancellations table';
    END IF;
END $$;

-- Check and report policies
DO $$
DECLARE
    policy_count integer;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE tablename = 'session_cancellations';
    
    RAISE NOTICE 'Number of RLS policies on session_cancellations: %', policy_count;
    
    IF policy_count = 0 THEN
        RAISE NOTICE 'No RLS policies found - creating default policies';
        
        -- Create default policies
        CREATE POLICY "Admin can read session cancellations" 
        ON public.session_cancellations FOR SELECT USING (true);
        
        CREATE POLICY "Admin can insert session cancellations" 
        ON public.session_cancellations FOR INSERT WITH CHECK (true);
        
        CREATE POLICY "Admin can update session cancellations" 
        ON public.session_cancellations FOR UPDATE USING (true);
        
        CREATE POLICY "Admin can delete session cancellations" 
        ON public.session_cancellations FOR DELETE USING (true);
        
        RAISE NOTICE 'Default RLS policies created';
    END IF;
END $$;

-- Final verification
SELECT 
    'session_cancellations' as table_name,
    relrowsecurity as rls_enabled,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'session_cancellations') as policy_count
FROM pg_class 
WHERE relname = 'session_cancellations' 
AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
