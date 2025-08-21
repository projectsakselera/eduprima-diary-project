# 🧪 TRN Fix Testing Guide

## 📋 Overview
Guide untuk testing fix TRN generation issue yang terjadi pada format tanggal YYYY-MM-DD.

---

## 🐛 Issue Summary
- **Problem**: Format DD/MM/YYYY preserve TRN, tapi YYYY-MM-DD generate TRN baru
- **Root Cause**: Broken database trigger + inconsistent date validation
- **Solution**: Fix database trigger + strengthen TRN preservation logic

---

## ✅ Fixes Applied

### 1. **Database Trigger Fix**
```sql
-- File: scripts/fix-broken-trn-trigger.sql
-- Fixed: Broken trigger that referenced non-existent function
-- Result: Trigger now properly preserves TRN from CSV or auto-generates
```

### 2. **Backend Logic Enhancement**
```javascript
// File: app/api/tutors/bulk-import/route.ts
// Enhanced: TRN preservation logic in both RPC and direct insert paths
// Result: TRN from CSV is always preserved if provided and unique
```

### 3. **Documentation Update**
```markdown
// File: docs/CSV-Template-Import-Guide.md
// Updated: Format examples and TRN preservation notes
// Result: Clear guidance for YYYY-MM-DD format
```

---

## 🧪 Testing Scenarios

### **Scenario 1: TRN Preservation with YYYY-MM-DD**
**Test Case**: CSV dengan existing TRN + valid date format

**CSV Data:**
```csv
"TRN (Tutor Registration Number)","Nama Lengkap","Tanggal Lahir","Email Aktif"
"TSL2506012","Ahmad Santoso","1994-08-23","ahmad@test.com"
```

**Expected Result:**
- ✅ Import successful
- ✅ TRN preserved: `TSL2506012` 
- ✅ Date stored correctly: `1994-08-23`
- ✅ No auto-generated TRN

**How to Test:**
1. Upload CSV with above data
2. Check preview shows valid record
3. Import to database
4. Verify TRN in database matches CSV

---

### **Scenario 2: Auto-Generate TRN with YYYY-MM-DD**
**Test Case**: CSV without TRN + valid date format

**CSV Data:**
```csv
"TRN (Tutor Registration Number)","Nama Lengkap","Tanggal Lahir","Email Aktif"
"","Siti Rahayu","1995-12-15","siti@test.com"
```

**Expected Result:**
- ✅ Import successful
- ✅ TRN auto-generated: `ID2500XXX` (kelipatan 7)
- ✅ Date stored correctly: `1995-12-15`

---

### **Scenario 3: Duplicate TRN Handling**
**Test Case**: CSV with duplicate TRN

**CSV Data:**
```csv
"TRN (Tutor Registration Number)","Nama Lengkap","Tanggal Lahir","Email Aktif"
"TSL2506012","Ahmad Santoso","1994-08-23","ahmad@test.com"
"TSL2506012","Budi Pratama","1992-03-07","budi@test.com"
```

**Expected Result:**
- ✅ First record: TRN preserved `TSL2506012`
- ✅ Second record: Auto-generated TRN (duplicate detected)
- ⚠️ Warning message about duplicate TRN

---

### **Scenario 4: Invalid Date Format (Should Fail)**
**Test Case**: CSV dengan format tanggal salah

**CSV Data:**
```csv
"TRN (Tutor Registration Number)","Nama Lengkap","Tanggal Lahir","Email Aktif"
"TSL2506013","Dina Sari","23/08/1996","dina@test.com"
```

**Expected Result:**
- ❌ Record marked as invalid
- ❌ Error message: "Format tanggal lahir tidak valid"
- ❌ Record not imported to database

---

## 🎯 Step-by-Step Testing Process

### **Pre-Testing Setup**
1. **Run Database Fix:**
   ```sql
   -- Execute this SQL in Supabase SQL Editor
   \i scripts/fix-broken-trn-trigger.sql
   ```

2. **Deploy Backend Changes:**
   - Ensure `app/api/tutors/bulk-import/route.ts` changes are deployed
   - Check logs for any deployment errors

### **Test Execution**
1. **Access Import Page:**
   - Go to EduPrima → Database Tutor → Import/Export
   - Download latest CSV template

2. **Prepare Test Data:**
   - Create CSV files for each scenario
   - Use exact column names from template

3. **Execute Tests:**
   - Upload CSV file
   - Check preview validation
   - Review mapping and fuzzy matching
   - Import to database
   - Verify results in database

4. **Verify Results:**
   ```sql
   -- Check TRN values in database
   SELECT 
     tutor_registration_number,
     user_id,
     created_at
   FROM tutor_details 
   WHERE tutor_registration_number IN ('TSL2506012', 'TSL2506013')
   ORDER BY created_at DESC;
   ```

---

## 📊 Success Criteria

### **✅ All Tests Must Pass:**
- [ ] TRN preservation works with YYYY-MM-DD format
- [ ] Auto-generation works when TRN empty
- [ ] Duplicate TRN detection works
- [ ] Invalid dates are properly rejected
- [ ] No broken triggers or errors in logs

### **📈 Performance Criteria:**
- Import speed should be same or better
- No memory leaks or connection issues
- Proper error messages and logging

---

## 🚨 Rollback Plan

**If tests fail:**
1. **Database Rollback:**
   ```sql
   -- Restore old trigger if needed
   DROP TRIGGER IF EXISTS tr_tutor_registration_number ON tutor_details;
   -- Restore to previous state
   ```

2. **Code Rollback:**
   - Revert `bulk-import/route.ts` changes
   - Deploy previous version

---

## ✨ Post-Testing Verification

**After successful tests:**
1. **Update Documentation:**
   - Mark issue as resolved
   - Update user guides

2. **Monitor Production:**
   - Watch import success rates
   - Check error logs
   - Gather user feedback

---

**🎯 Expected Timeline: 1-2 hours for complete testing**
**👥 Required: 1 developer + 1 tester**