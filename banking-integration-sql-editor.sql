-- ===========================================================
-- BANKING INTEGRATION - SQL EDITOR
-- Selesstia Database Banking System Enhancement
-- ===========================================================

-- ===========================================================
-- 1. CREATE INDONESIAN BANKS MASTER TABLE  
-- ===========================================================

CREATE TABLE IF NOT EXISTS t_120_02_01_banks_indonesia (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country_id UUID NOT NULL,
    bank_name TEXT NOT NULL,                    -- PT Bank Rakyat Indonesia (Persero) Tbk
    popular_bank_name TEXT NOT NULL,            -- BRI
    bank_code TEXT NOT NULL UNIQUE,             -- 002
    swift_code TEXT,                            -- BRINIDJA
    bank_category TEXT DEFAULT 'commercial',    -- commercial, islamic, rural, development
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 999,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Foreign Key Constraints
    CONSTRAINT fk_banks_country 
        FOREIGN KEY (country_id) 
        REFERENCES t_120_01_01_countries(id) 
        ON DELETE RESTRICT
);

-- Create indexes for performance
CREATE INDEX idx_banks_indonesia_country_id ON t_120_02_01_banks_indonesia(country_id);
CREATE INDEX idx_banks_indonesia_bank_code ON t_120_02_01_banks_indonesia(bank_code);
CREATE INDEX idx_banks_indonesia_active ON t_120_02_01_banks_indonesia(is_active);

-- ===========================================================
-- 2. POPULATE INDONESIAN BANKS DATA
-- ===========================================================

-- First, get Indonesia country ID
DO $$
DECLARE
    indonesia_id UUID;
BEGIN
    SELECT id INTO indonesia_id 
    FROM t_120_01_01_countries 
    WHERE country_code = 'IDN';
    
    IF indonesia_id IS NOT NULL THEN
        -- Insert major Indonesian banks
        INSERT INTO t_120_02_01_banks_indonesia (country_id, bank_name, popular_bank_name, bank_code, swift_code, display_order) VALUES
        -- BUMN Banks (State-Owned)
        (indonesia_id, 'PT Bank Rakyat Indonesia (Persero) Tbk', 'BRI', '002', 'BRINIDJA', 1),
        (indonesia_id, 'PT Bank Mandiri (Persero) Tbk', 'Bank Mandiri', '008', 'BMRIIDJA', 2),
        (indonesia_id, 'PT Bank Negara Indonesia (Persero) Tbk', 'BNI', '009', 'BNINIDJA', 3),
        (indonesia_id, 'PT Bank Tabungan Negara (Persero) Tbk', 'BTN', '200', 'BTANIDJA', 4),
        
        -- Private Banks (Major)
        (indonesia_id, 'PT Bank Central Asia Tbk', 'BCA', '014', 'CENAIDJA', 5),
        (indonesia_id, 'PT Bank CIMB Niaga Tbk', 'CIMB Niaga', '022', 'BNIAIDJA', 6),
        (indonesia_id, 'PT Bank Danamon Indonesia Tbk', 'Bank Danamon', '011', 'BDINIDJA', 7),
        (indonesia_id, 'PT Bank Permata Tbk', 'Bank Permata', '013', 'BBBAIDJA', 8),
        (indonesia_id, 'PT Bank Maybank Indonesia Tbk', 'Maybank Indonesia', '016', 'MBBEIDJA', 9),
        (indonesia_id, 'PT Bank Pan Indonesia Tbk', 'Bank PAN', '019', 'PINBIDJA', 10),
        
        -- Digital Banks
        (indonesia_id, 'PT Bank Jago Tbk', 'Bank Jago', '490', 'ARTOIDJA', 11),
        (indonesia_id, 'PT Bank Neo Commerce Tbk', 'Bank Neo Commerce', '490', 'NEOAIDJA', 12),
        (indonesia_id, 'PT Bank Seabank Indonesia', 'SeaBank', '535', 'SEABIDJA', 13),
        
        -- Regional Banks (Major)
        (indonesia_id, 'PT Bank DKI', 'Bank DKI', '111', 'BDKIIDJA', 14),
        (indonesia_id, 'PT Bank Jawa Barat dan Banten Tbk', 'BJB', '110', 'BJBRIDJA', 15),
        (indonesia_id, 'PT Bank Jawa Tengah', 'Bank Jateng', '113', 'JATGIDJA', 16),
        (indonesia_id, 'PT Bank Jawa Timur', 'Bank Jatim', '114', 'JATMIDJA', 17),
        
        -- Islamic Banks
        (indonesia_id, 'PT Bank Syariah Indonesia Tbk', 'BSI', '451', 'BSYAIDJA', 18),
        (indonesia_id, 'PT Bank Muamalat Indonesia Tbk', 'Bank Muamalat', '147', 'MUABIDJA', 19),
        (indonesia_id, 'PT Bank Syariah Mandiri', 'BSM', '451', 'BSMAIDJA', 20),
        
        -- Others
        (indonesia_id, 'PT Bank OCBC NISP Tbk', 'OCBC NISP', '028', 'NISPIDJA', 21),
        (indonesia_id, 'PT Bank UOB Indonesia', 'UOB Indonesia', '023', 'UOIVIDJA', 22),
        (indonesia_id, 'PT Bank Mega Tbk', 'Bank Mega', '426', 'MEGAIDJA', 23),
        (indonesia_id, 'PT Bank Sinarmas Tbk', 'Bank Sinarmas', '153', 'SINAIDJA', 24),
        (indonesia_id, 'PT Bank Bukopin Tbk', 'Bank Bukopin', '441', 'BBUKIDJA', 25);
        
        RAISE NOTICE 'Indonesian banks data inserted successfully';
    ELSE
        RAISE EXCEPTION 'Indonesia country not found in t_120_01_01_countries table';
    END IF;
END $$;

-- ===========================================================
-- 3. MODIFY EDUCATOR BANKING INFO TABLE
-- ===========================================================

-- Step 3a: Add new bank_id column
ALTER TABLE t_460_02_04_educator_banking_info 
ADD COLUMN IF NOT EXISTS bank_id UUID,
ADD CONSTRAINT fk_educator_banking_bank 
    FOREIGN KEY (bank_id) 
    REFERENCES t_120_02_01_banks_indonesia(id) 
    ON DELETE RESTRICT;

-- Step 3b: Add bank_code column for quick reference
ALTER TABLE t_460_02_04_educator_banking_info 
ADD COLUMN IF NOT EXISTS bank_code TEXT;

-- Step 3c: Change VARCHAR columns to TEXT (PostgreSQL specific)
-- Note: In PostgreSQL, VARCHAR and TEXT are essentially the same, 
-- but TEXT is more flexible for future changes

ALTER TABLE t_460_02_04_educator_banking_info 
ALTER COLUMN account_holder_name TYPE TEXT,
ALTER COLUMN account_number TYPE TEXT,
ALTER COLUMN bank_name TYPE TEXT,           -- Keep for migration period
ALTER COLUMN swift_code TYPE TEXT,
ALTER COLUMN bank_branch TYPE TEXT,
ALTER COLUMN city TYPE TEXT,
ALTER COLUMN country_code TYPE TEXT;

-- Step 3d: Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_educator_banking_bank_id 
ON t_460_02_04_educator_banking_info(bank_id);

CREATE INDEX IF NOT EXISTS idx_educator_banking_bank_code 
ON t_460_02_04_educator_banking_info(bank_code);

-- ===========================================================
-- 4. DATA MIGRATION SCRIPT (Optional - for existing data)
-- ===========================================================

-- Update existing records to link with new bank table
-- This script tries to match existing bank_name with new bank records

DO $$
DECLARE
    rec RECORD;
    matched_bank_id UUID;
    matched_bank_code TEXT;
BEGIN
    -- Loop through existing banking info records
    FOR rec IN 
        SELECT id, bank_name, educator_id 
        FROM t_460_02_04_educator_banking_info 
        WHERE bank_id IS NULL AND bank_name IS NOT NULL
    LOOP
        -- Try to find matching bank by name (fuzzy matching)
        SELECT b.id, b.bank_code INTO matched_bank_id, matched_bank_code
        FROM t_120_02_01_banks_indonesia b
        WHERE 
            LOWER(b.bank_name) LIKE '%' || LOWER(TRIM(rec.bank_name)) || '%'
            OR LOWER(b.popular_bank_name) LIKE '%' || LOWER(TRIM(rec.bank_name)) || '%'
            OR LOWER(TRIM(rec.bank_name)) LIKE '%' || LOWER(b.popular_bank_name) || '%'
        ORDER BY 
            CASE 
                WHEN LOWER(b.popular_bank_name) = LOWER(TRIM(rec.bank_name)) THEN 1
                WHEN LOWER(b.bank_name) = LOWER(TRIM(rec.bank_name)) THEN 2
                ELSE 3
            END
        LIMIT 1;
        
        -- Update if match found
        IF matched_bank_id IS NOT NULL THEN
            UPDATE t_460_02_04_educator_banking_info 
            SET 
                bank_id = matched_bank_id,
                bank_code = matched_bank_code,
                updated_at = NOW()
            WHERE id = rec.id;
            
            RAISE NOTICE 'Updated educator % bank % -> % (%)', 
                rec.educator_id, rec.bank_name, matched_bank_id, matched_bank_code;
        ELSE
            RAISE NOTICE 'No match found for bank: % (educator: %)', 
                rec.bank_name, rec.educator_id;
        END IF;
    END LOOP;
END $$;

-- ===========================================================
-- 5. CREATE VIEWS FOR EASY DATA ACCESS
-- ===========================================================

-- View for educator banking info with bank details
CREATE OR REPLACE VIEW v_educator_banking_complete AS
SELECT 
    ebi.id,
    ebi.educator_id,
    ebi.account_holder_name,
    ebi.account_number,
    ebi.bank_branch,
    ebi.city,
    ebi.country_code,
    
    -- Bank information from master table
    b.bank_name,
    b.popular_bank_name,
    b.bank_code,
    b.swift_code AS bank_swift_code,
    b.bank_category,
    
    -- Status and verification
    ebi.is_verified,
    ebi.verification_document_url,
    ebi.last_verified_at,
    
    -- Payout information
    ebi.total_payouts,
    ebi.last_payout_at,
    ebi.payout_count,
    
    -- Timestamps
    ebi.created_at,
    ebi.updated_at
FROM t_460_02_04_educator_banking_info ebi
LEFT JOIN t_120_02_01_banks_indonesia b ON ebi.bank_id = b.id;

-- View for active Indonesian banks (for dropdown)
CREATE OR REPLACE VIEW v_banks_indonesia_active AS
SELECT 
    id,
    bank_name,
    popular_bank_name,
    bank_code,
    swift_code,
    display_order
FROM t_120_02_01_banks_indonesia
WHERE is_active = true
ORDER BY display_order, popular_bank_name;

-- ===========================================================
-- 6. UPDATE TRIGGERS FOR AUTOMATIC TIMESTAMPS
-- ===========================================================

-- Trigger for banks table
CREATE OR REPLACE FUNCTION update_banks_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_banks_indonesia_updated_at 
ON t_120_02_01_banks_indonesia;

CREATE TRIGGER tr_banks_indonesia_updated_at
    BEFORE UPDATE ON t_120_02_01_banks_indonesia
    FOR EACH ROW
    EXECUTE FUNCTION update_banks_timestamp();

-- ===========================================================
-- 7. VERIFICATION QUERIES
-- ===========================================================

-- Verify bank data
SELECT 
    'Banks Created' as check_item,
    COUNT(*) as count,
    'Expected: 25+' as expected
FROM t_120_02_01_banks_indonesia;

-- Verify educator banking modifications
SELECT 
    'Banking Info Columns' as check_item,
    COUNT(*) as count,
    'Expected: 19+' as expected
FROM information_schema.columns 
WHERE table_name = 't_460_02_04_educator_banking_info';

-- Sample bank dropdown data
SELECT 
    id,
    popular_bank_name,
    bank_code,
    display_order
FROM v_banks_indonesia_active
LIMIT 10;

-- ===========================================================
-- 8. CLEANUP SCRIPTS (USE WITH CAUTION)
-- ===========================================================

-- UNCOMMENT ONLY IF YOU WANT TO REMOVE OLD BANK_NAME COLUMN
-- After confirming all data is migrated properly

/*
-- Remove old bank_name column (after migration complete)
ALTER TABLE t_460_02_04_educator_banking_info 
DROP COLUMN IF EXISTS bank_name;

-- Make bank_id required (after migration complete)
ALTER TABLE t_460_02_04_educator_banking_info 
ALTER COLUMN bank_id SET NOT NULL;
*/

-- ===========================================================
-- END OF SQL EDITOR
-- ===========================================================

-- Usage Notes:
-- 1. Run sections 1-3 to create and modify tables
-- 2. Run section 4 if you have existing data to migrate
-- 3. Run section 5 to create helpful views
-- 4. Use section 7 to verify everything works
-- 5. Use section 8 only after confirming migration success 