# Import CSV Fix - Education Level Column Issue

## Masalah yang Ditemukan

Saat melakukan import CSV pada halaman `/en/eduprima/main/ops/em/database-tutor/import-export`, terjadi error:

```
Could not find the 'education_level' column of 'user_profiles' in the schema cache
```

## Penyebab Masalah

1. **Migrasi Database**: Kolom `education_level` telah dihapus dari tabel `user_profiles` melalui migrasi `education-data-migration.sql`
2. **Kode Import Tidak Diperbarui**: Kode import masih mencoba mengakses kolom `education_level` yang sudah tidak ada
3. **Data Pendidikan Dipindahkan**: Data pendidikan sekarang disimpan di tabel `tutor_details` dengan kolom yang berbeda

## Solusi yang Diterapkan

### 1. Menghapus Referensi ke Kolom yang Tidak Ada

**Sebelum:**
```typescript
const profileData = {
  user_id: userId,
  full_name: record['Nama Lengkap'] || record['nama'] || 'Unknown',
  // ... other fields
  education_level: record['Status Akademik'] || null,  // ❌ Kolom tidak ada
  university: record['Nama Universitas'] || null,      // ❌ Kolom tidak ada
  major: record['Jurusan S1'] || null,                // ❌ Kolom tidak ada
  graduation_year: record['Tahun Lulus'] || null,     // ❌ Kolom tidak ada
  gpa: record['IPK/GPA'] || null,                     // ❌ Kolom tidak ada
};
```

**Sesudah:**
```typescript
const profileData = {
  user_id: userId,
  full_name: record['Nama Lengkap'] || record['nama'] || 'Unknown',
  // ... other fields
  // ✅ Data pendidikan dipindahkan ke tutor_details
};
```

### 2. Memindahkan Data Pendidikan ke tutor_details

Data pendidikan sekarang disimpan di tabel `tutor_details` dengan mapping yang benar:

```typescript
// Education data in tutor_details (moved from user_profiles)
academic_status: record['Status Akademik'] || null,
university_s1_name: record['Nama Universitas'] || record['Nama Universitas S1'] || null,
faculty_s1: record['Fakultas S1'] || null,
major_s1: record['Jurusan S1'] || null,
entry_year: record['Tahun Masuk'] ? parseInt(record['Tahun Masuk']) : null,
// Additional education fields
current_university: record['Nama Universitas'] || record['Nama Universitas S1'] || null,
current_faculty: record['Fakultas S1'] || null,
current_major: record['Jurusan S1'] || record['Fakultas/Jurusan'] || null,
current_graduation_year: record['Tahun Lulus'] ? parseInt(record['Tahun Lulus']) : null,
current_gpa: record['IPK/GPA'] ? parseFloat(record['IPK/GPA']) : null
```

## Mapping Kolom Database

### Tabel user_profiles (Sekarang)
- `full_name` ← `Nama Lengkap`
- `nick_name` ← `Nama Panggilan`
- `date_of_birth` ← `Tanggal Lahir`
- `gender` ← `Jenis Kelamin`
- `headline` ← `Headline`
- `bio` ← `Deskripsi Diri`

### Tabel tutor_details (Data Pendidikan)
- `academic_status` ← `Status Akademik`
- `university_s1_name` ← `Nama Universitas`
- `faculty_s1` ← `Fakultas S1`
- `major_s1` ← `Jurusan S1`
- `current_university` ← `Nama Universitas`
- `current_faculty` ← `Fakultas S1`
- `current_major` ← `Jurusan S1` atau `Fakultas/Jurusan`
- `current_graduation_year` ← `Tahun Lulus`
- `current_gpa` ← `IPK/GPA`

## File yang Diperbarui

1. `app/api/tutors/bulk-import/route.ts` - API endpoint untuk import
2. `docs/IMPORT-EXPORT-FIX.md` - Dokumentasi ini

## Cara Testing

1. Buka halaman import: `http://localhost:3000/en/eduprima/main/ops/em/database-tutor/import-export`
2. Download template CSV
3. Isi data dengan minimal field wajib:
   - Nama Lengkap
   - Email Aktif
   - No. HP Utama (+62)
4. Upload file CSV
5. Verifikasi preview data
6. Klik "Import" untuk menyimpan ke database

## Field Wajib untuk Import

- ✅ Nama Lengkap
- ✅ Email Aktif  
- ✅ No. HP Utama (+62)

## Field Opsional yang Didukung

- 📍 Provinsi Domisili (dengan fuzzy matching)
- 📍 Kota/Kabupaten Domisili (dengan fuzzy matching)
- 🏦 Nama Bank (dengan fuzzy matching)
- 📚 Program yang Dipilih (dengan fuzzy matching)
- 🎓 Status Akademik
- 🏫 Nama Universitas
- 📖 Fakultas/Jurusan
- 📊 IPK/GPA
- 💰 Tarif per Jam
- 📱 No. HP Alternatif
- 📅 Tanggal Lahir
- 👤 Jenis Kelamin
- 🏛️ Agama

## Status Perbaikan

- ✅ **FIXED**: Error `education_level` column not found
- ✅ **FIXED**: Data pendidikan dipindahkan ke tabel yang benar
- ✅ **FIXED**: Mapping kolom diperbarui sesuai struktur database terbaru
- ✅ **TESTED**: Import berhasil tanpa error

## Catatan Penting

1. **Backup Data**: Selalu backup data sebelum melakukan import besar
2. **Validasi Data**: Gunakan preview untuk memvalidasi data sebelum import
3. **Fuzzy Matching**: Sistem akan mencoba mencocokkan lokasi, bank, dan program secara otomatis
4. **Error Handling**: Jika ada error, periksa log console untuk detail lebih lanjut
