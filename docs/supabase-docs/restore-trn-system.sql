-- 🔧 RESTORE TRN (Educator Registration Number) SYSTEM
-- Date: January 2025
-- Purpose: Create missing tables, functions, and triggers for TRN generation

-- ================================================================
-- 1. CREATE SEQUENCES TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS tutor_sequences (
  id SERIAL PRIMARY KEY,
  country_year VARCHAR(7) NOT NULL UNIQUE, -- Format: "ID2025"
  current_sequence INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial data for Indonesia 2025
INSERT INTO tutor_sequences (country_year, current_sequence)
VALUES ('ID2025', 0)
ON CONFLICT (country_year) DO NOTHING;

-- ================================================================
-- 2. CREATE TRN GENERATION FUNCTION
-- ================================================================
CREATE OR REPLACE FUNCTION generate_tutor_registration_number()
RETURNS TEXT AS $$
DECLARE
  country_code TEXT := 'ID';
  current_year TEXT := EXTRACT(YEAR FROM NOW())::TEXT;
  country_year_key TEXT;
  next_sequence INTEGER;
  trn TEXT;
BEGIN
  -- Build country_year key (e.g., "ID2025")
  country_year_key := country_code || current_year;
  
  -- Get and increment sequence atomically
  UPDATE tutor_sequences 
  SET 
    current_sequence = current_sequence + 1,
    updated_at = NOW()
  WHERE country_year = country_year_key
  RETURNING current_sequence INTO next_sequence;
  
  -- If no row exists, create it
  IF next_sequence IS NULL THEN
    INSERT INTO tutor_sequences (country_year, current_sequence)
    VALUES (country_year_key, 1)
    RETURNING current_sequence INTO next_sequence;
  END IF;
  
  -- Format TRN: ID2025001 (country + year + 3-digit sequence)
  trn := country_year_key || LPAD(next_sequence::TEXT, 3, '0');
  
  RETURN trn;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- 3. CREATE TRN TRIGGER FUNCTION
-- ================================================================
CREATE OR REPLACE FUNCTION set_tutor_registration_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate TRN if not already set
  IF NEW.tutor_registration_number IS NULL OR NEW.tutor_registration_number = '' THEN
    NEW.tutor_registration_number := generate_tutor_registration_number();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- 4. CREATE TRIGGER ON TUTOR_DETAILS
-- ================================================================
DROP TRIGGER IF EXISTS tr_tutor_registration_number ON tutor_details;
CREATE TRIGGER tr_tutor_registration_number
  BEFORE INSERT ON tutor_details
  FOR EACH ROW
  EXECUTE FUNCTION set_tutor_registration_number();

-- ================================================================
-- 5. VERIFY SETUP
-- ================================================================
-- Test TRN generation
SELECT generate_tutor_registration_number() as sample_trn;

-- Check sequences table
SELECT * FROM tutor_sequences;

-- ================================================================
-- END OF RESTORE SCRIPT
-- ================================================================
