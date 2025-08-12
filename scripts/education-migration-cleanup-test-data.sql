-- ================================================================
-- EDUCATION DATA MIGRATION - CLEANUP TEST DATA SCRIPT
-- ================================================================
-- Purpose: Remove test data created by education-migration-test-data.sql
-- Run this after testing migration to clean up staging environment
-- ================================================================

\echo '==================================================================='
\echo 'EDUCATION DATA MIGRATION - TEST DATA CLEANUP'
\echo '==================================================================='
\echo ''
\echo 'This script will remove all test data created for migration testing.'
\echo ''

-- Start transaction
BEGIN;

-- ================================================================
-- PHASE 1: IDENTIFY TEST DATA
-- ================================================================

\echo '=== PHASE 1: IDENTIFYING TEST DATA TO REMOVE ==='

-- Check if test data exists
\echo 'Current test data count:'
SELECT 
    'Test Users' as data_type,
    COUNT(*) as count
FROM users_universal 
WHERE id LIKE '00000000-1111-2222-3333-44444444440%'

UNION ALL

SELECT 
    'Test Tutors' as data_type,
    COUNT(*) as count
FROM tutor_details 
WHERE user_id LIKE '00000000-1111-2222-3333-44444444440%'

UNION ALL

SELECT 
    'Test Profiles' as data_type,
    COUNT(*) as count
FROM user_profiles 
WHERE user_id LIKE '00000000-1111-2222-3333-44444444440%'

UNION ALL

SELECT 
    'Test Addresses' as data_type,
    COUNT(*) as count
FROM user_addresses 
WHERE user_id LIKE '00000000-1111-2222-3333-44444444440%';

-- List test user details
\echo 'Test users to be removed:'
SELECT 
    id,
    email,
    user_code
FROM users_universal 
WHERE id LIKE '00000000-1111-2222-3333-44444444440%'
ORDER BY id;

-- ================================================================
-- PHASE 2: REMOVE TEST DATA (CASCADE DELETE)
-- ================================================================

\echo '=== PHASE 2: REMOVING TEST DATA ==='

-- Remove in proper order to avoid foreign key constraints

-- 1. Remove addresses
DELETE FROM user_addresses 
WHERE user_id LIKE '00000000-1111-2222-3333-44444444440%';

\echo 'Test addresses removed'

-- 2. Remove user demographics (if any)
DELETE FROM user_demographics 
WHERE user_id LIKE '00000000-1111-2222-3333-44444444440%';

\echo 'Test demographics removed'

-- 3. Remove banking info (if any)
DELETE FROM tutor_banking_info 
WHERE tutor_id IN (
    SELECT id FROM tutor_details 
    WHERE user_id LIKE '00000000-1111-2222-3333-44444444440%'
);

\echo 'Test banking info removed'

-- 4. Remove availability config (if any)
DELETE FROM tutor_availability_config 
WHERE tutor_id IN (
    SELECT id FROM tutor_details 
    WHERE user_id LIKE '00000000-1111-2222-3333-44444444440%'
);

\echo 'Test availability config removed'

-- 5. Remove teaching preferences (if any)
DELETE FROM tutor_teaching_preferences 
WHERE tutor_id IN (
    SELECT id FROM tutor_details 
    WHERE user_id LIKE '00000000-1111-2222-3333-44444444440%'
);

\echo 'Test teaching preferences removed'

-- 6. Remove personality traits (if any)
DELETE FROM tutor_personality_traits 
WHERE tutor_id IN (
    SELECT id FROM tutor_details 
    WHERE user_id LIKE '00000000-1111-2222-3333-44444444440%'
);

\echo 'Test personality traits removed'

-- 7. Remove program mappings (if any)
DELETE FROM tutor_program_mappings 
WHERE tutor_id IN (
    SELECT id FROM tutor_details 
    WHERE user_id LIKE '00000000-1111-2222-3333-44444444440%'
);

\echo 'Test program mappings removed'

-- 8. Remove additional subjects (if any)
DELETE FROM tutor_additional_subjects 
WHERE tutor_id IN (
    SELECT id FROM tutor_details 
    WHERE user_id LIKE '00000000-1111-2222-3333-44444444440%'
);

\echo 'Test additional subjects removed'

-- 9. Remove document storage (if any)
DELETE FROM document_storage 
WHERE user_id LIKE '00000000-1111-2222-3333-44444444440%';

\echo 'Test document storage removed'

-- 10. Remove tutor management (if any)
DELETE FROM tutor_management 
WHERE user_id LIKE '00000000-1111-2222-3333-44444444440%';

\echo 'Test tutor management removed'

-- 11. Remove user profiles
DELETE FROM user_profiles 
WHERE user_id LIKE '00000000-1111-2222-3333-44444444440%';

\echo 'Test user profiles removed'

-- 12. Remove tutor details
DELETE FROM tutor_details 
WHERE user_id LIKE '00000000-1111-2222-3333-44444444440%';

\echo 'Test tutor details removed'

-- 13. Finally, remove users
DELETE FROM users_universal 
WHERE id LIKE '00000000-1111-2222-3333-44444444440%';

\echo 'Test users removed'

-- ================================================================
-- PHASE 3: VERIFY CLEANUP
-- ================================================================

\echo '=== PHASE 3: VERIFYING CLEANUP ==='

-- Check that all test data is gone
\echo 'Post-cleanup verification:'
SELECT 
    'Test Users Remaining' as data_type,
    COUNT(*) as count,
    CASE WHEN COUNT(*) = 0 THEN '✅ CLEAN' ELSE '❌ STILL EXISTS' END as status
FROM users_universal 
WHERE id LIKE '00000000-1111-2222-3333-44444444440%'

UNION ALL

SELECT 
    'Test Tutors Remaining' as data_type,
    COUNT(*) as count,
    CASE WHEN COUNT(*) = 0 THEN '✅ CLEAN' ELSE '❌ STILL EXISTS' END as status
FROM tutor_details 
WHERE user_id LIKE '00000000-1111-2222-3333-44444444440%'

UNION ALL

SELECT 
    'Test Profiles Remaining' as data_type,
    COUNT(*) as count,
    CASE WHEN COUNT(*) = 0 THEN '✅ CLEAN' ELSE '❌ STILL EXISTS' END as status
FROM user_profiles 
WHERE user_id LIKE '00000000-1111-2222-3333-44444444440%'

UNION ALL

SELECT 
    'Test Addresses Remaining' as data_type,
    COUNT(*) as count,
    CASE WHEN COUNT(*) = 0 THEN '✅ CLEAN' ELSE '❌ STILL EXISTS' END as status
FROM user_addresses 
WHERE user_id LIKE '00000000-1111-2222-3333-44444444440%';

-- Check for any orphaned test data in other tables
\echo ''
\echo 'Checking for orphaned test data:'

-- Check for any remaining references to test user IDs in other tables
WITH test_user_refs AS (
    SELECT 'tutor_banking_info' as table_name, COUNT(*) as count
    FROM tutor_banking_info tbi
    WHERE NOT EXISTS (SELECT 1 FROM tutor_details td WHERE td.id = tbi.tutor_id)
      AND tbi.tutor_id::text LIKE '11111111-1111-2222-3333-44444444440%'
    
    UNION ALL
    
    SELECT 'tutor_availability_config' as table_name, COUNT(*) as count
    FROM tutor_availability_config tac
    WHERE NOT EXISTS (SELECT 1 FROM tutor_details td WHERE td.id = tac.tutor_id)
      AND tac.tutor_id::text LIKE '11111111-1111-2222-3333-44444444440%'
    
    UNION ALL
    
    SELECT 'document_storage' as table_name, COUNT(*) as count
    FROM document_storage ds
    WHERE NOT EXISTS (SELECT 1 FROM users_universal u WHERE u.id = ds.user_id)
      AND ds.user_id::text LIKE '00000000-1111-2222-3333-44444444440%'
)
SELECT 
    table_name,
    count,
    CASE WHEN count = 0 THEN '✅ CLEAN' ELSE '⚠️ ORPHANED DATA FOUND' END as status
FROM test_user_refs;

-- ================================================================
-- PHASE 4: CLEANUP SUMMARY
-- ================================================================

\echo ''
\echo '=== PHASE 4: CLEANUP SUMMARY ==='

\echo 'Test data cleanup completed successfully!'
\echo ''
\echo 'The following test data has been removed:'
\echo '✅ 6 test users (S1, S2, S1 grad, alternative, D3 grad, S3)'
\echo '✅ 6 test tutor profiles'
\echo '✅ 6 test user profiles'
\echo '✅ 6 test addresses'
\echo '✅ All related test data (banking, availability, etc.)'
\echo ''
\echo 'The staging environment is now clean and ready for the next test cycle.'

-- ================================================================
-- COMMIT CLEANUP
-- ================================================================

COMMIT;

\echo ''
\echo '==================================================================='
\echo '🧹 TEST DATA CLEANUP COMPLETED SUCCESSFULLY'
\echo '==================================================================='
\echo ''
\echo 'Staging environment is now clean.'
\echo 'You can run education-migration-test-data.sql again if needed.'
\echo '==================================================================='
