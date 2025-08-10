# 🔧 Migration System: Troubleshooting Guide

## 🚨 Critical Issues (Fix Immediately)

### **❌ Cannot Access Migration Pages**
```
Problem: 404 or page not found
Solution:
1. Check URL format: http://localhost:3000/en/eduprima/main/ops/em/matchmaking/database-tutor/migration/[page-name]
2. Ensure locale (/en/) is included
3. Restart development server: npm run dev
4. Clear browser cache + hard refresh (Ctrl+F5)
```

### **❌ Database Connection Failed**
```
Problem: Supabase connection errors
Solution:
1. Check Supabase URL and API key in page files
2. Verify Supabase project is active
3. Test connection: Go to Schema Validation page
4. Check browser console for specific error messages
```

---

## 📥 Import Issues

### **❌ "No column mapping found"**
```
STEP 1: Go to Column Mapping page
STEP 2: Wait for auto-loading of form fields + database fields  
STEP 3: Configure mappings (green = mapped, red = unmapped)
STEP 4: Click "Save Mapping" button
STEP 5: Return to Import Export page and retry
```

### **❌ File Upload Fails**
```
Check 1: File format (.csv, .xlsx, .xls only)
Check 2: File size (<50MB)
Check 3: Header row exists in first row
Check 4: No special characters in filename
Fix: Rename file to simple name: tutors.csv
```

### **❌ "Invalid email format" (Multiple Records)**
```
STEP 1: Export failed records from import results
STEP 2: Open in Excel/Google Sheets
STEP 3: Filter email column for "@" character
STEP 4: Fix emails: must have format user@domain.com
STEP 5: Save and re-import

Common Invalid Formats:
❌ john@           → ✅ john@example.com
❌ @domain.com     → ✅ user@domain.com  
❌ john.domain.com → ✅ john@domain.com
```

### **❌ "Invalid phone number format" (Indonesian)**
```
STEP 1: Open source file
STEP 2: Find phone/no_hp column
STEP 3: Apply format rules:

Valid Formats:
✅ +6281234567890    (international)
✅ 081234567890      (national)  
✅ 628123456789      (without +)

Invalid Formats to Fix:
❌ 12345            → Add proper Indonesia prefix
❌ +1-234-567-8900  → Change to Indonesian number
❌ (021) 1234567    → Change to mobile format

Find/Replace in Excel:
- Find: +1         Replace: +62
- Find: ( )        Replace: (empty)
- Find: -          Replace: (empty)
```

---

## 🗺️ Column Mapping Issues

### **❌ Auto-mapping Not Working**
```
STEP 1: Check if form fields loaded (left panel should show 20+ fields)
STEP 2: Check if database fields loaded (right panel should show 30+ fields)
STEP 3: If either empty:
   - Refresh page (F5)
   - Check browser console for errors
   - Check Supabase connection

STEP 4: If still empty:
   - Go to Add Tutor page first (to load form config)
   - Return to Column Mapping page
```

### **❌ Cannot Save Mapping Configuration**
```
STEP 1: Check browser console for JavaScript errors
STEP 2: Try different browser (Chrome recommended)
STEP 3: Check localStorage is enabled:
   - Open Developer Tools (F12)
   - Go to Application tab  
   - Check Local Storage is not disabled
STEP 4: Manual save test:
   - Map 2-3 fields manually
   - Click Save Mapping
   - Check for success alert
```

### **❌ Mapping Shows But Import Still Fails**
```
STEP 1: Go to Column Mapping page
STEP 2: Check statistics at top:
   - Mapped Fields > 0
   - Unmapped Fields = 0 (or acceptable)
STEP 3: If Unmapped > 0:
   - Map required fields: email, nama_lengkap, no_hp_1
   - Skip optional fields not needed
STEP 4: Save mapping again
STEP 5: Go to Import Export page
STEP 6: Upload file and check preview table
```

---

## 📊 Data Validation Errors

### **❌ "Duplicate email detected"**
```
STEP 1: Check existing database records
   - Go to View All Tutors page
   - Search for the email
STEP 2: Choose action:
   Option A: Update existing record (manual)
   Option B: Change email in import file
   Option C: Skip duplicate in import
STEP 3: For bulk duplicates:
   - Filter import file for unique emails only
   - Use Excel: Data → Remove Duplicates
```

### **❌ "TRN must contain only uppercase letters and numbers"**
```
STEP 1: Open import file
STEP 2: Find TRN/trn column  
STEP 3: Fix format:
   ❌ tut-123     → ✅ TUT123
   ❌ tutor_001   → ✅ TUTOR001  
   ❌ abc 123     → ✅ ABC123
STEP 4: Excel formula to fix:
   =UPPER(SUBSTITUTE(SUBSTITUTE(A1," ",""),"-",""))
```

### **❌ Date Format Issues**
```
STEP 1: Check date columns (tanggal_lahir, etc.)
STEP 2: Standard formats accepted:
   ✅ 2023-01-15     (YYYY-MM-DD)
   ✅ 01/15/2023     (MM/DD/YYYY)
   ✅ 15-01-2023     (DD-MM-YYYY)
STEP 3: Fix invalid dates:
   ❌ 32/13/2023     → ✅ 12/31/2023
   ❌ 2023-13-32     → ✅ 2023-12-31
   ❌ "not set"      → ✅ (leave empty)
```

---

## 🔄 Performance Issues

### **❌ Import Takes Too Long (>5 minutes)**
```
STEP 1: Check file size
   - If >1000 records: Split into smaller files
   - Recommended: 500 records per batch
STEP 2: Check validation errors
   - Too many invalid records slow down processing
   - Fix major validation issues first
STEP 3: Browser resources:
   - Close other tabs
   - Clear browser cache
   - Use Chrome for best performance
STEP 4: Database resources:
   - Import during off-peak hours
   - Check Supabase dashboard for performance metrics
```

### **❌ Browser Crashes During Import**
```
STEP 1: Reduce file size (<1000 records)
STEP 2: Clear browser cache and restart
STEP 3: Increase browser memory:
   - Close all other applications  
   - Use Incognito/Private mode
STEP 4: Split import into multiple smaller batches
```

---

## 🛡️ Schema Validation Issues

### **❌ Schema Validation Shows No Fields**
```
STEP 1: Check Add Tutor form config:
   - Go to: /eduprima/main/ops/em/matchmaking/database-tutor/add
   - Ensure form loads properly
   - Check for JavaScript errors in console
STEP 2: Check Supabase connection:
   - Go to Schema Validation page  
   - Open browser Developer Tools (F12)
   - Check Network tab for failed requests
STEP 3: Refresh and retry:
   - Hard refresh page (Ctrl+Shift+R)
   - Wait for full loading
```

### **❌ "Schema Compatibility: 0%"**
```
This indicates serious issues between form and database.

STEP 1: Check database table exists:
   - Login to Supabase dashboard
   - Verify table: t_310_01_01_users_universal exists
   - Check table has columns (not empty)
   
STEP 2: Check form configuration:
   - Go to Add Tutor form
   - Verify form fields load properly
   - Check form-config.ts file exists
   
STEP 3: Update database schema if needed:
   - Add missing columns to database
   - Or modify form configuration to match database
```

---

## 🔍 Browser Console Debugging

### **How to Check Browser Console:**
```
1. Open browser Developer Tools:
   - Chrome: F12 or Ctrl+Shift+I
   - Firefox: F12 or Ctrl+Shift+K
   - Safari: Cmd+Option+I
   
2. Go to "Console" tab

3. Look for error messages (red text)

4. Common error types:
   - Network errors: Check Supabase connection
   - TypeError: Check data format issues
   - 404 errors: Check URL paths
   - Permission errors: Check Supabase API keys
```

### **Common Console Errors & Fixes:**
```
❌ "Cannot read properties of undefined"
→ Data format issue, check file structure

❌ "Failed to fetch"  
→ Network/Supabase connection issue

❌ "Permission denied"
→ Supabase API key or RLS policy issue

❌ "Module not found"
→ Missing dependency, check npm install

❌ "Unexpected token"
→ File parsing error, check file format
```

---

## 📞 When to Ask for Help

Contact development team if you encounter:

- [ ] **Cannot access any migration pages** after following URL troubleshooting
- [ ] **Database connection consistently fails** after checking Supabase
- [ ] **File uploads always fail** regardless of file size/format  
- [ ] **JavaScript errors in console** that you cannot resolve
- [ ] **Performance issues persist** after reducing file size
- [ ] **Schema validation shows 0 compatibility** after database verification

Include in support request:
1. **Exact error message** from browser console
2. **Steps you've already tried** from this guide
3. **File sample** (2-3 records) that's causing issues
4. **Browser and operating system** information

---

*🛠️ Updated: January 2025 | For complex issues, check MIGRATION-GUIDE.md for detailed explanations* 