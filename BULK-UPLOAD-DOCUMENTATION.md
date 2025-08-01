# 📁 Bulk Upload Tutor System - Documentation

## 🎯 Overview

Fitur bulk upload untuk data tutor telah berhasil diintegrasikan dengan form add tutor yang lengkap. Sistem ini memungkinkan upload data tutor dalam jumlah besar melalui CSV/Excel dengan validasi yang sama seperti form manual.

## ✨ Features

### 1. **Upload File Format Support**
- ✅ CSV (.csv)
- ✅ Excel (.xlsx, .xls)
- ✅ Automatic parsing dan validation

### 2. **Intelligent Field Mapping**
- 🧠 Otomatis mapping berdasarkan nama kolom
- 🔍 Multiple matching strategies:
  - Exact label match
  - Field name match
  - Lowercase match
  - Space-removed match
  - Underscore/dash variations

### 3. **Comprehensive Validation**
- 📧 Email format validation
- 📱 Phone number formatting (Indonesian standard)
- 🔢 Number validation dengan min/max
- 📅 Date format validation
- 📋 Select options validation
- 🎯 Custom validation rules dari form config

### 4. **Data Transformation**
- 🔄 Phone numbers: Auto format ke standard Indonesia (62xxx)
- 📧 Email: Lowercase dan trim
- 🔢 Numbers: Parse dengan handling error
- 📅 Dates: ISO format conversion
- 📦 Arrays: Split comma/semicolon separated values
- ✅ Booleans: Smart parsing (Yes/No, True/False, 1/0, Ya/Tidak)

### 5. **Real-time Preview & Error Reporting**
- 👀 Preview data sebelum import
- ❌ Error details per row
- ⚠️ Warning notifications
- 📊 Statistics dashboard
- 🎯 Success/error count

## 🚀 How to Use

### Step 1: Access Bulk Upload
Navigate to: `http://localhost:3000/en/eduprima/main/ops/em/matchmaking/database-tutor/import-export`

### Step 2: Download Template
1. Click **"Download Template"** button
2. Template CSV akan ter-download dengan:
   - Semua field headers sesuai form config
   - Sample data untuk guidance
   - Proper field types dan formats

### Step 3: Prepare Your Data
1. Fill template dengan data tutor
2. Pastikan format sesuai dengan contoh:
   - **Email**: `nama@gmail.com`
   - **Phone**: `6281234567890` (no spaces, Indonesian format)
   - **Date**: `2000-01-15` (YYYY-MM-DD)
   - **Arrays**: `Option 1, Option 2, Option 3`
   - **Numbers**: `75000` (no thousands separator)

### Step 4: Upload & Preview
1. Click **"Browse Files"** atau drag & drop
2. File akan diparsing otomatis
3. Review preview data dan statistics
4. Check error/warning messages

### Step 5: Import to Database
1. Pastikan data valid (green status)
2. Click **"Import X Records"**
3. Monitor progress bar
4. Review final results

## 📋 Template Structure

### Required Fields
- ✅ **Nama Lengkap**: Full name
- ✅ **Email Aktif**: Gmail address
- ✅ **No. HP (WhatsApp)**: Phone number
- ✅ **Tanggal Lahir**: Birth date
- ✅ **Jenis Kelamin**: Gender
- ✅ **Motivasi Menjadi Tutor**: Teaching motivation

### Important Fields
- 🏠 **Address fields**: Provinsi, Kota, etc.
- 🏦 **Banking**: Account details
- 🎓 **Education**: University, major, GPA
- 📚 **Subjects**: Teaching subjects
- 💰 **Fee**: Hourly rate
- 📅 **Schedule**: Available times

### Optional Fields
- 📱 Social media links
- 🏆 Achievements
- 📄 Certifications
- 🎯 Specializations

## 🔧 Technical Implementation

### Key Improvements Made:

1. **Integration with Form Config**
```typescript
// Uses tutorFormConfig for field mapping and validation
const generateFieldMapping = (): Array<{field: TutorFormField, csvColumn: string}> => {
  // Maps all form fields automatically
}
```

2. **Smart Data Transformation**
```typescript
const transformValue = (value: any, fieldName: string, fieldType: string): any => {
  // Handles all field types: email, tel_split, number, date, checkbox, etc.
}
```

3. **Comprehensive Validation**
```typescript
const validateRecord = (record: Record<string, any>): string[] => {
  // Uses validation rules from form config
  // Custom validation per field type
}
```

4. **Template Generation**
```typescript
const downloadCSVTemplate = () => {
  // Auto-generates template based on form config
  // Includes sample data for guidance
}
```

## 📊 Sample Data Format

Contoh baris data dalam CSV:

```csv
Status Tutor,Nama Lengkap,Email Aktif,No. HP (WhatsApp),...
active,"John Doe","john.doe@gmail.com","6281234567890",...
active,"Maria Santos","maria.santos@gmail.com","6281234567893",...
```

## ⚠️ Common Issues & Solutions

### 1. **Phone Number Format**
❌ Wrong: `081234567890`, `+62-812-3456-7890`
✅ Correct: `6281234567890`

### 2. **Date Format**
❌ Wrong: `15/05/2000`, `May 15, 2000`
✅ Correct: `2000-05-15`

### 3. **Array Fields**
❌ Wrong: `["Option 1","Option 2"]`
✅ Correct: `Option 1, Option 2`

### 4. **Email Format**
❌ Wrong: `JOHN@GMAIL.COM`
✅ Correct: `john@gmail.com`

## 🎯 Benefits

1. **Time Efficient**: Upload ratusan tutor sekaligus
2. **Data Consistency**: Same validation as manual form
3. **Error Prevention**: Comprehensive validation
4. **User Friendly**: Smart field mapping
5. **Template-based**: Easy to follow format
6. **Progress Tracking**: Real-time import status

## 🔜 Future Enhancements

- [ ] Support for file uploads dalam bulk (photos, documents)
- [ ] Advanced column mapping interface
- [ ] Import history dan rollback
- [ ] Batch processing untuk file besar
- [ ] Email notifications untuk import completion

---

✅ **Status**: COMPLETED - Ready for production use
🚀 **Version**: 1.0.0
📅 **Last Updated**: January 2025