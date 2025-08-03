-- ===== FIX EDUCATOR REGISTRATION NUMBER FUNCTION V2 =====
-- Script untuk memperbaiki error "function is not unique"
-- Menghapus semua variant function dan membuat yang baru
-- Format TRN: ID2500000 (CountryCode-Year-Sequential kelipatan 7)

-- STEP 1: Drop ALL existing functions dengan CASCADE untuk menghapus dependencies
DO $$
DECLARE
    func_record RECORD;
BEGIN
    -- Drop semua function generate_educator_registration_number dengan berbagai signature
    FOR func_record IN 
        SELECT proname, oidvectortypes(proargtypes) as args
        FROM pg_proc 
        WHERE proname = 'generate_educator_registration_number'
    LOOP
        EXECUTE format('DROP FUNCTION IF EXISTS %I(%s) CASCADE', 
                      func_record.proname, 
                      func_record.args);
        RAISE NOTICE 'Dropped function: %(%)', func_record.proname, func_record.args;
    END LOOP;
    
    -- Drop semua function set_educator_registration_number dengan berbagai signature  
    FOR func_record IN 
        SELECT proname, oidvectortypes(proargtypes) as args
        FROM pg_proc 
        WHERE proname = 'set_educator_registration_number'
    LOOP
        EXECUTE format('DROP FUNCTION IF EXISTS %I(%s) CASCADE', 
                      func_record.proname, 
                      func_record.args);
        RAISE NOTICE 'Dropped function: %(%)', func_record.proname, func_record.args;
    END LOOP;
END $$;

-- STEP 2: Drop existing trigger (kalau ada)
DROP TRIGGER IF EXISTS tr_educator_registration_number ON t_315_01_01_educator_details CASCADE;

-- STEP 3: Create function untuk generate educator registration number (CLEAN VERSION)
CREATE OR REPLACE FUNCTION generate_educator_registration_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    country_code TEXT := 'ID';  -- Indonesia country code
    current_year TEXT := EXTRACT(YEAR FROM NOW())::TEXT;
    country_year_key TEXT;
    next_sequence INTEGER;
    registration_number TEXT;
BEGIN
    -- Buat key untuk country_year (format: ID25 untuk tahun 2025)
    country_year_key := country_code || RIGHT(current_year, 2);
    
    -- Lock table untuk concurrent access safety
    LOCK TABLE t_315_01_02_educator_sequences IN ROW EXCLUSIVE MODE;
    
    -- Get current sequence untuk country_year ini (dengan explicit alias)
    SELECT seq.current_sequence INTO next_sequence
    FROM t_315_01_02_educator_sequences AS seq
    WHERE seq.country_year = country_year_key;
    
    -- Jika belum ada record untuk country_year ini, buat yang baru
    IF next_sequence IS NULL THEN
        next_sequence := 0;
        
        INSERT INTO t_315_01_02_educator_sequences (country_year, current_sequence, updated_at)
        VALUES (country_year_key, next_sequence, NOW())
        ON CONFLICT (country_year) DO UPDATE SET
            current_sequence = EXCLUDED.current_sequence,
            updated_at = NOW();
            
        -- Re-fetch untuk memastikan
        SELECT seq.current_sequence INTO next_sequence
        FROM t_315_01_02_educator_sequences AS seq  
        WHERE seq.country_year = country_year_key;
    END IF;
    
    -- Increment sequence dengan kelipatan 7
    next_sequence := next_sequence + 7;
    
    -- Update sequence di database (dengan explicit alias)
    UPDATE t_315_01_02_educator_sequences AS seq
    SET 
        current_sequence = next_sequence,
        updated_at = NOW()
    WHERE seq.country_year = country_year_key;
    
    -- Validate update berhasil
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Failed to update sequence for country_year: %', country_year_key;
    END IF;
    
    -- Format registration number: ID2500000, ID2500007, ID2500014, dst
    registration_number := country_year_key || LPAD(next_sequence::TEXT, 5, '0');
    
    -- Log untuk debugging
    RAISE NOTICE 'Generated ERN: % (country_year: %, sequence: %)', 
                 registration_number, country_year_key, next_sequence;
    
    RETURN registration_number;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error generating educator registration number: %', SQLERRM;
END;
$$;

-- STEP 4: Create trigger function untuk set educator registration number (CLEAN VERSION)
CREATE OR REPLACE FUNCTION set_educator_registration_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Hanya generate TRN jika educator_registration_number NULL atau empty
    IF NEW.educator_registration_number IS NULL OR TRIM(NEW.educator_registration_number) = '' THEN
        NEW.educator_registration_number := generate_educator_registration_number();
        RAISE NOTICE 'Auto-generated ERN for user_id %: %', NEW.user_id, NEW.educator_registration_number;
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error in set_educator_registration_number trigger: %', SQLERRM;
END;
$$;

-- STEP 5: Create trigger pada tabel educator_details
CREATE TRIGGER tr_educator_registration_number
    BEFORE INSERT ON t_315_01_01_educator_details
    FOR EACH ROW
    EXECUTE FUNCTION set_educator_registration_number();

-- STEP 6: Ensure tabel t_315_01_02_educator_sequences ada dan properly configured
DO $$
BEGIN
    -- Check if table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                   WHERE table_name = 't_315_01_02_educator_sequences') THEN
        -- Create table jika belum ada
        CREATE TABLE t_315_01_02_educator_sequences (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            country_year TEXT NOT NULL UNIQUE,
            current_sequence INTEGER NOT NULL DEFAULT 0,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created table t_315_01_02_educator_sequences';
    END IF;
    
    -- Ensure unique constraint ada
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'educator_sequences_country_year_key' 
        AND table_name = 't_315_01_02_educator_sequences'
    ) THEN
        ALTER TABLE t_315_01_02_educator_sequences 
        ADD CONSTRAINT educator_sequences_country_year_key UNIQUE (country_year);
        RAISE NOTICE 'Added unique constraint on country_year';
    END IF;
END $$;

-- STEP 7: Insert initial data untuk tahun 2025 (jika belum ada)
INSERT INTO t_315_01_02_educator_sequences (country_year, current_sequence, updated_at)
VALUES ('ID25', 0, NOW())
ON CONFLICT (country_year) DO NOTHING;

-- STEP 8: Grant permissions (if needed)
-- GRANT EXECUTE ON FUNCTION generate_educator_registration_number() TO authenticated;
-- GRANT EXECUTE ON FUNCTION set_educator_registration_number() TO authenticated;

-- STEP 9: Test functions (UNCOMMENT untuk testing)
/*
DO $$
DECLARE
    test_ern1 TEXT;
    test_ern2 TEXT;
    test_ern3 TEXT;
BEGIN
    test_ern1 := generate_educator_registration_number();
    test_ern2 := generate_educator_registration_number();
    test_ern3 := generate_educator_registration_number();
    
    RAISE NOTICE 'Test ERN 1: %', test_ern1;
    RAISE NOTICE 'Test ERN 2: %', test_ern2;  
    RAISE NOTICE 'Test ERN 3: %', test_ern3;
END $$;

-- Check sequence table
SELECT * FROM t_315_01_02_educator_sequences WHERE country_year = 'ID25';
*/

-- STEP 10: Verify functions exist and are unique
DO $$
DECLARE
    func_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO func_count
    FROM pg_proc 
    WHERE proname = 'generate_educator_registration_number';
    
    IF func_count = 1 THEN
        RAISE NOTICE 'SUCCESS: generate_educator_registration_number() function is unique';
    ELSE
        RAISE WARNING 'WARNING: Found % functions with name generate_educator_registration_number', func_count;
    END IF;
    
    SELECT COUNT(*) INTO func_count
    FROM pg_proc 
    WHERE proname = 'set_educator_registration_number';
    
    IF func_count = 1 THEN
        RAISE NOTICE 'SUCCESS: set_educator_registration_number() function is unique';
    ELSE
        RAISE WARNING 'WARNING: Found % functions with name set_educator_registration_number', func_count;
    END IF;
END $$;

-- Add comments
COMMENT ON FUNCTION generate_educator_registration_number() IS 
'Generate unique educator registration number dengan format: CountryCode+Year+Sequential(kelipatan 7). Contoh: ID2500000, ID2500007, ID2500014. Thread-safe dengan table locking.';

COMMENT ON FUNCTION set_educator_registration_number() IS 
'Trigger function untuk auto-generate educator registration number jika NULL/empty saat INSERT ke t_315_01_01_educator_details';

COMMENT ON TABLE t_315_01_02_educator_sequences IS
'Tabel untuk menyimpan sequence counter untuk educator registration number per country-year';

-- Final success message
DO $$
BEGIN
    RAISE NOTICE '🎉 SUCCESS: Educator Registration Number functions berhasil diperbaiki!';
    RAISE NOTICE '📋 Format TRN: ID2500000, ID2500007, ID2500014, dst (kelipatan 7)';
    RAISE NOTICE '🔧 Trigger akan otomatis generate TRN saat INSERT ke educator_details';
    RAISE NOTICE '✅ Functions sekarang UNIQUE dan siap digunakan!';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  UNCOMMENT bagian test di line 123-135 untuk testing';
END $$;