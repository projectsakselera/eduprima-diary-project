# New Education Schema Design

## 🎯 Design Principles

### 1. **Single Source of Truth**
- All education data stored ONLY in `tutor_details` table
- No duplication in `user_profiles` table

### 2. **Clear Data Separation**
- **Current Education**: University/college currently attending or last attended
- **S1 Background**: Previous S1 degree (only for S2/S3 students)
- **High School**: SMA/SMK/equivalent background
- **Alternative Learning**: Non-formal education path

### 3. **Consistent Naming Convention**
- `current_*` prefix for current education fields
- `*_s1` suffix for S1 background fields
- `high_school_*` prefix for high school fields
- `alternative_*` prefix for alternative learning fields

---

## 📊 New tutor_details Schema Design

### **Current Education Fields** (For all academic status except 'lainnya')
```sql
-- New columns to be added
current_university         TEXT    NULL    -- namaUniversitas (current university name)
current_faculty           TEXT    NULL    -- fakultas (current faculty)
current_major             TEXT    NULL    -- jurusan (current major/program)
current_graduation_year   INTEGER NULL    -- tahunLulus (graduation year, NULL if still studying)
current_gpa               DECIMAL NULL    -- ipk (current GPA, format: 4.00)

-- Existing column (unchanged)
entry_year                INTEGER NULL    -- tahunMasuk (entry year)
```

### **S1 Background Fields** (Only for S2/S3 students)
```sql
-- Existing columns (logic will be fixed)
university_s1_name        TEXT    NULL    -- namaUniversitasS1 (S1 university name)
faculty_s1               TEXT    NULL    -- fakultasS1 (S1 faculty) - LOGIC WILL BE FIXED
major_s1                 TEXT    NULL    -- jurusanS1 (S1 major/program)
```

### **High School Fields** (For all except 'lainnya')
```sql
-- Existing columns (unchanged)
high_school              TEXT    NULL    -- namaSMA (high school name)
high_school_major        VARCHAR NULL    -- jurusanSMA (IPA/IPS/Bahasa/SMK)
high_school_graduation_year INTEGER NULL -- tahunLulusSMA (high school graduation year)
vocational_school_detail TEXT    NULL    -- jurusanSMKDetail (SMK specialization detail)
```

### **Alternative Learning Fields** (Only for statusAkademik = 'lainnya')
```sql
-- Existing columns (unchanged)
alternative_institution_name TEXT NULL   -- namaInstitusi (institution name)
expertise_field             TEXT NULL   -- bidangKeahlian (field of expertise)
learning_experience         TEXT NULL   -- pengalamanBelajar (learning experience description)
```

### **Academic Status Field** (Unchanged)
```sql
-- Existing column
academic_status             TEXT NULL   -- statusAkademik (current academic status)
```

---

## 🔄 New Data Mapping Logic

### **Conditional Logic by Academic Status:**

#### **For All Students/Graduates (except 'lainnya'):**
```typescript
// Current Education - ALWAYS filled for university students/graduates
current_university: data.education?.namaUniversitas || null
current_faculty: data.education?.fakultas || null
current_major: data.education?.jurusan || null
current_graduation_year: toIntOrNull(data.education?.tahunLulus) // NULL for active students
current_gpa: toFloatOrNull(data.education?.ipk)
entry_year: toIntOrNull(data.education?.tahunMasuk)
```

#### **For S2/S3 Students Only:**
```typescript
// S1 Background - ONLY for S2/S3 students
university_s1_name: isS2S3Student(statusAkademik) 
  ? (data.education?.namaUniversitasS1 || null) 
  : null

faculty_s1: isS2S3Student(statusAkademik)
  ? (data.education?.fakultasS1 || null)  // ✅ FIXED: Only S1 faculty
  : null                                   // ✅ FIXED: Not current faculty

major_s1: isS2S3Student(statusAkademik)
  ? (data.education?.jurusanS1 || null)
  : null
```

#### **For All (except 'lainnya'):**
```typescript
// High School - for all standard academic paths
high_school: data.education?.namaSMA || null
high_school_major: data.education?.jurusanSMA || null
high_school_graduation_year: toIntOrNull(data.education?.tahunLulusSMA)
vocational_school_detail: data.education?.jurusanSMA === 'SMK' 
  ? (data.education?.jurusanSMKDetail || null)
  : null
```

#### **For Alternative Learning ('lainnya') Only:**
```typescript
// Alternative Learning - ONLY for non-standard paths
alternative_institution_name: isAlternativeLearning(statusAkademik)
  ? (data.education?.namaInstitusi || null)
  : null
  
expertise_field: isAlternativeLearning(statusAkademik)
  ? (data.education?.bidangKeahlian || null)
  : null
  
learning_experience: isAlternativeLearning(statusAkademik)
  ? (data.education?.pengalamanBelajar || null)
  : null
```

---

## 📋 Data Examples by Academic Status

### **Example 1: mahasiswa_s1 (S1 Student)**
```typescript
// Form Input:
statusAkademik: 'mahasiswa_s1'
namaUniversitas: 'Universitas Indonesia'
fakultas: 'Fakultas Teknik'
jurusan: 'Teknik Informatika'
tahunMasuk: '2022'
tahunLulus: null // Still studying
ipk: '3.75'
namaSMA: 'SMA Negeri 1 Jakarta'
jurusanSMA: 'IPA'
tahunLulusSMA: '2022'

// Database Storage:
academic_status: 'mahasiswa_s1'
current_university: 'Universitas Indonesia'
current_faculty: 'Fakultas Teknik'
current_major: 'Teknik Informatika'
current_graduation_year: null
current_gpa: 3.75
entry_year: 2022
university_s1_name: null        // Not S2/S3 student
faculty_s1: null               // Not S2/S3 student
major_s1: null                 // Not S2/S3 student
high_school: 'SMA Negeri 1 Jakarta'
high_school_major: 'IPA'
high_school_graduation_year: 2022
vocational_school_detail: null
```

### **Example 2: mahasiswa_s2 (S2 Student)**
```typescript
// Form Input:
statusAkademik: 'mahasiswa_s2'
namaUniversitas: 'Universitas Gadjah Mada'
fakultas: 'Fakultas MIPA'
jurusan: 'Magister Ilmu Komputer'
tahunMasuk: '2024'
tahunLulus: null // Still studying
ipk: '3.80'
namaUniversitasS1: 'Institut Teknologi Bandung'
fakultasS1: 'Fakultas Teknik'
jurusanS1: 'Teknik Informatika'
namaSMA: 'SMA Negeri 2 Bandung'
jurusanSMA: 'IPA'
tahunLulusSMA: '2020'

// Database Storage:
academic_status: 'mahasiswa_s2'
current_university: 'Universitas Gadjah Mada'      // ✅ Current S2 university
current_faculty: 'Fakultas MIPA'                   // ✅ Current S2 faculty
current_major: 'Magister Ilmu Komputer'            // ✅ Current S2 major
current_graduation_year: null
current_gpa: 3.80
entry_year: 2024
university_s1_name: 'Institut Teknologi Bandung'   // ✅ Previous S1 university
faculty_s1: 'Fakultas Teknik'                      // ✅ Previous S1 faculty
major_s1: 'Teknik Informatika'                     // ✅ Previous S1 major
high_school: 'SMA Negeri 2 Bandung'
high_school_major: 'IPA'
high_school_graduation_year: 2020
vocational_school_detail: null
```

### **Example 3: lainnya (Alternative Learning)**
```typescript
// Form Input:
statusAkademik: 'lainnya'
namaInstitusi: 'Kursus Programming Online'
bidangKeahlian: 'Web Development & Mobile Apps'
pengalamanBelajar: 'Self-taught programmer dengan 3 tahun pengalaman...'

// Database Storage:
academic_status: 'lainnya'
current_university: null
current_faculty: null
current_major: null
current_graduation_year: null
current_gpa: null
entry_year: null
university_s1_name: null
faculty_s1: null
major_s1: null
high_school: null              // No high school data for alternative path
high_school_major: null
high_school_graduation_year: null
vocational_school_detail: null
alternative_institution_name: 'Kursus Programming Online'
expertise_field: 'Web Development & Mobile Apps'
learning_experience: 'Self-taught programmer dengan 3 tahun pengalaman...'
```

---

## 🔧 Migration Strategy

### **Phase 1: Schema Changes**
```sql
-- Add new columns to tutor_details
ALTER TABLE tutor_details ADD COLUMN current_university TEXT;
ALTER TABLE tutor_details ADD COLUMN current_faculty TEXT;
ALTER TABLE tutor_details ADD COLUMN current_major TEXT;
ALTER TABLE tutor_details ADD COLUMN current_graduation_year INTEGER;
ALTER TABLE tutor_details ADD COLUMN current_gpa DECIMAL;
```

### **Phase 2: Data Migration**
```sql
-- Migrate data from user_profiles to tutor_details
UPDATE tutor_details 
SET 
  current_university = (SELECT university FROM user_profiles WHERE user_profiles.user_id = tutor_details.user_id),
  current_major = (SELECT major FROM user_profiles WHERE user_profiles.user_id = tutor_details.user_id),
  current_graduation_year = (SELECT graduation_year FROM user_profiles WHERE user_profiles.user_id = tutor_details.user_id),
  current_gpa = (SELECT gpa FROM user_profiles WHERE user_profiles.user_id = tutor_details.user_id)
WHERE EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.user_id = tutor_details.user_id);

-- Fix faculty_s1 logic (currently stores wrong data)
-- This will need careful manual review of existing data
```

### **Phase 3: Remove Old Columns**
```sql
-- Remove duplicate columns from user_profiles
ALTER TABLE user_profiles DROP COLUMN education_level;
ALTER TABLE user_profiles DROP COLUMN university;
ALTER TABLE user_profiles DROP COLUMN major;
ALTER TABLE user_profiles DROP COLUMN graduation_year;
ALTER TABLE user_profiles DROP COLUMN gpa;
```

---

## ✅ Benefits of New Design

1. **Single Source of Truth**: All education data in one place
2. **Clear Logic**: No confusing conditional storage
3. **Better Performance**: No JOINs needed to get complete education data
4. **Maintainable**: Clear naming convention and separation
5. **Scalable**: Easy to add new education types in future

---

*Design Date: Current Date*
*Status: Proposed design - ready for implementation*
