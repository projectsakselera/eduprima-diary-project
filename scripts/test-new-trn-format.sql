-- ================================================================
-- TEST NEW TRN FORMAT: ID2500014
-- Run this in Supabase SQL Editor
-- ================================================================

-- 1. Check current TRN format in database
SELECT 
  'Current TRNs in database:' as info,
  tutor_registration_number 
FROM tutor_details 
WHERE tutor_registration_number IS NOT NULL 
LIMIT 5;

-- 2. Test generate new TRN (run multiple times to see sequence)
SELECT 
  'Testing new TRN generation:' as info,
  generate_tutor_registration_number() as new_trn_sample;

-- 3. Check sequence state
SELECT 
  'Current sequence state:' as info,
  country_year,
  current_sequence,
  'Next will be: ID' || RIGHT(country_year, 2) || LPAD((current_sequence + 1)::TEXT, 5, '0') as preview_next
FROM tutor_sequences;

-- 4. Generate 5 consecutive TRNs to verify format
SELECT 
  'Sample TRN batch:' as info,
  generate_tutor_registration_number() as sample_1
UNION ALL
SELECT 
  '',
  generate_tutor_registration_number() as sample_2  
UNION ALL
SELECT 
  '',
  generate_tutor_registration_number() as sample_3
UNION ALL
SELECT 
  '',
  generate_tutor_registration_number() as sample_4
UNION ALL
SELECT 
  '',
  generate_tutor_registration_number() as sample_5;
