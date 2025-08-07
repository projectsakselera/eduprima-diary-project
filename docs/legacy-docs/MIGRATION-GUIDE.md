# 📚 Panduan Lengkap: Google Sheet to Supabase Migration System

## 🎯 Overview

Sistem Migration ini memungkinkan Anda untuk:
- ✅ **Validasi schema** antara form Add Tutor dengan database Supabase
- 🔗 **Mapping kolom** dari file Excel/CSV ke database fields
- 📥 **Import data massal** dari Google Sheet/Excel/CSV ke Supabase
- 📊 **Tracking progress** dan monitoring hasil migration
- 📤 **Export data** dari database ke file CSV

---

## 🗂️ Menu Navigation

Semua fitur migration dapat diakses melalui sidebar **"Migration Tools"**:

```
📁 Migration Tools
├── 🏠 Migration Dashboard    - Overview dan status
├── 🔗 Column Mapping        - Map form fields ke database
├── 🛡️ Schema Validation     - Validasi kompatibilitas
├── 📊 Progress Tracking     - Monitor migration progress
```

**Base URL**: `http://localhost:3000/en/eduprima/main/ops/em/matchmaking/database-tutor/migration/`

---

## 📋 Step-by-Step Migration Process

### **STEP 1: Schema Validation** ✅
**URL**: `/schema-validation`

**Tujuan**: Memvalidasi apakah form fields di Add Tutor compatible dengan database schema.

#### Cara Penggunaan:
1. **Buka page Schema Validation**
2. **Page akan auto-load** dan fetch:
   - Form fields dari `Add Tutor` configuration
   - Database schema dari Supabase table `t_310_01_01_users_universal`
3. **Review hasil validasi**:
   - ✅ **Matched Fields**: Fields yang kompatible
   - ⚠️ **Type Mismatches**: Fields dengan type berbeda  
   - ❌ **Missing Fields**: Fields tidak ada di database
   - ℹ️ **Database Only**: Fields hanya ada di database

#### Hasil Validasi:
- **Total Fields**: Jumlah form fields
- **Matched**: Fields yang perfectly match
- **Issues**: Fields dengan masalah compatibility  
- **Compatibility Score**: Percentage kecocokan

#### Contoh Output:
```
✅ MATCHED FIELDS (15):
- email → email (varchar)
- namaLengkap → nama_lengkap (varchar)  
- noHp1 → no_hp_1 (varchar)

⚠️ TYPE MISMATCHES (3):
- tarif → tarif_per_jam (string vs numeric)
- tanggalLahir → tanggal_lahir (string vs date)

❌ MISSING IN DATABASE (2):
- motivasiMengajar (form field tidak ada di DB)
- pengalamanMengajar (form field tidak ada di DB)
```

---

### **STEP 2: Column Mapping** 🔗
**URL**: `/column-mapping`

**Tujuan**: Membuat mapping antara kolom di file Excel/CSV dengan database fields.

#### Cara Penggunaan:

1. **Buka page Column Mapping**
2. **Auto-mapping akan dijalankan**:
   - Form fields di-load dari Add Tutor config
   - Database fields di-fetch dari Supabase
   - Intelligent mapping suggestions dibuat
3. **Review dan adjust mappings**:
   - **Green**: Fields yang successfully mapped
   - **Red**: Fields yang belum mapped
   - **Orange**: Fields yang di-skip
4. **Manual mapping**:
   - Click dropdown untuk select database field
   - Pilih "-- No Mapping --" untuk skip field
   - Click ❌ button untuk toggle skip
5. **Save configuration**: Click **"Save Mapping"**

#### Intelligent Auto-Mapping Examples:
```
namaLengkap     → nama_lengkap      (camelCase to snake_case)
email          → email             (exact match)
noHp           → no_hp_1           (partial match)
mataPelajaran  → mata_pelajaran_sd (subject mapping)
```

#### Statistics Dashboard:
- **Total Fields**: Total form fields
- **Mapped**: Successfully mapped fields
- **Skipped**: Fields yang akan diabaikan
- **Unmapped**: Fields yang masih butuh attention

---

### **STEP 3: Import & Export** 📥📤
**URL**: `/import-export`

**Tujuan**: Import data dari file Excel/CSV atau export existing data.

#### Import Process:

1. **Persiapan File**:
   ```
   Supported formats: .csv, .xlsx, .xls
   Header row required di baris pertama
   
   Contoh struktur:
   | Name          | Email                | Phone           | Subjects          |
   |---------------|----------------------|-----------------|-------------------|
   | John Doe      | john@example.com     | +62812345678    | Math, Physics     |
   | Jane Smith    | jane@example.com     | +62813456789    | English, Bio      |
   ```

2. **Upload File**:
   - Click **"Browse Files"** atau drag-drop file
   - File akan di-parse automatically
   - Column mapping akan di-apply dari konfigurasi yang sudah disimpan

3. **Review Data Preview**:
   - **Statistics Cards**: Total, Valid, Invalid, Warnings
   - **Data Table**: Preview first 10 records
   - **Status Indicators**:
     - 🟢 **Valid**: Ready to import  
     - 🔴 **Invalid**: Has validation errors
     - 🟡 **Warning**: Minor issues

4. **Import Execution**:
   - Click **"Import X Records"**
   - Progress bar akan show real-time progress
   - Import results akan ditampilkan

#### Export Process:

1. Click **"Export Data"** di top-right
2. System akan fetch all records dari Supabase
3. CSV file akan di-generate dan auto-download
4. Filename format: `tutor_export_YYYY-MM-DD.csv`

---

### **STEP 4: Progress Tracking** 📊  
**URL**: `/progress-tracking`

**Tujuan**: Monitor migration history dan detailed logs.

#### Features:
- **Current Migration Status**: Ongoing operations
- **Migration Statistics**: Success/failure rates  
- **History Table**: Past migration records
- **Error Logs**: Detailed error information
- **Performance Metrics**: Speed dan efficiency data

---

### **STEP 5: Migration Dashboard** 🏠
**URL**: `/dashboard`

**Tujuan**: Central hub untuk overview semua migration tools.

#### Quick Stats:
- **Schema Compatibility**: Overall compatibility score
- **Mapping Configuration**: Status of column mappings
- **Recent Imports**: Latest import activities
- **Data Volume**: Database record counts

#### Quick Actions:
- Links ke semua migration tools  
- Recent activity overview
- System health indicators

---

## 🛠️ Data Validation Rules

### **Email Validation**:
```regex
Pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
Valid: john@example.com, user@domain.co.id
Invalid: john@, @domain.com, john.domain.com
```

### **Phone Number Validation** (Indonesian Format):
```regex
Pattern: /^(\+62|62|0)[0-9]{9,13}$/
Valid: +6281234567890, 08123456789, 62812345678
Invalid: 12345, +1234567890
```

### **TRN Validation**:
```regex  
Pattern: /^[A-Z0-9]+$/
Valid: TUT123, TUTOR001, ABC123
Invalid: tut123, tutor-001, tut_123
```

### **Data Transformations**:
- **Arrays**: `"Math,Physics"` → `["Math", "Physics"]`
- **Numbers**: `"150.000"` → `150000`  
- **Dates**: `"01/01/2023"` → `"2023-01-01"`
- **Booleans**: `"Yes"` → `true`, `"No"` → `false`

---

## 🔧 Troubleshooting

### **❌ Common Errors**

#### 1. **"No column mapping found"**
**Penyebab**: Column mapping belum dikonfigurasi  
**Solusi**: 
1. Buka Column Mapping page
2. Configure field mappings  
3. Save configuration
4. Retry import

#### 2. **"Invalid email format"**
**Penyebab**: Email tidak sesuai format standar  
**Solusi**: Fix email format di source file:
```
❌ Salah: john@, user@domain
✅ Benar: john@example.com, user@domain.com
```

#### 3. **"Invalid phone number format"**  
**Penyebab**: Format nomor telpon tidak sesuai Indonesia  
**Solusi**: Gunakan format Indonesia:
```
❌ Salah: 12345, +1-234-567  
✅ Benar: +6281234567890, 08123456789
```

#### 4. **"File must contain header row"**
**Penyebab**: File tidak ada header di baris pertama  
**Solusi**: Pastikan baris pertama berisi nama kolom

#### 5. **"Duplicate email detected"**
**Penyebab**: Email sudah ada di database  
**Solusi**: 
- Update existing record, atau
- Use different email address

### **⚠️ Performance Tips**

#### **Large File Imports** (>1000 records):
1. **Split file** menjadi chunks 500-1000 records
2. **Import bertahap** untuk avoid timeout  
3. **Monitor memory usage** saat processing

#### **Column Mapping Optimization**:
1. **Save mapping configuration** untuk reuse
2. **Skip unnecessary fields** untuk faster processing
3. **Use exact field names** untuk better auto-mapping

---

## 📝 Best Practices

### **File Preparation**:
```csv
✅ Good Structure:
Name,Email,Phone,Subjects,Rate
John Doe,john@example.com,+6281234567890,"Math,Physics",150000

❌ Bad Structure:  
Name|Email|Phone  
John Doe|john@|12345 (wrong delimiter, invalid data)
```

### **Data Quality**:
- ✅ **Consistent formatting**: Same date format, phone format  
- ✅ **Complete required fields**: Email, name, phone
- ✅ **Unique identifiers**: No duplicate emails/TRN
- ✅ **Valid data types**: Numbers for rates, proper dates

### **Import Strategy**:
1. **Small test batch first** (10-20 records)
2. **Validate results** sebelum import full data
3. **Backup existing data** sebelum mass import  
4. **Monitor error logs** untuk identify patterns

### **Column Mapping Strategy**:
- **Map semua required fields** first
- **Skip optional/irrelevant fields** untuk efficiency
- **Double-check field types** untuk avoid conversion errors
- **Save multiple mapping configs** untuk different data sources

---

## 🚀 Quick Start Checklist

### **First-Time Setup**:
- [ ] Buka **Schema Validation** untuk understand compatibility  
- [ ] Configure **Column Mapping** dengan sample file
- [ ] Test **Import** dengan 2-3 sample records
- [ ] Verify results di database atau View All page  
- [ ] Save mapping configuration untuk production use

### **Regular Migration**:
- [ ] Prepare file dengan consistent format
- [ ] Load saved column mapping  
- [ ] Upload dan review data preview
- [ ] Fix validation errors jika ada
- [ ] Execute import dan monitor progress
- [ ] Check **Progress Tracking** untuk results

---

## 📞 Support & Resources

### **Database Schema Reference**:
```sql
Table: t_310_01_01_users_universal

Key Fields:
- id (uuid, auto-generated)
- trn (varchar, required, unique)  
- nama_lengkap (varchar, required)
- email (varchar, required, unique)
- no_hp_1 (varchar, required)
- mata_pelajaran_sd (text[], optional)
- tarif_per_jam (numeric, optional)  
- created_at (timestamp, auto)
- updated_at (timestamp, auto)
```

### **File Size Limits**:
- **Excel**: Max 50MB atau ~100,000 rows
- **CSV**: Max 20MB atau ~200,000 rows  
- **Processing**: Batch size 1000 records per operation

### **Browser Compatibility**:
- ✅ Chrome 90+, Firefox 90+, Safari 14+, Edge 90+
- ⚠️ Internet Explorer not supported
- 📱 Mobile browsers: limited file upload support

---

## 🔄 Updates & Changelog

### **Version 1.0** (Current):
- ✅ Schema validation dengan real database connection
- ✅ Intelligent column mapping dengan auto-suggestions
- ✅ CSV/Excel import dengan comprehensive validation  
- ✅ Real-time progress tracking
- ✅ Database export functionality
- ✅ Error logging dan detailed reporting

### **Planned Features**:
- 🔄 Bulk update existing records
- 📧 Email notifications untuk import completion  
- 🔍 Advanced filtering di Progress Tracking
- 📊 Migration analytics dan insights
- 🔒 User permission levels untuk migration operations

---

## 💡 Tips & Tricks

### **Excel Preparation**:
```
1. Remove empty rows/columns
2. Consistent data formatting  
3. Use text format untuk phone numbers (avoid auto-conversion)
4. Save as .xlsx untuk better compatibility
```

### **CSV Preparation**:
```  
1. UTF-8 encoding untuk Indonesian characters
2. Comma-separated values (not semicolon)
3. Quote strings yang contain commas
4. Unix line endings jika possible
```

### **Performance Optimization**:
- 🚀 **Import during off-peak hours** untuk better performance
- 📊 **Monitor system resources** saat large imports
- 🔄 **Use incremental imports** untuk large datasets  
- 💾 **Regular backup** sebelum mass operations

---

*📝 Last Updated: January 2025*  
*🔧 For technical support, contact the development team* 