# Current Education Data Flow Analysis

## 📋 Complete Form Fields Analysis

### Current Form Configuration (form-config.ts):

#### 1. **Academic Status Selection**
```typescript
name: 'statusAkademik'
options: ['mahasiswa_s1', 'mahasiswa_s2', 'lulusan_s1', 'lulusan_s2', 'lulusan_d3', 'lainnya']
```

#### 2. **S1 Education Fields** (Conditional: S2/S3 students only)
```typescript
// Only shown when statusAkademik = 'mahasiswa_s2' | 'lulusan_s2'
name: 'namaUniversitasS1'    // S1 University name
name: 'fakultasS1'           // S1 Faculty
name: 'jurusanS1'            // S1 Major
```

#### 3. **Current Education Fields** (Conditional: All except 'lainnya')
```typescript
// Shown for: mahasiswa_s1, mahasiswa_s2, lulusan_s1, lulusan_s2, lulusan_d3
name: 'namaUniversitas'      // Current university
name: 'fakultas'             // Current faculty
name: 'jurusan'              // Current major
name: 'ipk'                  // Current GPA
name: 'tahunMasuk'           // Entry year
name: 'tahunLulus'           // Graduation year (only for graduates)
name: 'transkripNilai'       // Transcript document
```

#### 4. **High School Fields** (Conditional: All except 'lainnya')
```typescript
// Shown for all academic status except 'lainnya'
name: 'namaSMA'              // High school name
name: 'jurusanSMA'           // High school major (IPA/IPS/Bahasa/SMK)
name: 'jurusanSMKDetail'     // Vocational school detail (when jurusanSMA = 'SMK')
name: 'tahunLulusSMA'        // High school graduation year
```

#### 5. **Alternative Learning Fields** (Conditional: statusAkademik = 'lainnya')
```typescript
// Only shown when statusAkademik = 'lainnya'
name: 'namaInstitusi'        // Institution name
name: 'bidangKeahlian'       // Field of expertise
name: 'pengalamanBelajar'    // Learning experience
name: 'sertifikatKeahlian'   // Expertise certificate document
```

---

## 🔄 Current Data Mapping Flow

### Step 1: Form → Edge Service (tutor-edge.service.ts)

**Current Mapping in `BasicTutorData.education`:**
```typescript
interface education {
  // Academic Status & Current Education
  statusAkademik?: string           // ✅ Mapped
  namaUniversitas?: string          // ✅ Mapped
  fakultas?: string                 // ✅ Mapped
  jurusan?: string                  // ✅ Mapped
  tahunMasuk?: string               // ✅ Mapped
  tahunLulus?: string               // ✅ Mapped
  ipk?: string                      // ✅ Mapped
  
  // S1 Education (for S2/S3 students)
  namaUniversitasS1?: string        // ✅ Mapped
  fakultasS1?: string               // ✅ Mapped
  jurusanS1?: string                // ✅ Mapped
  
  // High School Information
  namaSMA?: string                  // ✅ Mapped
  jurusanSMA?: string               // ✅ Mapped
  jurusanSMKDetail?: string         // ✅ Mapped (FIXED)
  tahunLulusSMA?: string            // ✅ Mapped
  
  // Alternative Learning
  namaInstitusi?: string            // ✅ Mapped
  bidangKeahlian?: string           // ✅ Mapped
  pengalamanBelajar?: string        // ✅ Mapped
  
  // Document Files
  transkripNilai?: File | string | null         // ✅ Mapped
  sertifikatKeahlian?: File | string | null     // ✅ Mapped
}
```

### Step 2: Edge Service → Edge Function (create-tutor-complete/index.ts)

**Current Interface in Edge Function:**
```typescript
education?: {
  // Academic Status & Current Education
  statusAkademik?: string           // ✅ Received
  namaUniversitas?: string          // ✅ Received
  fakultas?: string                 // ✅ Received
  jurusan?: string                  // ✅ Received
  tahunMasuk?: string               // ✅ Received
  tahunLulus?: string               // ✅ Received
  ipk?: string                      // ✅ Received
  
  // S1 Education (for S2/S3 students)
  namaUniversitasS1?: string        // ✅ Received
  fakultasS1?: string               // ✅ Received
  jurusanS1?: string                // ✅ Received
  
  // High School Information
  namaSMA?: string                  // ✅ Received
  jurusanSMA?: string               // ✅ Received
  jurusanSMKDetail?: string         // ✅ Received (FIXED)
  tahunLulusSMA?: string            // ✅ Received
  
  // Alternative Learning
  namaInstitusi?: string            // ✅ Received
  bidangKeahlian?: string           // ✅ Received
  pengalamanBelajar?: string        // ✅ Received
  
  // Document Files
  transkripNilai?: File | string | null         // ✅ Received
  sertifikatKeahlian?: File | string | null     // ✅ Received
}
```

### Step 3: Edge Function → Database Tables

#### **Current Storage: tutor_details Table**
```typescript
// Lines 342-396 in create-tutor-complete/index.ts
academic_status: data.education?.statusAkademik || 'unknown',

// S1 Education (conditional - for S2/S3 students)
university_s1_name: isS2S3Student(statusAkademik) 
  ? (data.education?.namaUniversitasS1 || null) 
  : null,
faculty_s1: isS2S3Student(statusAkademik)
  ? (data.education?.fakultasS1 || null)
  : (data.education?.fakultas || null), // ❌ CONFUSING LOGIC!
major_s1: isS2S3Student(statusAkademik)
  ? (data.education?.jurusanS1 || null)
  : null,

// High School Information
high_school: data.education?.namaSMA || null,
high_school_major: data.education?.jurusanSMA || null,
high_school_graduation_year: toIntOrNull(data.education?.tahunLulusSMA),
vocational_school_detail: data.education?.jurusanSMKDetail || null, // ✅ FIXED

// Alternative Learning (for statusAkademik = 'lainnya')
alternative_institution_name: isAlternativeLearning(statusAkademik)
  ? (data.education?.namaInstitusi || null)
  : null,
expertise_field: isAlternativeLearning(statusAkademik)
  ? (data.education?.bidangKeahlian || null)
  : null,
learning_experience: isAlternativeLearning(statusAkademik)
  ? (data.education?.pengalamanBelajar || null)
  : null,

// Entry year (for current education)
entry_year: toIntOrNull(data.education?.tahunMasuk),

// ❌ MISSING CRITICAL FIELDS:
// - Current University (namaUniversitas) → STORED IN user_profiles INSTEAD!
// - Current Major (jurusan) → STORED IN user_profiles INSTEAD!
// - Current Graduation Year (tahunLulus) → STORED IN user_profiles INSTEAD!
// - Current GPA (ipk) → STORED IN user_profiles INSTEAD!
```

#### **Current Storage: user_profiles Table** (DUPLICATE!)
```typescript
// Lines 471-476 in create-tutor-complete/index.ts
// 🎓 Education fields (Step 2) - stored in user_profiles
education_level: data.education?.statusAkademik || null,     // ❌ DUPLIKAT dari tutor_details.academic_status
university: data.education?.namaUniversitas || null,         // ❌ CONFUSING dengan tutor_details.university_s1_name
major: data.education?.jurusan || null,                      // ❌ CONFUSING dengan tutor_details.major_s1
graduation_year: toIntOrNull(data.education?.tahunLulus),    // ❌ SHOULD BE IN tutor_details
gpa: toFloatOrNull(data.education?.ipk),                     // ❌ SHOULD BE IN tutor_details
```

---

## ❌ Current Problems Identified

### 1. **Data Duplication**
- `statusAkademik` stored in both `tutor_details.academic_status` AND `user_profiles.education_level`
- Both tables store university/major data but with different logic

### 2. **Confusing Logic in tutor_details.faculty_s1**
```typescript
// Lines 349-351: PROBLEMATIC LOGIC
faculty_s1: isS2S3Student(data.education?.statusAkademik)
  ? (data.education?.fakultasS1 || null)           // ✅ CORRECT: S1 faculty for S2/S3
  : (data.education?.fakultas || null),            // ❌ WRONG: Current faculty goes to S1 field!
```

### 3. **Missing Critical Data in tutor_details**
- Current university (`namaUniversitas`) → Goes to user_profiles instead
- Current major (`jurusan`) → Goes to user_profiles instead  
- Current graduation year (`tahunLulus`) → Goes to user_profiles instead
- Current GPA (`ipk`) → Goes to user_profiles instead

### 4. **Inconsistent Data Access**
- To get complete education info, systems must JOIN tutor_details + user_profiles
- No single source of truth for education data

---

## 🎯 Required Changes Summary

### Database Schema Changes:
1. **ADD to tutor_details**: `current_university`, `current_faculty`, `current_major`, `current_graduation_year`, `current_gpa`
2. **REMOVE from user_profiles**: `education_level`, `university`, `major`, `graduation_year`, `gpa`

### Code Logic Changes:
1. **Fix tutor_details mapping**: Store current education data in new columns
2. **Fix faculty_s1 logic**: Only store S1 faculty for S2/S3 students
3. **Remove user_profiles education mapping**: Stop storing education data there

### Migration Requirements:
1. **Data migration**: Move existing user_profiles education data to tutor_details
2. **Code updates**: Update all systems reading education data
3. **Testing**: Ensure no data loss during migration

---

*Analysis Date: Current Date*
*Status: Current problematic state - needs architectural fix*
