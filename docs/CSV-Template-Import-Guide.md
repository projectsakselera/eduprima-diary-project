# 📥 CSV Template Import Guide - EduPrima Tutor System

## 📋 Overview
Template CSV telah diperbarui untuk mendukung import tutor dengan field mapping yang lengkap dan fuzzy matching untuk lokasi, bank, dan program.

## 🔧 Template Structure

### 📊 CSV Format
Template CSV memiliki **3 baris**:
1. **Header Row**: Nama kolom yang sesuai dengan field mapping
2. **Required Info Row**: Menunjukkan field mana yang WAJIB atau Opsional  
3. **Example Data Row**: Contoh data untuk setiap field

### 📝 Column Mapping (32 Kolom Total)

#### 🆔 IDENTITAS DASAR
| CSV Column | Required | Example | Notes |
|------------|----------|---------|-------|
| `Nama Lengkap` | ✅ WAJIB | Ahmad Budi Santoso | Nama lengkap tutor |
| `Email Aktif` | ✅ WAJIB | ahmad.budi@example.com | Email valid untuk login |
| `No. HP Utama (+62)` | ✅ WAJIB | 81234567890 | Nomor HP utama (tanpa +62) |
| `No. HP Alternatif (+62)` | ⚪ Opsional | 85987654321 | Nomor HP cadangan |
| `WhatsApp Number (+62)` | ⚪ Opsional | 81234567890 | Nomor WhatsApp |
| `Tanggal Lahir` | ⚪ Opsional | 1995-06-15 | Format: YYYY-MM-DD |
| `Jenis Kelamin` | ⚪ Opsional | L | L = Laki-laki, P = Perempuan |
| `Agama` | ⚪ Opsional | Islam | Agama tutor |

#### 🏠 ALAMAT & LOKASI
| CSV Column | Required | Example | Fuzzy Matching |
|------------|----------|---------|----------------|
| `Provinsi Domisili` | ✅ WAJIB | DKI Jakarta | ✅ Ya - cocok otomatis |
| `Kota/Kabupaten Domisili` | ✅ WAJIB | Jakarta Selatan | ✅ Ya - cocok otomatis |
| `Alamat Lengkap` | ⚪ Opsional | Jl. Sudirman No. 123 | - |
| `Provinsi KTP` | ⚪ Opsional | Jawa Barat | ✅ Ya - cocok otomatis |
| `Kota/Kabupaten KTP` | ⚪ Opsional | Bandung | ✅ Ya - cocok otomatis |
| `Alamat Titik Pusat Mengajar` | ⚪ Opsional | Jl. Thamrin No. 45 | - |

#### 🎓 PENDIDIKAN
| CSV Column | Required | Example | Notes |
|------------|----------|---------|-------|
| `Status Akademik` | ⚪ Opsional | S1 | S1, S2, S3, D3, SMA |
| `Nama Universitas` | ⚪ Opsional | Universitas Indonesia | Nama universitas |
| `Fakultas/Jurusan` | ⚪ Opsional | Teknik Informatika | Jurusan studi |
| `IPK/GPA` | ⚪ Opsional | 3.75 | Skala 0-4 |
| `Tahun Lulus` | ⚪ Opsional | 2020 | Tahun kelulusan |

#### 👨‍🏫 PENGALAMAN MENGAJAR
| CSV Column | Required | Example | Notes |
|------------|----------|---------|-------|
| `Pengalaman Mengajar (tahun)` | ⚪ Opsional | 3 | Lama pengalaman (tahun) |
| `Status Menerima Siswa` | ⚪ Opsional | active | active, inactive, pending |
| `Tarif per Jam` | ⚪ Opsional | 75000 | Tarif dalam Rupiah |
| `Radius Mengajar (km)` | ⚪ Opsional | 15 | Radius dalam kilometer |

#### 📚 MATA PELAJARAN
| CSV Column | Required | Example | Fuzzy Matching |
|------------|----------|---------|----------------|
| `Program yang Dipilih` | ✅ WAJIB | Matematika; Fisika; Kimia | ✅ Ya - pisah dengan `;` |

#### 🏦 BANK & PEMBAYARAN
| CSV Column | Required | Example | Fuzzy Matching |
|------------|----------|---------|----------------|
| `Nama Bank` | ⚪ Opsional | Bank Mandiri | ✅ Ya - cocok otomatis |
| `Nomor Rekening` | ⚪ Opsional | 1234567890123 | - |
| `Nama Pemilik Rekening` | ⚪ Opsional | Ahmad Budi Santoso | - |

#### 🚨 KONTAK DARURAT
| CSV Column | Required | Example | Notes |
|------------|----------|---------|-------|
| `Nama Kontak Darurat` | ⚪ Opsional | Siti Aminah | Nama kontak darurat |
| `Hubungan Kontak Darurat` | ⚪ Opsional | Ibu | Hubungan keluarga |
| `No. HP Kontak Darurat` | ⚪ Opsional | 82187654321 | Nomor HP kontak darurat |

#### 📝 CATATAN TAMBAHAN
| CSV Column | Required | Example | Notes |
|------------|----------|---------|-------|
| `Bio/Deskripsi Singkat` | ⚪ Opsional | Tutor berpengalaman... | Deskripsi singkat |
| `Keahlian Khusus` | ⚪ Opsional | Olimpiade, Programming | Keahlian khusus |
| `Catatan Admin` | ⚪ Opsional | Recommended dari universitas | Catatan internal |

## 🤖 Fuzzy Matching Features

### 🗺️ Location Matching
- **Provinsi**: Otomatis cocok dengan database provinsi
- **Kota/Kabupaten**: Otomatis cocok dengan database kota (filtered by province)
- **Contoh**: "Jakarta Selatan" → akan dicocokkan dengan "Kota Jakarta Selatan"

### 🏦 Bank Matching  
- **Nama Bank**: Otomatis cocok dengan database bank Indonesia
- **Contoh**: "Mandiri" → akan dicocokkan dengan "Bank Mandiri"

### 📚 Program Matching
- **Program/Subjects**: Otomatis cocok dengan database mata pelajaran
- **Multiple Programs**: Pisah dengan `;` atau `,`
- **Contoh**: "Matematika; Fisika" → akan dicocokkan dengan program yang sesuai

## ✅ Validation Rules

### 📋 Required Fields
- `Nama Lengkap`: Wajib diisi
- `Email Aktif`: Wajib diisi dan format email valid
- `No. HP Utama (+62)`: Wajib diisi dan format nomor valid
- `Provinsi Domisili`: Wajib diisi  
- `Kota/Kabupaten Domisili`: Wajib diisi
- `Program yang Dipilih`: Wajib diisi

### 🔍 Format Validation
- **Email**: Format email yang valid (contoh@domain.com)
- **Phone**: 8-15 digit, bisa dengan spasi/tanda hubung
- **Date**: Format YYYY-MM-DD
- **IPK/GPA**: Angka 0-4
- **Tarif**: Angka positif, warning jika < 10.000 atau > 500.000

### 👤 Business Logic
- **Age**: Warning jika usia < 17 atau > 70 tahun
- **Matching Confidence**: Warning jika confidence < 90%

## 📥 How to Use

1. **Download Template**: Klik "Download Template CSV" di halaman import
2. **Fill Data**: Isi data sesuai dengan format dan contoh
3. **Upload File**: Upload file CSV ke sistem import  
4. **Review Preview**: Periksa hasil fuzzy matching dan validasi
5. **Import Data**: Klik "Import to Database" jika semua data valid

## ⚠️ Important Notes

- **File Encoding**: Pastikan CSV disimpan dalam format UTF-8
- **Separator**: Gunakan comma (`,`) sebagai separator
- **Multiple Values**: Untuk program, pisah dengan semicolon (`;`)
- **Phone Format**: Tulis tanpa +62, langsung dari 8xxx
- **Date Format**: Selalu gunakan YYYY-MM-DD

## 🎯 Success Tips

1. **Use Examples**: Ikuti format contoh yang diberikan
2. **Check Required**: Pastikan semua field WAJIB terisi
3. **Fuzzy Matching**: Nama lokasi/bank tidak perlu persis sama
4. **Preview First**: Selalu review preview sebelum import
5. **Small Batches**: Mulai dengan file kecil untuk testing

---

**📊 Template ini mendukung import hingga ribuan tutor sekaligus dengan intelligent matching dan comprehensive validation!**
