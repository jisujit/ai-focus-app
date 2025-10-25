-- Debug RLS Issue Migration
-- This migration will provide detailed information about the RLS status

-- Check detailed RLS information
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'session_cancellations';

-- Check RLS status from pg_class
SELECT 
    relname as table_name,
    relrowsecurity as rls_enabled,
    relforcerowsecurity as force_rls
FROM pg_class 
WHERE relname = 'session_cancellations' 
AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Check if the table exists and its properties
SELECT 
    table_name,
    table_schema,
    table_type,
    is_insertable_into
FROM information_schema.tables 
WHERE table_name = 'session_cancellations';

-- Check RLS policies in detail
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

-- Force enable RLS with explicit commands
ALTER TABLE public.session_cancellations ENABLE ROW LEVEL SECURITY;

-- Verify the change took effect
SELECT 
    'session_cancellations' as table_name,
    relrowsecurity as rls_enabled,
    relforcerowsecurity as force_rls
FROM pg_class 
WHERE relname = 'session_cancellations' 
AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Check if there are any conflicting settings
SELECT 
    attname,
    attnotnull,
    attnum
FROM pg_attribute 
WHERE attrelid = (SELECT oid FROM pg_class WHERE relname = 'session_cancellations')
AND attnum > 0
ORDER BY attnum;
