-- Verify the trigger fix by checking the function definition
-- This will show us if the trigger is using the correct field comparison

-- Check if the function exists and what it contains
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc 
WHERE proname = 'update_session_availability';

-- Check if the trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'update_session_availability_trigger';
