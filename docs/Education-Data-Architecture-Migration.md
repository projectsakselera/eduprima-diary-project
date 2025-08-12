# Education Data Architecture Migration Guide

## 📋 Overview

This document outlines a major architecture change to consolidate education data storage and eliminate duplication between `tutor_details` and `user_profiles` tables.

## 🚨 CRITICAL CHANGE ALERT

**Impact Level: HIGH** - This change affects:
- Database schema (new columns + removed columns)
- Edge Function mapping logic
- Edge Service mapping logic  
- Form Add flow
- Any existing integrations that read education data

## 📊 Current State Analysis

### Current Data Duplication Issues

#### tutor_details Table (Partial Education Data):
```sql
-- Current columns
academic_status              -- statusAkademik
university_s1_name          -- namaUniversitasS1 (for S2/S3 students only)
faculty_s1                  -- fakultasS1 OR fakultas (confusing logic!)
major_s1                    -- jurusanS1 (for S2/S3 students only)
high_school                 -- namaSMA
high_school_major           -- jurusanSMA
high_school_graduation_year -- tahunLulusSMA
vocational_school_detail    -- jurusanSMKDetail
alternative_institution_name -- namaInstitusi
expertise_field             -- bidangKeahlian
learning_experience         -- pengalamanBelajar
entry_year                  -- tahunMasuk

-- MISSING CRITICAL FIELDS:
-- ❌ Current university (namaUniversitas)
-- ❌ Current major (jurusan) 
-- ❌ Current graduation year (tahunLulus)
-- ❌ GPA (ipk)
```

#### user_profiles Table (Duplicate Education Data):
```sql
-- DUPLICATE columns (should be removed)
education_level    -- DUPLICATES tutor_details.academic_status
university         -- CONFUSING vs tutor_details.university_s1_name
major             -- CONFUSING vs tutor_details.major_s1
graduation_year   -- MISSING in tutor_details
gpa              -- MISSING in tutor_details
```

### Current Form Mapping Flow:
```
Form Field → Edge Service → Edge Function → Database Tables
namaUniversitas → education.namaUniversitas → data.education?.namaUniversitas → user_profiles.university ❌
fakultas → education.fakultas → data.education?.fakultas → tutor_details.faculty_s1 ❌
jurusan → education.jurusan → data.education?.jurusan → user_profiles.major ❌
tahunLulus → education.tahunLulus → data.education?.tahunLulus → user_profiles.graduation_year ❌
ipk → education.ipk → data.education?.ipk → user_profiles.gpa ❌
```

## 🎯 Target Architecture

### New Single Source of Truth: tutor_details Only

#### Proposed New Columns in tutor_details:
```sql
-- Add new columns for current education
current_university         TEXT  -- namaUniversitas (current university)
current_faculty           TEXT  -- fakultas (current faculty)
current_major             TEXT  -- jurusan (current major)
current_graduation_year   INT   -- tahunLulus (current graduation year)
current_gpa               DECIMAL -- ipk (current GPA)

-- Keep existing columns (with clarified purpose)
academic_status              -- statusAkademik (unchanged)
university_s1_name          -- namaUniversitasS1 (S1 university for S2/S3 students)
faculty_s1                  -- fakultasS1 (S1 faculty for S2/S3 students)
major_s1                    -- jurusanS1 (S1 major for S2/S3 students)
high_school                 -- namaSMA (unchanged)
high_school_major           -- jurusanSMA (unchanged)
high_school_graduation_year -- tahunLulusSMA (unchanged)
vocational_school_detail    -- jurusanSMKDetail (unchanged)
alternative_institution_name -- namaInstitusi (unchanged)
expertise_field             -- bidangKeahlian (unchanged)
learning_experience         -- pengalamanBelajar (unchanged)
entry_year                  -- tahunMasuk (unchanged)
```

#### Remove from user_profiles:
```sql
-- Delete these columns (data will be migrated to tutor_details)
❌ education_level    -- MIGRATE to tutor_details.academic_status
❌ university         -- MIGRATE to tutor_details.current_university
❌ major             -- MIGRATE to tutor_details.current_major
❌ graduation_year   -- MIGRATE to tutor_details.current_graduation_year
❌ gpa              -- MIGRATE to tutor_details.current_gpa
```

### New Clear Data Mapping Logic:

#### For All Academic Status Types:
```typescript
// Current Education (always filled when applicable)
current_university: data.education?.namaUniversitas || null
current_faculty: data.education?.fakultas || null
current_major: data.education?.jurusan || null
current_graduation_year: toIntOrNull(data.education?.tahunLulus)
current_gpa: toFloatOrNull(data.education?.ipk)
```

#### For S2/S3 Students Only:
```typescript
// S1 Background Education (only for S2/S3 students)
university_s1_name: isS2S3Student() ? data.education?.namaUniversitasS1 : null
faculty_s1: isS2S3Student() ? data.education?.fakultasS1 : null
major_s1: isS2S3Student() ? data.education?.jurusanS1 : null
```

## 🔄 Migration Steps

### Phase 1: Database Schema Changes
1. Add new columns to `tutor_details`
2. Migrate existing data from `user_profiles` to `tutor_details`
3. Remove education columns from `user_profiles`

### Phase 2: Code Changes
1. Update Edge Function mapping logic
2. Update Edge Service mapping logic
3. Update any queries/views that read education data

### Phase 3: Testing & Validation
1. Test with existing data
2. Test new tutor registration flow
3. Validate no data loss occurred

### Phase 4: Documentation
1. Update Form Add Guide
2. Update API documentation
3. Update database schema documentation

## ⚠️ Breaking Changes

### For External Systems:
- Any system reading education data from `user_profiles` must switch to `tutor_details`
- API responses may change structure
- Database views/triggers may need updates

### For Frontend Components:
- Any UI components displaying education data may need updates
- Form validation logic may need adjustments

## 🧪 Testing Strategy

### Test Cases:
1. **New Tutor Registration**: All education data flows to tutor_details correctly
2. **S2/S3 Student**: S1 background data stored separately from current education
3. **Alternative Learning**: Non-standard education paths handled correctly
4. **Data Migration**: Existing user_profiles education data migrated successfully
5. **Edge Cases**: Empty/null values handled properly

## 📝 Rollback Plan

### If Issues Arise:
1. Restore backup of user_profiles table
2. Revert code changes to Edge Function/Service
3. Remove new columns from tutor_details
4. Restore original mapping logic

---

## 📅 Implementation Timeline

**Estimated Duration: 2-3 days**

### Day 1: Analysis & Design
- ✅ Document current state (this document)
- ✅ Design new schema
- ⏳ Create migration scripts

### Day 2: Implementation
- ⏳ Database schema changes
- ⏳ Code updates (Edge Function + Service)
- ⏳ Testing with sample data

### Day 3: Validation & Documentation
- ⏳ Full system testing
- ⏳ Update all related documentation
- ⏳ Deploy to staging/production

---

*Last Updated: [Current Date]*
*Author: AI Assistant*
*Review Status: Draft - Needs Review*
