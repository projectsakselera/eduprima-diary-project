-- ===== ENHANCED ADDRESS SYSTEM FOR EDUPRIMA DIARY =====
-- Script untuk membuat tabel alamat yang terstruktur dan scalable
-- Berlaku untuk semua user: tutor, staff, siswa, dll

-- 1. Tabel Kecamatan (Districts)
CREATE TABLE t_120_01_04_districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID NOT NULL REFERENCES t_120_01_03_cities(id),
  district_code VARCHAR(10),
  district_name VARCHAR(100) NOT NULL,
  district_local_name VARCHAR(100),
  postal_code_prefix VARCHAR(5), -- Prefix kode pos untuk kecamatan
  
  -- Geographic info
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  area_sq_km DECIMAL(10, 2),
  
  -- Administrative info
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes
  UNIQUE(city_id, district_name)
);

-- 2. Tabel Kelurahan/Desa (Villages)
CREATE TABLE t_120_01_05_villages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id UUID NOT NULL REFERENCES t_120_01_04_districts(id),
  village_code VARCHAR(10),
  village_name VARCHAR(100) NOT NULL,
  village_local_name VARCHAR(100),
  village_type VARCHAR(20) DEFAULT 'kelurahan', -- 'kelurahan' or 'desa'
  postal_code VARCHAR(10), -- Kode pos spesifik
  
  -- Geographic info
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  area_sq_km DECIMAL(10, 2),
  population_estimate INTEGER,
  
  -- Administrative info
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes
  UNIQUE(district_id, village_name)
);

-- 3. Enhanced User Addresses Table (Multiple addresses per user)
CREATE TABLE t_310_01_03_user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES t_310_01_01_users_universal(id),
  
  -- Address Type
  address_type VARCHAR(20) NOT NULL DEFAULT 'domicile', -- 'domicile', 'ktp', 'office', 'emergency'
  address_label VARCHAR(50), -- 'Rumah', 'Kantor', 'Alamat KTP', etc
  
  -- Administrative Hierarchy (Foreign Keys)
  province_id UUID REFERENCES t_120_01_02_province(id),
  city_id UUID REFERENCES t_120_01_03_cities(id),
  district_id UUID REFERENCES t_120_01_04_districts(id),
  village_id UUID REFERENCES t_120_01_05_villages(id),
  
  -- Manual Input Fields
  district_name VARCHAR(100), -- Fallback jika tidak ada di tabel
  village_name VARCHAR(100),  -- Fallback jika tidak ada di tabel
  street_address TEXT NOT NULL, -- Alamat lengkap jalan, RT/RW, dll
  postal_code VARCHAR(10),
  
  -- Additional Info
  landmark VARCHAR(200), -- Patokan/landmark
  notes TEXT, -- Catatan tambahan
  
  -- Status
  is_primary BOOLEAN DEFAULT false, -- Alamat utama
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES t_310_01_01_users_universal(id),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id, address_type), -- Satu user hanya punya satu alamat per type
  CHECK (address_type IN ('domicile', 'ktp', 'office', 'emergency', 'shipping'))
);

-- 4. Create Indexes for Performance
CREATE INDEX idx_districts_city_id ON t_120_01_04_districts(city_id);
CREATE INDEX idx_districts_name ON t_120_01_04_districts(district_name);
CREATE INDEX idx_villages_district_id ON t_120_01_05_villages(district_id);
CREATE INDEX idx_villages_name ON t_120_01_05_villages(village_name);
CREATE INDEX idx_user_addresses_user_id ON t_310_01_03_user_addresses(user_id);
CREATE INDEX idx_user_addresses_type ON t_310_01_03_user_addresses(address_type);
CREATE INDEX idx_user_addresses_primary ON t_310_01_03_user_addresses(is_primary);

-- 5. Add Comments for Documentation
COMMENT ON TABLE t_120_01_04_districts IS 'Tabel kecamatan untuk sistem alamat Indonesia. Relasi ke cities dan parent untuk villages.';
COMMENT ON TABLE t_120_01_05_villages IS 'Tabel kelurahan/desa untuk sistem alamat Indonesia. Child dari districts.';
COMMENT ON TABLE t_310_01_03_user_addresses IS 'Multiple addresses per user: domicile, KTP, office, etc. Universal untuk semua user types.';

COMMENT ON COLUMN t_310_01_03_user_addresses.address_type IS 'Type alamat: domicile (domisili), ktp (sesuai KTP), office (kantor), emergency (darurat)';
COMMENT ON COLUMN t_310_01_03_user_addresses.district_name IS 'Manual input kecamatan sebagai fallback jika tidak ada di master tabel';
COMMENT ON COLUMN t_310_01_03_user_addresses.village_name IS 'Manual input kelurahan/desa sebagai fallback jika tidak ada di master tabel';

-- 6. Sample Data Insert (Optional - untuk testing)
-- INSERT INTO t_120_01_04_districts (city_id, district_name, district_code) 
-- VALUES ('city-uuid-here', 'Menteng', '3171070');

-- INSERT INTO t_120_01_05_villages (district_id, village_name, village_type, postal_code)
-- VALUES ('district-uuid-here', 'Menteng', 'kelurahan', '10310');

-- 7. Create Views for Easy Querying
CREATE VIEW v_user_addresses_complete AS
SELECT 
  ua.id,
  ua.user_id,
  ua.address_type,
  ua.address_label,
  ua.street_address,
  ua.postal_code,
  ua.landmark,
  ua.is_primary,
  ua.is_verified,
  
  -- Administrative names
  p.region_name as province_name,
  c.city_name,
  COALESCE(d.district_name, ua.district_name) as district_name,
  COALESCE(v.village_name, ua.village_name) as village_name,
  
  -- Full address
  CONCAT(
    ua.street_address, ', ',
    COALESCE(v.village_name, ua.village_name), ', ',
    COALESCE(d.district_name, ua.district_name), ', ',
    c.city_name, ', ',
    p.region_name, ' ',
    ua.postal_code
  ) as full_address,
  
  ua.created_at,
  ua.updated_at
FROM t_310_01_03_user_addresses ua
LEFT JOIN t_120_01_02_province p ON ua.province_id = p.id
LEFT JOIN t_120_01_03_cities c ON ua.city_id = c.id
LEFT JOIN t_120_01_04_districts d ON ua.district_id = d.id
LEFT JOIN t_120_01_05_villages v ON ua.village_id = v.id;

-- 8. Create Functions for Address Management
CREATE OR REPLACE FUNCTION get_user_primary_address(user_uuid UUID)
RETURNS TABLE(
  address_type VARCHAR,
  full_address TEXT,
  province_name VARCHAR,
  city_name VARCHAR,
  district_name VARCHAR,
  village_name VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ua.address_type,
    CONCAT(
      ua.street_address, ', ',
      COALESCE(v.village_name, ua.village_name), ', ',
      COALESCE(d.district_name, ua.district_name), ', ',
      c.city_name, ', ',
      p.region_name, ' ',
      ua.postal_code
    ) as full_address,
    p.region_name as province_name,
    c.city_name,
    COALESCE(d.district_name, ua.district_name) as district_name,
    COALESCE(v.village_name, ua.village_name) as village_name
  FROM t_310_01_03_user_addresses ua
  LEFT JOIN t_120_01_02_province p ON ua.province_id = p.id
  LEFT JOIN t_120_01_03_cities c ON ua.city_id = c.id
  LEFT JOIN t_120_01_04_districts d ON ua.district_id = d.id
  LEFT JOIN t_120_01_05_villages v ON ua.village_id = v.id
  WHERE ua.user_id = user_uuid AND ua.is_primary = true
  LIMIT 1;
END;
$$ LANGUAGE plpgsql; 