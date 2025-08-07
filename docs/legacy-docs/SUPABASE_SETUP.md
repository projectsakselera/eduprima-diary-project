# Supabase Setup Guide

## Langkah-langkah Setup Supabase

### 1. Buat Proyek Supabase
1. Kunjungi [supabase.com](https://supabase.com)
2. Sign up atau login ke akun Anda
3. Klik "New Project"
4. Pilih organization dan beri nama proyek
5. Masukkan password database
6. Pilih region terdekat
7. Klik "Create new project"

### 2. Dapatkan Credentials
1. Setelah proyek dibuat, pergi ke Settings > API
2. Copy URL dan anon key
3. Untuk service role key, scroll ke bawah dan copy service_role key

### 3. Setup Environment Variables
1. Buat file `.env.local` di root proyek
2. Tambahkan credentials berikut:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Buat Database Tables
Buka SQL Editor di Supabase Dashboard dan jalankan query berikut:

```sql
-- Contoh tabel users
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy untuk users
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);
```

### 5. Setup Authentication
1. Di Supabase Dashboard, pergi ke Authentication > Settings
2. Konfigurasi email templates jika diperlukan
3. Setup redirect URLs untuk development dan production

### 6. Testing
1. Jalankan `npm run dev`
2. Buka halaman yang menggunakan komponen `SupabaseExample`
3. Test sign up, sign in, dan sign out

## File yang Sudah Dibuat

- `lib/supabase.ts` - Konfigurasi Supabase client
- `hooks/use-supabase.ts` - Custom hooks untuk Supabase
- `components/supabase-example.tsx` - Komponen contoh
- `app/api/supabase/example/route.ts` - API route contoh

## Penggunaan

### Di Komponen React
```tsx
import { useSupabase, useSupabaseQuery } from '@/hooks/use-supabase'

function MyComponent() {
  const { user, session, supabase } = useSupabase()
  const { data, loading, error } = useSupabaseQuery('users')
  
  // Gunakan data dan fungsi auth
}
```

### Di API Routes
```tsx
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET() {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from('users').select('*')
  // Handle response
}
```

## Tips Keamanan

1. Selalu gunakan RLS (Row Level Security) di Supabase
2. Jangan expose service role key di client-side
3. Validasi input sebelum insert/update data
4. Gunakan prepared statements untuk query yang kompleks
5. Monitor penggunaan API di Supabase Dashboard 