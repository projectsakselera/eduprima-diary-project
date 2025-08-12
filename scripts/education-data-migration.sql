-- ================================================================
-- EDUCATION DATA ARCHITECTURE MIGRATION SCRIPT
-- ================================================================
-- Purpose: Migrate education data from user_profiles to tutor_details
-- Impact: HIGH - Major schema change with data migration
-- Estimated Duration: 2-3 hours
-- 
-- CRITICAL: Run this script in a transaction and test on staging first!
-- ================================================================

-- Start transaction for rollback capability
BEGIN;

-- ================================================================
-- PHASE 1: PRE-MIGRATION VALIDATION
-- ================================================================
-- Check current state before migration

\echo '=== PHASE 1: PRE-MIGRATION VALIDATION ==='

-- Check if new columns already exist (prevent double-run)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tutor_details' AND column_name = 'current_university') THEN
        RAISE EXCEPTION 'Migration already appears to be run - current_university column exists';
    END IF;
END $$;

-- Count current data to migrate
\echo 'Current education data counts:'
SELECT 
    'user_profiles' as source_table,
    COUNT(*) as total_users,
    COUNT(education_level) as has_education_level,
    COUNT(university) as has_university,
    COUNT(major) as has_major,
    COUNT(graduation_year) as has_graduation_year,
    COUNT(gpa) as has_gpa
FROM user_profiles;

SELECT 
    'tutor_details' as target_table,
    COUNT(*) as total_tutors,
    COUNT(academic_status) as has_academic_status,
    COUNT(faculty_s1) as has_faculty_s1_current,
    COUNT(university_s1_name) as has_university_s1_name,
    COUNT(major_s1) as has_major_s1
FROM tutor_details;

-- ================================================================
-- PHASE 2: CREATE NEW COLUMNS IN tutor_details
-- ================================================================

\echo '=== PHASE 2: ADDING NEW COLUMNS TO tutor_details ==='

-- Add current education columns
ALTER TABLE tutor_details ADD COLUMN current_university TEXT DEFAULT NULL;
ALTER TABLE tutor_details ADD COLUMN current_faculty TEXT DEFAULT NULL;
ALTER TABLE tutor_details ADD COLUMN current_major TEXT DEFAULT NULL;
ALTER TABLE tutor_details ADD COLUMN current_graduation_year INTEGER DEFAULT NULL;
ALTER TABLE tutor_details ADD COLUMN current_gpa DECIMAL(4,3) DEFAULT NULL;

-- Add column comments for documentation
COMMENT ON COLUMN tutor_details.current_university IS 'Current university name (namaUniversitas from form) - for all academic status except lainnya';
COMMENT ON COLUMN tutor_details.current_faculty IS 'Current faculty name (fakultas from form) - for all academic status except lainnya';
COMMENT ON COLUMN tutor_details.current_major IS 'Current major/program (jurusan from form) - for all academic status except lainnya';
COMMENT ON COLUMN tutor_details.current_graduation_year IS 'Current program graduation year (tahunLulus from form) - NULL if still studying';
COMMENT ON COLUMN tutor_details.current_gpa IS 'Current GPA (ipk from form), format: 4.000 - for all academic status except lainnya';

-- Update column comments for existing S1 columns for clarity
COMMENT ON COLUMN tutor_details.university_s1_name IS 'S1 university name (namaUniversitasS1 from form) - ONLY for S2/S3 students';
COMMENT ON COLUMN tutor_details.faculty_s1 IS 'S1 faculty name (fakultasS1 from form) - ONLY for S2/S3 students - WILL BE FIXED';
COMMENT ON COLUMN tutor_details.major_s1 IS 'S1 major/program (jurusanS1 from form) - ONLY for S2/S3 students';

-- Verify new columns were created successfully
\echo 'Verifying new columns:'
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    col_description(pgc.oid, a.attnum) as column_comment
FROM information_schema.columns c
JOIN pg_class pgc ON pgc.relname = c.table_name
JOIN pg_attribute a ON a.attrelid = pgc.oid AND a.attname = c.column_name
WHERE c.table_name = 'tutor_details' 
  AND c.column_name LIKE 'current_%'
ORDER BY c.column_name;

-- ================================================================
-- PHASE 3: DATA MIGRATION FROM user_profiles TO tutor_details
-- ================================================================

\echo '=== PHASE 3: DATA MIGRATION ==='

-- Step 3.1: Migrate basic education data from user_profiles to tutor_details
\echo 'Step 3.1: Migrating basic education data...'

UPDATE tutor_details 
SET 
  current_university = up.university,
  current_major = up.major,
  current_graduation_year = up.graduation_year,
  current_gpa = up.gpa
FROM user_profiles up 
WHERE up.user_id = tutor_details.user_id;

-- Get migration stats
\echo 'Migration Step 3.1 Results:'
SELECT 
    COUNT(*) as total_tutors,
    COUNT(current_university) as migrated_university,
    COUNT(current_major) as migrated_major,
    COUNT(current_graduation_year) as migrated_graduation_year,
    COUNT(current_gpa) as migrated_gpa
FROM tutor_details;

-- Step 3.2: Update academic_status from education_level if missing
\echo 'Step 3.2: Filling missing academic_status...'

UPDATE tutor_details 
SET academic_status = up.education_level
FROM user_profiles up 
WHERE up.user_id = tutor_details.user_id
  AND (tutor_details.academic_status IS NULL OR tutor_details.academic_status = 'unknown')
  AND up.education_level IS NOT NULL;

-- Show academic status distribution
\echo 'Academic status distribution after migration:'
SELECT 
    academic_status,
    COUNT(*) as count
FROM tutor_details 
WHERE academic_status IS NOT NULL
GROUP BY academic_status 
ORDER BY count DESC;

-- ================================================================
-- PHASE 4: FIX faculty_s1 LOGIC ISSUE
-- ================================================================

\echo '=== PHASE 4: FIXING faculty_s1 LOGIC ISSUE ==='

-- Step 4.1: Identify records with problematic faculty_s1 data
\echo 'Step 4.1: Identifying problematic faculty_s1 records...'

-- Create temporary table to track changes
CREATE TEMP TABLE faculty_s1_fixes AS
SELECT 
  td.user_id,
  td.academic_status,
  td.faculty_s1 as old_faculty_s1,
  td.current_faculty as old_current_faculty,
  CASE 
    WHEN td.academic_status IN ('mahasiswa_s2', 'lulusan_s2', 'mahasiswa_s3', 'lulusan_s3') 
    THEN 'keep_faculty_s1'
    ELSE 'move_to_current_faculty'
  END as action_needed
FROM tutor_details td 
WHERE td.faculty_s1 IS NOT NULL;

\echo 'Faculty S1 fix analysis:'
SELECT action_needed, COUNT(*) as count FROM faculty_s1_fixes GROUP BY action_needed;

-- Step 4.2: Fix faculty data for non-S2/S3 students
\echo 'Step 4.2: Moving faculty_s1 to current_faculty for non-S2/S3 students...'

UPDATE tutor_details 
SET 
  current_faculty = COALESCE(current_faculty, faculty_s1),
  faculty_s1 = NULL
WHERE academic_status NOT IN ('mahasiswa_s2', 'lulusan_s2', 'mahasiswa_s3', 'lulusan_s3')
  AND faculty_s1 IS NOT NULL;

-- Show fix results
\echo 'Faculty fix results:'
SELECT 
    fs.action_needed,
    COUNT(*) as total_records,
    COUNT(CASE WHEN td.current_faculty IS NOT NULL THEN 1 END) as has_current_faculty,
    COUNT(CASE WHEN td.faculty_s1 IS NOT NULL THEN 1 END) as has_faculty_s1
FROM faculty_s1_fixes fs
JOIN tutor_details td ON td.user_id = fs.user_id
GROUP BY fs.action_needed;

-- ================================================================
-- PHASE 5: DATA VALIDATION
-- ================================================================

\echo '=== PHASE 5: DATA VALIDATION ==='

-- Validation 1: Overall migration completeness
\echo 'Validation 1: Migration completeness comparison:'
SELECT 
  'BEFORE (user_profiles)' as data_source,
  COUNT(university) as has_university,
  COUNT(major) as has_major,
  COUNT(graduation_year) as has_graduation_year,
  COUNT(gpa) as has_gpa,
  COUNT(education_level) as has_education_level
FROM user_profiles
WHERE EXISTS (SELECT 1 FROM tutor_details WHERE tutor_details.user_id = user_profiles.user_id)

UNION ALL

SELECT 
  'AFTER (tutor_details)' as data_source,
  COUNT(current_university) as has_university,
  COUNT(current_major) as has_major,
  COUNT(current_graduation_year) as has_graduation_year,
  COUNT(current_gpa) as has_gpa,
  COUNT(academic_status) as has_education_level
FROM tutor_details;

-- Validation 2: Check for data loss (should be 0)
\echo 'Validation 2: Checking for data loss...'
SELECT 
    'Data Loss Check' as validation_type,
    COUNT(*) as records_with_potential_loss
FROM user_profiles up
LEFT JOIN tutor_details td ON td.user_id = up.user_id
WHERE up.university IS NOT NULL 
  AND td.current_university IS NULL
  AND td.user_id IS NOT NULL;

-- Validation 3: S1 data logic validation
\echo 'Validation 3: S1 data logic validation:'
SELECT 
  academic_status,
  COUNT(*) as total_count,
  COUNT(university_s1_name) as has_s1_university,
  COUNT(faculty_s1) as has_s1_faculty,
  COUNT(major_s1) as has_s1_major,
  COUNT(current_university) as has_current_university,
  COUNT(current_faculty) as has_current_faculty,
  COUNT(current_major) as has_current_major
FROM tutor_details 
WHERE academic_status IS NOT NULL
GROUP BY academic_status
ORDER BY 
  CASE 
    WHEN academic_status LIKE '%s1%' THEN 1
    WHEN academic_status LIKE '%s2%' THEN 2
    WHEN academic_status LIKE '%s3%' THEN 3
    WHEN academic_status = 'lulusan_d3' THEN 4
    WHEN academic_status = 'lainnya' THEN 5
    ELSE 6
  END;

-- Validation 4: Sample data verification (first 5 records)
\echo 'Validation 4: Sample data verification:'
SELECT 
  td.user_id,
  td.academic_status,
  td.current_university,
  td.current_faculty,
  td.current_major,
  td.current_gpa,
  td.university_s1_name,
  td.faculty_s1,
  td.major_s1,
  up.university as old_user_profiles_university,
  up.major as old_user_profiles_major,
  up.gpa as old_user_profiles_gpa
FROM tutor_details td
LEFT JOIN user_profiles up ON up.user_id = td.user_id
WHERE td.current_university IS NOT NULL 
   OR up.university IS NOT NULL
ORDER BY td.user_id
LIMIT 5;

-- ================================================================
-- PHASE 6: CREATE BACKUP OF OLD DATA
-- ================================================================

\echo '=== PHASE 6: CREATING BACKUP TABLE ==='

-- Create backup table with old user_profiles education data
CREATE TABLE IF NOT EXISTS user_profiles_education_backup AS 
SELECT 
  user_id,
  education_level,
  university,
  major,
  graduation_year,
  gpa,
  created_at,
  updated_at,
  NOW() as backup_created_at
FROM user_profiles 
WHERE education_level IS NOT NULL 
   OR university IS NOT NULL 
   OR major IS NOT NULL 
   OR graduation_year IS NOT NULL 
   OR gpa IS NOT NULL;

\echo 'Backup table created with records:'
SELECT COUNT(*) as backup_record_count FROM user_profiles_education_backup;

-- Add comment to backup table
COMMENT ON TABLE user_profiles_education_backup IS 'Backup of education data from user_profiles before migration to tutor_details. Created during education data migration.';

-- ================================================================
-- PHASE 7: REMOVE DUPLICATE COLUMNS FROM user_profiles
-- ================================================================

\echo '=== PHASE 7: REMOVING DUPLICATE COLUMNS (DANGER ZONE!) ==='
\echo 'WARNING: This step is IRREVERSIBLE!'

-- Final confirmation before dropping columns
DO $$ 
BEGIN
    -- Double-check that backup table exists and has data
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles_education_backup') THEN
        RAISE EXCEPTION 'Backup table does not exist! Cannot proceed with column removal.';
    END IF;
    
    -- Check that backup has data
    IF (SELECT COUNT(*) FROM user_profiles_education_backup) = 0 THEN
        RAISE EXCEPTION 'Backup table is empty! Cannot proceed with column removal.';
    END IF;
    
    RAISE NOTICE 'Backup verification passed. Proceeding with column removal...';
END $$;

-- Remove duplicate education columns from user_profiles
ALTER TABLE user_profiles DROP COLUMN IF EXISTS education_level;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS university;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS major;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS graduation_year;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS gpa;

\echo 'Removed columns from user_profiles. Verifying removal:'

-- Verify columns were removed (should return 0 rows)
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
  AND column_name IN ('education_level', 'university', 'major', 'graduation_year', 'gpa');

-- ================================================================
-- PHASE 8: FINAL VALIDATION
-- ================================================================

\echo '=== PHASE 8: FINAL VALIDATION ==='

-- Final stats
\echo 'FINAL MIGRATION STATISTICS:'
SELECT 
    'tutor_details' as table_name,
    COUNT(*) as total_records,
    COUNT(academic_status) as has_academic_status,
    COUNT(current_university) as has_current_university,
    COUNT(current_faculty) as has_current_faculty,
    COUNT(current_major) as has_current_major,
    COUNT(current_graduation_year) as has_current_graduation_year,
    COUNT(current_gpa) as has_current_gpa,
    COUNT(university_s1_name) as has_university_s1_name,
    COUNT(faculty_s1) as has_faculty_s1,
    COUNT(major_s1) as has_major_s1
FROM tutor_details;

\echo 'Migration completed successfully!';
\echo 'Backup table created: user_profiles_education_backup';
\echo 'New columns added to tutor_details: current_university, current_faculty, current_major, current_graduation_year, current_gpa';
\echo 'Fixed faculty_s1 logic for non-S2/S3 students';
\echo 'Removed duplicate columns from user_profiles: education_level, university, major, graduation_year, gpa';

-- ================================================================
-- COMMIT TRANSACTION
-- ================================================================

\echo '=== COMMITTING TRANSACTION ==='
\echo 'If everything looks correct above, the transaction will be committed.'
\echo 'If you see any issues, you can still ROLLBACK before this point.'

-- Uncomment the next line to commit the transaction
COMMIT;

-- If you want to rollback instead, uncomment this line:
-- ROLLBACK;

\echo '=== MIGRATION COMPLETED SUCCESSFULLY ==='
