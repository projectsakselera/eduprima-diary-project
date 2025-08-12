-- ================================================================
-- FIX TRN GENERATION - KELIPATAN 7 SEQUENCE  
-- ================================================================
-- Script untuk memperbaiki TRN generation agar menggunakan kelipatan 7
-- Format: ID2500007, ID2500014, ID2500021, ID2500028, etc.

-- ================================================================
-- 1. UPDATE FUNCTION: generate_tutor_registration_number() 
-- ================================================================
CREATE OR REPLACE FUNCTION generate_tutor_registration_number()
RETURNS TEXT AS $$
DECLARE
  country_code TEXT := 'ID';
  current_year TEXT := EXTRACT(YEAR FROM NOW())::TEXT;
  current_year_short TEXT := RIGHT(EXTRACT(YEAR FROM NOW())::TEXT, 2); -- Get last 2 digits
  country_year_key TEXT;
  next_sequence INTEGER;
  trn TEXT;
BEGIN
  -- Build country_year key (e.g., "ID2025")
  country_year_key := country_code || current_year;
  
  -- 🎯 GET AND INCREMENT SEQUENCE BY 7 (KELIPATAN 7)
  UPDATE tutor_sequences 
  SET 
    current_sequence = current_sequence + 7,  -- ✅ CHANGED: +7 instead of +1
    updated_at = NOW()
  WHERE country_year = country_year_key
  RETURNING current_sequence INTO next_sequence;
  
  -- If no row exists, create it starting at 7
  IF next_sequence IS NULL THEN
    INSERT INTO tutor_sequences (country_year, current_sequence)
    VALUES (country_year_key, 7)  -- ✅ CHANGED: Start at 7 instead of 1
    RETURNING current_sequence INTO next_sequence;
  END IF;
  
  -- 🎯 FORMAT TRN: ID2500007 (ID + 25 + 00007)
  -- Format: country + year(2-digit) + sequence(5-digit, padded with zeros)
  trn := country_code || current_year_short || LPAD(next_sequence::TEXT, 5, '0');
  
  RETURN trn;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- 2. TEST NEW TRN GENERATION WITH KELIPATAN 7
-- ================================================================
-- Generate 5 sample TRNs to verify kelipatan 7 sequence
SELECT generate_tutor_registration_number() as sample_trn_1;
SELECT generate_tutor_registration_number() as sample_trn_2;
SELECT generate_tutor_registration_number() as sample_trn_3;
SELECT generate_tutor_registration_number() as sample_trn_4;
SELECT generate_tutor_registration_number() as sample_trn_5;

-- ================================================================
-- 3. CHECK SEQUENCE STATE
-- ================================================================
SELECT 
  country_year,
  current_sequence,
  'Next TRN will be: ID' || RIGHT(country_year, 2) || LPAD((current_sequence + 7)::TEXT, 5, '0') as preview_next_trn,
  'Kelipatan 7 check: ' || CASE 
    WHEN current_sequence % 7 = 0 THEN '✅ VALID' 
    ELSE '❌ NOT KELIPATAN 7' 
  END as validation
FROM tutor_sequences 
WHERE country_year LIKE 'ID%';

-- ================================================================
-- 4. VERIFICATION QUERY
-- ================================================================
-- Check existing TRNs to see current sequence
SELECT 
  tutor_registration_number,
  created_at
FROM tutor_details 
WHERE tutor_registration_number IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- ================================================================
-- 5. OPTIONAL: RESET SEQUENCE TO KELIPATAN 7
-- ================================================================
-- Uncomment below if you want to reset current sequence to next kelipatan 7
/*
UPDATE tutor_sequences 
SET current_sequence = CEIL(current_sequence::float / 7) * 7
WHERE country_year LIKE 'ID%';
*/

