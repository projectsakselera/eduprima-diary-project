# 🚀 Tutorial Menjalankan Development Server

## 📋 Langkah-langkah

### 1. Buka Terminal/Command Prompt
- Buka Command Prompt atau Terminal di Windows
- Atau gunakan terminal yang tersedia di VS Code/Cursor

### 2. Navigasi ke Project Directory
```bash
cd "C:\Users\MASTER CORE\Documents\Windsurf\selestia-main"
```

### 3. Jalankan Development Server
```bash
npm run dev
```

### 4. Tunggu Server Ready
- Server akan mulai di port 3000, atau port 3001 jika 3000 sedang digunakan
- Tunggu sampai muncul pesan: `✓ Ready in [waktu]`

### 5. Akses Website
Server biasanya berjalan di salah satu URL berikut:
- **http://localhost:3000** (default)
- **http://localhost:3001** (jika port 3000 digunakan)

### 6. Akses Form Add Tutor
Setelah login, buka:
- **http://localhost:3000/en/eduprima/main/ops/em/matchmaking/database-tutor/add**
- **http://localhost:3001/en/eduprima/main/ops/em/matchmaking/database-tutor/add**

## 🔧 Troubleshooting

### Jika Server Tidak Mau Start:
```bash
# Kill semua process Node.js yang berjalan
taskkill /F /IM node.exe

# Bersihkan cache npm
npm cache clean --force

# Install ulang dependencies (jika perlu)
npm install

# Jalankan lagi
npm run dev
```

### Jika Port Sudah Digunakan:
Server akan otomatis mencari port yang tersedia (3001, 3002, dst.)

### Jika Ada Error Import:
Biasanya ada warning tentang `signIn` import, tapi tidak mempengaruhi functionality.

## 💡 Tips
- Server akan hot-reload otomatis saat ada perubahan code
- Biarkan terminal tetap terbuka selama development
- Gunakan Ctrl+C untuk stop server

## 🎯 Quick Start
```bash
cd "C:\Users\MASTER CORE\Documents\Windsurf\selestia-main"
npm run dev
```
Lalu buka: http://localhost:3000 atau http://localhost:3001