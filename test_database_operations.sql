-- ========================================
-- Test Database Operations After Rename
-- Verify all renamed tables work correctly
-- ========================================

-- Test 1: Critical tables exist and are accessible
SELECT 'Testing critical tables...' as test_phase;

-- Check document_storage (was t_460_03_01_document_storage)
SELECT COUNT(*) as document_storage_count FROM document_storage;

-- Check users_universal (was t_310_01_01_users_universal)  
SELECT COUNT(*) as users_universal_count FROM users_universal;

-- Check educator_details (was t_315_01_01_educator_details)
SELECT COUNT(*) as educator_details_count FROM educator_details;

-- Test 2: Foreign key relationships still work
SELECT 'Testing foreign key relationships...' as test_phase;

-- Test join between users and educator details
SELECT 
  u.id as user_id,
  e.id as educator_id
FROM users_universal u
LEFT JOIN educator_details e ON u.id = e.user_id
LIMIT 5;

-- Test join between educator and document storage
SELECT 
  e.id as educator_id,
  d.file_type,
  d.file_url
FROM educator_details e
LEFT JOIN document_storage d ON e.user_id = d.user_id
LIMIT 5;

-- Test 3: Insert/Update operations work
SELECT 'Testing database operations...' as test_phase;

-- Try to insert a test record (will rollback)
BEGIN;
  INSERT INTO users_universal (email, user_code, account_type, role)
  VALUES ('test@example.com', 'TEST001', 'educator', 'tutor');
  
  SELECT 'Insert operation: SUCCESS' as test_result;
ROLLBACK;

-- Test 4: Check for any broken views or functions
SELECT 'Testing database objects...' as test_phase;

-- List any views that might reference old table names
SELECT 
  schemaname,
  viewname,
  definition
FROM pg_views 
WHERE schemaname = 'public'
  AND definition LIKE '%t_[0-9]%';

-- List any functions that might reference old table names
SELECT 
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND pg_get_functiondef(p.oid) LIKE '%t_[0-9]%';

SELECT 'Database operation tests completed!' as final_status;