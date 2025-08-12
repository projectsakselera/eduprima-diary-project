-- ================================================================
-- EDUCATION DATA MIGRATION VALIDATION SCRIPT
-- ================================================================
-- Purpose: Validate the success of education data migration
-- Run this after: education-data-migration.sql
-- ================================================================

\echo '==================================================================='
\echo 'EDUCATION DATA MIGRATION VALIDATION REPORT'
\echo '==================================================================='
\echo ''

-- ================================================================
-- VALIDATION 1: SCHEMA VALIDATION
-- ================================================================

\echo '1. SCHEMA VALIDATION'
\echo '===================='

\echo 'New columns in tutor_details:'
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    COALESCE(col_description(pgc.oid, a.attnum), 'No comment') as column_comment
FROM information_schema.columns c
JOIN pg_class pgc ON pgc.relname = c.table_name
JOIN pg_attribute a ON a.attrelid = pgc.oid AND a.attname = c.column_name
WHERE c.table_name = 'tutor_details' 
  AND c.column_name LIKE 'current_%'
ORDER BY c.column_name;

\echo ''
\echo 'Removed columns from user_profiles (should be empty):'
SELECT 
    column_name,
    'SHOULD NOT EXIST' as status
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
  AND column_name IN ('education_level', 'university', 'major', 'graduation_year', 'gpa');

-- ================================================================
-- VALIDATION 2: DATA COMPLETENESS
-- ================================================================

\echo ''
\echo '2. DATA COMPLETENESS VALIDATION'
\echo '==============================='

\echo 'Overall data distribution:'
SELECT 
    'tutor_details' as table_name,
    COUNT(*) as total_records,
    COUNT(academic_status) as has_academic_status,
    COUNT(current_university) as has_current_university,
    COUNT(current_faculty) as has_current_faculty,
    COUNT(current_major) as has_current_major,
    COUNT(current_graduation_year) as has_current_graduation_year,
    COUNT(current_gpa) as has_current_gpa,
    ROUND(COUNT(current_university)::decimal / COUNT(*)::decimal * 100, 2) as university_completion_rate,
    ROUND(COUNT(current_gpa)::decimal / COUNT(*)::decimal * 100, 2) as gpa_completion_rate
FROM tutor_details;

\echo ''
\echo 'Backup table validation:'
SELECT 
    'user_profiles_education_backup' as table_name,
    COUNT(*) as backup_record_count,
    COUNT(university) as had_university,
    COUNT(major) as had_major,
    COUNT(gpa) as had_gpa,
    MAX(backup_created_at) as backup_timestamp
FROM user_profiles_education_backup;

-- ================================================================
-- VALIDATION 3: DATA INTEGRITY BY ACADEMIC STATUS
-- ================================================================

\echo ''
\echo '3. DATA INTEGRITY BY ACADEMIC STATUS'
\echo '===================================='

\echo 'Education data by academic status:'
SELECT 
  COALESCE(academic_status, 'NULL') as academic_status,
  COUNT(*) as total_count,
  COUNT(current_university) as has_current_university,
  COUNT(current_faculty) as has_current_faculty,
  COUNT(current_major) as has_current_major,
  COUNT(current_gpa) as has_current_gpa,
  COUNT(university_s1_name) as has_s1_university,
  COUNT(faculty_s1) as has_s1_faculty,
  COUNT(major_s1) as has_s1_major,
  COUNT(alternative_institution_name) as has_alternative_institution
FROM tutor_details 
GROUP BY academic_status
ORDER BY 
  CASE 
    WHEN academic_status LIKE '%s1%' THEN 1
    WHEN academic_status LIKE '%s2%' THEN 2
    WHEN academic_status LIKE '%s3%' THEN 3
    WHEN academic_status = 'lulusan_d3' THEN 4
    WHEN academic_status = 'lainnya' THEN 5
    ELSE 6
  END,
  academic_status;

-- ================================================================
-- VALIDATION 4: LOGIC VALIDATION (S2/S3 vs NON-S2/S3)
-- ================================================================

\echo ''
\echo '4. LOGIC VALIDATION'
\echo '=================='

\echo 'S2/S3 students should have both current AND S1 data:'
SELECT 
  'S2/S3 Students' as group_type,
  COUNT(*) as total_students,
  COUNT(CASE WHEN current_university IS NOT NULL THEN 1 END) as has_current_university,
  COUNT(CASE WHEN university_s1_name IS NOT NULL THEN 1 END) as has_s1_university,
  COUNT(CASE WHEN current_university IS NOT NULL AND university_s1_name IS NOT NULL THEN 1 END) as has_both_complete,
  ROUND(
    COUNT(CASE WHEN current_university IS NOT NULL AND university_s1_name IS NOT NULL THEN 1 END)::decimal / 
    COUNT(*)::decimal * 100, 2
  ) as completion_rate_percent
FROM tutor_details 
WHERE academic_status IN ('mahasiswa_s2', 'lulusan_s2', 'mahasiswa_s3', 'lulusan_s3');

\echo ''
\echo 'Non-S2/S3 students should have current data only (S1 fields should be NULL):'
SELECT 
  'Non-S2/S3 Students' as group_type,
  COUNT(*) as total_students,
  COUNT(CASE WHEN current_university IS NOT NULL THEN 1 END) as has_current_university,
  COUNT(CASE WHEN university_s1_name IS NOT NULL THEN 1 END) as has_s1_university_should_be_zero,
  COUNT(CASE WHEN faculty_s1 IS NOT NULL THEN 1 END) as has_s1_faculty_should_be_zero,
  COUNT(CASE WHEN major_s1 IS NOT NULL THEN 1 END) as has_s1_major_should_be_zero
FROM tutor_details 
WHERE academic_status NOT IN ('mahasiswa_s2', 'lulusan_s2', 'mahasiswa_s3', 'lulusan_s3', 'lainnya')
  AND academic_status IS NOT NULL;

\echo ''
\echo 'Alternative learning students should have alternative data only:'
SELECT 
  'Alternative Learning' as group_type,
  COUNT(*) as total_students,
  COUNT(CASE WHEN alternative_institution_name IS NOT NULL THEN 1 END) as has_alternative_institution,
  COUNT(CASE WHEN expertise_field IS NOT NULL THEN 1 END) as has_expertise_field,
  COUNT(CASE WHEN current_university IS NOT NULL THEN 1 END) as has_current_university_should_be_zero
FROM tutor_details 
WHERE academic_status = 'lainnya';

-- ================================================================
-- VALIDATION 5: DATA QUALITY CHECKS
-- ================================================================

\echo ''
\echo '5. DATA QUALITY CHECKS'
\echo '====================='

\echo 'GPA value ranges (should be between 0.00 and 4.00):'
SELECT 
  'GPA Range Analysis' as check_type,
  COUNT(*) as total_gpa_records,
  MIN(current_gpa) as min_gpa,
  MAX(current_gpa) as max_gpa,
  AVG(current_gpa) as avg_gpa,
  COUNT(CASE WHEN current_gpa < 0 OR current_gpa > 4 THEN 1 END) as invalid_gpa_count
FROM tutor_details 
WHERE current_gpa IS NOT NULL;

\echo ''
\echo 'Graduation year ranges (should be reasonable):'
SELECT 
  'Graduation Year Analysis' as check_type,
  COUNT(*) as total_graduation_records,
  MIN(current_graduation_year) as earliest_year,
  MAX(current_graduation_year) as latest_year,
  COUNT(CASE WHEN current_graduation_year < 1950 OR current_graduation_year > EXTRACT(YEAR FROM NOW()) + 10 THEN 1 END) as potentially_invalid_years
FROM tutor_details 
WHERE current_graduation_year IS NOT NULL;

\echo ''
\echo 'Text field length analysis:'
SELECT 
  'Text Field Lengths' as check_type,
  AVG(LENGTH(current_university)) as avg_university_length,
  MAX(LENGTH(current_university)) as max_university_length,
  AVG(LENGTH(current_major)) as avg_major_length,
  MAX(LENGTH(current_major)) as max_major_length,
  COUNT(CASE WHEN LENGTH(current_university) > 255 THEN 1 END) as university_too_long,
  COUNT(CASE WHEN LENGTH(current_major) > 255 THEN 1 END) as major_too_long
FROM tutor_details 
WHERE current_university IS NOT NULL OR current_major IS NOT NULL;

-- ================================================================
-- VALIDATION 6: SAMPLE DATA VERIFICATION
-- ================================================================

\echo ''
\echo '6. SAMPLE DATA VERIFICATION'
\echo '=========================='

\echo 'Sample S1 student records:'
SELECT 
  user_id,
  academic_status,
  current_university,
  current_faculty,
  current_major,
  current_gpa,
  university_s1_name as s1_uni_should_be_null,
  faculty_s1 as s1_faculty_should_be_null
FROM tutor_details 
WHERE academic_status IN ('mahasiswa_s1', 'lulusan_s1')
  AND current_university IS NOT NULL
ORDER BY user_id
LIMIT 3;

\echo ''
\echo 'Sample S2 student records:'
SELECT 
  user_id,
  academic_status,
  current_university,
  current_major,
  current_gpa,
  university_s1_name,
  faculty_s1,
  major_s1
FROM tutor_details 
WHERE academic_status IN ('mahasiswa_s2', 'lulusan_s2')
  AND current_university IS NOT NULL
ORDER BY user_id
LIMIT 3;

\echo ''
\echo 'Sample alternative learning records:'
SELECT 
  user_id,
  academic_status,
  alternative_institution_name,
  expertise_field,
  current_university as should_be_null,
  university_s1_name as should_be_null_too
FROM tutor_details 
WHERE academic_status = 'lainnya'
ORDER BY user_id
LIMIT 3;

-- ================================================================
-- VALIDATION 7: MIGRATION IMPACT SUMMARY
-- ================================================================

\echo ''
\echo '7. MIGRATION IMPACT SUMMARY'
\echo '=========================='

WITH migration_stats AS (
  SELECT 
    COUNT(*) as total_tutors,
    COUNT(CASE WHEN current_university IS NOT NULL THEN 1 END) as tutors_with_university,
    COUNT(CASE WHEN current_gpa IS NOT NULL THEN 1 END) as tutors_with_gpa,
    COUNT(CASE WHEN academic_status IN ('mahasiswa_s2', 'lulusan_s2', 'mahasiswa_s3', 'lulusan_s3') 
          AND university_s1_name IS NOT NULL THEN 1 END) as s2s3_with_s1_data,
    COUNT(CASE WHEN academic_status = 'lainnya' 
          AND alternative_institution_name IS NOT NULL THEN 1 END) as alternative_with_institution,
    (SELECT COUNT(*) FROM user_profiles_education_backup) as backup_record_count
  FROM tutor_details
)
SELECT 
  'MIGRATION SUCCESS SUMMARY' as summary_type,
  total_tutors,
  tutors_with_university,
  ROUND(tutors_with_university::decimal / total_tutors::decimal * 100, 2) as university_coverage_percent,
  tutors_with_gpa,
  ROUND(tutors_with_gpa::decimal / total_tutors::decimal * 100, 2) as gpa_coverage_percent,
  s2s3_with_s1_data,
  alternative_with_institution,
  backup_record_count,
  CASE 
    WHEN backup_record_count > 0 THEN '✅ BACKUP CREATED'
    ELSE '❌ NO BACKUP FOUND'
  END as backup_status
FROM migration_stats;

-- ================================================================
-- VALIDATION 8: POTENTIAL ISSUES DETECTION
-- ================================================================

\echo ''
\echo '8. POTENTIAL ISSUES DETECTION'
\echo '============================'

\echo 'Checking for potential data loss or corruption:'

-- Check 1: S2/S3 students missing S1 data
WITH s2s3_issues AS (
  SELECT COUNT(*) as count
  FROM tutor_details 
  WHERE academic_status IN ('mahasiswa_s2', 'lulusan_s2', 'mahasiswa_s3', 'lulusan_s3')
    AND (university_s1_name IS NULL OR faculty_s1 IS NULL OR major_s1 IS NULL)
)
SELECT 
  'S2/S3 Missing S1 Data' as issue_type,
  count as affected_records,
  CASE WHEN count > 0 THEN '⚠️ REVIEW NEEDED' ELSE '✅ OK' END as status
FROM s2s3_issues

UNION ALL

-- Check 2: Non-S2/S3 students with S1 data (should be cleaned up)
SELECT 
  'Non-S2/S3 with S1 Data' as issue_type,
  COUNT(*) as affected_records,
  CASE WHEN COUNT(*) > 0 THEN '⚠️ REVIEW NEEDED' ELSE '✅ OK' END as status
FROM tutor_details 
WHERE academic_status NOT IN ('mahasiswa_s2', 'lulusan_s2', 'mahasiswa_s3', 'lulusan_s3', 'lainnya')
  AND academic_status IS NOT NULL
  AND (university_s1_name IS NOT NULL OR faculty_s1 IS NOT NULL OR major_s1 IS NOT NULL)

UNION ALL

-- Check 3: Alternative learning with university data
SELECT 
  'Alternative with University Data' as issue_type,
  COUNT(*) as affected_records,
  CASE WHEN COUNT(*) > 0 THEN '⚠️ REVIEW NEEDED' ELSE '✅ OK' END as status
FROM tutor_details 
WHERE academic_status = 'lainnya'
  AND (current_university IS NOT NULL OR university_s1_name IS NOT NULL)

UNION ALL

-- Check 4: Invalid GPA values
SELECT 
  'Invalid GPA Values' as issue_type,
  COUNT(*) as affected_records,
  CASE WHEN COUNT(*) > 0 THEN '❌ FIX REQUIRED' ELSE '✅ OK' END as status
FROM tutor_details 
WHERE current_gpa IS NOT NULL 
  AND (current_gpa < 0 OR current_gpa > 4);

-- ================================================================
-- FINAL REPORT
-- ================================================================

\echo ''
\echo '==================================================================='
\echo 'VALIDATION COMPLETED'
\echo '==================================================================='
\echo ''
\echo 'KEY POINTS TO VERIFY:'
\echo '1. ✅ New current_* columns should exist in tutor_details'
\echo '2. ✅ Old education columns should be removed from user_profiles' 
\echo '3. ✅ Backup table should exist with original data'
\echo '4. ✅ S2/S3 students should have both current and S1 data'
\echo '5. ✅ Non-S2/S3 students should have current data only'
\echo '6. ✅ Alternative learning should have alternative data only'
\echo '7. ✅ GPA values should be between 0.00-4.00'
\echo '8. ✅ No data should be lost during migration'
\echo ''
\echo 'If any validation shows issues, check the detailed output above.'
\echo 'Migration can be rolled back using education-migration-rollback.sql'
\echo '==================================================================='
