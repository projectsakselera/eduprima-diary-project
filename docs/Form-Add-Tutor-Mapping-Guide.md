# 📋 FORM ADD TUTOR - CURRENT STATE & NEXT STEPS

## 🎯 **CURRENT STATUS (August 2025)**

### ✅ **COMPLETED - Supabase Side**
- **Database Schema**: Cleaned and optimized
- **Functions**: `generate_tutor_registration_number` ✅ Ready
- **Triggers**: `tr_tutor_registration_number` ✅ Ready  
- **CASCADE**: Proper delete chain configured ✅
- **Tables**: Lean version with only form-relevant columns ✅
- **Constraints**: PK, FK, UNIQUE, CHECK constraints defined ✅

### ⚠️ **PENDING - Form Add Side**
- **Monolithic Structure**: Still 6,540 lines across 3 files
- **Client-side DB writes**: Security risk (using anon key)
- **No component extraction**: All logic in single page
- **No hooks**: Direct API calls in components
- **No type safety**: Missing shared TypeScript types

---

## 📊 **CURRENT DATABASE MAPPING (Updated)**

### **Core Tables (Form Add Focus):**

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `users_universal` | User account & auth | `id`, `email`, `phone`, `user_code`, `password_hash` |
| `user_profiles` | Personal info | `full_name`, `date_of_birth`, `gender`, `mobile_phone`, `headline`, `bio` |
| `user_addresses` | Multiple addresses | `address_type` ('domicile'/'identity'), `province_id`, `city_id`, `district_name`, `village_name` |
| `user_demographics` | Demographics | `religion`, `marital_status`, `ethnicity` |
| `tutor_details` | Main tutor profile | `tutor_registration_number`, `academic_status`, `university_s1_name`, `teaching_experience` |
| `tutor_management` | Status & approval | `status_tutor`, `approval_level`, `identity_verification_status` |
| `tutor_availability_config` | Schedule & rates | `availability_status`, `hourly_rate`, `teaching_methods`, `available_schedule` |
| `tutor_teaching_preferences` | Teaching style | `teaching_styles`, `student_level_preferences`, `online_teaching_capability` |
| `tutor_personality_traits` | Personality | `personality_type`, `communication_style`, `teaching_patience_level` |
| `tutor_program_mappings` | Subject mapping | `program_id`, `proficiency_level`, `is_primary_subject` |
| `tutor_banking_info` | Bank account | `bank_id`, `account_holder_name`, `account_number` |
| `tutor_additional_subjects` | Custom subjects | `subject_name`, `target_level`, `approval_status` |
| `document_storage` | File uploads | `document_type`, `file_url`, `verification_status` |

### **Master Data Tables:**
| Table | Purpose | Usage |
|-------|---------|-------|
| `location_countries` | Countries (ID default) | International expansion ready |
| `location_province` | Provinces | Address dropdown |
| `location_cities` | Cities | Address dropdown |
| `location_districts` | Districts | Address text input |
| `location_villages` | Villages | Address text input |
| `finance_banks_indonesia` | Banks | Banking dropdown |
| `programs_unit` | Programs | Subject selector |
| `program_main_categories` | Categories | Subject grouping |
| `program_sub_categories` | Sub-categories | Subject grouping |

---

## 🔍 **DETAILED FIELD MAPPING (Current)**

### **1. PERSONAL INFORMATION**
```typescript
// Form → Database Mapping
namaLengkap: string           → user_profiles.full_name
namaPanggilan?: string        → user_profiles.nick_name  
tanggalLahir: string          → user_profiles.date_of_birth
jenisKelamin: string          → user_profiles.gender
agama?: string                → user_demographics.religion
email: string                 → users_universal.email
noHp1: string                 → user_profiles.mobile_phone
noHp2?: string                → user_profiles.mobile_phone_2
```

### **2. ADDRESS INFORMATION**
```typescript
// DOMISILI (Always created)
provinsiDomisili: string      → user_addresses.province_id (FK)
kotaKabupatenDomisili: string → user_addresses.city_id (FK)
kecamatanDomisili: string     → user_addresses.district_name (TEXT)
kelurahanDomisili: string     → user_addresses.village_name (TEXT)
alamatLengkapDomisili: string → user_addresses.street_address
kodePosDomisili?: string      → user_addresses.postal_code

// KTP (Conditional - only if different)
alamatSamaDenganKTP?: boolean → user_addresses.is_same_as_domicile
provinsiKTP?: string          → user_addresses.province_id (FK)
kotaKabupatenKTP?: string     → user_addresses.city_id (FK)
kecamatanKTP?: string         → user_addresses.district_name (TEXT)
kelurahanKTP?: string         → user_addresses.village_name (TEXT)
alamatLengkapKTP?: string     → user_addresses.street_address
kodePosKTP?: string           → user_addresses.postal_code
```

### **3. EDUCATION INFORMATION**
```typescript
statusAkademik?: string       → tutor_details.academic_status
namaUniversitasS1?: string    → tutor_details.university_s1_name
fakultasS1?: string           → tutor_details.faculty_s1
jurusanS1?: string            → tutor_details.major_s1
tahunMasuk?: string           → tutor_details.entry_year
namaSMA?: string              → tutor_details.high_school
jurusanSMA?: string           → tutor_details.high_school_major
jurusanSMKDetail?: string     → tutor_details.vocational_school_detail
```

### **4. AVAILABILITY & TEACHING**
```typescript
statusMenerimaSiswa?: string  → tutor_availability_config.availability_status
hourly_rate: number           → tutor_availability_config.hourly_rate
teaching_methods: string[]    → tutor_availability_config.teaching_methods
available_schedule: string[]  → tutor_availability_config.available_schedule
teachingMethods?: string[]    → tutor_teaching_preferences.teaching_styles
studentLevelPreferences?: string[] → tutor_teaching_preferences.student_level_preferences
```

### **5. BANKING INFORMATION**
```typescript
namaNasabah: string           → tutor_banking_info.account_holder_name
nomorRekening: string         → tutor_banking_info.account_number
namaBank: string              → tutor_banking_info.bank_id (FK)
```

### **6. PROGRAMS & SUBJECTS**
```typescript
selectedPrograms?: string[]   → tutor_program_mappings.program_id (multiple records)
mataPelajaranLainnya?: string → tutor_additional_subjects.subject_name
```

---

## 🚨 **CURRENT ISSUES (Need Immediate Fix)**

### **1. Security Issues**
```typescript
// ❌ CURRENT: Client-side database writes
const supabase = createClient(supabaseUrl, supabaseKey);
await supabase.from('users_universal').insert([userData]);

// ✅ SHOULD BE: Server-side operations
// app/api/tutors/create/route.ts
export async function POST(request: Request) {
  'use server'
  // Server-side validation + DB writes
}
```

### **2. Monolithic Structure**
```typescript
// ❌ CURRENT: 1,771 lines in page.tsx
// ❌ CURRENT: 2,810 lines in form-config.ts  
// ❌ CURRENT: 1,959 lines in form-field.tsx

// ✅ SHOULD BE: Component-based
components/tutor/add/
├── PersonalTab.tsx          (~200 lines)
├── AddressTab.tsx           (~300 lines)
├── EducationTab.tsx         (~250 lines)
├── ProgramsTab.tsx          (~200 lines)
├── AvailabilityTab.tsx      (~300 lines)
└── DocumentsTab.tsx         (~150 lines)
```

### **3. Missing Type Safety**
```typescript
// ❌ CURRENT: No shared types
interface TutorFormData { /* 80+ fields */ }

// ✅ SHOULD BE: Shared types
// types/tutor.ts
export interface TutorPersonal { /* personal fields */ }
export interface TutorAddress { /* address fields */ }
export interface TutorEducation { /* education fields */ }
```

---

## 📋 **NEXT STEPS (Priority Order)**

### **Phase 1: Security & Architecture (Week 1-2)**

#### **1.1 Move to Server Actions**
```typescript
// Create: app/api/tutors/create/route.ts
export async function POST(request: Request) {
  'use server'
  
  // 1. Validate form data with Zod
  const formData = await request.json();
  const validatedData = TutorFormSchema.parse(formData);
  
  // 2. Generate TRN server-side
  const trn = await generateTutorRegistrationNumber();
  
  // 3. Create user with server-side password
  const userData = {
    ...validatedData,
    password_hash: await hashPassword(validatedData.password),
    tutor_registration_number: trn
  };
  
  // 4. Insert with proper transaction
  const result = await supabase.rpc('create_tutor_complete', userData);
  
  return NextResponse.json({ success: true, tutor_id: result.data.id });
}
```

#### **1.2 Extract Components**
```typescript
// components/tutor/add/PersonalTab.tsx
export function PersonalTab({ formData, onChange }: PersonalTabProps) {
  return (
    <div className="space-y-6">
      <FormField name="namaLengkap" label="Nama Lengkap" />
      <FormField name="tanggalLahir" label="Tanggal Lahir" type="date" />
      <FormField name="jenisKelamin" label="Jenis Kelamin" type="select" />
      {/* ... other personal fields */}
    </div>
  );
}
```

#### **1.3 Create Shared Types**
```typescript
// types/tutor.ts
export interface TutorPersonal {
  namaLengkap: string;
  namaPanggilan?: string;
  tanggalLahir: string;
  jenisKelamin: string;
  email: string;
  noHp1: string;
  noHp2?: string;
}

export interface TutorAddress {
  provinsiDomisili: string;
  kotaKabupatenDomisili: string;
  kecamatanDomisili: string;
  kelurahanDomisili: string;
  alamatLengkapDomisili: string;
  kodePosDomisili?: string;
  alamatSamaDenganKTP?: boolean;
  // ... KTP fields
}

export interface TutorComposite extends TutorPersonal, TutorAddress, TutorEducation, TutorAvailability, TutorPrograms, TutorDocuments {}
```

### **Phase 2: Data Layer & Hooks (Week 3)**

#### **2.1 Create Hooks**
```typescript
// hooks/useTutor.ts
export function useTutor() {
  const createTutor = async (data: TutorComposite) => {
    const response = await fetch('/api/tutors/create', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response.json();
  };
  
  return { createTutor };
}

// hooks/useLocations.ts
export function useLocations() {
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  
  const fetchProvinces = async () => {
    const response = await fetch('/api/locations/provinces');
    setProvinces(await response.json());
  };
  
  return { provinces, cities, fetchProvinces };
}
```

#### **2.2 Create Services**
```typescript
// services/tutors.ts
export class TutorService {
  static async createTutor(data: TutorComposite): Promise<Tutor> {
    // Server-side creation logic
  }
  
  static async getTutor(id: string): Promise<Tutor> {
    // Fetch tutor data
  }
}

// services/programs.ts
export class ProgramService {
  static async getPrograms(category?: string): Promise<Program[]> {
    // Fetch programs for selector
  }
}
```

### **Phase 3: Validation & Error Handling (Week 4)**

#### **3.1 Zod Schemas**
```typescript
// schemas/tutor.ts
export const TutorPersonalSchema = z.object({
  namaLengkap: z.string().min(3, 'Nama minimal 3 karakter'),
  tanggalLahir: z.string().refine(isValidDate, 'Tanggal lahir tidak valid'),
  jenisKelamin: z.enum(['L', 'P']),
  email: z.string().email('Format email tidak valid'),
  noHp1: z.string().regex(/^(\+62|62|0)[0-9]{9,13}$/, 'Format HP tidak valid')
});

export const TutorAddressSchema = z.object({
  provinsiDomisili: z.string().uuid('Provinsi harus dipilih'),
  kotaKabupatenDomisili: z.string().uuid('Kota harus dipilih'),
  kecamatanDomisili: z.string().min(1, 'Kecamatan harus diisi'),
  // ... other address fields
});
```

#### **3.2 Error Boundaries**
```typescript
// components/ErrorBoundary.tsx
export function TutorFormErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={<TutorFormErrorFallback />}
      onError={(error) => {
        console.error('Tutor form error:', error);
        // Send to error tracking service
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
```

---

## 🎯 **ACCEPTANCE CRITERIA**

### **Functional Requirements:**
- [ ] **Security**: No client-side database writes
- [ ] **Architecture**: Page < 500 lines, components < 300 lines each
- [ ] **Type Safety**: 100% TypeScript coverage with shared types
- [ ] **Validation**: Zod schemas for all form sections
- [ ] **Error Handling**: Comprehensive error boundaries and user feedback

### **Performance Requirements:**
- [ ] **Bundle Size**: 30% reduction from current 6,540 lines
- [ ] **Load Time**: Form initialization < 2 seconds
- [ ] **Validation**: Field validation < 100ms
- [ ] **API Calls**: Optimized with proper caching

### **Code Quality:**
- [ ] **Unit Tests**: 80% coverage for hooks and services
- [ ] **Linting**: ESLint + Prettier compliance
- [ ] **Documentation**: Updated mapping guide
- [ ] **Consistency**: Same patterns across Add/View/Edit

---

## 📊 **PROGRESS TRACKING**

| Phase | Status | Completion | Notes |
|-------|--------|------------|-------|
| **Supabase Cleanup** | ✅ **COMPLETE** | 100% | Database schema optimized |
| **Security Migration** | ⏳ **PENDING** | 0% | Move to server actions |
| **Component Extraction** | ⏳ **PENDING** | 0% | Break down monolith |
| **Type System** | ⏳ **PENDING** | 0% | Shared TypeScript types |
| **Validation Layer** | ⏳ **PENDING** | 0% | Zod schemas |
| **Testing** | ⏳ **PENDING** | 0% | Unit tests |

---

## 🔗 **RELATED DOCUMENTATION**

- **Database Schema**: `docs/supabase-docs/Supabase-Table.json`
- **Functions**: `docs/supabase-docs/supabase-functions.json`
- **Triggers**: `docs/supabase-docs/supabase-triggers.json`
- **CASCADE**: `docs/supabase-docs/supabase-cascade.json`
- **Policies**: `docs/supabase-docs/supabase-rsl-policies.json`

---

**Last Updated**: August 2025  
**Next Review**: After Phase 1 completion  
**Status**: Supabase Ready, Form Refactor Pending

---

## 🚀 **NEXT TODO (Immediate Actions)**

### **Week 1: Security First**
- [ ] **Create Server Action**: `app/api/tutors/create/route.ts`
  - Move all DB writes from client to server
  - Implement proper transaction handling
  - Add input validation with Zod
  - Generate TRN server-side

- [ ] **Fix Password Generation**: 
  - Remove client-side password logic
  - Implement server-side password hashing
  - Add proper password validation

- [ ] **Update Form Submit**:
  - Replace direct Supabase calls with API calls
  - Add proper error handling
  - Implement loading states

### **Week 2: Component Extraction**
- [ ] **Create Component Structure**:
  ```
  components/tutor/add/
  ├── PersonalTab.tsx
  ├── AddressTab.tsx  
  ├── EducationTab.tsx
  ├── ProgramsTab.tsx
  ├── AvailabilityTab.tsx
  └── DocumentsTab.tsx
  ```

- [ ] **Extract Form Logic**:
  - Move form validation to components
  - Create reusable form fields
  - Implement tab navigation

- [ ] **Create Shared Types**:
  ```typescript
  // types/tutor.ts
  export interface TutorPersonal { /* ... */ }
  export interface TutorAddress { /* ... */ }
  export interface TutorEducation { /* ... */ }
  ```

### **Week 3: Data Layer**
- [ ] **Create Hooks**:
  - `hooks/useTutor.ts` - CRUD operations
  - `hooks/useLocations.ts` - Address data
  - `hooks/usePrograms.ts` - Subject data
  - `hooks/useDocuments.ts` - File uploads

- [ ] **Create Services**:
  - `services/tutors.ts` - API calls
  - `services/programs.ts` - Program data
  - `services/locations.ts` - Location data

- [ ] **Implement Caching**:
  - Cache location data (provinces, cities)
  - Cache program data
  - Optimize API calls

### **Week 4: Validation & Testing**
- [ ] **Zod Schemas**:
  - Create validation schemas for each section
  - Implement form-level validation
  - Add custom error messages

- [ ] **Error Handling**:
  - Create error boundaries
  - Implement user-friendly error messages
  - Add retry mechanisms

- [ ] **Testing**:
  - Unit tests for hooks
  - Integration tests for API
  - E2E tests for form flow

---

## 📋 **IMMEDIATE CHECKLIST**

### **Today (Priority 1)**
- [ ] Create `app/api/tutors/create/route.ts` skeleton
- [ ] Move password generation to server
- [ ] Test current form with new API endpoint

### **This Week (Priority 2)**  
- [ ] Extract PersonalTab component
- [ ] Create basic TypeScript types
- [ ] Set up Zod validation

### **Next Week (Priority 3)**
- [ ] Extract remaining tab components
- [ ] Create hooks for data fetching
- [ ] Implement proper error handling

---

**Next Update**: After Week 1 completion  
**Current Focus**: Security migration to server actions
