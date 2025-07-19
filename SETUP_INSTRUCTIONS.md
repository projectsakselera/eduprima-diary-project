# 🚀 Setup Supabase - Instruksi Lengkap

## ✅ Credentials yang Sudah Diberikan

**URL:** `https://btnsfqhgrjdyxwjiomrj.supabase.co`  
**Anon Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0bnNmcWhncmpkeXh3amlvbXJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzODAwOTEsImV4cCI6MjA2Nzk1NjA5MX0.AzC7DZEmzIs9paMsrPJKYdCH4J2pLKMcaPF_emVZH6Q`

## 📝 Langkah 1: Buat File Environment Variables

Buat file `.env.local` di root proyek dengan isi berikut:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://btnsfqhgrjdyxwjiomrj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0bnNmcWhncmpkeXh3amlvbXJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzODAwOTEsImV4cCI6MjA2Nzk1NjA5MX0.AzC7DZEmzIs9paMsrPJKYdCH4J2pLKMcaPF_emVZH6Q

# NextAuth Configuration (existing)
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your_nextauth_secret
```

## 🗄️ Langkah 2: Setup Database di Supabase

1. **Buka Supabase Dashboard:**
   - Kunjungi [supabase.com](https://supabase.com)
   - Login ke akun Anda
   - Pilih proyek `btnsfqhgrjdyxwjiomrj`

2. **Buka SQL Editor:**
   - Klik menu "SQL Editor" di sidebar kiri
   - Klik "New query"

3. **Jalankan Script SQL:**
   - Copy seluruh isi file `supabase-setup.sql`
   - Paste ke SQL Editor
   - Klik "Run" untuk menjalankan script

## 🔐 Langkah 3: Setup Authentication

1. **Buka Authentication Settings:**
   - Di Supabase Dashboard, klik "Authentication" > "Settings"

2. **Konfigurasi Email Templates (Optional):**
   - Klik tab "Email Templates"
   - Customize template sesuai kebutuhan

3. **Setup Redirect URLs:**
   - Di tab "URL Configuration"
   - Tambahkan redirect URLs:
     - `http://localhost:3001/auth/callback`
     - `http://localhost:3001/supabase-demo`

## 🧪 Langkah 4: Test Aplikasi

1. **Restart Development Server:**
   ```bash
   # Stop server yang sedang berjalan (Ctrl+C)
   npm run dev
   ```

2. **Akses Halaman Demo:**
   - Buka browser
   - Kunjungi: `http://localhost:3001/en/supabase-demo`

3. **Test Fitur:**
   - **Sign Up:** Buat akun baru dengan email dan password
   - **Sign In:** Login dengan akun yang sudah dibuat
   - **Create Post:** Buat post baru (setelah login)
   - **View Data:** Lihat data di tab Users, Profiles, dan Posts

## 📊 Fitur yang Tersedia

### ✅ Authentication
- Sign up dengan email/password
- Sign in dengan email/password
- Sign out
- Auto-create user profile saat signup

### ✅ Database Operations
- **Users Table:** Menyimpan data user
- **Profiles Table:** Data tambahan user (bio, website, dll)
- **Posts Table:** Blog posts dengan author dan publish status

### ✅ Real-time Features
- Auto-refresh data setelah operasi CRUD
- Real-time authentication state
- Loading states untuk semua operasi

### ✅ Security
- Row Level Security (RLS) enabled
- User-specific data access
- Secure API routes

## 🔧 Troubleshooting

### Error: "Invalid API key"
- Pastikan anon key sudah benar di `.env.local`
- Restart development server setelah mengubah environment variables

### Error: "Table does not exist"
- Pastikan script SQL sudah dijalankan di Supabase Dashboard
- Cek apakah tabel `users`, `profiles`, dan `posts` sudah dibuat

### Error: "RLS policy violation"
- Pastikan user sudah login untuk mengakses data
- Cek RLS policies di Supabase Dashboard

### Port 3000 sudah digunakan
- Aplikasi akan otomatis menggunakan port 3001
- Akses `http://localhost:3001` sebagai gantinya

## 📁 File yang Sudah Dibuat

- `lib/supabase.ts` - Konfigurasi Supabase client
- `hooks/use-supabase.ts` - Custom hooks untuk Supabase
- `components/supabase-dashboard.tsx` - Dashboard lengkap
- `app/[locale]/supabase-demo/page.tsx` - Halaman demo
- `supabase-setup.sql` - Script setup database
- `app/api/supabase/example/route.ts` - API route contoh

## 🎯 Next Steps

Setelah setup selesai, Anda bisa:

1. **Customize UI:** Modifikasi komponen sesuai kebutuhan
2. **Add More Tables:** Buat tabel baru sesuai business logic
3. **Add Real-time Features:** Implementasi real-time updates
4. **Add File Upload:** Integrasi dengan Supabase Storage
5. **Add Email Templates:** Customize email notifications

## 🆘 Support

Jika ada masalah, cek:
1. Console browser untuk error JavaScript
2. Terminal untuk error server
3. Supabase Dashboard untuk error database
4. Network tab untuk error API calls 