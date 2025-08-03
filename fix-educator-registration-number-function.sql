-- ===== FIX EDUCATOR REGISTRATION NUMBER FUNCTION =====
-- Script untuk memperbaiki error "column reference country_year is ambiguous"
-- Format TRN: ID2500000 (CountryCode-Year-Sequential kelipatan 7)
-- 
-- Jalankan script ini di Supabase SQL Editor

-- 1. Drop existing functions jika ada (untuk clean slate)
DROP FUNCTION IF EXISTS set_educator_registration_number() CASCADE;
DROP FUNCTION IF EXISTS generate_educator_registration_number() CASCADE;

-- 2. Create function untuk generate educator registration number
CREATE OR REPLACE FUNCTION generate_educator_registration_number()
RETURNS TEXT
LANGUAGE plpgsql
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
    
    -- Get atau create sequence untuk country_year ini
    -- Menggunakan alias 'seq' untuk menghindari ambiguous column reference
    SELECT seq.current_sequence INTO next_sequence
    FROM t_315_01_02_educator_sequences seq
    WHERE seq.country_year = country_year_key;
    
    -- Jika belum ada record untuk country_year ini, buat yang baru
    IF next_sequence IS NULL THEN
        next_sequence := 0;
        
        INSERT INTO t_315_01_02_educator_sequences (country_year, current_sequence)
        VALUES (country_year_key, next_sequence)
        ON CONFLICT (country_year) DO NOTHING;
    END IF;
    
    -- Increment sequence dengan kelipatan 7
    next_sequence := next_sequence + 7;
    
    -- Update sequence di database menggunakan alias untuk avoid ambiguity
    UPDATE t_315_01_02_educator_sequences seq
    SET 
        current_sequence = next_sequence,
        updated_at = NOW()
    WHERE seq.country_year = country_year_key;
    
    -- Format registration number: ID2500000, ID2500007, ID2500014, dst
    registration_number := country_year_key || LPAD(next_sequence::TEXT, 5, '0');
    
    RETURN registration_number;
END;
$$;

-- 3. Create trigger function untuk set educator registration number
CREATE OR REPLACE FUNCTION set_educator_registration_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Hanya generate TRN jika educator_registration_number NULL atau empty
    IF NEW.educator_registration_number IS NULL OR NEW.educator_registration_number = '' THEN
        NEW.educator_registration_number := generate_educator_registration_number();
    END IF;
    
    RETURN NEW;
END;
$$;

-- 4. Recreate trigger pada tabel educator_details
DROP TRIGGER IF EXISTS tr_educator_registration_number ON t_315_01_01_educator_details;

CREATE TRIGGER tr_educator_registration_number
    BEFORE INSERT ON t_315_01_01_educator_details
    FOR EACH ROW
    EXECUTE FUNCTION set_educator_registration_number();

-- 5. Ensure tabel t_315_01_02_educator_sequences memiliki unique constraint
-- dan primary key yang benar (jika belum ada)
DO $$
BEGIN
    -- Add unique constraint pada country_year jika belum ada
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'educator_sequences_country_year_key' 
        AND table_name = 't_315_01_02_educator_sequences'
    ) THEN
        ALTER TABLE t_315_01_02_educator_sequences 
        ADD CONSTRAINT educator_sequences_country_year_key UNIQUE (country_year);
    END IF;
END $$;

-- 6. Insert initial data untuk tahun 2025 (jika belum ada)
INSERT INTO t_315_01_02_educator_sequences (country_year, current_sequence)
VALUES ('ID25', 0)
ON CONFLICT (country_year) DO NOTHING;

-- 7. Test function (optional - comment out setelah testing)
-- SELECT generate_educator_registration_number() as test_ern_1;
-- SELECT generate_educator_registration_number() as test_ern_2;
-- SELECT generate_educator_registration_number() as test_ern_3;

-- 8. Verify hasil test
-- SELECT * FROM t_315_01_02_educator_sequences WHERE country_year = 'ID25';

COMMENT ON FUNCTION generate_educator_registration_number() IS 
'Generate unique educator registration number dengan format: CountryCode+Year+Sequential(kelipatan 7). Contoh: ID2500000, ID2500007, ID2500014';

COMMENT ON FUNCTION set_educator_registration_number() IS 
'Trigger function untuk auto-generate educator registration number jika NULL saat INSERT ke t_315_01_01_educator_details';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'SUCCESS: Educator Registration Number functions berhasil diperbaiki!';
    RAISE NOTICE 'Format TRN: ID2500000, ID2500007, ID2500014, dst (kelipatan 7)';
    RAISE NOTICE 'Trigger akan otomatis generate TRN saat INSERT ke educator_details';
END $$;