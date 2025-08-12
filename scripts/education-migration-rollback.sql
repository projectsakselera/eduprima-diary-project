-- ================================================================
-- EDUCATION DATA MIGRATION ROLLBACK SCRIPT
-- ================================================================
-- Purpose: Rollback education data migration in case of issues
-- DANGER: This will RESTORE the old duplicate structure
-- Only use this if migration failed or caused critical issues
-- ================================================================

-- ⚠️ CRITICAL WARNING ⚠️
-- This script will:
-- 1. Restore education columns to user_profiles
-- 2. Migrate data back from tutor_details to user_profiles  
-- 3. Remove new current_* columns from tutor_details
-- 4. This will LOSE any new education data entered after migration

\echo '================================================================='
\echo '⚠️  EDUCATION DATA MIGRATION ROLLBACK SCRIPT  ⚠️'
\echo '================================================================='
\echo ''
\echo 'DANGER: This will restore the old duplicate education structure!'
\echo 'Any new education data entered after migration will be LOST!'
\echo ''

-- Start transaction for safety
BEGIN;

-- ================================================================
-- PHASE 1: PRE-ROLLBACK VALIDATION
-- ================================================================

\echo '=== PHASE 1: PRE-ROLLBACK VALIDATION ==='

-- Check if backup table exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles_education_backup') THEN
        RAISE EXCEPTION 'ROLLBACK FAILED: Backup table user_profiles_education_backup does not exist!';
    END IF;
    
    IF (SELECT COUNT(*) FROM user_profiles_education_backup) = 0 THEN
        RAISE EXCEPTION 'ROLLBACK FAILED: Backup table is empty!';
    END IF;
    
    RAISE NOTICE 'Backup table validation passed: % records found', (SELECT COUNT(*) FROM user_profiles_education_backup);
END $$;

-- Check if new columns exist in tutor_details (they should exist if migration was run)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tutor_details' AND column_name = 'current_university') THEN
        RAISE EXCEPTION 'ROLLBACK FAILED: Migration appears to have never been run - current_university column does not exist';
    END IF;
    
    RAISE NOTICE 'Migration columns detected in tutor_details. Proceeding with rollback...';
END $$;

\echo 'Current state before rollback:'
SELECT 
    'tutor_details' as table_name,
    COUNT(*) as total_records,
    COUNT(current_university) as has_current_university,
    COUNT(current_faculty) as has_current_faculty,
    COUNT(current_major) as has_current_major,
    COUNT(current_gpa) as has_current_gpa
FROM tutor_details;

-- ================================================================
-- PHASE 2: RESTORE COLUMNS TO user_profiles
-- ================================================================

\echo '=== PHASE 2: RESTORING COLUMNS TO user_profiles ==='

-- Check if columns still exist (they shouldn't if migration was successful)
DO $$ 
DECLARE
    column_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO column_count
    FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
      AND column_name IN ('education_level', 'university', 'major', 'graduation_year', 'gpa');
    
    IF column_count > 0 THEN
        RAISE NOTICE 'Some education columns still exist in user_profiles. Checking which ones to add...';
    END IF;
END $$;

-- Add columns back to user_profiles (with IF NOT EXISTS safety)
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS education_level TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS university TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS major TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS graduation_year INTEGER;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS gpa DECIMAL(4,3);

-- Add comments to restored columns
COMMENT ON COLUMN user_profiles.education_level IS 'RESTORED: Academic status (statusAkademik) - duplicate with tutor_details.academic_status';
COMMENT ON COLUMN user_profiles.university IS 'RESTORED: University name (namaUniversitas) - duplicate with tutor_details.current_university';
COMMENT ON COLUMN user_profiles.major IS 'RESTORED: Major/program (jurusan) - duplicate with tutor_details.current_major';
COMMENT ON COLUMN user_profiles.graduation_year IS 'RESTORED: Graduation year (tahunLulus) - duplicate with tutor_details.current_graduation_year';
COMMENT ON COLUMN user_profiles.gpa IS 'RESTORED: GPA (ipk) - duplicate with tutor_details.current_gpa';

\echo 'Education columns restored to user_profiles'

-- ================================================================
-- PHASE 3: RESTORE DATA FROM BACKUP
-- ================================================================

\echo '=== PHASE 3: RESTORING DATA FROM BACKUP ==='

-- Restore data from backup table to user_profiles
UPDATE user_profiles 
SET 
  education_level = backup.education_level,
  university = backup.university,
  major = backup.major,
  graduation_year = backup.graduation_year,
  gpa = backup.gpa
FROM user_profiles_education_backup backup
WHERE user_profiles.user_id = backup.user_id;

\echo 'Data restored to user_profiles:'
SELECT 
    'user_profiles (restored)' as table_name,
    COUNT(*) as total_records,
    COUNT(education_level) as has_education_level,
    COUNT(university) as has_university,
    COUNT(major) as has_major,
    COUNT(graduation_year) as has_graduation_year,
    COUNT(gpa) as has_gpa
FROM user_profiles;

-- ================================================================
-- PHASE 4: RESTORE faculty_s1 LOGIC (REVERT THE FIX)
-- ================================================================

\echo '=== PHASE 4: REVERTING faculty_s1 LOGIC TO OLD STATE ==='

-- Note: This step is complex because we need to restore the "wrong" logic
-- that was in place before the migration. This means putting current faculty
-- back into faculty_s1 for non-S2/S3 students.

-- First, let's see what we're working with
\echo 'Current faculty_s1 distribution by academic status:'
SELECT 
  academic_status,
  COUNT(*) as total_count,
  COUNT(faculty_s1) as has_faculty_s1,
  COUNT(current_faculty) as has_current_faculty
FROM tutor_details 
WHERE academic_status IS NOT NULL
GROUP BY academic_status
ORDER BY academic_status;

-- For non-S2/S3 students, move current_faculty back to faculty_s1 (restoring old wrong logic)
UPDATE tutor_details 
SET faculty_s1 = current_faculty
WHERE academic_status NOT IN ('mahasiswa_s2', 'lulusan_s2', 'mahasiswa_s3', 'lulusan_s3', 'lainnya')
  AND academic_status IS NOT NULL
  AND current_faculty IS NOT NULL
  AND faculty_s1 IS NULL;

\echo 'faculty_s1 logic reverted to pre-migration state'

-- ================================================================
-- PHASE 5: CREATE ROLLBACK BACKUP
-- ================================================================

\echo '=== PHASE 5: CREATING ROLLBACK BACKUP ==='

-- Create backup of current tutor_details education data before removing columns
CREATE TABLE IF NOT EXISTS tutor_details_education_backup AS 
SELECT 
  user_id,
  academic_status,
  current_university,
  current_faculty,
  current_major,
  current_graduation_year,
  current_gpa,
  university_s1_name,
  faculty_s1,
  major_s1,
  NOW() as rollback_backup_created_at
FROM tutor_details 
WHERE current_university IS NOT NULL 
   OR current_faculty IS NOT NULL 
   OR current_major IS NOT NULL 
   OR current_graduation_year IS NOT NULL 
   OR current_gpa IS NOT NULL;

COMMENT ON TABLE tutor_details_education_backup IS 'Backup of tutor_details education data created during rollback. Contains migrated data that will be lost.';

\echo 'Rollback backup created:'
SELECT COUNT(*) as rollback_backup_record_count FROM tutor_details_education_backup;

-- ================================================================
-- PHASE 6: REMOVE NEW COLUMNS FROM tutor_details
-- ================================================================

\echo '=== PHASE 6: REMOVING NEW COLUMNS FROM tutor_details (DANGER!) ==='

-- Remove new current_* columns from tutor_details
ALTER TABLE tutor_details DROP COLUMN IF EXISTS current_university;
ALTER TABLE tutor_details DROP COLUMN IF EXISTS current_faculty;
ALTER TABLE tutor_details DROP COLUMN IF EXISTS current_major;
ALTER TABLE tutor_details DROP COLUMN IF EXISTS current_graduation_year;
ALTER TABLE tutor_details DROP COLUMN IF EXISTS current_gpa;

\echo 'New columns removed from tutor_details. Verifying removal:'

-- Verify columns were removed (should return 0 rows)
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'tutor_details' 
  AND column_name LIKE 'current_%';

-- ================================================================
-- PHASE 7: ROLLBACK VALIDATION
-- ================================================================

\echo '=== PHASE 7: ROLLBACK VALIDATION ==='

\echo 'Final state after rollback:'

-- user_profiles should have education data again
SELECT 
    'user_profiles (restored)' as table_name,
    COUNT(*) as total_records,
    COUNT(education_level) as has_education_level,
    COUNT(university) as has_university,
    COUNT(major) as has_major,
    COUNT(graduation_year) as has_graduation_year,
    COUNT(gpa) as has_gpa
FROM user_profiles;

-- tutor_details should not have current_* columns
SELECT 
    'tutor_details (reverted)' as table_name,
    COUNT(*) as total_records,
    COUNT(academic_status) as has_academic_status,
    COUNT(university_s1_name) as has_university_s1_name,
    COUNT(faculty_s1) as has_faculty_s1,
    COUNT(major_s1) as has_major_s1
FROM tutor_details;

-- Check for any remaining current_* columns (should be 0)
SELECT 
    'Current columns check' as validation_type,
    COUNT(*) as remaining_current_columns
FROM information_schema.columns 
WHERE table_name = 'tutor_details' 
  AND column_name LIKE 'current_%';

-- Sample data comparison
\echo 'Sample data comparison (first 3 records):'
SELECT 
  up.user_id,
  up.education_level as user_profiles_education_level,
  up.university as user_profiles_university,
  up.major as user_profiles_major,
  up.gpa as user_profiles_gpa,
  td.academic_status as tutor_details_academic_status,
  td.faculty_s1 as tutor_details_faculty_s1
FROM user_profiles up
JOIN tutor_details td ON td.user_id = up.user_id
WHERE up.university IS NOT NULL
ORDER BY up.user_id
LIMIT 3;

-- ================================================================
-- PHASE 8: CLEANUP OLD MIGRATION ARTIFACTS
-- ================================================================

\echo '=== PHASE 8: CLEANUP ==='

-- Rename backup tables to indicate rollback was performed
ALTER TABLE user_profiles_education_backup RENAME TO user_profiles_education_backup_pre_rollback;
COMMENT ON TABLE user_profiles_education_backup_pre_rollback IS 'Original backup from education migration, preserved after rollback';

\echo 'Backup tables renamed and preserved'

-- ================================================================
-- ROLLBACK SUMMARY
-- ================================================================

\echo '=== ROLLBACK COMPLETED ==='
\echo ''
\echo 'ROLLBACK SUMMARY:'
\echo '✅ Education columns restored to user_profiles'
\echo '✅ Data restored from backup'
\echo '✅ faculty_s1 logic reverted to old state'
\echo '✅ New current_* columns removed from tutor_details'
\echo '✅ Rollback backup created: tutor_details_education_backup'
\echo '✅ Original backup preserved: user_profiles_education_backup_pre_rollback'
\echo ''
\echo '⚠️  IMPORTANT NOTES:'
\echo '- System is now back to the old duplicate structure'
\echo '- Any new education data entered after migration has been lost'
\echo '- Code changes still need to be reverted manually'
\echo '- Edge Function mapping needs to be restored to old version'
\echo ''
\echo 'FILES TO REVERT:'
\echo '- supabase/functions/create-tutor-complete/index.ts'
\echo '- services/tutor-edge.service.ts (if modified)'
\echo ''

-- ================================================================
-- COMMIT ROLLBACK TRANSACTION  
-- ================================================================

\echo '=== COMMITTING ROLLBACK TRANSACTION ==='

-- Uncomment to commit rollback
COMMIT;

-- If you want to abort rollback, uncomment this:
-- ROLLBACK;

\echo '==================================================================='
\echo '🔄 ROLLBACK COMPLETED SUCCESSFULLY'
\echo '==================================================================='
\echo ''
\echo 'The system has been restored to the pre-migration state.'
\echo 'Remember to also revert any code changes that were made!'
\echo '==================================================================='
