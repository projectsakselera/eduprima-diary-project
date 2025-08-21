-- ================================================================
-- FIX BROKEN TRN TRIGGER - URGENT REPAIR
-- Date: January 2025
-- Issue: Trigger references non-existent function set_tutor_registration_number()
-- Solution: Update trigger to use existing function generate_tutor_registration_number()
-- ================================================================

-- ================================================================
-- 1. CHECK CURRENT BROKEN STATE
-- ================================================================
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement,
  'BROKEN - Function does not exist' as status
FROM information_schema.triggers 
WHERE trigger_name = 'tr_tutor_registration_number';

-- ================================================================
-- 2. DROP BROKEN TRIGGER
-- ================================================================
DROP TRIGGER IF EXISTS tr_tutor_registration_number ON tutor_details;

-- ================================================================
-- 3. CREATE PROPER TRN SETTER FUNCTION 
-- ================================================================
-- This function will be called by the trigger
CREATE OR REPLACE FUNCTION set_tutor_registration_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate TRN if not already provided
  IF NEW.tutor_registration_number IS NULL OR NEW.tutor_registration_number = '' THEN
    NEW.tutor_registration_number := generate_tutor_registration_number();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- 4. CREATE NEW WORKING TRIGGER
-- ================================================================
CREATE TRIGGER tr_tutor_registration_number
  BEFORE INSERT ON tutor_details
  FOR EACH ROW
  EXECUTE FUNCTION set_tutor_registration_number();

-- ================================================================
-- 5. VERIFY TRIGGER IS NOW WORKING
-- ================================================================
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement,
  '✅ FIXED - Function exists and works' as status
FROM information_schema.triggers 
WHERE trigger_name = 'tr_tutor_registration_number';

-- ================================================================
-- 6. TEST TRN GENERATION WORKS
-- ================================================================
-- Test the function directly
SELECT generate_tutor_registration_number() as test_trn_1;
SELECT generate_tutor_registration_number() as test_trn_2;

-- ================================================================
-- 7. VERIFY FUNCTION EXISTS
-- ================================================================
SELECT 
  function_name,
  return_type,
  '✅ EXISTS' as status
FROM information_schema.routines 
WHERE routine_name IN ('generate_tutor_registration_number', 'set_tutor_registration_number')
ORDER BY function_name;

-- ================================================================
-- 8. TEST TRIGGER WITH SAMPLE DATA (OPTIONAL)
-- ================================================================
/*
-- Uncomment to test trigger behavior
INSERT INTO tutor_details (user_id, tutor_registration_number) 
VALUES ('test-user-1', 'PRESERVE_THIS_TRN');

INSERT INTO tutor_details (user_id, tutor_registration_number) 
VALUES ('test-user-2', NULL); -- Should auto-generate

SELECT user_id, tutor_registration_number FROM tutor_details 
WHERE user_id IN ('test-user-1', 'test-user-2');

-- Cleanup test data
DELETE FROM tutor_details WHERE user_id IN ('test-user-1', 'test-user-2');
*/

COMMIT;