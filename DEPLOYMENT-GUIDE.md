# 🚀 Deployment Guide - Secure Setup untuk Vercel

## ⚠️ SECURITY FIRST: Jangan Pernah Commit Credentials!

### 📋 **Pre-Deployment Checklist:**
- [x] .env.local ada di .gitignore ✅
- [ ] Environment variables siap untuk Vercel
- [ ] Production database setup (jika perlu)
- [ ] Domain setup (optional)

---

## 🔐 **Step 1: Setup Vercel Environment Variables**

### **Login ke Vercel Dashboard:**
1. Buka [vercel.com](https://vercel.com)
2. Login dengan GitHub/Google
3. Import project dari Git repository

### **Setup Environment Variables:**
Masuk ke Project Settings > Environment Variables, tambahkan:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://btnsfqhgrjdyxwjiomrj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0bnNmcWhncmpkeXh3amlvbXJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzODAwOTEsImV4cCI6MjA2Nzk1NjA5MX0.AzC7DZEmzIs9paMsrPJKYdCH4J2pLKMcaPF_emVZH6Q
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0bnNmcWhncmpkeXh3amlvbXJqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjM4MDA5MSwiZXhwIjoyMDY3OTU2MDkxfQ.dNNwElmfp7NVyXrxZp0zMjxAfT79157UGlXDM0hcvpo

# NextAuth Configuration  
NEXTAUTH_URL=https://yourapp.vercel.app
NEXTAUTH_SECRET=KiDwEUCWmc9xcgNJWkgYepqKkUFCjgpT3z9dh56eQbM=
AUTH_SECRET=KiDwEUCWmc9xcgNJWkgYepqKkUFCjgpT3z9dh56eQbM=
AUTH_URL=https://yourapp.vercel.app
```

**⚠️ PENTING:** Ganti `https://yourapp.vercel.app` dengan domain Vercel yang sebenarnya!

---

## 🔄 **Step 2: Git Backup Strategy (AMAN)**

### **Yang BOLEH di-commit:**
```bash
✅ env.example (template tanpa credentials)
✅ Source code aplikasi
✅ Documentation dan README
✅ Package.json dan dependencies
```

### **Yang JANGAN PERNAH di-commit:**
```bash
❌ .env.local (credentials asli)
❌ .env.production
❌ Database dump dengan data sensitif
❌ API keys atau passwords
```

### **Safe Git Commands:**
```bash
# Cek status sebelum commit
git status

# Pastikan .env.local tidak ada dalam staged files
git add .
git commit -m "feat: add deployment configuration"
git push origin main
```

---

## 🚀 **Step 3: Deploy ke Vercel**

### **Via Vercel CLI:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

### **Via GitHub Integration:**
1. Connect repository ke Vercel
2. Vercel otomatis deploy setiap push ke `main`
3. Preview deployments untuk setiap PR

---

## 🔒 **Step 4: Security Best Practices**

### **Environment Management:**
```bash
# Development
.env.local (local saja, jangan commit)

# Production  
Vercel Dashboard > Environment Variables

# Staging/Preview
Vercel Environment Variables dengan prefix "preview"
```

### **Database Security:**
- ✅ Enable RLS (Row Level Security) di Supabase
- ✅ Gunakan Service Role Key hanya di server-side
- ✅ Audit log untuk tracking perubahan data
- ✅ Regular backup database

### **Authentication Security:**
- ✅ Strong NEXTAUTH_SECRET (32+ karakter)
- ✅ HTTPS only untuk production
- ✅ Proper session timeout (30 hari)
- ✅ Role-based access control

---

## 🧪 **Step 5: Testing Deployment**

### **Pre-deployment Testing:**
```bash
# Test build locally
npm run build
npm start

# Test environment variables
curl https://yourapp.vercel.app/api/auth/session
```

### **Post-deployment Testing:**
1. ✅ Login functionality
2. ✅ Database connections
3. ✅ Role-based access control
4. ✅ API endpoints
5. ✅ Static assets loading

---

## 🆘 **Troubleshooting**

### **Common Issues:**

**1. Environment Variables tidak terbaca:**
- Pastikan nama variable exact match
- Restart Vercel deployment
- Check di Function logs

**2. Database connection error:**
- Verify Supabase credentials
- Check network policies
- Verify RLS settings

**3. Authentication tidak bekerja:**
- Pastikan NEXTAUTH_URL sesuai domain production
- Check AUTH_SECRET consistency
- Verify callback URLs

---

## 📝 **Deployment Checklist**

```bash
# Pre-deployment
[ ] .env.local tidak ter-commit
[ ] env.example sudah updated
[ ] Build berhasil locally
[ ] Tests passing

# Vercel Setup
[ ] Environment variables configured
[ ] Domain setup (optional)
[ ] NEXTAUTH_URL updated untuk production
[ ] Supabase whitelist domain Vercel

# Post-deployment
[ ] Login test berhasil
[ ] Database access working
[ ] Role-based access berfungsi
[ ] Performance monitoring setup
```

---

## 🔗 **Useful Links**

- [Vercel Documentation](https://vercel.com/docs)
- [NextAuth.js Deployment](https://next-auth.js.org/deployment)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-to-prod)

---

## 📞 **Support**

Jika ada masalah deployment:
1. Check Vercel Function logs
2. Verify environment variables
3. Test API endpoints secara manual
4. Check database connections 