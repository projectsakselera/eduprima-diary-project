# 📚 Dokumentasi Sistem Seleksi Program - Eduprima

## 🎯 **Overview Sistem**

Sistem ini memungkinkan tutor untuk memilih mata pelajaran/program yang akan diajarkan melalui interface yang user-friendly dengan fitur search, filter, dan pagination. Data program diambil dari database Supabase dengan struktur relasional yang kompleks.

---

## 🗄️ **Struktur Database Supabase**

### **Tabel Utama:**

#### 1. `t_210_01_01_program_main_categories`
```sql
-- Kategori utama program (ex: Bisnis & Kewirausahaan, Teknologi, dll)
CREATE TABLE t_210_01_01_program_main_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  main_code VARCHAR(10) UNIQUE NOT NULL,      -- Ex: "BIZ", "TECH"
  main_name VARCHAR(100) NOT NULL,            -- English name
  main_name_local VARCHAR(100) NOT NULL,      -- Indonesian name
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. `t_210_01_02_program_sub_categories`
```sql
-- Sub-kategori program (ex: E-commerce, Startup, dll)
CREATE TABLE t_210_01_02_program_sub_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  main_category_id UUID REFERENCES t_210_01_01_program_main_categories(id),
  sub_code VARCHAR(10) NOT NULL,              -- Ex: "ECO", "STU"
  sub_name VARCHAR(100) NOT NULL,             -- English name
  sub_name_local VARCHAR(100) NOT NULL,       -- Indonesian name
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. `t_210_02_01_program_types`
```sql
-- Tipe program (ex: Course, Workshop, dll)
CREATE TABLE t_210_02_01_program_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type_code VARCHAR(10) UNIQUE NOT NULL,      -- Ex: "CRS", "WKS"
  type_name VARCHAR(100) NOT NULL,            -- English name
  type_name_local VARCHAR(100) NOT NULL,      -- Indonesian name
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 4. `t_210_02_02_programs_catalog` 🎯 **MAIN TABLE**
```sql
-- Katalog program lengkap
CREATE TABLE t_210_02_02_programs_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subcategory_id UUID REFERENCES t_210_01_02_program_sub_categories(id),
  program_type_id UUID REFERENCES t_210_02_01_program_types(id),
  
  -- Program Identity
  program_code VARCHAR(20) UNIQUE NOT NULL,   -- Ex: "BIZ-ECO-STF-AMZ"
  program_name VARCHAR(200) NOT NULL,         -- English name
  program_name_local VARCHAR(200) NOT NULL,   -- "Amazon FBA"
  program_name_short VARCHAR(50),             -- Short version
  
  -- Program Details
  subject_focus VARCHAR(100),                 -- "E-commerce"
  description TEXT,
  prerequisites TEXT,
  
  -- Target Audience
  target_age_min INTEGER,                     -- 18
  target_age_max INTEGER,                     -- 65
  grade_level INTEGER,                        -- For school subjects
  
  -- Teaching Configuration
  ideal_session_duration_minutes INTEGER,     -- 90 minutes per session
  ideal_total_sessions INTEGER,               -- 12 sessions total
  ideal_class_size_min INTEGER,               -- Min 3 students
  ideal_class_size_max INTEGER,               -- Max 15 students
  
  -- Status & Flags
  is_active BOOLEAN DEFAULT true,
  is_premium BOOLEAN DEFAULT false,
  requires_certification BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔗 **API Endpoints**

### **1. Categories API** 📂
**File:** `app/api/subjects/categories/route.ts`

```typescript
// GET /api/subjects/categories
// Mengambil semua kategori utama yang aktif

Response Format:
{
  "categories": [
    {
      "id": "uuid",
      "main_code": "BIZ",
      "main_name": "Business & Entrepreneurship", 
      "main_name_local": "Bisnis & Kewirausahaan",
      "description": "...",
      "is_active": true
    }
  ],
  "count": 5
}
```

### **2. Programs API** 📚
**File:** `app/api/subjects/programs/route.ts`

```typescript
// GET /api/subjects/programs?category=BIZ&limit=30&offset=0&search=amazon

Query Parameters:
- category: main_code dari kategori (optional)
- subcategory: subcategory_id (optional)  
- search: pencarian di program_name_local, program_name, subject_focus
- limit: jumlah data per halaman (default: 50)
- offset: offset untuk pagination (default: 0)

Response Format:
{
  "programs": [
    {
      "id": "uuid",
      "program_code": "BIZ-ECO-STF-AMZ",
      "program_name": "Amazon FBA",
      "program_name_local": "Amazon FBA",
      "subject_focus": "E-commerce",
      "target_age_min": 18,
      "target_age_max": 65,
      "ideal_session_duration_minutes": 90,
      "ideal_total_sessions": 12,
      "subcategory": {
        "id": "uuid",
        "sub_name_local": "E-commerce",
        "main_category": {
          "id": "uuid", 
          "main_code": "BIZ",
          "main_name_local": "Bisnis & Kewirausahaan"
        }
      },
      "program_type": {
        "id": "uuid",
        "type_name_local": "Kursus Standar"
      }
    }
  ],
  "count": 150,
  "pagination": {
    "limit": 30,
    "offset": 0, 
    "hasMore": true
  }
}
```

---

## ⚛️ **React Components**

### **1. CategoryProgramSelector** 🎯 **MAIN COMPONENT**
**File:** `app/[locale]/(protected)/eduprima/main/ops/em/matchmaking/database-tutor/add/form-field.tsx`

#### **Props Interface:**
```typescript
interface CategoryProgramSelectorProps {
  field: FormFieldConfig;
  value: string[];           // Array of selected program IDs
  onChange: (value: string[]) => void;
  disabled?: boolean;
  error?: string;
}
```

#### **State Management:**
```typescript
// Data States
const [allPrograms, setAllPrograms] = useState<Program[]>([]);
const [searchResults, setSearchResults] = useState<Program[]>([]);
const [categories, setCategories] = useState<Category[]>([]);

// UI States
const [loading, setLoading] = useState(true);
const [loadingMore, setLoadingMore] = useState(false);
const [searchLoading, setSearchLoading] = useState(false);

// User Input States
const [searchTerm, setSearchTerm] = useState('');
const [selectedCategory, setSelectedCategory] = useState<string>('all');

// Pagination States
const [currentPage, setCurrentPage] = useState(1);
const [hasMore, setHasMore] = useState(true);
const [totalPrograms, setTotalPrograms] = useState(0);

const PROGRAMS_PER_PAGE = 30;
```

#### **Key Functions:**

##### **fetchCategories()** 📂
```typescript
// Mengambil daftar kategori dari API
// Handles both response formats: {categories: []} dan {data: []}
const fetchCategories = async () => {
  const response = await fetch('/api/subjects/categories');
  const data = await response.json();
  
  // Handle different response formats
  let categories = [];
  if (data.categories) {
    categories = data.categories;
  } else if (data.data) {
    // Map field names if different
    categories = data.data.map(item => ({
      id: item.id,
      main_code: item.code,
      main_name: item.name,
      main_name_local: item.nameLocal,
      description: item.description,
      is_active: true
    }));
  }
  setCategories(categories);
};
```

##### **fetchPrograms(page, reset)** 📚
```typescript
// Mengambil program dengan pagination
// page: halaman yang akan diambil
// reset: apakah reset data existing atau append
const fetchPrograms = async (page: number = 1, reset: boolean = false) => {
  const offset = (page - 1) * PROGRAMS_PER_PAGE;
  let programsToFetch: Program[] = [];
  
  if (selectedCategory === 'all') {
    // Fetch from all categories
    for (const category of categories) {
      const response = await fetch(
        `/api/subjects/programs?category=${category.main_code}&limit=50&offset=0`
      );
      const data = await response.json();
      programsToFetch.push(...(data.programs || data.data || []));
    }
  } else {
    // Fetch from specific category
    const response = await fetch(
      `/api/subjects/programs?category=${selectedCategory}&limit=100&offset=0`
    );
    const data = await response.json();
    programsToFetch = data.programs || data.data || [];
  }
  
  // Apply client-side pagination
  const startIndex = offset;
  const endIndex = startIndex + PROGRAMS_PER_PAGE;
  const paginatedPrograms = programsToFetch.slice(startIndex, endIndex);
  
  setTotalPrograms(programsToFetch.length);
  setHasMore(endIndex < programsToFetch.length);
  
  if (reset || page === 1) {
    setAllPrograms(paginatedPrograms);
  } else {
    setAllPrograms(prev => [...prev, ...paginatedPrograms]);
  }
};
```

##### **searchAllPrograms(searchTerm)** 🔍
```typescript
// Global search across all programs
const searchAllPrograms = async (searchTerm: string) => {
  if (!searchTerm.trim()) {
    setSearchResults([]);
    return;
  }
  
  setSearchLoading(true);
  
  // Fetch from all categories
  const allProgramsData: Program[] = [];
  for (const category of categories) {
    const response = await fetch(
      `/api/subjects/programs?category=${category.main_code}&limit=200&offset=0`
    );
    const data = await response.json();
    allProgramsData.push(...(data.programs || data.data || []));
  }
  
  // Filter by search term
  const search = searchTerm.toLowerCase();
  const filtered = allProgramsData.filter(program =>
    program.program_name_local?.toLowerCase().includes(search) ||
    program.program_name?.toLowerCase().includes(search) ||
    program.program_code?.toLowerCase().includes(search) ||
    program.subject_focus?.toLowerCase().includes(search)
  );
  
  // Sort: selected first, then alphabetical
  const sorted = filtered.sort((a, b) => {
    const aSelected = value.includes(a.id);
    const bSelected = value.includes(b.id);
    
    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    
    return (a.program_name_local || a.program_name).localeCompare(
      b.program_name_local || b.program_name
    );
  });
  
  setSearchResults(sorted);
  setSearchLoading(false);
};
```

#### **UI Layout Structure:**
```
┌─ CategoryProgramSelector ─────────────────────────────┐
│ ┌─ Selection Summary (if selected > 0) ─────────────┐ │
│ │ ✅ 3 program dipilih          [Hapus Semua]      │ │
│ └───────────────────────────────────────────────────┘ │
│                                                       │
│ ┌─ Search & Filter ─────────────────────────────────┐ │
│ │ [🔍 Search Global]  [📂 Category Dropdown]       │ │
│ │ Results: 25 programs • Page 1 • Total: 150       │ │
│ └───────────────────────────────────────────────────┘ │
│                                                       │
│ ┌─ Programs Grid (2 columns) ───────────────────────┐ │
│ │ ☑️ Program A        ☑️ Program B                  │ │
│ │   Code • Focus        Code • Focus                │ │  
│ │   Category            Category                    │ │
│ │                                                   │ │
│ │ ☑️ Program C        ☐ Program D                  │ │
│ │   Code • Focus        Code • Focus                │ │
│ │   Category            Category                    │ │
│ │                                                   │ │
│ │           [📥 Load More Programs]                 │ │
│ └───────────────────────────────────────────────────┘ │
│                                                       │
│ ┌─ Selected Programs Recap ─────────────────────────┐ │
│ │ ✅ 3 Program Dipilih          [🗑️ Hapus Semua]    │ │
│ │ ┌───────────────┐ ┌───────────────┐               │ │
│ │ │✅ Program A [×]│ │✅ Program B [×]│               │ │
│ │ │  Code•Category │ │  Code•Category │               │ │
│ │ └───────────────┘ └───────────────┘               │ │
│ │ ┌───────────────┐                                 │ │
│ │ │✅ Program C [×]│                                 │ │
│ │ │  Code•Category │                                 │ │
│ │ └───────────────┘                                 │ │
│ └───────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────┘
```

---

## 🔧 **Setup & Configuration**

### **1. Environment Variables**
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **2. Supabase Client Setup**
**File:** `lib/supabase.ts`
```typescript
import { createClient } from '@supabase/supabase-js';

export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  return createClient(supabaseUrl, supabaseKey);
};
```

### **3. Form Configuration**
**File:** `form-config.ts`
```typescript
{
  name: 'selectedPrograms',
  label: '📚 Pilih Program/Mata Pelajaran yang Diajarkan',
  type: 'category-program-selector',
  required: true,
  helperText: 'Klik kategori untuk melihat semua program yang tersedia. Pilih program yang sesuai dengan keahlian Anda.',
  icon: 'ph:book-open'
}
```

### **4. Page Layout Integration**
**File:** `page.tsx` - Line 629
```typescript
// Make sure category-program-selector gets full width
field.type === 'category-program-selector' || 
field.type === 'textarea' || 
field.type === 'checkbox' ? 'lg:col-span-2 xl:col-span-3' : ''
```

---

## 🚀 **Usage Flow**

### **User Journey:**
1. **Load Categories** 📂 - Component fetches categories on mount
2. **Load Programs** 📚 - Fetches first 30 programs from selected category
3. **User Actions:**
   - **Search** 🔍 - Global search across all programs (debounced 300ms)
   - **Filter** 📂 - Select specific category to narrow results
   - **Select** ☑️ - Click checkbox to select/unselect programs
   - **Load More** 📥 - Pagination to load next 30 programs
   - **Manage Selection** 🎯 - View and remove selected programs from recap

### **Data Flow:**
```
Categories API → [categories] State
     ↓
Programs API → [allPrograms] State → Display Grid
     ↓                                     ↓
User Search → [searchResults] State → Display Results
     ↓                                     ↓
User Selection → [value] Props → Selected Recap
```

---

## 🔍 **Troubleshooting Guide**

### **Common Issues:**

#### **1. "No Data" meskipun curl berhasil**
```typescript
// Problem: API response format tidak sesuai
// Solution: Check response parsing di fetchCategories()

// Expected formats:
{ categories: [...] }          // ✅ Primary format
{ success: true, data: [...] } // ✅ Alternative format  
{ data: [...] }                // ✅ Fallback format
```

#### **2. Field tidak full width**
```typescript
// Problem: Field masih 1/3 lebar dalam grid
// Solution: Add type ke col-span condition
field.type === 'category-program-selector' || 
field.type === 'textarea' ? 'lg:col-span-2 xl:col-span-3' : ''
```

#### **3. Search tidak mengembalikan hasil**
```typescript
// Problem: Search hanya mencari di category yang dipilih
// Solution: searchAllPrograms() mencari di semua kategori
for (const category of categories) {
  // Fetch dari setiap kategori untuk global search
}
```

#### **4. Pagination tidak bekerja**
```typescript
// Problem: Client-side pagination implementation
// Solution: fetchPrograms() handles pagination logic
const startIndex = offset;
const endIndex = startIndex + PROGRAMS_PER_PAGE;
const paginatedPrograms = allProgramsData.slice(startIndex, endIndex);
```

---

## 📊 **Performance Considerations**

### **Optimizations Applied:**

1. **Debounced Search** ⏱️ - 300ms delay untuk avoid excessive API calls
2. **Client-side Pagination** 📄 - Fetch once, paginate on client
3. **Memoized Display** 🧠 - `useMemo` untuk sorted/filtered results
4. **Conditional Fetching** 🎯 - Search hanya fetch saat ada search term
5. **Selected-first Sorting** ⭐ - Selected programs always appear first

### **Data Loading Strategy:**
```typescript
// Initial Load: 30 programs from selected category
// Search: All programs from all categories (max ~1000 programs)
// Pagination: Client-side slicing of fetched data
// Category Change: Reset and fetch new data
```

---

## 🧪 **Testing Guide**

### **Manual Testing Checklist:**

#### **Basic Functionality:**
- [ ] Categories load on component mount
- [ ] Programs load with correct pagination
- [ ] Search works across all categories
- [ ] Category filter narrows results
- [ ] Selection/deselection works
- [ ] Load more button works
- [ ] Selected programs appear in recap
- [ ] Unselect from recap works
- [ ] "Hapus Semua" clears all selections

#### **Edge Cases:**
- [ ] Empty search results
- [ ] No programs in category
- [ ] API errors handled gracefully
- [ ] Loading states display correctly
- [ ] Mobile responsive layout

#### **Performance:**
- [ ] Search debouncing works (no excessive requests)
- [ ] Large selection lists render smoothly
- [ ] Pagination doesn't cause memory leaks

---

## 🔄 **Future Enhancements**

### **Potential Improvements:**

1. **Server-side Search** 🔍 - Move global search to API with LIKE queries
2. **Virtual Scrolling** ♾️ - Handle thousands of programs efficiently  
3. **Category Hierarchy** 🌳 - Show subcategories in UI
4. **Program Details Modal** 📋 - Show full program info on click
5. **Bulk Actions** ⚡ - Select all in category, import/export selections
6. **Saved Selections** 💾 - Save common program combinations
7. **Real-time Updates** 🔄 - WebSocket updates for program changes

---

## 📝 **Notes & Best Practices**

### **Code Organization:**
- ✅ Single component handles all program selection logic
- ✅ Clear separation of data fetching and UI logic  
- ✅ Consistent error handling across API calls
- ✅ TypeScript interfaces for all data structures

### **User Experience:**
- ✅ Loading states for all async operations
- ✅ Visual feedback for selected items
- ✅ Search suggestions and results count
- ✅ Mobile-friendly touch interactions

### **Data Integrity:**
- ✅ Program IDs used for selection (not names)
- ✅ Category relationships preserved in display
- ✅ Consistent data formatting across components

---

**📅 Last Updated:** January 2024  
**👥 Maintainers:** Development Team  
**🔄 Version:** 1.0.0

> **⚠️ Important:** Selalu test di environment development sebelum deploy ke production. Database structure changes memerlukan migration yang hati-hati. 