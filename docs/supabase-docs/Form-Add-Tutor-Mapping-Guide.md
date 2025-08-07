# 📋 FIELD MAPPING DOCUMENTATION - FORM ADD TUTOR

## Overview
Dokumentasi ini menjelaskan mapping lengkap antara field-field pada form "Add Tutor" dengan struktur database Supabase. Setiap field form dipetakan ke tabel dan kolom database yang sesuai.

---

## 📊 SUMMARY MAPPING

### Database Tables yang Terlibat:
1. **`users_universal`** - Data user utama
2. **`user_profiles`** - Profil user detail
3. **`user_addresses`** - Alamat user (multiple addresses)
4. **`user_demographics`** - Data demografis user (agama, dll)
5. **`tutor_details`** - Detail khusus tutor
6. **`tutor_management`** - Manajemen status tutor
7. **`tutor_availability_config`** - Konfigurasi ketersediaan tutor
8. **`tutor_teaching_preferences`** - Preferensi mengajar tutor
9. **`tutor_personality_traits`** - Sifat kepribadian tutor
10. **`tutor_program_mappings`** - Mapping program tutor
11. **`tutor_additional_subjects`** - Mata pelajaran tambahan
12. **`location_province`** - Data provinsi
13. **`location_cities`** - Data kota/kabupaten
14. **`location_districts`** - Data kecamatan
15. **`location_villages`** - Data kelurahan/desa
16. **`finance_banks_indonesia`** - Data bank Indonesia

---

## 🔍 DETAILED FIELD MAPPING

### 1. SYSTEM & STATUS INFORMATION

| Form Field | Database Table | Database Column | Data Type | Required | Description |
|------------|----------------|-----------------|-----------|----------|-------------|
| `status_tutor` | `tutor_management` | `status_tutor` | VARCHAR | ✅ | Status tutor (pending, approved, rejected, etc.) |
| `approval_level` | `tutor_management` | `approval_level` | VARCHAR | ✅ | Level approval tutor |
| `staff_notes` | `tutor_management` | `staff_notes` | TEXT | ❌ | Catatan staff untuk tutor |
| `additionalScreening` | `tutor_management` | `additional_screening` | TEXT[] | ❌ | Checklist screening tambahan |

### 2. PERSONAL INFORMATION

| Form Field | Database Table | Database Column | Data Type | Required | Description |
|------------|----------------|-----------------|-----------|----------|-------------|
| `trn` | `tutor_details` | `tutor_registration_number` | VARCHAR | ✅ | Tutor Registration Number (auto-generated) |
| `namaLengkap` | `user_profiles` | `full_name` | VARCHAR | ✅ | Nama lengkap tutor |
| `namaPanggilan` | `user_profiles` | `nick_name` | VARCHAR | ❌ | Nama panggilan tutor |
| `tanggalLahir` | `user_profiles` | `date_of_birth` | DATE | ✅ | Tanggal lahir tutor |
| `jenisKelamin` | `user_profiles` | `gender` | VARCHAR | ✅ | Jenis kelamin (L/P) |
| `agama` | `user_demographics` | `religion` | VARCHAR | ❌ | Agama tutor |
| `email` | `users_universal` | `email` | VARCHAR | ✅ | Email tutor |
| `noHp1` | `user_profiles` | `mobile_phone` | VARCHAR | ✅ | Nomor HP utama (format +62) |
| `noHp2` | `user_profiles` | `mobile_phone_2` | VARCHAR | ❌ | Nomor HP alternatif |

### 3. PROFILE & VALUE PROPOSITION

| Form Field | Database Table | Database Column | Data Type | Required | Description |
|------------|----------------|-----------------|-----------|----------|-------------|
| `headline` | `user_profiles` | `headline` | VARCHAR | ❌ | Headline/tagline tutor (max 100 chars) |
| `deskripsiDiri` | `user_profiles` | `bio` | TEXT | ❌ | Deskripsi diri/bio tutor |
| `socialMedia1` | `user_profiles` | `social_media_1` | VARCHAR | ❌ | Link media sosial 1 (Instagram/LinkedIn) |
| `socialMedia2` | `user_profiles` | `social_media_2` | VARCHAR | ❌ | Link media sosial 2 (YouTube/TikTok) |

### 4. ADDRESS INFORMATION - DOMISILI

| Form Field | Database Table | Database Column | Data Type | Required | Description |
|------------|----------------|-----------------|-----------|----------|-------------|
| `provinsiDomisili` | `user_addresses` | `province_id` | UUID | ✅ | Foreign key ke location_province |
| `kotaKabupatenDomisili` | `user_addresses` | `city_id` | UUID | ✅ | Foreign key ke location_cities |
| `kecamatanDomisili` | `user_addresses` | `district_name` | VARCHAR | ✅ | Manual input kecamatan |
| `kelurahanDomisili` | `user_addresses` | `village_name` | VARCHAR | ✅ | Manual input kelurahan/desa |
| `alamatLengkapDomisili` | `user_addresses` | `street_address` | TEXT | ✅ | Alamat lengkap jalan |
| `kodePosDomisili` | `user_addresses` | `postal_code` | VARCHAR | ❌ | Kode pos |

### 5. ADDRESS INFORMATION - KTP/KK

| Form Field | Database Table | Database Column | Data Type | Required | Description |
|------------|----------------|-----------------|-----------|----------|-------------|
| `alamatSamaDenganKTP` | `user_addresses` | `is_same_as_domicile` | BOOLEAN | ❌ | Flag apakah alamat sama dengan domisili |
| `provinsiKTP` | `user_addresses` | `province_id` | UUID | ❌ | Foreign key ke location_province |
| `kotaKabupatenKTP` | `user_addresses` | `city_id` | UUID | ❌ | Foreign key ke location_cities |
| `kecamatanKTP` | `user_addresses` | `district_name` | VARCHAR | ❌ | Manual input kecamatan KTP |
| `kelurahanKTP` | `user_addresses` | `village_name` | VARCHAR | ❌ | Manual input kelurahan/desa KTP |
| `alamatLengkapKTP` | `user_addresses` | `street_address` | TEXT | ❌ | Alamat lengkap jalan KTP |
| `kodePosKTP` | `user_addresses` | `postal_code` | VARCHAR | ❌ | Kode pos KTP |

### 6. BANKING INFORMATION

| Form Field | Database Table | Database Column | Data Type | Required | Description |
|------------|----------------|-----------------|-----------|----------|-------------|
| `namaNasabah` | `tutor_banking_info` | `account_holder_name` | VARCHAR | ✅ | Nama pemilik rekening |
| `nomorRekening` | `tutor_banking_info` | `account_number` | VARCHAR | ✅ | Nomor rekening bank |
| `namaBank` | `tutor_banking_info` | `bank_id` | UUID | ✅ | Foreign key ke finance_banks_indonesia |

### 7. EDUCATION INFORMATION

| Form Field | Database Table | Database Column | Data Type | Required | Description |
|------------|----------------|-----------------|-----------|----------|-------------|
| `statusAkademik` | `user_profiles` | `education_level` | VARCHAR | ✅ | Status akademik (SMA, S1, S2, dll) |
| `namaUniversitasS1` | `tutor_details` | `university_s1_name` | VARCHAR | ❌ | Nama universitas S1 |
| `fakultasS1` | `tutor_details` | `faculty_s1` | VARCHAR | ❌ | Fakultas S1 |
| `jurusanS1` | `tutor_details` | `major_s1` | VARCHAR | ❌ | Jurusan S1 |
| `namaUniversitas` | `user_profiles` | `university` | VARCHAR | ❌ | Nama universitas |
| `fakultas` | `user_profiles` | `faculty` | VARCHAR | ❌ | Fakultas |
| `jurusan` | `user_profiles` | `major` | VARCHAR | ❌ | Jurusan |
| `ipk` | `user_profiles` | `gpa` | DECIMAL | ❌ | IPK/GPA |
| `tahunMasuk` | `tutor_details` | `entry_year` | INTEGER | ❌ | Tahun masuk kuliah |
| `tahunLulus` | `user_profiles` | `graduation_year` | INTEGER | ❌ | Tahun lulus |
| `transkripNilai` | `document_storage` | `file_url` | VARCHAR | ❌ | URL file transkrip (document_type='transcript') |
| `namaSMA` | `tutor_details` | `high_school` | VARCHAR | ❌ | Nama SMA |
| `jurusanSMA` | `tutor_details` | `high_school_major` | VARCHAR | ❌ | Jurusan SMA |
| `jurusanSMKDetail` | `tutor_details` | `vocational_school_detail` | VARCHAR | ❌ | Detail jurusan SMK |
| `tahunLulusSMA` | `tutor_details` | `high_school_graduation_year` | INTEGER | ❌ | Tahun lulus SMA |

### 8. ALTERNATIVE LEARNING BACKGROUND

| Form Field | Database Table | Database Column | Data Type | Required | Description |
|------------|----------------|-----------------|-----------|----------|-------------|
| `namaInstitusi` | `tutor_details` | `alternative_institution_name` | VARCHAR | ❌ | Nama institusi alternatif |
| `bidangKeahlian` | `tutor_details` | `expertise_field` | VARCHAR | ❌ | Bidang keahlian |
| `pengalamanBelajar` | `tutor_details` | `learning_experience` | TEXT | ❌ | Pengalaman belajar |
| `sertifikatKeahlian` | `document_storage` | `file_url` | VARCHAR | ❌ | URL file sertifikat keahlian (document_type='skill_certificate') |

### 9. PROFESSIONAL PROFILE & EXPERIENCE

| Form Field | Database Table | Database Column | Data Type | Required | Description |
|------------|----------------|-----------------|-----------|----------|-------------|
| `motivasiMenjadiTutor` | `user_profiles` | `motivation_as_tutor` | TEXT | ❌ | Motivasi menjadi tutor |
| `keahlianSpesialisasi` | `tutor_details` | `special_skills` | TEXT | ❌ | Keahlian spesialisasi |
| `keahlianLainnya` | `tutor_details` | `other_skills` | TEXT | ❌ | Keahlian lainnya |

### 10. TEACHING EXPERIENCE

| Form Field | Database Table | Database Column | Data Type | Required | Description |
|------------|----------------|-----------------|-----------|----------|-------------|
| `pengalamanMengajar` | `tutor_details` | `teaching_experience` | TEXT | ❌ | Pengalaman mengajar |
| `pengalamanLainRelevan` | `tutor_details` | `other_relevant_experience` | TEXT | ❌ | Pengalaman lain yang relevan |

### 11. ACHIEVEMENTS & CREDENTIALS

| Form Field | Database Table | Database Column | Data Type | Required | Description |
|------------|----------------|-----------------|-----------|----------|-------------|
| `prestasiAkademik` | `tutor_details` | `academic_achievements` | TEXT | ❌ | Prestasi akademik |
| `prestasiNonAkademik` | `tutor_details` | `non_academic_achievements` | TEXT | ❌ | Prestasi non-akademik |
| `sertifikasiPelatihan` | `tutor_details` | `certifications_training` | TEXT | ❌ | Sertifikasi dan pelatihan |

### 12. TEACHING CONFIGURATION

| Form Field | Database Table | Database Column | Data Type | Required | Description |
|------------|----------------|-----------------|-----------|----------|-------------|
| `hourly_rate` | `tutor_availability_config` | `hourly_rate` | DECIMAL | ✅ | Tarif per jam |
| `teaching_methods` | `tutor_availability_config` | `teaching_methods` | TEXT[] | ✅ | Metode mengajar |
| `available_schedule` | `tutor_availability_config` | `available_schedule` | TEXT[] | ✅ | Jadwal ketersediaan |

### 13. AVAILABILITY CONFIGURATION

| Form Field | Database Table | Database Column | Data Type | Required | Description |
|------------|----------------|-----------------|-----------|----------|-------------|
| `statusMenerimaSiswa` | `tutor_availability_config` | `availability_status` | VARCHAR | ✅ | Status menerima siswa |
| `maksimalSiswaBaru` | `tutor_availability_config` | `max_new_students_per_week` | INTEGER | ❌ | Maksimal siswa baru per minggu |
| `maksimalTotalSiswa` | `tutor_availability_config` | `max_total_students` | INTEGER | ❌ | Maksimal total siswa |
| `usiaTargetSiswa` | `tutor_availability_config` | `target_student_ages` | TEXT[] | ❌ | Usia target siswa |
| `catatanAvailability` | `tutor_availability_config` | `availability_notes` | TEXT | ❌ | Catatan ketersediaan |

### 14. TEACHING DETAILS

| Form Field | Database Table | Database Column | Data Type | Required | Description |
|------------|----------------|-----------------|-----------|----------|-------------|
| `teachingMethods` | `tutor_availability_config` | `teaching_methods` | TEXT[] | ✅ | Metode mengajar |
| `studentLevelPreferences` | `tutor_teaching_preferences` | `student_level_preferences` | VARCHAR | ❌ | Level siswa yang disukai |
| `specialNeedsCapable` | `tutor_teaching_preferences` | `special_needs_capability` | BOOLEAN | ❌ | Kemampuan mengajar siswa berkebutuhan khusus |
| `groupClassWilling` | `tutor_teaching_preferences` | `group_class_willingness` | BOOLEAN | ❌ | Kesediaan mengajar kelas grup |

### 15. TECHNOLOGY CAPABILITY

| Form Field | Database Table | Database Column | Data Type | Required | Description |
|------------|----------------|-----------------|-----------|----------|-------------|
| `onlineTeachingCapable` | `tutor_teaching_preferences` | `online_teaching_capability` | BOOLEAN | ❌ | Kemampuan mengajar online |
| `techSavviness` | `tutor_teaching_preferences` | `tech_savviness_level` | VARCHAR | ❌ | Kemampuan teknologi |
| `gmeetExperience` | `tutor_teaching_preferences` | `gmeet_experience_level` | VARCHAR | ❌ | Pengalaman Google Meet |
| `presensiUpdateCapability` | `tutor_teaching_preferences` | `attendance_update_capability` | BOOLEAN | ❌ | Kemampuan update presensi |

### 16. PERSONALITY & CHARACTER

| Form Field | Database Table | Database Column | Data Type | Required | Description |
|------------|----------------|-----------------|-----------|----------|-------------|
| `tutorPersonalityType` | `tutor_personality_traits` | `personality_type` | VARCHAR | ❌ | Tipe kepribadian tutor |
| `communicationStyle` | `tutor_personality_traits` | `communication_style` | VARCHAR | ❌ | Gaya komunikasi |
| `teachingPatienceLevel` | `tutor_personality_traits` | `teaching_patience_level` | VARCHAR | ❌ | Level kesabaran mengajar |
| `studentMotivationAbility` | `tutor_personality_traits` | `student_motivation_ability` | VARCHAR | ❌ | Kemampuan memotivasi siswa |
| `scheduleFlexibilityLevel` | `tutor_personality_traits` | `schedule_flexibility_level` | VARCHAR | ❌ | Level fleksibilitas jadwal |

### 17. EMERGENCY CONTACT & COMMUNICATION

| Form Field | Database Table | Database Column | Data Type | Required | Description |
|------------|----------------|-----------------|-----------|----------|-------------|
| `emergencyContactName` | `user_profiles` | `emergency_contact_name` | VARCHAR | ❌ | Nama kontak darurat |
| `emergencyContactRelationship` | `user_profiles` | `emergency_contact_relationship` | VARCHAR | ❌ | Hubungan dengan kontak darurat |
| `emergencyContactPhone` | `user_profiles` | `emergency_contact_phone` | VARCHAR | ❌ | Nomor telepon kontak darurat |

### 18. TEACHING AREA INFORMATION

| Form Field | Database Table | Database Column | Data Type | Required | Description |
|------------|----------------|-----------------|-----------|----------|-------------|
| `teaching_radius_km` | `tutor_availability_config` | `teaching_radius_km` | DECIMAL | ❌ | Radius mengajar dalam km |
| `transportasiTutor` | `tutor_availability_config` | `transportation_method` | TEXT[] | ❌ | Metode transportasi |
| `location_notes` | `tutor_availability_config` | `location_notes` | TEXT | ❌ | Catatan lokasi |

### 19. LOCATION COORDINATES

| Form Field | Database Table | Database Column | Data Type | Required | Description |
|------------|----------------|-----------------|-----------|----------|-------------|
| `titikLokasiLat` | `tutor_availability_config` | `teaching_center_lat` | DECIMAL | ❌ | Latitude titik pusat mengajar |
| `titikLokasiLng` | `tutor_availability_config` | `teaching_center_lng` | DECIMAL | ❌ | Longitude titik pusat mengajar |
| `alamatTitikLokasi` | `tutor_availability_config` | `teaching_center_location` | VARCHAR | ❌ | Alamat titik pusat mengajar |

### 20. DOCUMENTS

| Form Field | Database Table | Database Column | Data Type | Required | Description |
|------------|----------------|-----------------|-----------|----------|-------------|
| `fotoProfil` | `user_profiles` | `profile_photo_url` | VARCHAR | ❌ | URL foto profil tutor |

| `dokumenIdentitas` | `document_storage` | `file_url` | VARCHAR | ❌ | URL dokumen identitas (document_type='identity') |
| `dokumenPendidikan` | `document_storage` | `file_url` | VARCHAR | ❌ | URL dokumen pendidikan (document_type='education') |
| `dokumenSertifikat` | `document_storage` | `file_url` | VARCHAR | ❌ | URL dokumen sertifikat (document_type='certificate') |

### 21. DOCUMENT VERIFICATION (Staff Only)

| Form Field | Database Table | Database Column | Data Type | Required | Description |
|------------|----------------|-----------------|-----------|----------|-------------|
| `status_verifikasi_identitas` | `tutor_management` | `identity_verification_status` | VARCHAR | ❌ | Status verifikasi identitas |
| `status_verifikasi_pendidikan` | `tutor_management` | `education_verification_status` | VARCHAR | ❌ | Status verifikasi pendidikan |

### 22. PROGRAM SELECTION

| Form Field | Database Table | Database Column | Data Type | Required | Description |
|------------|----------------|-----------------|-----------|----------|-------------|
| `selectedPrograms` | `tutor_program_mappings` | `program_id` | UUID[] | ❌ | Array program ID yang dipilih |
| `mataPelajaranLainnya` | `tutor_additional_subjects` | `subject_name` | TEXT | ❌ | Mata pelajaran lain yang tidak ada di selector |

---

## ⚠️ FIELDS YANG DI-SKIP/TIDAK ADA MAPPING

### 1. Form Fields yang SUDAH ADA di Database Baru:
✅ **SUDAH ADA - Perlu Update Mapping:**
- `agama` → `user_demographics.religion` (BUKAN di user_profiles)
- `transportasiTutor` → `tutor_availability_config.transportation_method` ✅
- `specialNeedsCapable` → `tutor_teaching_preferences.special_needs_capability` ✅
- `groupClassWilling` → `tutor_teaching_preferences.group_class_willingness` ✅
- `onlineTeachingCapable` → `tutor_teaching_preferences.online_teaching_capability` ✅
- `techSavviness` → `tutor_teaching_preferences.tech_savviness_level` ✅
- `gmeetExperience` → `tutor_teaching_preferences.gmeet_experience_level` ✅
- `presensiUpdateCapability` → `tutor_teaching_preferences.attendance_update_capability` ✅
- `communicationStyle` → `tutor_personality_traits.communication_style` ✅
- `teachingPatienceLevel` → `tutor_personality_traits.teaching_patience_level` ✅
- `studentMotivationAbility` → `tutor_personality_traits.student_motivation_ability` ✅
- `scheduleFlexibilityLevel` → `tutor_personality_traits.schedule_flexibility_level` ✅

❌ **BELUM ADA - Masih Perlu Ditambah ke Database:**
- `jurusanSMA` - Tidak ada kolom `high_school_major` di `tutor_details`
- `jurusanSMKDetail` - Tidak ada kolom `vocational_school_detail` di `tutor_details`

✅ **SUDAH ADA - Menggunakan document_storage:**
- `transkripNilai` → `document_storage.file_url` (document_type='transcript')
- `sertifikatKeahlian` → `document_storage.file_url` (document_type='skill_certificate')
- `dokumenIdentitas` → `document_storage.file_url` (document_type='identity')
- `dokumenPendidikan` → `document_storage.file_url` (document_type='education')
- `dokumenSertifikat` → `document_storage.file_url` (document_type='certificate')
- `other_subjects` → `tutor_additional_subjects` table (relational)

### 2. Database Columns yang Belum Ada di Form:
- `users_universal.phone_verified` - Status verifikasi phone
- `users_universal.email_verified` - Status verifikasi email
- `user_profiles.nationality` - Kebangsaan (default: IDN)
- `user_profiles.national_id` - Nomor KTP
- `user_profiles.passport_number` - Nomor paspor
- `user_profiles.linkedin_url` - URL LinkedIn
- `user_profiles.social_media_links` - Link media sosial
- `user_profiles.website_url` - URL website
- `user_profiles.job_title` - Jabatan pekerjaan
- `user_profiles.employer` - Pemberi kerja
- `user_profiles.work_experience_years` - Tahun pengalaman kerja
- `user_profiles.professional_summary` - Ringkasan profesional
- `user_profiles.preferred_language` - Bahasa yang disukai
- `user_profiles.teaching_subjects` - Mata pelajaran yang diajar
- `user_profiles.learning_subjects` - Mata pelajaran yang dipelajari
- `user_profiles.grade_level` - Level kelas
- `user_profiles.state_province` - Provinsi
- `user_profiles.city` - Kota
- `user_profiles.address_line1` - Alamat baris 1
- `user_profiles.address_line2` - Alamat baris 2
- `user_profiles.driver_license` - Nomor SIM
- `user_profiles.academic_goals` - Tujuan akademik
- `user_profiles.availability_schedule` - Jadwal ketersediaan
- `user_profiles.preferred_session_duration` - Durasi sesi yang disukai
- `user_profiles.preferred_session_type` - Tipe sesi yang disukai
- `user_profiles.location_preference` - Preferensi lokasi
- `user_profiles.profile_completion_percentage` - Persentase kelengkapan profil
- `user_profiles.identity_verified` - Status verifikasi identitas
- `user_profiles.education_verified` - Status verifikasi pendidikan
- `user_profiles.background_check_status` - Status pemeriksaan latar belakang
- `user_profiles.background_check_date` - Tanggal pemeriksaan latar belakang
- `user_profiles.institution_name` - Nama institusi
- `user_profiles.cover_photo_url` - URL foto sampul
- `tutor_details.reason_for_teaching` - Alasan mengajar
- `tutor_details.education_history` - Riwayat pendidikan
- `tutor_details.teaching_philosophy` - Filosofi mengajar
- `tutor_details.form_submission_timestamp` - Timestamp submit form
- `tutor_details.onboarding_status` - Status onboarding
- `tutor_details.bio_summary` - Ringkasan bio
- `tutor_details.other_experience` - Pengalaman lain
- `tutor_details.achievements` - Prestasi
- `tutor_details.teaching_service_options` - Opsi layanan mengajar
- `tutor_details.service_areas` - Area layanan
- `tutor_details.teaching_style_descriptions` - Deskripsi gaya mengajar
- `tutor_details.average_rating` - Rating rata-rata
- `tutor_details.total_teaching_hours` - Total jam mengajar
- `tutor_details.cancellation_rate` - Tingkat pembatalan
- `tutor_details.registration_notes_to_admin` - Catatan registrasi untuk admin
- `tutor_details.form_agreement_check` - Cek persetujuan form
- `tutor_details.is_top_educator` - Status tutor top
- `tutor_details.middle_school` - Nama SMP
- `tutor_details.middle_school_graduation_year` - Tahun lulus SMP
- `tutor_details.current_faculty` - Fakultas saat ini
- `tutor_details.major_accreditation` - Akreditasi jurusan
- `tutor_management.last_status_change` - Perubahan status terakhir
- `tutor_management.recruitment_stage_history` - Riwayat tahap rekrutmen
- `tutor_management.status_changed_by` - Diubah oleh siapa
- `tutor_availability_config.availability_status` - Status ketersediaan

---

## 🔧 RECOMMENDATIONS

### 1. Database Schema Updates Needed:
```sql
-- Add missing columns to tutor_details (hanya 2 kolom yang benar-benar belum ada)
ALTER TABLE tutor_details 
ADD COLUMN high_school_major VARCHAR(100),
ADD COLUMN vocational_school_detail VARCHAR(200);

-- Catatan: SEMUA kolom lain SUDAH ADA di database:
-- ✅ religion -> user_demographics.religion
-- ✅ transportation_method -> tutor_availability_config.transportation_method
-- ✅ special_needs_capability -> tutor_teaching_preferences.special_needs_capability
-- ✅ group_class_willingness -> tutor_teaching_preferences.group_class_willingness
-- ✅ online_teaching_capability -> tutor_teaching_preferences.online_teaching_capability
-- ✅ tech_savviness_level -> tutor_teaching_preferences.tech_savviness_level
-- ✅ gmeet_experience_level -> tutor_teaching_preferences.gmeet_experience_level
-- ✅ attendance_update_capability -> tutor_teaching_preferences.attendance_update_capability
-- ✅ communication_style -> tutor_personality_traits.communication_style
-- ✅ teaching_patience_level -> tutor_personality_traits.teaching_patience_level
-- ✅ student_motivation_ability -> tutor_personality_traits.student_motivation_ability
-- ✅ schedule_flexibility_level -> tutor_personality_traits.schedule_flexibility_level
-- ✅ other_subjects -> tutor_additional_subjects table (relational)
-- ✅ document uploads -> document_storage table dengan document_type
```

### 2. Form Validation Updates:
- Tambahkan validasi untuk field yang required
- Implementasi format phone number (+62)
- Validasi email format
- Validasi file upload (size, type)

### 3. Data Transformation Rules:
- Format phone number: `formatPhoneNumber()` function
- UUID generation untuk foreign keys
- Timestamp handling untuk created_at/updated_at
- File upload handling untuk documents

---

## 🔄 PERUBAHAN NAMA TABEL (OLD vs NEW)

Database telah dimigrasi dari nama tabel dengan prefix numerik ke nama yang lebih sederhana:

| **Old Table Name** | **New Table Name** | **Status** |
|---|---|---|
| `users_universal` | `users_universal` | ✅ Sudah diubah |
| `user_profiles` | `user_profiles` | ✅ Sudah diubah |
| `t_310_01_03_user_addresses` | `user_addresses` | ✅ Sudah diubah |
| `t_380_01_01_user_demographics` | `user_demographics` | ✅ Sudah diubah |
| `tutor_details` | `tutor_details` | ✅ Sudah diubah |
| `tutor_management` | `tutor_management` | ✅ Sudah diubah |
| `tutor_availability_config` | `tutor_availability_config` | ✅ Sudah diubah |
| `t_315_04_01_tutor_teaching_preferences` | `tutor_teaching_preferences` | ✅ Sudah diubah |
| `t_315_05_01_tutor_personality_traits` | `tutor_personality_traits` | ✅ Sudah diubah |
| `t_315_06_01_tutor_program_mappings` | `tutor_program_mappings` | ✅ Sudah diubah |
| `t_315_07_01_tutor_additional_subjects` | `tutor_additional_subjects` | ✅ Sudah diubah |
| `t_120_01_02_province` | `location_province` | ✅ Sudah diubah |
| `t_120_01_03_cities` | `location_cities` | ✅ Sudah diubah |
| `t_120_01_04_districts` | `location_districts` | ✅ Sudah diubah |
| `t_120_01_05_villages` | `location_villages` | ✅ Sudah diubah |
| `t_120_02_01_banks_indonesia` | `finance_banks_indonesia` | ✅ Sudah diubah |

---

## 📝 NOTES

1. **Address Handling**: Sistem menggunakan multiple addresses per user dengan `address_type` untuk membedakan domisili dan KTP
2. **File Uploads**: Semua dokumen disimpan sebagai URL di database, file fisik disimpan di Supabase Storage
3. **Foreign Keys**: Semua referensi ke tabel master (province, city, bank) menggunakan UUID
4. **Status Management**: Status tutor dikelola di tabel terpisah untuk tracking yang lebih baik
5. **Availability Config**: Konfigurasi ketersediaan tutor disimpan di tabel terpisah untuk fleksibilitas

---

*Dokumentasi ini dibuat berdasarkan analisis form add tutor dan struktur database Supabase yang ada. Perlu review dan update sesuai dengan perubahan schema database.*
