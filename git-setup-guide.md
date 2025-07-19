# Git Setup Guide - DashCode Main Project

## 🔧 Setup Remote Repository

### Option 1: GitHub (Recommended)
```bash
# 1. Buat repository baru di GitHub.com dengan nama: "dashcode-main"
# 2. Copy URL repository (contoh: https://github.com/username/dashcode-main.git)
# 3. Add remote origin:
git remote add origin https://github.com/YOUR_USERNAME/dashcode-main.git

# 4. Push pertama kali:
git branch -M main
git push -u origin main
```

### Option 2: GitLab
```bash
# 1. Buat repository baru di GitLab.com
# 2. Add remote origin:
git remote add origin https://gitlab.com/YOUR_USERNAME/dashcode-main.git

# 3. Push:
git branch -M main
git push -u origin main
```

## 💾 Backup & Restore Workflow

### Daily Backup (Sebelum coding):
```bash
# Commit changes
git add .
git commit -m "Daily backup: [tanggal]"
git push origin main
```

### Restore dari Git (Jika file lokal rusak):
```bash
# Option 1: Reset ke commit terakhir (HATI-HATI: menghapus semua changes)
git reset --hard HEAD

# Option 2: Reset ke commit spesifik
git reset --hard [commit-hash]

# Option 3: Pull changes terbaru
git pull origin main

# Option 4: Clone ulang project
git clone https://github.com/YOUR_USERNAME/dashcode-main.git
```

### Emergency Restore:
```bash
# Jika semua rusak, clone ke folder baru:
cd ..
git clone https://github.com/YOUR_USERNAME/dashcode-main.git Main-Recovery
cd Main-Recovery
npm install
```

## 📋 Best Practices

### Commit Messages:
- `feat: add new dashboard component`
- `fix: resolve login authentication issue` 
- `style: update header design`
- `docs: update README`
- `backup: daily save [2025-01-19]`

### Branching Strategy:
```bash
# Development branch
git checkout -b develop
git push -u origin develop

# Feature branch
git checkout -b feature/new-component
git push -u origin feature/new-component
```

### Regular Backup Schedule:
- **Daily**: Before major changes
- **Weekly**: Complete backup
- **Before Deploy**: Always backup before Vercel deployment 