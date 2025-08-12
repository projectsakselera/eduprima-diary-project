# Education Data Migration Guide

## ⚠️ CRITICAL MIGRATION ALERT

**This is a major database schema change that affects core education data storage.**

**Impact Level: HIGH**
- Database schema modification
- Data migration required
- Code changes in multiple files
- Potential downtime required

---

## 📋 Pre-Migration Checklist

### ✅ **Before Starting Migration:**

1. **Database Backup**
   ```bash
   # Create full database backup
   pg_dump your_database_name > backup_before_education_migration_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Code Backup**
   ```bash
   # Create Git branch for migration
   git checkout -b education-data-migration
   git add -A
   git commit -m "Backup before education data migration"
   ```

3. **Test Environment Setup**
   - Deploy current code to staging environment
   - Import production data to staging
   - Test migration on staging first

4. **Downtime Planning**
   - Schedule maintenance window
   - Notify users of temporary service unavailability
   - Prepare rollback plan

---

## 🗃️ Migration SQL Scripts

### **Phase 1: Add New Columns to tutor_details**

```sql
-- Add new current education columns
ALTER TABLE tutor_details ADD COLUMN current_university TEXT DEFAULT NULL;
ALTER TABLE tutor_details ADD COLUMN current_faculty TEXT DEFAULT NULL;
ALTER TABLE tutor_details ADD COLUMN current_major TEXT DEFAULT NULL;
ALTER TABLE tutor_details ADD COLUMN current_graduation_year INTEGER DEFAULT NULL;
ALTER TABLE tutor_details ADD COLUMN current_gpa DECIMAL(4,3) DEFAULT NULL;

-- Add comments for documentation
COMMENT ON COLUMN tutor_details.current_university IS 'Current university name (namaUniversitas from form)';
COMMENT ON COLUMN tutor_details.current_faculty IS 'Current faculty name (fakultas from form)';
COMMENT ON COLUMN tutor_details.current_major IS 'Current major/program (jurusan from form)';
COMMENT ON COLUMN tutor_details.current_graduation_year IS 'Current program graduation year (tahunLulus from form)';
COMMENT ON COLUMN tutor_details.current_gpa IS 'Current GPA (ipk from form), format: 4.000';

-- Verify columns were added successfully
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'tutor_details' 
  AND column_name LIKE 'current_%'
ORDER BY column_name;
```

### **Phase 2: Migrate Existing Data**

```sql
-- Step 1: Migrate education data from user_profiles to tutor_details
UPDATE tutor_details 
SET 
  current_university = up.university,
  current_major = up.major,
  current_graduation_year = up.graduation_year,
  current_gpa = up.gpa
FROM user_profiles up 
WHERE up.user_id = tutor_details.user_id
  AND up.university IS NOT NULL;

-- Step 2: Update academic_status if it's missing (from user_profiles.education_level)
UPDATE tutor_details 
SET academic_status = up.education_level
FROM user_profiles up 
WHERE up.user_id = tutor_details.user_id
  AND tutor_details.academic_status IS NULL
  AND up.education_level IS NOT NULL;

-- Step 3: Fix faculty_s1 logic (currently has wrong data for non-S2/S3 students)
-- WARNING: This requires manual review of existing data!
-- Current logic stores current faculty in faculty_s1 for non-S2/S3 students
-- We need to move this to current_faculty and clear faculty_s1

-- First, identify problematic records
SELECT 
  td.user_id,
  td.academic_status,
  td.faculty_s1,
  td.current_faculty,
  CASE 
    WHEN td.academic_status IN ('mahasiswa_s2', 'lulusan_s2', 'mahasiswa_s3', 'lulusan_s3') 
    THEN 'Keep faculty_s1 (S2/S3 student)'
    ELSE 'Move faculty_s1 to current_faculty'
  END as action_needed
FROM tutor_details td 
WHERE td.faculty_s1 IS NOT NULL
ORDER BY td.academic_status;

-- Fix faculty data for non-S2/S3 students
UPDATE tutor_details 
SET 
  current_faculty = faculty_s1,
  faculty_s1 = NULL
WHERE academic_status NOT IN ('mahasiswa_s2', 'lulusan_s2', 'mahasiswa_s3', 'lulusan_s3')
  AND faculty_s1 IS NOT NULL
  AND current_faculty IS NULL;
```

### **Phase 3: Data Validation**

```sql
-- Validation Query 1: Check data migration completeness
SELECT 
  'tutor_details' as table_name,
  COUNT(*) as total_records,
  COUNT(current_university) as has_current_university,
  COUNT(current_major) as has_current_major,
  COUNT(current_gpa) as has_current_gpa
FROM tutor_details
UNION ALL
SELECT 
  'user_profiles' as table_name,
  COUNT(*) as total_records,
  COUNT(university) as has_university,
  COUNT(major) as has_major,
  COUNT(gpa) as has_gpa
FROM user_profiles;

-- Validation Query 2: Check for data inconsistencies
SELECT 
  td.user_id,
  td.academic_status,
  td.current_university,
  td.current_faculty,
  td.current_major,
  td.current_gpa,
  td.faculty_s1,
  td.university_s1_name,
  td.major_s1,
  up.university as user_profiles_university,
  up.major as user_profiles_major,
  up.gpa as user_profiles_gpa
FROM tutor_details td
LEFT JOIN user_profiles up ON up.user_id = td.user_id
WHERE td.current_university IS NOT NULL 
   OR up.university IS NOT NULL
ORDER BY td.user_id
LIMIT 10;

-- Validation Query 3: Check S1 data logic
SELECT 
  academic_status,
  COUNT(*) as count,
  COUNT(university_s1_name) as has_s1_university,
  COUNT(faculty_s1) as has_s1_faculty,
  COUNT(major_s1) as has_s1_major
FROM tutor_details 
WHERE academic_status IS NOT NULL
GROUP BY academic_status
ORDER BY academic_status;
```

### **Phase 4: Remove Duplicate Columns from user_profiles**

```sql
-- DANGER ZONE: Only run after confirming data migration is successful!

-- Step 1: Create backup table with old data
CREATE TABLE user_profiles_education_backup AS 
SELECT 
  user_id,
  education_level,
  university,
  major,
  graduation_year,
  gpa,
  created_at
FROM user_profiles 
WHERE education_level IS NOT NULL 
   OR university IS NOT NULL 
   OR major IS NOT NULL 
   OR graduation_year IS NOT NULL 
   OR gpa IS NOT NULL;

-- Step 2: Remove duplicate columns (IRREVERSIBLE!)
ALTER TABLE user_profiles DROP COLUMN education_level;
ALTER TABLE user_profiles DROP COLUMN university;
ALTER TABLE user_profiles DROP COLUMN major;
ALTER TABLE user_profiles DROP COLUMN graduation_year;
ALTER TABLE user_profiles DROP COLUMN gpa;

-- Step 3: Verify columns were removed
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
  AND column_name IN ('education_level', 'university', 'major', 'graduation_year', 'gpa');
-- Should return 0 rows
```

---

## 💻 Code Changes Required

### **File 1: supabase/functions/create-tutor-complete/index.ts**

#### **Remove from user_profiles creation (Lines 471-476):**
```typescript
// 🔥 DELETE THESE LINES:
// education_level: data.education?.statusAkademik || null,
// university: data.education?.namaUniversitas || null,
// major: data.education?.jurusan || null,
// graduation_year: toIntOrNull(data.education?.tahunLulus),
// gpa: toFloatOrNull(data.education?.ipk),
```

#### **Update tutor_details creation (After Line 374):**
```typescript
// ADD after entry_year line:

// 🆕 Current Education Fields (for all except 'lainnya')
current_university: !isAlternativeLearning(data.education?.statusAkademik) 
  ? (data.education?.namaUniversitas || null)
  : null,
current_faculty: !isAlternativeLearning(data.education?.statusAkademik)
  ? (data.education?.fakultas || null)
  : null,
current_major: !isAlternativeLearning(data.education?.statusAkademik)
  ? (data.education?.jurusan || null)
  : null,
current_graduation_year: !isAlternativeLearning(data.education?.statusAkademik)
  ? toIntOrNull(data.education?.tahunLulus)
  : null,
current_gpa: !isAlternativeLearning(data.education?.statusAkademik)
  ? toFloatOrNull(data.education?.ipk)
  : null,
```

#### **Fix faculty_s1 logic (Line 349-351):**
```typescript
// 🔧 REPLACE EXISTING LOGIC:
faculty_s1: isS2S3Student(data.education?.statusAkademik)
  ? (data.education?.fakultasS1 || null)     // ✅ FIXED: Only S1 faculty for S2/S3
  : null,                                    // ✅ FIXED: No current faculty here
```

---

## 🧪 Testing Strategy

### **Test Case 1: New Tutor Registration**
```typescript
// Test Data: S1 Student
const testDataS1 = {
  education: {
    statusAkademik: 'mahasiswa_s1',
    namaUniversitas: 'Universitas Test',
    fakultas: 'Fakultas Test',
    jurusan: 'Jurusan Test',
    tahunMasuk: '2023',
    ipk: '3.75'
  }
}

// Expected Result in tutor_details:
// current_university: 'Universitas Test'
// current_faculty: 'Fakultas Test'
// current_major: 'Jurusan Test'
// current_gpa: 3.75
// faculty_s1: NULL (not S2/S3 student)
```

### **Test Case 2: S2 Student Registration**
```typescript
// Test Data: S2 Student
const testDataS2 = {
  education: {
    statusAkademik: 'mahasiswa_s2',
    namaUniversitas: 'Universitas S2 Test',
    fakultas: 'Fakultas S2 Test',
    jurusan: 'Magister Test',
    namaUniversitasS1: 'Universitas S1 Test',
    fakultasS1: 'Fakultas S1 Test',
    jurusanS1: 'Sarjana Test',
    ipk: '3.80'
  }
}

// Expected Result in tutor_details:
// current_university: 'Universitas S2 Test'
// current_faculty: 'Fakultas S2 Test'
// current_major: 'Magister Test'
// current_gpa: 3.80
// university_s1_name: 'Universitas S1 Test'
// faculty_s1: 'Fakultas S1 Test'
// major_s1: 'Sarjana Test'
```

### **Test Case 3: Alternative Learning**
```typescript
// Test Data: Alternative Path
const testDataAlt = {
  education: {
    statusAkademik: 'lainnya',
    namaInstitusi: 'Bootcamp Test',
    bidangKeahlian: 'Programming',
    pengalamanBelajar: 'Self-taught for 3 years'
  }
}

// Expected Result in tutor_details:
// current_university: NULL
// current_faculty: NULL
// current_major: NULL
// current_gpa: NULL
// alternative_institution_name: 'Bootcamp Test'
// expertise_field: 'Programming'
// learning_experience: 'Self-taught for 3 years'
```

---

## 🔄 Rollback Plan

### **If Migration Fails:**

1. **Stop Application**
   ```bash
   # Stop the application to prevent data corruption
   kubectl scale deployment your-app --replicas=0
   ```

2. **Restore Database**
   ```bash
   # Restore from backup
   psql your_database_name < backup_before_education_migration_*.sql
   ```

3. **Revert Code Changes**
   ```bash
   git checkout main
   git branch -D education-data-migration
   ```

4. **Restart Application**
   ```bash
   kubectl scale deployment your-app --replicas=3
   ```

---

## 📅 Migration Timeline

### **Estimated Duration: 4-6 hours**

#### **Phase 1: Preparation (1 hour)**
- ✅ Create backups
- ✅ Set up staging environment  
- ✅ Deploy current code to staging

#### **Phase 2: Schema Changes (30 minutes)**
- Add new columns to tutor_details
- Verify column creation

#### **Phase 3: Data Migration (2-3 hours)**
- Migrate data from user_profiles
- Fix faculty_s1 logic issues
- Validate data migration
- Run comprehensive tests

#### **Phase 4: Code Deployment (1 hour)**
- Update Edge Function code
- Deploy to staging and test
- Deploy to production

#### **Phase 5: Cleanup (30 minutes)**
- Remove duplicate columns from user_profiles
- Final validation
- Monitor system health

#### **Phase 6: Monitoring (1 hour)**
- Monitor application logs
- Verify new registrations work
- Check existing data accessibility

---

## ⚡ Post-Migration Actions

### **Immediate (Day 1):**
- Monitor error logs for education-related issues
- Test tutor registration flow
- Verify education data display in admin panels

### **Short-term (Week 1):**
- Update API documentation
- Update database schema documentation
- Train support team on new data structure

### **Long-term (Month 1):**
- Drop backup tables (user_profiles_education_backup)
- Optimize database queries that use education data
- Consider adding database indexes if needed

---

*Migration Guide Version: 1.0*
*Last Updated: Current Date*
*Status: Ready for execution*
