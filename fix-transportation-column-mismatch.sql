-- ===== FIX TRANSPORTATION COLUMN MISMATCH =====
-- Script untuk memperbaiki mismatch kolom transportation_method vs transportation_methods
-- di tabel t_315_03_01_tutor_availability_config
--
-- MASALAH: Code menggunakan 'transportation_methods' tapi database punya 'transportation_method'
-- SOLUSI: Rename kolom database untuk match dengan code

-- STEP 1: Check current table structure
DO $$
BEGIN
    RAISE NOTICE '=== CHECKING CURRENT TABLE STRUCTURE ===';
    
    -- List current columns
    RAISE NOTICE 'Current columns in t_315_03_01_tutor_availability_config:';
    FOR col IN 
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 't_315_03_01_tutor_availability_config'
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE '- %: % (%)', col.column_name, col.data_type, 
                     CASE WHEN col.is_nullable = 'YES' THEN 'nullable' ELSE 'not null' END;
    END LOOP;
END $$;

-- STEP 2: Check if transportation_method column exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 't_315_03_01_tutor_availability_config' 
        AND column_name = 'transportation_method'
    ) THEN
        RAISE NOTICE '✓ Found transportation_method column (singular) - akan direname';
    ELSE
        RAISE NOTICE '✗ transportation_method column not found';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 't_315_03_01_tutor_availability_config' 
        AND column_name = 'transportation_methods'
    ) THEN
        RAISE NOTICE '✓ Found transportation_methods column (plural) - already correct';
    ELSE
        RAISE NOTICE '✗ transportation_methods column not found - will be created';
    END IF;
END $$;

-- STEP 3: Rename column from transportation_method to transportation_methods
DO $$
BEGIN
    -- Check if old column exists and new column doesn't exist
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 't_315_03_01_tutor_availability_config' 
        AND column_name = 'transportation_method'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 't_315_03_01_tutor_availability_config' 
        AND column_name = 'transportation_methods'
    ) THEN
        -- Rename column
        ALTER TABLE t_315_03_01_tutor_availability_config 
            RENAME COLUMN transportation_method TO transportation_methods;
        
        RAISE NOTICE '✅ Successfully renamed transportation_method → transportation_methods';
    
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 't_315_03_01_tutor_availability_config' 
        AND column_name = 'transportation_methods'
    ) THEN
        RAISE NOTICE '✅ Column transportation_methods already exists - no action needed';
        
    ELSE
        -- Neither column exists, create the correct one
        ALTER TABLE t_315_03_01_tutor_availability_config 
            ADD COLUMN transportation_methods TEXT[];
        
        RAISE NOTICE '✅ Created new transportation_methods column';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error renaming transportation column: %', SQLERRM;
END $$;

-- STEP 4: Verify the change
DO $$
DECLARE
    col_exists BOOLEAN;
    col_type TEXT;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 't_315_03_01_tutor_availability_config' 
        AND column_name = 'transportation_methods'
    ), 
    (SELECT data_type FROM information_schema.columns 
     WHERE table_name = 't_315_03_01_tutor_availability_config' 
     AND column_name = 'transportation_methods' LIMIT 1)
    INTO col_exists, col_type;
    
    IF col_exists THEN
        RAISE NOTICE '✅ VERIFICATION: transportation_methods column exists with type: %', col_type;
    ELSE
        RAISE EXCEPTION '❌ VERIFICATION FAILED: transportation_methods column not found!';
    END IF;
END $$;

-- STEP 5: Check for other potential column mismatches
DO $$
BEGIN
    RAISE NOTICE '=== CHECKING FOR OTHER POTENTIAL COLUMN MISMATCHES ===';
    
    -- Check if there are other columns that might have singular/plural issues
    -- Based on the pattern in the code, these columns might be arrays/multiple values
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 't_315_03_01_tutor_availability_config' 
        AND column_name = 'teaching_methods'
    ) THEN
        RAISE WARNING '⚠️  Column teaching_methods not found - might cause similar error';
    ELSE
        RAISE NOTICE '✓ teaching_methods column exists';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 't_315_03_01_tutor_availability_config' 
        AND column_name = 'available_schedule'
    ) THEN
        RAISE WARNING '⚠️  Column available_schedule not found - might cause similar error';
    ELSE
        RAISE NOTICE '✓ available_schedule column exists';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 't_315_03_01_tutor_availability_config' 
        AND column_name = 'target_student_ages'
    ) THEN
        RAISE WARNING '⚠️  Column target_student_ages not found - might cause similar error';
    ELSE
        RAISE NOTICE '✓ target_student_ages column exists';
    END IF;
END $$;

-- STEP 6: Update column comments for clarity
COMMENT ON COLUMN t_315_03_01_tutor_availability_config.transportation_methods IS 
'Array of transportation methods available to the tutor (e.g., ["motor", "mobil", "online"])';

-- STEP 7: Show final table structure
DO $$
DECLARE
    col RECORD;
BEGIN
    RAISE NOTICE '=== FINAL TABLE STRUCTURE ===';
    RAISE NOTICE 'Updated columns in t_315_03_01_tutor_availability_config:';
    
    FOR col IN 
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 't_315_03_01_tutor_availability_config'
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE '- %: % (%) default: %', 
                     col.column_name, 
                     col.data_type, 
                     CASE WHEN col.is_nullable = 'YES' THEN 'nullable' ELSE 'not null' END,
                     COALESCE(col.column_default, 'none');
    END LOOP;
END $$;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 SUCCESS: Transportation column mismatch berhasil diperbaiki!';
    RAISE NOTICE '✅ transportation_method → transportation_methods';
    RAISE NOTICE '🔧 Code sekarang akan bisa insert data ke availability config';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Next: Test create educator untuk memastikan tidak ada error lagi';
END $$;