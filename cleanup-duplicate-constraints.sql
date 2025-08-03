-- ===== CLEANUP DUPLICATE CONSTRAINTS =====
-- Script untuk cleanup constraint yang duplicate dan conflicting
-- Khusus untuk primary user_id columns yang harus CASCADE
-- 
-- Jalankan script ini di Supabase SQL Editor

DO $$
BEGIN
    RAISE NOTICE '🧹 CLEANING UP DUPLICATE CONSTRAINTS...';
    RAISE NOTICE '';
END $$;

-- Strategy: Drop ALL existing constraints for primary columns, then recreate with proper CASCADE

-- 1. Clean up t_315_02_01_tutor_management.user_id (main blocker)
DO $$
DECLARE
    constraint_rec RECORD;
BEGIN
    RAISE NOTICE '🔧 Cleaning t_315_02_01_tutor_management.user_id constraints...';
    
    -- Find all constraints on user_id column
    FOR constraint_rec IN 
        SELECT tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 't_315_02_01_tutor_management'
        AND kcu.column_name = 'user_id'
        AND tc.constraint_type = 'FOREIGN KEY'
    LOOP
        RAISE NOTICE '  • Dropping constraint: %', constraint_rec.constraint_name;
        EXECUTE format('ALTER TABLE t_315_02_01_tutor_management DROP CONSTRAINT IF EXISTS %I CASCADE', constraint_rec.constraint_name);
    END LOOP;
    
    -- Create single CASCADE constraint
    ALTER TABLE t_315_02_01_tutor_management
    ADD CONSTRAINT fk_tutor_management_user_id_cascade 
    FOREIGN KEY (user_id) REFERENCES t_310_01_01_users_universal(id) 
    ON DELETE CASCADE;
    
    RAISE NOTICE '✅ Fixed t_315_02_01_tutor_management.user_id -> CASCADE';
END $$;

-- 2. Clean up other primary columns that might have duplicates
DO $$
DECLARE
    constraint_rec RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔧 Cleaning other potential duplicate constraints...';
    
    -- Clean t_310_01_02_user_profiles.user_id
    FOR constraint_rec IN 
        SELECT tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 't_310_01_02_user_profiles'
        AND kcu.column_name = 'user_id'
        AND tc.constraint_type = 'FOREIGN KEY'
    LOOP
        EXECUTE format('ALTER TABLE t_310_01_02_user_profiles DROP CONSTRAINT IF EXISTS %I CASCADE', constraint_rec.constraint_name);
    END LOOP;
    
    ALTER TABLE t_310_01_02_user_profiles
    ADD CONSTRAINT fk_user_profiles_user_id_cascade 
    FOREIGN KEY (user_id) REFERENCES t_310_01_01_users_universal(id) 
    ON DELETE CASCADE;
    
    -- Clean t_310_01_03_user_addresses.user_id
    FOR constraint_rec IN 
        SELECT tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 't_310_01_03_user_addresses'
        AND kcu.column_name = 'user_id'
        AND tc.constraint_type = 'FOREIGN KEY'
    LOOP
        EXECUTE format('ALTER TABLE t_310_01_03_user_addresses DROP CONSTRAINT IF EXISTS %I CASCADE', constraint_rec.constraint_name);
    END LOOP;
    
    ALTER TABLE t_310_01_03_user_addresses
    ADD CONSTRAINT fk_user_addresses_user_id_cascade 
    FOREIGN KEY (user_id) REFERENCES t_310_01_01_users_universal(id) 
    ON DELETE CASCADE;
    
    -- Clean t_315_01_01_educator_details.user_id
    FOR constraint_rec IN 
        SELECT tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 't_315_01_01_educator_details'
        AND kcu.column_name = 'user_id'
        AND tc.constraint_type = 'FOREIGN KEY'
    LOOP
        EXECUTE format('ALTER TABLE t_315_01_01_educator_details DROP CONSTRAINT IF EXISTS %I CASCADE', constraint_rec.constraint_name);
    END LOOP;
    
    ALTER TABLE t_315_01_01_educator_details
    ADD CONSTRAINT fk_educator_details_user_id_cascade 
    FOREIGN KEY (user_id) REFERENCES t_310_01_01_users_universal(id) 
    ON DELETE CASCADE;
    
    -- Clean t_460_03_01_document_storage.user_id
    FOR constraint_rec IN 
        SELECT tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 't_460_03_01_document_storage'
        AND kcu.column_name = 'user_id'
        AND tc.constraint_type = 'FOREIGN KEY'
    LOOP
        EXECUTE format('ALTER TABLE t_460_03_01_document_storage DROP CONSTRAINT IF EXISTS %I CASCADE', constraint_rec.constraint_name);
    END LOOP;
    
    ALTER TABLE t_460_03_01_document_storage
    ADD CONSTRAINT fk_document_storage_user_id_cascade 
    FOREIGN KEY (user_id) REFERENCES t_310_01_01_users_universal(id) 
    ON DELETE CASCADE;
    
    -- Clean t_380_01_01_user_demographics.user_id
    FOR constraint_rec IN 
        SELECT tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 't_380_01_01_user_demographics'
        AND kcu.column_name = 'user_id'
        AND tc.constraint_type = 'FOREIGN KEY'
    LOOP
        EXECUTE format('ALTER TABLE t_380_01_01_user_demographics DROP CONSTRAINT IF EXISTS %I CASCADE', constraint_rec.constraint_name);
    END LOOP;
    
    ALTER TABLE t_380_01_01_user_demographics
    ADD CONSTRAINT fk_user_demographics_user_id_cascade 
    FOREIGN KEY (user_id) REFERENCES t_310_01_01_users_universal(id) 
    ON DELETE CASCADE;
    
    RAISE NOTICE '✅ All primary user_id constraints cleaned and set to CASCADE';
END $$;

-- 3. Final verification - check for NO ACTION/RESTRICT on primary columns
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🧪 FINAL VERIFICATION...';
    RAISE NOTICE '';
END $$;

-- This should return NO ROWS for primary columns (user_id, educator_id)
SELECT 
    tc.table_name AS child_table,
    kcu.column_name AS fk_column,
    ccu.table_name AS parent_table,
    rc.delete_rule,
    '❌ BLOCKING DELETION' as issue
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
    AND ccu.table_name = 't_310_01_01_users_universal'
    AND kcu.column_name IN ('user_id', 'educator_id')  -- Primary columns only
    AND rc.delete_rule IN ('NO ACTION', 'RESTRICT')
ORDER BY child_table;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 CONSTRAINT CLEANUP COMPLETE!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ All primary user_id columns now have single CASCADE constraints';
    RAISE NOTICE '✅ Admin/audit columns remain SET NULL (preserving audit trail)';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Ready to test deletion - should work without constraint errors!';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  If verification query above returns NO ROWS, deletion is ready to work';
END $$;