-- ===== FIX REMAINING CASCADE CONSTRAINTS =====
-- Script untuk fix constraint yang masih NO ACTION
-- Khusus untuk columns yang blocking user deletion
-- 
-- Jalankan script ini di Supabase SQL Editor

DO $$
BEGIN
    RAISE NOTICE '🔧 FIXING REMAINING NO ACTION CONSTRAINTS...';
    RAISE NOTICE '';
END $$;

-- Strategy: Set admin/audit columns to SET NULL instead of CASCADE
-- This preserves audit trail while allowing user deletion

-- 1. Fix t_310_01_03_user_addresses.verified_by
-- This should be SET NULL (keep verification record but remove user reference)
ALTER TABLE t_310_01_03_user_addresses
DROP CONSTRAINT IF EXISTS fk_user_addresses_verified_by CASCADE,
ADD CONSTRAINT fk_user_addresses_verified_by 
FOREIGN KEY (verified_by) REFERENCES t_310_01_01_users_universal(id) 
ON DELETE SET NULL;

-- 2. Fix t_315_02_01_tutor_management.status_changed_by  
-- This should be SET NULL (keep management record but remove admin reference)
ALTER TABLE t_315_02_01_tutor_management
DROP CONSTRAINT IF EXISTS fk_tutor_management_status_changed_by CASCADE,
ADD CONSTRAINT fk_tutor_management_status_changed_by 
FOREIGN KEY (status_changed_by) REFERENCES t_310_01_01_users_universal(id) 
ON DELETE SET NULL;

-- 3. Fix t_315_06_01_tutor_program_mappings.mapped_by
-- This should be SET NULL (keep mapping record but remove admin reference)
ALTER TABLE t_315_06_01_tutor_program_mappings
DROP CONSTRAINT IF EXISTS fk_program_mappings_mapped_by CASCADE,
ADD CONSTRAINT fk_program_mappings_mapped_by 
FOREIGN KEY (mapped_by) REFERENCES t_310_01_01_users_universal(id) 
ON DELETE SET NULL;

-- 4. Fix t_315_07_01_tutor_additional_subjects.approved_by
-- This should be SET NULL (keep subject record but remove admin reference)
ALTER TABLE t_315_07_01_tutor_additional_subjects
DROP CONSTRAINT IF EXISTS fk_additional_subjects_approved_by CASCADE,
ADD CONSTRAINT fk_additional_subjects_approved_by 
FOREIGN KEY (approved_by) REFERENCES t_310_01_01_users_universal(id) 
ON DELETE SET NULL;

-- 5. Fix t_460_03_01_document_storage.verified_by
-- This should be SET NULL (keep document record but remove admin reference)
ALTER TABLE t_460_03_01_document_storage
DROP CONSTRAINT IF EXISTS fk_document_storage_verified_by CASCADE,
ADD CONSTRAINT fk_document_storage_verified_by 
FOREIGN KEY (verified_by) REFERENCES t_310_01_01_users_universal(id) 
ON DELETE SET NULL;

-- 6. Clean up any duplicate constraints for primary user_id columns
-- Ensure main user_id relationships are CASCADE

-- Double-check t_315_02_01_tutor_management.user_id is CASCADE
-- (This was the specific constraint blocking deletion)
DO $$
BEGIN
    -- Drop all existing constraints on user_id column
    PERFORM 1 FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 't_315_02_01_tutor_management'
    AND kcu.column_name = 'user_id'
    AND tc.constraint_type = 'FOREIGN KEY';
    
    IF FOUND THEN
        RAISE NOTICE '🔧 Cleaning up t_315_02_01_tutor_management.user_id constraints...';
        
        -- Drop any existing user_id constraints
        ALTER TABLE t_315_02_01_tutor_management DROP CONSTRAINT IF EXISTS fk_tutor_management_user_id CASCADE;
        ALTER TABLE t_315_02_01_tutor_management DROP CONSTRAINT IF EXISTS t_315_02_01_tutor_management_user_id_fkey CASCADE;
        
        -- Add proper CASCADE constraint
        ALTER TABLE t_315_02_01_tutor_management
        ADD CONSTRAINT fk_tutor_management_user_id 
        FOREIGN KEY (user_id) REFERENCES t_310_01_01_users_universal(id) 
        ON DELETE CASCADE;
        
        RAISE NOTICE '✅ Fixed t_315_02_01_tutor_management.user_id constraint';
    END IF;
END $$;

-- 7. Final verification
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ CONSTRAINTS FIXED!';
    RAISE NOTICE '';
    RAISE NOTICE '📋 SUMMARY:';
    RAISE NOTICE '• Primary user_id columns: CASCADE (deletes related records)';
    RAISE NOTICE '• Admin/audit columns: SET NULL (preserves audit trail)';
    RAISE NOTICE '';
    RAISE NOTICE '🧪 Run verification query to confirm all constraints:';
END $$;

-- Verification query - run this to check results
SELECT 
    tc.table_name AS child_table,
    kcu.column_name AS fk_column,
    ccu.table_name AS parent_table,
    rc.delete_rule,
    CASE 
        WHEN rc.delete_rule = 'CASCADE' THEN '✅ CASCADE'
        WHEN rc.delete_rule = 'SET NULL' THEN '✅ SET NULL'
        ELSE '❌ ' || rc.delete_rule
    END as status,
    CASE 
        WHEN kcu.column_name LIKE '%_by' OR kcu.column_name = 'verified_by' THEN 'Admin/Audit'
        WHEN kcu.column_name = 'user_id' THEN 'Primary User'
        WHEN kcu.column_name = 'educator_id' THEN 'Primary Educator'
        ELSE 'Other'
    END as column_type
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
    AND (
        rc.delete_rule = 'NO ACTION' 
        OR rc.delete_rule = 'RESTRICT'
    )
ORDER BY parent_table, child_table, column_type;

-- This query should return NO ROWS if all constraints are properly configured

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎯 If the verification query above returns NO ROWS,';
    RAISE NOTICE '   then all constraints are properly configured!';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Ready to test user deletion with proper CASCADE behavior';
END $$;