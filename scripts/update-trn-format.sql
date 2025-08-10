-- ================================================================
-- UPDATE TRN FORMAT: ID-2025-0014 → ID2500014
-- Date: January 2025
-- Purpose: Mengubah format TRN menjadi lebih compact
-- ================================================================

-- ================================================================
-- 1. BACKUP EXISTING FUNCTION (OPTIONAL - untuk safety)
-- ================================================================
-- SELECT pg_get_functiondef('generate_tutor_registration_number'::regproc);

-- ================================================================
-- 2. CREATE NEW TRN GENERATION FUNCTION
-- Format: ID + 2-digit year + 5-digit sequence = ID2500014
-- ================================================================
CREATE OR REPLACE FUNCTION generate_tutor_registration_number()
RETURNS TEXT AS $$
DECLARE
  country_code TEXT := 'ID';
  current_year_short TEXT := RIGHT(EXTRACT(YEAR FROM NOW())::TEXT, 2); -- Get last 2 digits (25 for 2025)
  country_year_key TEXT;
  next_sequence INTEGER;
  trn TEXT;
BEGIN
  -- Build country_year key for sequence tracking (still use full year: "ID2025")
  country_year_key := country_code || EXTRACT(YEAR FROM NOW())::TEXT;
  
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
  
  -- 🎯 NEW FORMAT: ID2500014
  -- ID + 25 (year) + 00014 (5-digit sequence)
  trn := country_code || current_year_short || LPAD(next_sequence::TEXT, 5, '0');
  
  RETURN trn;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- 3. TEST NEW TRN GENERATION
-- ================================================================
-- Generate 3 sample TRNs to verify new format
SELECT generate_tutor_registration_number() as new_sample_trn_1;
SELECT generate_tutor_registration_number() as new_sample_trn_2;
SELECT generate_tutor_registration_number() as new_sample_trn_3;

-- ================================================================
-- 4. CHECK CURRENT SEQUENCE STATE
-- ================================================================
SELECT 
  country_year,
  current_sequence,
  'Next TRN will be: ID' || RIGHT(country_year, 2) || LPAD((current_sequence + 1)::TEXT, 5, '0') as preview_next_trn
FROM tutor_sequences 
WHERE country_year LIKE 'ID%';

-- ================================================================
-- 5. OPTIONAL: RESET SEQUENCE FOR TESTING
-- ================================================================
-- UNCOMMENT BELOW TO RESET SEQUENCE TO 0 FOR TESTING
-- UPDATE tutor_sequences SET current_sequence = 0 WHERE country_year = 'ID2025';

-- ================================================================
-- 6. VERIFY TRIGGER IS STILL ACTIVE
-- ================================================================
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'tr_tutor_registration_number';
