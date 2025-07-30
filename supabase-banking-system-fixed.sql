-- ===== ENHANCED BANKING SYSTEM FOR SELESTIA (CORRECTED VERSION) =====
-- Script untuk sistem perbankan yang lebih baik dengan master data bank Indonesia
-- Menggunakan TEXT data type dan referensi tabel country yang benar
-- Berlaku untuk semua user: tutor, staff, siswa, dll

-- 1. Tabel Master Bank Indonesia
CREATE TABLE t_120_02_01_banks_indonesia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID REFERENCES t_120_01_01_countries(id) DEFAULT (
    SELECT id FROM t_120_01_01_countries WHERE country_code = 'IDN' LIMIT 1
  ),
  
  -- Bank Information
  bank_name TEXT NOT NULL, -- PT Bank Rakyat Indonesia (Persero) Tbk
  popular_bank_name TEXT NOT NULL, -- BRI
  bank_code TEXT NOT NULL UNIQUE, -- 002
  swift_code TEXT, -- BRINIDJA
  
  -- Bank Category
  bank_type TEXT DEFAULT 'commercial', -- 'commercial', 'syariah', 'regional', 'digital'
  bank_category TEXT DEFAULT 'national', -- 'national', 'regional', 'foreign', 'digital'
  
  -- Transfer Fee Information (for UI hints)
  is_free_transfer BOOLEAN DEFAULT false, -- Top 4 banks have free inter-bank transfer
  transfer_fee_info TEXT, -- "Gratis Transfer Antar Bank"
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_popular BOOLEAN DEFAULT false, -- For prioritizing in dropdown
  
  -- Metadata
  logo_url TEXT, -- Bank logo URL
  website_url TEXT, -- Bank official website
  customer_service TEXT, -- Customer service phone
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes
  UNIQUE(bank_code),
  UNIQUE(popular_bank_name)
);

-- 2. Enhanced User Banking Info (Universal for all users)
CREATE TABLE t_310_01_04_user_banking_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES t_310_01_01_users_universal(id),
  
  -- Bank Information (Foreign Key to master table)
  bank_id UUID REFERENCES t_120_02_01_banks_indonesia(id),
  
  -- Account Information
  account_holder_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_type TEXT DEFAULT 'savings', -- 'savings', 'checking', 'current'
  
  -- Branch Information
  bank_branch TEXT, -- Nama cabang bank
  branch_city TEXT, -- Kota cabang
  branch_code TEXT, -- Kode cabang (optional)
  
  -- Status & Verification
  is_primary BOOLEAN DEFAULT true, -- Primary bank account
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES t_310_01_01_users_universal(id),
  verification_method TEXT, -- 'manual', 'api', 'document'
  
  -- Additional Info
  notes TEXT, -- Catatan tambahan
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id, account_number), -- Prevent duplicate account per user
  CHECK(LENGTH(account_number) >= 8) -- Minimum account number length
);

-- 3. Insert Master Data Bank Indonesia (Top Banks)
INSERT INTO t_120_02_01_banks_indonesia (
  bank_name, popular_bank_name, bank_code, swift_code, bank_type, bank_category, 
  is_free_transfer, transfer_fee_info, is_popular, is_active
) VALUES
-- Top 4 Banks (Free Transfer)
('PT Bank Rakyat Indonesia (Persero) Tbk', 'BRI', '002', 'BRINIDJA', 'commercial', 'national', true, 'Gratis Transfer Antar Bank', true, true),
('PT Bank Central Asia Tbk', 'BCA', '014', 'CENAIDJA', 'commercial', 'national', true, 'Gratis Transfer Antar Bank', true, true),
('PT Bank Negara Indonesia (Persero) Tbk', 'BNI', '009', 'BNINIDJA', 'commercial', 'national', true, 'Gratis Transfer Antar Bank', true, true),
('PT Bank Mandiri (Persero) Tbk', 'Mandiri', '008', 'BMRIIDJA', 'commercial', 'national', true, 'Gratis Transfer Antar Bank', true, true),

-- Major Commercial Banks
('PT Bank CIMB Niaga Tbk', 'CIMB Niaga', '022', 'BNIAIDJA', 'commercial', 'national', false, null, true, true),
('PT Bank Danamon Indonesia Tbk', 'Danamon', '011', 'BDMNIDJA', 'commercial', 'national', false, null, true, true),
('PT Bank Permata Tbk', 'Permata', '013', 'BBBAIDJA', 'commercial', 'national', false, null, true, true),
('PT Bank OCBC NISP Tbk', 'OCBC NISP', '028', 'NISPIDJA', 'commercial', 'national', false, null, true, true),
('PT Bank Panin Tbk', 'Panin', '019', 'PANINIDJA', 'commercial', 'national', false, null, true, true),
('PT Bank Maybank Indonesia Tbk', 'Maybank', '016', 'MBBEIDJA', 'commercial', 'foreign', false, null, true, true),

-- Syariah Banks
('PT Bank Syariah Indonesia Tbk', 'BSI', '451', 'BSYAIDJA', 'syariah', 'national', false, null, true, true),
('PT Bank Muamalat Indonesia Tbk', 'Muamalat', '147', 'MUABIDJA', 'syariah', 'national', false, null, false, true),
('PT Bank Syariah Mandiri', 'BSM', '451', 'BSMDIDJA', 'syariah', 'national', false, null, false, true),

-- Digital Banks
('PT Bank Jago Tbk', 'Bank Jago', '094', 'JTRBIDJA', 'digital', 'national', false, null, true, true),
('PT Bank Aladin Syariah Tbk', 'Aladin Syariah', '564', null, 'digital', 'national', false, null, false, true),
('PT Bank Neo Commerce Tbk', 'Bank Neo', '490', 'NEOIIDJA', 'digital', 'national', false, null, true, true),

-- Regional Banks (Major ones)
('PT Bank DKI', 'Bank DKI', '111', 'BDKIIDJA', 'commercial', 'regional', false, null, false, true),
('PT Bank Jawa Barat dan Banten Tbk', 'BJB', '110', 'BJBRIDJA', 'commercial', 'regional', false, null, false, true),
('PT Bank Jawa Tengah', 'Bank Jateng', '113', 'JATGIDJA', 'commercial', 'regional', false, null, false, true),
('PT Bank Jawa Timur Tbk', 'Bank Jatim', '114', 'JATMIDJA', 'commercial', 'regional', false, null, false, true),
('PT Bank Sumatera Utara', 'Bank Sumut', '117', 'BSUMIDJA', 'commercial', 'regional', false, null, false, true),
('PT Bank Kalimantan Barat', 'Bank Kalbar', '123', 'BKBAIDJA', 'commercial', 'regional', false, null, false, true),

-- Foreign Banks (Major ones)
('Citibank N.A.', 'Citibank', '031', 'CITIIDJX', 'commercial', 'foreign', false, null, false, true),
('The Hongkong and Shanghai Banking Corporation Limited', 'HSBC', '041', 'HSBCIDJA', 'commercial', 'foreign', false, null, false, true),
('Standard Chartered Bank', 'Standard Chartered', '050', 'SCBLIDJA', 'commercial', 'foreign', false, null, false, true),
('PT Bank UOB Indonesia', 'UOB', '023', 'UOVBIDJA', 'commercial', 'foreign', false, null, false, true),
('Deutsche Bank AG', 'Deutsche Bank', '067', 'DEUTIDJA', 'commercial', 'foreign', false, null, false, true);

-- 4. Update existing educator_banking_info to reference new bank master
-- First, add bank_id column to existing table
ALTER TABLE t_460_02_04_educator_banking_info 
ADD COLUMN IF NOT EXISTS bank_id UUID REFERENCES t_120_02_01_banks_indonesia(id);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_educator_banking_bank_id ON t_460_02_04_educator_banking_info(bank_id);
CREATE INDEX IF NOT EXISTS idx_educator_banking_educator_id ON t_460_02_04_educator_banking_info(educator_id);

-- 5. Create indexes for performance
CREATE INDEX idx_banks_popular_name ON t_120_02_01_banks_indonesia(popular_bank_name);
CREATE INDEX idx_banks_code ON t_120_02_01_banks_indonesia(bank_code);
CREATE INDEX idx_banks_active_popular ON t_120_02_01_banks_indonesia(is_active, is_popular);
CREATE INDEX idx_banks_type_category ON t_120_02_01_banks_indonesia(bank_type, bank_category);
CREATE INDEX idx_user_banking_user_id ON t_310_01_04_user_banking_info(user_id);
CREATE INDEX idx_user_banking_bank_id ON t_310_01_04_user_banking_info(bank_id);
CREATE INDEX idx_user_banking_primary ON t_310_01_04_user_banking_info(is_primary);
CREATE INDEX idx_user_banking_account ON t_310_01_04_user_banking_info(account_number);

-- 6. Add comments for documentation
COMMENT ON TABLE t_120_02_01_banks_indonesia IS 'Master data bank-bank di Indonesia dengan informasi lengkap untuk dropdown dan validasi. Menggunakan TEXT data type untuk fleksibilitas.';
COMMENT ON TABLE t_310_01_04_user_banking_info IS 'Universal banking information untuk semua user types dengan referensi ke master bank. Mendukung multiple accounts per user.';

COMMENT ON COLUMN t_120_02_01_banks_indonesia.bank_name IS 'Nama resmi bank lengkap (PT Bank Rakyat Indonesia Tbk)';
COMMENT ON COLUMN t_120_02_01_banks_indonesia.popular_bank_name IS 'Nama populer bank untuk dropdown (BRI)';
COMMENT ON COLUMN t_120_02_01_banks_indonesia.is_free_transfer IS 'Bank dengan transfer gratis antar bank (Top 4: BRI, BCA, BNI, Mandiri)';
COMMENT ON COLUMN t_120_02_01_banks_indonesia.bank_type IS 'Tipe bank: commercial, syariah, digital, regional';
COMMENT ON COLUMN t_120_02_01_banks_indonesia.bank_category IS 'Kategori bank: national, regional, foreign';
COMMENT ON COLUMN t_310_01_04_user_banking_info.bank_id IS 'Foreign key ke master bank Indonesia';
COMMENT ON COLUMN t_310_01_04_user_banking_info.account_holder_name IS 'Nama pemilik rekening sesuai buku tabungan';
COMMENT ON COLUMN t_310_01_04_user_banking_info.is_primary IS 'Rekening utama user (hanya boleh satu per user)';

-- 7. Create Views for Easy Querying
CREATE VIEW v_user_banking_complete AS
SELECT 
  ubi.id,
  ubi.user_id,
  ubi.account_holder_name,
  ubi.account_number,
  ubi.account_type,
  ubi.bank_branch,
  ubi.branch_city,
  ubi.is_primary,
  ubi.is_verified,
  
  -- Bank information
  b.bank_name,
  b.popular_bank_name,
  b.bank_code,
  b.swift_code,
  b.bank_type,
  b.bank_category,
  b.is_free_transfer,
  b.transfer_fee_info,
  
  -- Country information
  c.country_name,
  c.country_code,
  
  ubi.created_at,
  ubi.updated_at
FROM t_310_01_04_user_banking_info ubi
LEFT JOIN t_120_02_01_banks_indonesia b ON ubi.bank_id = b.id
LEFT JOIN t_120_01_01_countries c ON b.country_id = c.id;

-- 8. Create Functions for Banking Operations
CREATE OR REPLACE FUNCTION get_user_primary_bank(user_uuid UUID)
RETURNS TABLE(
  account_holder_name TEXT,
  account_number TEXT,
  bank_name TEXT,
  popular_bank_name TEXT,
  bank_code TEXT,
  swift_code TEXT,
  bank_branch TEXT,
  is_free_transfer BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ubi.account_holder_name,
    ubi.account_number,
    b.bank_name,
    b.popular_bank_name,
    b.bank_code,
    b.swift_code,
    ubi.bank_branch,
    b.is_free_transfer
  FROM t_310_01_04_user_banking_info ubi
  LEFT JOIN t_120_02_01_banks_indonesia b ON ubi.bank_id = b.id
  WHERE ubi.user_id = user_uuid AND ubi.is_primary = true
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- 9. Function to get banks by category for API
CREATE OR REPLACE FUNCTION get_banks_by_category(
  category_filter TEXT DEFAULT NULL,
  popular_only BOOLEAN DEFAULT false
)
RETURNS TABLE(
  id UUID,
  bank_name TEXT,
  popular_bank_name TEXT,
  bank_code TEXT,
  swift_code TEXT,
  bank_type TEXT,
  bank_category TEXT,
  is_free_transfer BOOLEAN,
  transfer_fee_info TEXT,
  is_popular BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.bank_name,
    b.popular_bank_name,
    b.bank_code,
    b.swift_code,
    b.bank_type,
    b.bank_category,
    b.is_free_transfer,
    b.transfer_fee_info,
    b.is_popular
  FROM t_120_02_01_banks_indonesia b
  WHERE 
    b.is_active = true
    AND (category_filter IS NULL OR b.bank_type = category_filter)
    AND (popular_only = false OR b.is_popular = true)
  ORDER BY 
    b.is_popular DESC,
    b.is_free_transfer DESC,
    b.popular_bank_name ASC;
END;
$$ LANGUAGE plpgsql;

-- 10. Migration script for existing data (if needed)
-- Update existing bank_name in educator_banking_info to use popular names
UPDATE t_460_02_04_educator_banking_info 
SET bank_id = (
  SELECT id FROM t_120_02_01_banks_indonesia 
  WHERE popular_bank_name ILIKE t_460_02_04_educator_banking_info.bank_name
  OR bank_name ILIKE '%' || t_460_02_04_educator_banking_info.bank_name || '%'
  ORDER BY 
    CASE 
      WHEN popular_bank_name ILIKE t_460_02_04_educator_banking_info.bank_name THEN 1
      WHEN bank_name ILIKE '%' || t_460_02_04_educator_banking_info.bank_name || '%' THEN 2
      ELSE 3
    END
  LIMIT 1
)
WHERE bank_id IS NULL AND bank_name IS NOT NULL;

-- 11. Create trigger to auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Only create triggers if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_banks_indonesia_updated_at') THEN
    CREATE TRIGGER update_banks_indonesia_updated_at
      BEFORE UPDATE ON t_120_02_01_banks_indonesia
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_banking_info_updated_at') THEN
    CREATE TRIGGER update_user_banking_info_updated_at
      BEFORE UPDATE ON t_310_01_04_user_banking_info
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- 12. Create constraint to ensure only one primary bank per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_banking_one_primary 
ON t_310_01_04_user_banking_info(user_id) 
WHERE is_primary = true;

-- 13. Verify the setup
SELECT 
  'Banks Master Data' as table_name,
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE is_popular = true) as popular_banks,
  COUNT(*) FILTER (WHERE is_free_transfer = true) as free_transfer_banks,
  COUNT(*) FILTER (WHERE bank_type = 'commercial') as commercial_banks,
  COUNT(*) FILTER (WHERE bank_type = 'syariah') as syariah_banks,
  COUNT(*) FILTER (WHERE bank_type = 'digital') as digital_banks
FROM t_120_02_01_banks_indonesia

UNION ALL

SELECT 
  'Banking Info Structure' as table_name,
  COUNT(*) as total_columns,
  0 as popular_banks,
  0 as free_transfer_banks,
  0 as commercial_banks,
  0 as syariah_banks,
  0 as digital_banks
FROM information_schema.columns 
WHERE table_name = 't_310_01_04_user_banking_info';

-- 14. Sample queries for testing
-- Get all popular banks
-- SELECT * FROM get_banks_by_category(NULL, true);

-- Get only syariah banks
-- SELECT * FROM get_banks_by_category('syariah', false);

-- Get user's primary bank info
-- SELECT * FROM get_user_primary_bank('user-uuid-here');

-- Get complete banking view
-- SELECT * FROM v_user_banking_complete WHERE user_id = 'user-uuid-here'; 