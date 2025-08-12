-- ================================================================
-- EDUCATION DATA MIGRATION - TEST DATA SCRIPT
-- ================================================================
-- Purpose: Create sample test data for migration testing
-- Run this on staging environment before running actual migration
-- ================================================================

\echo '==================================================================='
\echo 'EDUCATION DATA MIGRATION - TEST DATA SETUP'
\echo '==================================================================='
\echo ''
\echo 'This script will create sample test data to validate migration logic.'
\echo 'Run this on staging environment only!'
\echo ''

-- Start transaction
BEGIN;

-- ================================================================
-- PHASE 1: CREATE TEST USERS AND TUTORS
-- ================================================================

\echo '=== PHASE 1: CREATING TEST USERS AND TUTORS ==='

-- Get tutor role ID
DO $$ 
DECLARE
    tutor_role_id UUID;
BEGIN
    SELECT id INTO tutor_role_id FROM user_roles WHERE role_name = 'Tutor' LIMIT 1;
    
    IF tutor_role_id IS NULL THEN
        RAISE EXCEPTION 'Tutor role not found! Cannot create test data.';
    END IF;
    
    -- Create test users in users_universal
    INSERT INTO users_universal (id, email, password_hash, primary_role_id, user_status, user_code)
    VALUES 
        ('00000000-1111-2222-3333-444444444401', 'test.s1.student@eduprima.test', 'test_hash_1', tutor_role_id, 'active', 'USR-TEST-S1-001'),
        ('00000000-1111-2222-3333-444444444402', 'test.s2.student@eduprima.test', 'test_hash_2', tutor_role_id, 'active', 'USR-TEST-S2-002'),
        ('00000000-1111-2222-3333-444444444403', 'test.graduate.s1@eduprima.test', 'test_hash_3', tutor_role_id, 'active', 'USR-TEST-GS1-003'),
        ('00000000-1111-2222-3333-444444444404', 'test.alternative@eduprima.test', 'test_hash_4', tutor_role_id, 'active', 'USR-TEST-ALT-004'),
        ('00000000-1111-2222-3333-444444444405', 'test.d3.graduate@eduprima.test', 'test_hash_5', tutor_role_id, 'active', 'USR-TEST-D3-005'),
        ('00000000-1111-2222-3333-444444444406', 'test.s3.student@eduprima.test', 'test_hash_6', tutor_role_id, 'active', 'USR-TEST-S3-006')
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'Test users created successfully';
END $$;

-- Create corresponding tutor_details records
INSERT INTO tutor_details (
    id, user_id, tutor_registration_number, academic_status,
    university_s1_name, faculty_s1, major_s1,
    high_school, high_school_major, high_school_graduation_year, vocational_school_detail,
    alternative_institution_name, expertise_field, learning_experience,
    entry_year, form_agreement_check, onboarding_status
)
VALUES 
    -- S1 Student (should have current data only)
    ('11111111-1111-2222-3333-444444444401', '00000000-1111-2222-3333-444444444401', 70001, 'mahasiswa_s1',
     NULL, NULL, NULL,  -- S1 fields should be NULL
     'SMA Negeri 1 Test', 'IPA', 2020, NULL,
     NULL, NULL, NULL,
     2021, true, 'pending'),
    
    -- S2 Student (should have both current and S1 data)
    ('11111111-1111-2222-3333-444444444402', '00000000-1111-2222-3333-444444444402', 70008, 'mahasiswa_s2',
     'Universitas S1 Test', 'Fakultas Teknik S1', 'Teknik Informatika S1',  -- S1 background
     'SMA Negeri 2 Test', 'IPA', 2018, NULL,
     NULL, NULL, NULL,
     2023, true, 'pending'),
     
    -- S1 Graduate (should have current data only)
    ('11111111-1111-2222-3333-444444444403', '00000000-1111-2222-3333-444444444403', 70015, 'lulusan_s1',
     NULL, NULL, NULL,  -- S1 fields should be NULL
     'SMA Negeri 3 Test', 'IPS', 2016, NULL,
     NULL, NULL, NULL,
     2017, true, 'pending'),
     
    -- Alternative Learning (should have alternative data only)
    ('11111111-1111-2222-3333-444444444404', '00000000-1111-2222-3333-444444444404', 70022, 'lainnya',
     NULL, NULL, NULL,
     NULL, NULL, NULL, NULL,  -- No high school data
     'Bootcamp Programming Test', 'Full Stack Web Development', 'Self-taught programmer with 3 years experience in React and Node.js',
     NULL, true, 'pending'),
     
    -- D3 Graduate (should have current data only)
    ('11111111-1111-2222-3333-444444444405', '00000000-1111-2222-3333-444444444405', 70029, 'lulusan_d3',
     NULL, NULL, NULL,  -- S1 fields should be NULL
     'SMK Negeri 1 Test', 'SMK', 2018, 'Teknik Komputer dan Jaringan',
     NULL, NULL, NULL,
     2019, true, 'pending'),
     
    -- S3 Student (should have both current and S1 data)
    ('11111111-1111-2222-3333-444444444406', '00000000-1111-2222-3333-444444444406', 70036, 'mahasiswa_s3',
     'Universitas S1 Test 2', 'Fakultas MIPA S1', 'Matematika S1',  -- S1 background
     'SMA Negeri 4 Test', 'IPA', 2015, NULL,
     NULL, NULL, NULL,
     2024, true, 'pending')
ON CONFLICT (id) DO NOTHING;

-- Create user_profiles with DUPLICATE education data (this is the problematic current state)
INSERT INTO user_profiles (
    user_id, full_name, nick_name, date_of_birth, gender, mobile_phone,
    education_level, university, major, graduation_year, gpa
)
VALUES 
    -- S1 Student
    ('00000000-1111-2222-3333-444444444401', 'Test S1 Student', 'TestS1', '2000-01-01', 'Laki-laki', '081234567001',
     'mahasiswa_s1', 'Universitas Test S1', 'Teknik Informatika', NULL, 3.75),
    
    -- S2 Student (current education, NOT S1 background)
    ('00000000-1111-2222-3333-444444444402', 'Test S2 Student', 'TestS2', '1998-02-02', 'Perempuan', '081234567002',
     'mahasiswa_s2', 'Universitas Test S2', 'Magister Ilmu Komputer', NULL, 3.80),
    
    -- S1 Graduate
    ('00000000-1111-2222-3333-444444444403', 'Test S1 Graduate', 'TestGS1', '1999-03-03', 'Laki-laki', '081234567003',
     'lulusan_s1', 'Universitas Test Graduate', 'Ekonomi', 2021, 3.65),
    
    -- Alternative Learning (should have NULL university data)
    ('00000000-1111-2222-3333-444444444404', 'Test Alternative', 'TestAlt', '1995-04-04', 'Perempuan', '081234567004',
     'lainnya', NULL, NULL, NULL, NULL),
    
    -- D3 Graduate
    ('00000000-1111-2222-3333-444444444405', 'Test D3 Graduate', 'TestD3', '2000-05-05', 'Laki-laki', '081234567005',
     'lulusan_d3', 'Politeknik Test', 'Teknik Komputer', 2022, 3.50),
     
    -- S3 Student
    ('00000000-1111-2222-3333-444444444406', 'Test S3 Student', 'TestS3', '1990-06-06', 'Perempuan', '081234567006',
     'mahasiswa_s3', 'Universitas Test S3', 'Doktor Matematika', NULL, 3.90)
ON CONFLICT (user_id) DO NOTHING;

-- Create some addresses (required for complete tutor profile)
INSERT INTO user_addresses (user_id, address_type, province_id, city_id, district_name, village_name, street_address, is_primary)
VALUES 
    ('00000000-1111-2222-3333-444444444401', 'domicile', '31', '3171', 'Test District 1', 'Test Village 1', 'Test Address 1', true),
    ('00000000-1111-2222-3333-444444444402', 'domicile', '32', '3201', 'Test District 2', 'Test Village 2', 'Test Address 2', true),
    ('00000000-1111-2222-3333-444444444403', 'domicile', '33', '3301', 'Test District 3', 'Test Village 3', 'Test Address 3', true),
    ('00000000-1111-2222-3333-444444444404', 'domicile', '34', '3401', 'Test District 4', 'Test Village 4', 'Test Address 4', true),
    ('00000000-1111-2222-3333-444444444405', 'domicile', '35', '3501', 'Test District 5', 'Test Village 5', 'Test Address 5', true),
    ('00000000-1111-2222-3333-444444444406', 'domicile', '36', '3601', 'Test District 6', 'Test Village 6', 'Test Address 6', true)
ON CONFLICT (user_id, address_type) DO NOTHING;

-- ================================================================
-- PHASE 2: DEMONSTRATE CURRENT PROBLEMATIC STATE
-- ================================================================

\echo '=== PHASE 2: CURRENT PROBLEMATIC STATE DEMONSTRATION ==='

\echo 'BEFORE MIGRATION - Current duplicate data structure:'

\echo 'user_profiles education data:'
SELECT 
    up.user_id,
    up.full_name,
    up.education_level,
    up.university,
    up.major,
    up.graduation_year,
    up.gpa
FROM user_profiles up
WHERE up.user_id LIKE '00000000-1111-2222-3333-44444444440%'
ORDER BY up.user_id;

\echo ''
\echo 'tutor_details education data:'
SELECT 
    td.user_id,
    td.academic_status,
    td.university_s1_name,
    td.faculty_s1,
    td.major_s1,
    td.high_school,
    td.high_school_major,
    td.alternative_institution_name,
    td.expertise_field
FROM tutor_details td
WHERE td.user_id LIKE '00000000-1111-2222-3333-44444444440%'
ORDER BY td.user_id;

\echo ''
\echo 'PROBLEMS TO BE FIXED:'
\echo '1. education_level in user_profiles DUPLICATES academic_status in tutor_details'
\echo '2. university/major in user_profiles is SEPARATE from tutor_details'
\echo '3. faculty_s1 in tutor_details has WRONG data for non-S2/S3 students'
\echo '4. Current university data is SPLIT between two tables'

-- ================================================================
-- PHASE 3: MIGRATION EXPECTATIONS
-- ================================================================

\echo ''
\echo '=== PHASE 3: MIGRATION EXPECTATIONS ==='

\echo 'AFTER MIGRATION - Expected results:'
\echo ''
\echo 'S1 Student (00000000-1111-2222-3333-444444444401):'
\echo '  ✅ current_university: "Universitas Test S1"'
\echo '  ✅ current_major: "Teknik Informatika"' 
\echo '  ✅ current_gpa: 3.75'
\echo '  ✅ university_s1_name: NULL (not S2/S3)'
\echo '  ✅ faculty_s1: NULL (not S2/S3)'

\echo ''
\echo 'S2 Student (00000000-1111-2222-3333-444444444402):'
\echo '  ✅ current_university: "Universitas Test S2"'
\echo '  ✅ current_major: "Magister Ilmu Komputer"'
\echo '  ✅ current_gpa: 3.80'
\echo '  ✅ university_s1_name: "Universitas S1 Test" (S1 background)'
\echo '  ✅ faculty_s1: "Fakultas Teknik S1" (S1 background)'
\echo '  ✅ major_s1: "Teknik Informatika S1" (S1 background)'

\echo ''
\echo 'Alternative Learning (00000000-1111-2222-3333-444444444404):'
\echo '  ✅ current_university: NULL'
\echo '  ✅ alternative_institution_name: "Bootcamp Programming Test"'
\echo '  ✅ expertise_field: "Full Stack Web Development"'

-- ================================================================
-- PHASE 4: TEST DATA SUMMARY
-- ================================================================

\echo ''
\echo '=== PHASE 4: TEST DATA SUMMARY ==='

SELECT 
    'Test Data Created' as status,
    COUNT(*) as test_users_count
FROM user_profiles 
WHERE user_id LIKE '00000000-1111-2222-3333-44444444440%';

SELECT 
    'Test Tutors Created' as status,
    COUNT(*) as test_tutors_count
FROM tutor_details 
WHERE user_id LIKE '00000000-1111-2222-3333-44444444440%';

-- Show academic status distribution
\echo 'Test data distribution by academic status:'
SELECT 
    academic_status,
    COUNT(*) as count
FROM tutor_details 
WHERE user_id LIKE '00000000-1111-2222-3333-44444444440%'
GROUP BY academic_status
ORDER BY academic_status;

\echo ''
\echo '==================================================================='
\echo 'TEST DATA SETUP COMPLETED'
\echo '==================================================================='
\echo ''
\echo 'Next steps:'
\echo '1. Run: education-data-migration.sql'
\echo '2. Run: education-migration-validation.sql'
\echo '3. Verify expected results match actual results'
\echo '4. If satisfied, run migration on production'
\echo '5. If issues found, run: education-migration-rollback.sql'
\echo ''
\echo 'Test user IDs created:'
\echo '- S1 Student: 00000000-1111-2222-3333-444444444401'
\echo '- S2 Student: 00000000-1111-2222-3333-444444444402'
\echo '- S1 Graduate: 00000000-1111-2222-3333-444444444403'
\echo '- Alternative: 00000000-1111-2222-3333-444444444404'
\echo '- D3 Graduate: 00000000-1111-2222-3333-444444444405'
\echo '- S3 Student: 00000000-1111-2222-3333-444444444406'
\echo '==================================================================='

-- Commit test data
COMMIT;

\echo '✅ Test data committed successfully!'
