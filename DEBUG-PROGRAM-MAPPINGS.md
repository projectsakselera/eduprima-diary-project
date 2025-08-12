# Debug Guide: Program Dipilih Issue

## Masalah
Kolom "Program Dipilih" tidak menampilkan data di halaman `view-all`, meskipun form "add new tutor" sudah memiliki logika untuk menyimpan program.

## Langkah Debug

### 1. Test Form Add New Tutor
1. Buka `http://localhost:3000/en/eduprima/main/ops/em/database-tutor/add`
2. Isi form sampai step "Mata Pelajaran"
3. Pilih beberapa program di section "📚 Pilih Program/Mata Pelajaran yang Diajarkan"
4. Submit form
5. Perhatikan console log browser untuk output debug:
   - `🔍 DEBUG: Form submitted with formData:`
   - `🔍 DEBUG: formData.selectedPrograms =`
   - `🔍 DEBUG: programMappingsData =`
   - `✅ Tutor program mappings created:`

### 2. Check Database Tables
Akses endpoint debug untuk memeriksa data di database:

#### A. Check tutor_program_mappings table:
```
http://localhost:3000/api/debug/program-mappings
```

#### B. Test spreadsheet logic:
```
http://localhost:3000/api/debug/spreadsheet-test
```

### 3. Expected Results

#### Jika form berhasil:
- Console log akan menampilkan `selectedPrograms` sebagai array dengan program IDs
- `programMappingsData` akan berisi array dengan object mapping
- `✅ Tutor program mappings created: X records` akan muncul

#### Jika database berisi data:
- `/api/debug/program-mappings` akan menampilkan data di `tutor_program_mappings`
- `/api/debug/spreadsheet-test` akan menampilkan `selected_programs` array

### 4. Troubleshooting

#### Jika selectedPrograms kosong:
- Periksa apakah program selector berfungsi dengan benar
- Periksa console log untuk error di `handleFieldChange`

#### Jika programMappingsData kosong:
- Periksa apakah `formData.selectedPrograms` berisi data
- Periksa apakah mapping logic berjalan dengan benar

#### Jika database insert gagal:
- Periksa error message di console log
- Periksa apakah tabel `tutor_program_mappings` ada dan struktur benar
- Periksa RLS policies di Supabase

#### Jika data ada di database tapi tidak tampil:
- Periksa apakah `programs_unit` table berisi data
- Periksa apakah mapping logic di `spreadsheet/route.ts` berjalan dengan benar

## Report Results
Setelah menjalankan langkah-langkah di atas, beritahu saya:
1. Console log output saat submit form
2. Response dari `/api/debug/program-mappings`
3. Response dari `/api/debug/spreadsheet-test`
4. Error messages yang muncul (jika ada)
