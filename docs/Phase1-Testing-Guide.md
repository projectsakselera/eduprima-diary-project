# 🧪 PHASE 1 TESTING GUIDE - EDGE FUNCTION MIGRATION

**Migration Phase**: Phase 1 - Basic User Creation  
**Status**: ⚙️ **READY FOR TESTING**  
**Date**: January 2025

---

## 🎯 **WHAT WE'RE TESTING**

### **Phase 1 Scope:**
- ✅ **User Creation**: `users_universal` + `user_profiles` via edge function
- ✅ **Address Data**: Domicile and KTP addresses
- ✅ **Banking Info**: Bank account details
- ✅ **Fallback Support**: Automatic client-side fallback if edge function fails

### **What's NOT in Phase 1:**
- ❌ Document uploads (still client-side)
- ❌ Advanced tutor features (personality, preferences)
- ❌ Program mappings
- ❌ Availability config (detailed)

---

## 🚀 **HOW TO TEST PHASE 1**

### **Step 1: Enable Migration (CAREFUL!)**
```typescript
// File: config/index.ts
export const migrationConfig = {
  useEdgeFunctionForUserCreation: true, // ⚠️ Change this to TRUE
  enableMigrationLogs: true,            // Keep detailed logs
  enableFallbackToClientSide: true,     // Safety net
}
```

### **Step 2: Test Scenarios**

#### **🧪 Test Case 1: Basic Tutor Creation**
```json
{
  "namaLengkap": "Test Tutor Phase1",
  "email": "test.phase1@example.com",
  "noHp1": "08123456789",
  "tanggalLahir": "1990-01-15",
  "jenisKelamin": "L",
  "provinsiDomisili": "[valid-uuid]",
  "kotaKabupatenDomisili": "[valid-uuid]",
  "kecamatanDomisili": "Test Kecamatan",
  "kelurahanDomisili": "Test Kelurahan",
  "alamatLengkapDomisili": "Jl. Test Phase 1 No. 123",
  "namaNasabah": "Test Tutor Phase1",
  "nomorRekening": "1234567890",
  "namaBank": "[bank-uuid]"
}
```

#### **🧪 Test Case 2: Minimal Required Fields Only**
```json
{
  "namaLengkap": "Minimal Test",
  "email": "minimal.test@example.com", 
  "noHp1": "08987654321",
  "tanggalLahir": "1985-12-20",
  "jenisKelamin": "P"
  // Minimal required fields only
}
```

#### **🧪 Test Case 3: Edge Function Failure (Network)**
- Disconnect internet briefly during submission
- Should fallback to client-side automatically

---

## 📊 **WHAT TO WATCH IN CONSOLE**

### **✅ Success Indicators:**
```javascript
📊 [MIGRATION] Starting Phase 1 - User Creation
⚙️ [MIGRATION] Edge Function enabled: true
🎯 [MIGRATION] Attempting edge function user creation...
📡 [MIGRATION] Edge function response status: 200
✅ [MIGRATION] Edge function success: {user_id: "...", tutor_id: "...", tables_created: 13}
✅ [MIGRATION] User creation successful via: edge
📊 [MIGRATION] Phase 1 Result: {source: "edge_function", success: true, user_id: "..."}
```

### **🔄 Fallback Indicators:**
```javascript
💥 [MIGRATION] Edge function error, falling back to client-side...
📝 [FALLBACK] Creating new tutor user with data: {...}
🔄 [MIGRATION] Client-side fallback used
📊 [MIGRATION] Phase 1 Result: {source: "client_side_fallback", success: true}
```

### **❌ Error Indicators:**
```javascript
❌ [MIGRATION] Edge function failed: {error: "...", details: "..."}
💥 [MIGRATION] Migration attempt failed: Error message
📊 [MIGRATION] Phase 1 Result: {source: "failed", success: false}
```

---

## 🗄️ **DATABASE VERIFICATION**

### **After Successful Test, Check These Tables:**
1. **`users_universal`** - New user record created
2. **`user_profiles`** - Profile data with all fields
3. **`user_addresses`** - Domicile (and KTP if different)
4. **`user_demographics`** - Religion data (if provided)
5. **`tutor_details`** - Basic tutor record
6. **`tutor_management`** - Status and approval info
7. **`tutor_banking_info`** - Banking details

### **Expected Data:**
- ✅ **Consistent user_id** across all related tables
- ✅ **Auto-generated fields**: TRN (tutor registration number), timestamps
- ✅ **Proper data types**: UUIDs, dates, enums as expected
- ✅ **No NULL violations**: Required fields properly filled

---

## 🚨 **ROLLBACK PROCEDURE**

### **If Testing Fails:**
```typescript
// IMMEDIATE ROLLBACK: Set flag to false
export const migrationConfig = {
  useEdgeFunctionForUserCreation: false, // ⚠️ ROLLBACK
  enableFallbackToClientSide: true,     // Keep safety net
}
```

### **If Data Issues:**
1. **Check Supabase logs**: Edge function error details
2. **Review console**: Migration source and error messages  
3. **Database cleanup**: Remove test records if needed
4. **Report findings**: Document any issues found

---

## 📋 **TESTING CHECKLIST**

### **Pre-Test:**
- [ ] ✅ Backup current working form (git commit)
- [ ] ✅ Verify edge function is deployed and active
- [ ] ✅ Check environment variables in browser network tab
- [ ] ✅ Enable migration logs (`enableMigrationLogs: true`)

### **During Test:**  
- [ ] 🧪 Test basic tutor creation (required fields only)
- [ ] 🧪 Test complete data (all optional fields)
- [ ] 🧪 Test validation errors (invalid email, phone)
- [ ] 🧪 Test fallback (simulate edge function failure)
- [ ] 📊 Monitor console logs for migration flow

### **Post-Test:**
- [ ] ✅ Verify data in Supabase dashboard
- [ ] ✅ Check all 7 database tables populated correctly
- [ ] ✅ Test tutor login with generated password
- [ ] 📝 Document any issues or improvements needed
- [ ] 🎯 Decide: Keep migration enabled or rollback

---

## 🎯 **SUCCESS CRITERIA FOR PHASE 1**

- [ ] ✅ **Edge function works**: No 400/406 errors
- [ ] ✅ **Data integrity**: All tables populated correctly
- [ ] ✅ **Fallback works**: Client-side backup functions properly
- [ ] ✅ **Performance**: Edge function faster than client-side
- [ ] ✅ **User experience**: No visible changes to form behavior
- [ ] ✅ **Error handling**: Clear error messages for users

---

**Ready to Test**: Change `useEdgeFunctionForUserCreation: true` and submit test tutor  
**Rollback Plan**: Set flag to `false` if any issues occur  
**Next Phase**: After Phase 1 success, plan Phase 2 (core tutor data)

---

**Testing Lead**: Developer  
**Risk Level**: 🟡 **LOW (Fallback enabled)**  
**Estimated Test Time**: 15-30 minutes
