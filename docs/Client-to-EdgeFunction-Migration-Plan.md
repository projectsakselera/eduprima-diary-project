# 🔄 CLIENT-SIDE TO EDGE FUNCTION MIGRATION PLAN

**Status**: 📋 **PLANNING PHASE**  
**Date**: January 2025  
**Approach**: 🎯 **GRADUAL/STEP-BY-STEP MIGRATION**

---

## 🚨 **CURRENT ISSUES IDENTIFIED**

### **Error Log Analysis (January 10, 2025)**

#### **❌ ERROR 1: Role Query Syntax (406 Not Acceptable)**
```javascript
// Current problematic query:
GET user_roles?select=*&role_name=eq.tutor
// Error: 406 Not Acceptable

// Issue: Using role_name instead of role_code
// Fix needed: role_code=eq.tutor or manual search
```

#### **❌ ERROR 2: User Profiles Schema Mismatch (400 Bad Request)**  
```javascript
// Current problematic insert:
POST user_profiles?columns="full_name","nick_name","date_of_birth"...
// Error: 400 Bad Request

// Issue: Too many columns specified or wrong column names
// Fix: Use edge function with proper schema mapping
```

#### **✅ WHAT WORKS:**
- ✅ User creation in `users_universal` (successful)
- ✅ Role lookup fallback (manual search works)
- ✅ Form validation (frontend working)

---

## 📋 **MIGRATION STRATEGY: GRADUAL APPROACH**

### **🎯 MIGRATION PHASES**

#### **PHASE 1: BASIC USER CREATION** *(First Migration)*
- **Scope**: Replace `users_universal` + `user_profiles` creation
- **Risk**: 🟡 LOW (only 2 tables)
- **Test**: Create user dengan data minimal
- **Rollback**: Easy - revert to client-side

#### **PHASE 2: CORE TUTOR DATA** *(Second Migration)*
- **Scope**: Add `tutor_details` + `tutor_management` 
- **Risk**: 🟡 MEDIUM (core tutor logic)
- **Test**: Complete tutor profile creation
- **Rollback**: Moderate complexity

#### **PHASE 3: EXTENDED DATA** *(Third Migration)*
- **Scope**: Add address, banking, availability
- **Risk**: 🟠 MEDIUM-HIGH (multiple tables)
- **Test**: Full form submission
- **Rollback**: Requires careful testing

#### **PHASE 4: ADVANCED FEATURES** *(Final Migration)*
- **Scope**: Documents, personality, preferences, programs
- **Risk**: 🟡 LOW (optional data)
- **Test**: Complete feature set
- **Rollback**: Easy (optional features)

---

## 🔧 **PHASE 1 IMPLEMENTATION PLAN**

### **📋 Current Client-Side Code (Problematic)**
```typescript
// ❌ CURRENT: Client-side operations
const userResult = await supabase.from('users_universal').insert(...)
const profileResult = await supabase.from('user_profiles').insert(...)
```

### **✅ Phase 1 Target: Edge Function Integration**
```typescript
// ✅ TARGET: Edge function call
const response = await fetch('/functions/v1/create-tutor-complete', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${sessionToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    personal: {
      namaLengkap: formData.namaLengkap,
      email: formData.email,
      // ... other personal fields
    },
    address: {
      provinsiDomisili: formData.provinsiDomisili,
      // ... address fields
    },
    banking: {
      namaNasabah: formData.namaNasabah,
      // ... banking fields
    }
  })
})
```

---

## 🎯 **PHASE 1: STEP-BY-STEP IMPLEMENTATION**

### **Step 1.1: Create Migration Flag**
```typescript
// Add feature flag untuk gradual migration
const USE_EDGE_FUNCTION_FOR_USER_CREATION = true; // Phase 1
const USE_EDGE_FUNCTION_FOR_FULL_CREATION = false; // Phase 4
```

### **Step 1.2: Create Helper Function**
```typescript
// services/tutor-edge.service.ts
export async function createBasicTutor(data: BasicTutorData) {
  const response = await fetch('/functions/v1/create-tutor-complete', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${sessionToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      personal: data.personal,
      address: data.address, 
      banking: data.banking
    })
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.details || 'Failed to create tutor')
  }
  
  return response.json()
}
```

### **Step 1.3: Update Form Handler**
```typescript
// Replace user creation logic in page.tsx
if (USE_EDGE_FUNCTION_FOR_USER_CREATION) {
  // ✅ NEW: Use edge function
  const result = await createBasicTutor({
    personal: { /* map form fields */ },
    address: { /* map form fields */ },
    banking: { /* map form fields */ }
  })
} else {
  // ❌ OLD: Keep existing client-side code for rollback
  const userResult = await supabase.from('users_universal')...
}
```

---

## 📊 **TESTING STRATEGY**

### **Phase 1 Testing Checklist:**
- [ ] **Smoke Test**: Basic form submission works
- [ ] **Data Validation**: All required fields saved correctly
- [ ] **Error Handling**: Proper error messages displayed
- [ ] **Rollback Test**: Can revert to client-side if needed
- [ ] **Edge Cases**: Empty fields, special characters, long text

### **Success Criteria Phase 1:**
- [ ] ✅ User creation works via edge function
- [ ] ✅ No 400/406 errors in console
- [ ] ✅ Data appears correctly in Supabase dashboard
- [ ] ✅ Form UX remains smooth
- [ ] ✅ Error messages user-friendly

---

## 🛡️ **ROLLBACK STRATEGY**

### **If Migration Fails:**
```typescript
// Quick rollback: Change feature flag
const USE_EDGE_FUNCTION_FOR_USER_CREATION = false; // Instant rollback

// Or: Keep both code paths during transition
if (EDGE_FUNCTION_AVAILABLE && !DEBUG_MODE) {
  // Try edge function
} else {
  // Fallback to client-side
}
```

---

## 📅 **TIMELINE & NEXT STEPS**

### **Phase 1 (Today/Tomorrow):**
- [x] ✅ Document current errors  
- [x] ✅ Create feature flag system (`migrationConfig` in config/index.ts)
- [x] ✅ Create edge function service (`services/tutor-edge.service.ts`)
- [x] ✅ Implement hybrid user creation (fallback support)
- [ ] 🧪 Test Phase 1 migration
- [ ] ✅ Verify data in Supabase dashboard

### **Phase 2-4 (Next Week):**
- [ ] 📊 Gradually expand edge function usage
- [ ] 🧪 Test each phase thoroughly
- [ ] 📋 Document findings and issues
- [ ] 🚀 Complete full migration

---

**Current Priority**: 🎯 **START PHASE 1 - BASIC USER CREATION**  
**Next Action**: Create feature flag and basic edge function integration

---

**Migration Lead**: Developer  
**Testing Approach**: Incremental with rollback capability  
**Risk Level**: 🟡 **CONTROLLED (Step-by-step approach)**
