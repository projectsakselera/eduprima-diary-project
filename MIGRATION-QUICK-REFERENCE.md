# 🚀 Quick Reference: Migration System

## 🔗 Quick Links
- **Migration Dashboard**: `http://localhost:3000/en/eduprima/main/ops/em/matchmaking/database-tutor/migration/dashboard`
- **Schema Validation**: `http://localhost:3000/en/eduprima/main/ops/em/matchmaking/database-tutor/migration/schema-validation`
- **Column Mapping**: `http://localhost:3000/en/eduprima/main/ops/em/matchmaking/database-tutor/migration/column-mapping`
- **Import Export**: `http://localhost:3000/en/eduprima/main/ops/em/matchmaking/database-tutor/migration/import-export`
- **Progress Tracking**: `http://localhost:3000/en/eduprima/main/ops/em/matchmaking/database-tutor/migration/progress-tracking`

---

## ⚡ Quick Start (5 Minutes)

### **First Time Setup:**
1. **Schema Validation** → Check compatibility
2. **Column Mapping** → Configure + Save  
3. **Import Export** → Test with 2-3 records
4. ✅ Ready for production!

### **Regular Import:**
1. Upload file → Review preview → Click Import → Done! 🎉

---

## 📁 File Format Examples

### **CSV Format:**
```csv
Name,Email,Phone,Subjects,Rate
John Doe,john@example.com,+6281234567890,"Math,Physics",150000
Jane Smith,jane@example.com,+6281234567891,"English,Biology",120000
```

### **Excel Columns:**
| Name | Email | Phone | Subjects | Rate |
|------|-------|-------|----------|------|
| John Doe | john@example.com | +6281234567890 | Math,Physics | 150000 |

---

## ✅ Validation Rules (Quick Check)

```
📧 Email: john@example.com ✅ | john@ ❌
📱 Phone: +6281234567890 ✅ | 12345 ❌  
🏷️ TRN: TUT123 ✅ | tut-123 ❌
🔢 Rate: 150000 ✅ | "150 ribu" ❌
```

---

## 🛠️ Common Fixes

| Error | Fix |
|-------|-----|
| "No column mapping found" | Go to Column Mapping → Configure → Save |
| "Invalid email" | Fix format: `user@domain.com` |
| "Invalid phone" | Use Indonesian format: `+6281234567890` |
| "File parsing error" | Check header row + data consistency |
| "Database error" | Check duplicate emails/TRN |

---

## 📊 Status Indicators

| Color | Meaning |
|-------|---------|
| 🟢 Green | Valid/Mapped/Success |
| 🔴 Red | Invalid/Error/Failed |  
| 🟡 Orange | Warning/Skipped |
| ⚪ Gray | Unmapped/Pending |

---

## 🔧 Emergency Commands

### **Reset Column Mapping:**
```
Column Mapping page → "Reset Mapping" button
```

### **Re-validate Schema:**
```  
Schema Validation page → Auto-refresh on load
```

### **Export Current Data:**
```
Import Export page → "Export Data" button
```

---

## 📞 Support Checklist

Before asking for help, check:
- [ ] Schema validation shows compatibility issues?
- [ ] Column mapping configured and saved?  
- [ ] File format matches examples above?
- [ ] Error messages from import results?
- [ ] Browser console for detailed errors?

---

*⏰ Quick Reference - Last Updated: January 2025* 