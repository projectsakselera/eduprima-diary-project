-- ===== SETUP CASCADE DELETE CONSTRAINTS =====
-- Script untuk mengkonfigurasikan CASCADE DELETE sesuai SUPABASE-CASCADE-DOCUMENTATION.json
-- 
-- ⚠️ BACKUP DATABASE DULU SEBELUM MENJALANKAN SCRIPT INI!
-- 
-- Jalankan script ini di Supabase SQL Editor

-- Step 1: Check existing constraints
DO $$
BEGIN
    RAISE NOTICE '🔍 CHECKING CURRENT CASCADE STATUS...';
END $$;

-- View current constraints
SELECT 
    tc.table_name AS child_table,
    kcu.column_name AS fk_column,
    ccu.table_name AS parent_table,
    rc.delete_rule,
    CASE 
        WHEN rc.delete_rule = 'CASCADE' THEN '✅ CASCADE'
        ELSE '❌ ' || rc.delete_rule
    END as status
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
    JOIN information_schema.referential_constraints AS rc
      ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND (
        ccu.table_name = 't_310_01_01_users_universal'
        OR ccu.table_name = 't_315_01_01_educator_details'
    )
ORDER BY parent_table, child_table;

-- Step 2: Setup CASCADE for users_universal child tables
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔧 SETTING UP CASCADE FOR USERS_UNIVERSAL CHILD TABLES...';
END $$;

-- 1. user_profiles
ALTER TABLE t_310_01_02_user_profiles
DROP CONSTRAINT IF EXISTS fk_user_profiles_user_id CASCADE,
ADD CONSTRAINT fk_user_profiles_user_id 
FOREIGN KEY (user_id) REFERENCES t_310_01_01_users_universal(id) 
ON DELETE CASCADE;

-- 2. user_addresses  
ALTER TABLE t_310_01_03_user_addresses
DROP CONSTRAINT IF EXISTS fk_user_addresses_user_id CASCADE,
DROP CONSTRAINT IF EXISTS t_310_01_03_user_addresses_user_id_fkey CASCADE,
ADD CONSTRAINT fk_user_addresses_user_id 
FOREIGN KEY (user_id) REFERENCES t_310_01_01_users_universal(id) 
ON DELETE CASCADE;

-- 3. user_demographics
ALTER TABLE t_380_01_01_user_demographics
DROP CONSTRAINT IF EXISTS fk_user_demographics_user_id CASCADE,
ADD CONSTRAINT fk_user_demographics_user_id 
FOREIGN KEY (user_id) REFERENCES t_310_01_01_users_universal(id) 
ON DELETE CASCADE;

-- 4. tutor_management
ALTER TABLE t_315_02_01_tutor_management
DROP CONSTRAINT IF EXISTS fk_tutor_management_user_id CASCADE,
ADD CONSTRAINT fk_tutor_management_user_id 
FOREIGN KEY (user_id) REFERENCES t_310_01_01_users_universal(id) 
ON DELETE CASCADE;

-- 5. document_storage
ALTER TABLE document_storage
DROP CONSTRAINT IF EXISTS fk_document_storage_user_id CASCADE,
ADD CONSTRAINT fk_document_storage_user_id 
FOREIGN KEY (user_id) REFERENCES t_310_01_01_users_universal(id) 
ON DELETE CASCADE;

-- 6. educator_details
ALTER TABLE t_315_01_01_educator_details
DROP CONSTRAINT IF EXISTS fk_educator_details_user_id CASCADE,
ADD CONSTRAINT fk_educator_details_user_id 
FOREIGN KEY (user_id) REFERENCES t_310_01_01_users_universal(id) 
ON DELETE CASCADE;

-- Step 3: Setup CASCADE for educator_details child tables
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔧 SETTING UP CASCADE FOR EDUCATOR_DETAILS CHILD TABLES...';
END $$;

-- 1. availability_config
ALTER TABLE t_315_03_01_tutor_availability_config
DROP CONSTRAINT IF EXISTS fk_availability_config_educator_id CASCADE,
ADD CONSTRAINT fk_availability_config_educator_id 
FOREIGN KEY (educator_id) REFERENCES t_315_01_01_educator_details(id) 
ON DELETE CASCADE;

-- 2. teaching_preferences
ALTER TABLE t_315_04_01_tutor_teaching_preferences
DROP CONSTRAINT IF EXISTS fk_teaching_preferences_educator_id CASCADE,
ADD CONSTRAINT fk_teaching_preferences_educator_id 
FOREIGN KEY (educator_id) REFERENCES t_315_01_01_educator_details(id) 
ON DELETE CASCADE;

-- 3. personality_traits
ALTER TABLE t_315_05_01_tutor_personality_traits
DROP CONSTRAINT IF EXISTS fk_personality_traits_educator_id CASCADE,
ADD CONSTRAINT fk_personality_traits_educator_id 
FOREIGN KEY (educator_id) REFERENCES t_315_01_01_educator_details(id) 
ON DELETE CASCADE;

-- 4. program_mappings
ALTER TABLE t_315_06_01_tutor_program_mappings
DROP CONSTRAINT IF EXISTS fk_program_mappings_educator_id CASCADE,
ADD CONSTRAINT fk_program_mappings_educator_id 
FOREIGN KEY (educator_id) REFERENCES t_315_01_01_educator_details(id) 
ON DELETE CASCADE;

-- 5. additional_subjects
ALTER TABLE t_315_07_01_tutor_additional_subjects
DROP CONSTRAINT IF EXISTS fk_additional_subjects_educator_id CASCADE,
ADD CONSTRAINT fk_additional_subjects_educator_id 
FOREIGN KEY (educator_id) REFERENCES t_315_01_01_educator_details(id) 
ON DELETE CASCADE;

-- 6. educator_banking_info
ALTER TABLE t_460_02_04_educator_banking_info
DROP CONSTRAINT IF EXISTS fk_educator_banking_info_educator_id CASCADE,
ADD CONSTRAINT fk_educator_banking_info_educator_id 
FOREIGN KEY (educator_id) REFERENCES t_315_01_01_educator_details(id) 
ON DELETE CASCADE;

-- Step 4: Verify CASCADE setup
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ CASCADE SETUP COMPLETED!';
    RAISE NOTICE '';
    RAISE NOTICE '🧪 VERIFYING CASCADE CONFIGURATION...';
END $$;

-- Final verification
SELECT 
    tc.table_name AS child_table,
    kcu.column_name AS fk_column,
    ccu.table_name AS parent_table,
    rc.delete_rule,
    CASE 
        WHEN rc.delete_rule = 'CASCADE' THEN '✅ CASCADE'
        ELSE '❌ ' || rc.delete_rule
    END as status
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
    JOIN information_schema.referential_constraints AS rc
      ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND (
        ccu.table_name = 't_310_01_01_users_universal'
        OR ccu.table_name = 't_315_01_01_educator_details'
    )
ORDER BY parent_table, child_table;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 CASCADE DELETE SETUP COMPLETE!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ All foreign key constraints now configured with ON DELETE CASCADE';
    RAISE NOTICE '🗑️ Safe to delete users - all related data will be automatically cleaned up';
    RAISE NOTICE '⚠️ Test with a sample user first before production use';
    RAISE NOTICE '';
END $$;