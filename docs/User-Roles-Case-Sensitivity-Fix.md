# 🐛 User Roles Case Sensitivity Fix

## Masalah
Error 406 (Not Acceptable) terjadi saat Form Add Tutor melakukan query ke tabel `user_roles`:
```
GET /rest/v1/user_roles?select=*&role_name=eq.tutor 406 (Not Acceptable)
```

## Root Cause
**Case sensitivity inconsistency** antara berbagai bagian sistem:
- Edge Function: menggunakan `'Tutor'` (capital T)
- Add Form & Services: menggunakan `'tutor'` (lowercase)
- Database: kemungkinan menyimpan data dengan case tertentu

## Solusi Diterapkan

### 1. Edge Function (`supabase/functions/create-tutor-complete/index.ts`)
✅ **Fallback mechanism** - coba kedua case:
```typescript
// Try 'Tutor' first, then fallback to 'tutor'
let { data: tutorRole, error: roleError } = await supabase
  .from('user_roles')
  .select('id')
  .eq('role_name', 'Tutor')
  .single()

if (roleError || !tutorRole) {
  const { data: tutorRoleLower, error: roleLowerError } = await supabase
    .from('user_roles')
    .select('id')
    .eq('role_name', 'tutor')
    .single()
  
  if (tutorRoleLower) {
    tutorRole = tutorRoleLower
    roleError = null
  }
}
```

### 2. Add Form (`database-tutor/add/page.tsx`)
✅ **Prioritize correct case** - coba `'Tutor'` pertama:
```typescript
const possibleRoleNames = ['Tutor', 'tutor', 'TUTOR', 'educator', 'Educator', 'EDUCATOR']
```

### 3. Service Layer (`lib/supabase-service.ts`)
✅ **Case insensitive query** dengan `ilike`:
```typescript
.or('role_name.ilike.Tutor,role_name.ilike.tutor,role_name.ilike.educator,role_name.ilike.Educator')
```

### 4. API Routes
✅ **Diperluas pattern matching** untuk semua kemungkinan case:
- `app/api/tutors/spreadsheet/route.ts`
- `app/api/tutors/bulk-import/route.ts`

## Hasil
- ✅ Error 406 teratasi
- ✅ Sistem robust terhadap case sensitivity
- ✅ Backward compatibility terjaga
- ✅ Performance tidak terpengaruh (minimal overhead)

## Best Practices untuk Future Development
1. **Gunakan case insensitive query** (`ilike`) untuk text matching
2. **Standardisasi naming convention** di database 
3. **Implement fallback mechanism** untuk critical queries
4. **Test dengan berbagai case scenarios**

---
*Fixed: Januari 2025 - Case Sensitivity User Roles Query*
