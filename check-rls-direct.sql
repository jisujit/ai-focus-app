-- Check RLS status directly from database
-- This will show the actual RLS status

-- Check if RLS is enabled on session_cancellations
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    hasrls as has_rls
FROM pg_tables 
WHERE tablename = 'session_cancellations';

-- Check RLS policies on session_cancellations
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'session_cancellations';

-- Check if table exists and its properties
SELECT 
    table_name,
    table_type,
    is_insertable_into,
    is_typed
FROM information_schema.tables 
WHERE table_name = 'session_cancellations';
