# 🔍 Cara Mengecek Supabase Credentials

## 📋 Opsi untuk Mengecek Credentials

### Opsi 1: Quick Check Script (Recommended)
```bash
# Jalankan quick check (baca dari .env.local)
node scripts/quick-supabase-check.js
```

### Opsi 2: Interactive Connection Test
```bash
# Test koneksi lengkap dengan input manual
node scripts/test-supabase-connection.js
```

### Opsi 3: Install Supabase CLI (Optional)
```bash
# Download installer
curl -o install_supabase_cli.sh https://raw.githubusercontent.com/supabase/cli/main/scripts/install.sh

# Install CLI
chmod +x install_supabase_cli.sh
./install_supabase_cli.sh

# Setelah install, cek status local supabase
supabase status
```

## 🌐 Akses Dashboard Lokal

Jika kamu menjalankan Supabase lokal:

1. **Start local Supabase**:
   ```bash
   supabase start
   ```

2. **Dashboard URLs**:
   - **Studio Dashboard**: http://127.0.0.1:54323
   - **API Server**: http://127.0.0.1:54321
   - **Inbucket (Email)**: http://127.0.0.1:54324

3. **Credentials untuk Local**:
   - **URL**: `http://127.0.0.1:54321`
   - **Anon Key**: (ditampilkan saat `supabase start`)
   - **Service Role**: (ditampilkan saat `supabase start`)

## 🔑 Yang Perlu Dicek

### Environment Variables (.env.local):
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` 
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- 🔒 `SUPABASE_JWT_SECRET` (opsional)

### Format Validasi:
1. **URL**: Harus format `https://xyz.supabase.co` atau `http://127.0.0.1:54321`
2. **Keys**: Harus JWT format (3 parts separated by dots)
3. **Roles**: 
   - Anon key → role: `anon`
   - Service key → role: `service_role`

## 🔧 Manual Check Commands

### Check if credentials are working:
```bash
# Test dengan curl
curl -H "Authorization: Bearer YOUR_ANON_KEY" \
     -H "apikey: YOUR_ANON_KEY" \
     "YOUR_SUPABASE_URL/rest/v1/"
```

### Check JWT payload:
```javascript
// Decode JWT di browser console
const token = 'YOUR_JWT_TOKEN';
const payload = JSON.parse(atob(token.split('.')[1]));
console.log(payload);
```

## ⚠️ Common Issues

1. **"Project not found"** → URL salah
2. **"Invalid JWT"** → Key salah atau expired  
3. **"Insufficient privileges"** → Pakai service role untuk admin operations
4. **CORS errors** → Cek `site_url` di auth config

## 🎯 Next Steps

1. Jalankan `node scripts/quick-supabase-check.js` dulu
2. Kalau ada error, cek credentials di Supabase dashboard
3. Kalau masih error, jalankan `node scripts/test-supabase-connection.js`
4. Consider install Supabase CLI untuk development yang lebih mudah

Semoga membantu! 🚀
