# 🗺️ Google Maps API Setup - Koordinat Mengajar

**Purpose**: Setup Google Maps API untuk mencari titik koordinat acuan mengajar tutor  
**Date**: January 2025  
**Status**: ✅ Ready to Configure  

---

## 🎯 **Overview**

Sistem sudah memiliki komponen Google Maps yang lengkap untuk mencari koordinat mengajar. Yang perlu dilakukan hanya konfigurasi API key.

### **🔧 Komponen yang Sudah Ada**

| Komponen | File | Fungsi |
|----------|------|--------|
| **AddressSearchPicker** | `components/ui/address-search-picker.tsx` | Advanced search dengan autocomplete |
| **SimpleAddressSearch** | `components/ui/simple-address-search.tsx` | Simple address to coordinate |
| **MapPicker** | `components/ui/map-picker.tsx` | Interactive map picker |
| **ManualLocationInput** | `components/ui/manual-location-input.tsx` | Manual coordinate input |

---

## 🔑 **Step 1: Dapatkan Google Maps API Key**

### **1.1 Buka Google Cloud Console**
```
https://console.cloud.google.com/
```

### **1.2 Buat Project Baru (jika belum ada)**
1. Click "Select a project" → "New Project"
2. Project name: `Eduprima Maps`
3. Click "Create"

### **1.3 Enable APIs**
1. Go to **APIs & Services** → **Library**
2. Enable APIs berikut:
   - ✅ **Maps JavaScript API**
   - ✅ **Places API** 
   - ✅ **Geocoding API**

### **1.4 Create API Key**
1. Go to **APIs & Services** → **Credentials**
2. Click **"+ CREATE CREDENTIALS"** → **"API key"**
3. Copy API key yang dihasilkan

### **1.5 Restrict API Key (PENTING untuk Security)**
1. Click **"RESTRICT KEY"**
2. **Application restrictions**:
   - Select **"HTTP referrers (web sites)"**
   - Add referrers:
     ```
     http://localhost:3000/*
     https://yourdomain.com/*
     ```
3. **API restrictions**:
   - Select **"Restrict key"**
   - Choose:
     - Maps JavaScript API
     - Places API  
     - Geocoding API
4. Click **"Save"**

---

## 🔧 **Step 2: Konfigurasi Environment Variable**

### **2.1 Update .env.local**
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://btnsfqhgrjdyxwjiomrj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyCqaVv2nRLoGxqwQ_pwhu2JUJ-Sp5gBKAE  # ← ADD THIS
```

### **2.2 Restart Development Server**
```bash
# Stop server (Ctrl+C)
npm run dev
```

---

## 🧪 **Step 3: Test Google Maps Integration**

### **3.1 Test Address Search**
1. Go to: `http://localhost:3000/en/eduprima/main/ops/em/matchmaking/database-tutor/add`
2. Scroll ke field **"Alamat Acuan Mengajar"**
3. Type alamat, contoh: `"Jalan Sudirman Jakarta"`
4. Pilih dari dropdown suggestions
5. Verify koordinat muncul

### **3.2 Expected Result**
```
✅ Address found: Jalan Jenderal Sudirman, Jakarta
✅ Coordinates: -6.208763, 106.845599
✅ Check accuracy button works
```

---

## 📋 **Step 4: Cara Menggunakan di Form**

### **4.1 Form Field Configuration**
Field sudah dikonfigurasi di `form-config.ts`:

```typescript
{
  name: 'alamatAcuanMengajar',
  label: 'Alamat Acuan Mengajar',
  type: 'address_search',
  required: true,
  helperText: 'Alamat pusat untuk area mengajar (akan digunakan untuk menghitung jarak)',
}
```

### **4.2 Component Integration**
Di `form-field.tsx` sudah ada:

```tsx
{field.type === 'address_search' && (
  <SimpleAddressSearch
    onLocationSelect={(location) => {
      setValue(field.name, location.address);
      setValue(`${field.name}_lat`, location.lat);
      setValue(`${field.name}_lng`, location.lng);
    }}
  />
)}
```

### **4.3 Database Storage**
Data tersimpan ke database:
- `alamat_acuan_mengajar` → Full address string
- `latitude` → Coordinate latitude
- `longitude` → Coordinate longitude

---

## 🔍 **Step 5: Advanced Configuration (Optional)**

### **5.1 Ganti ke Advanced Picker**
Jika ingin autocomplete yang lebih canggih, uncomment di `form-field.tsx`:

```tsx
{/* Advanced: Address Search Picker (uncomment after API setup) */}
<AddressSearchPicker
  onLocationSelect={(location) => {
    setValue(field.name, location.address);
    setValue(`${field.name}_lat`, location.lat);
    setValue(`${field.name}_lng`, location.lng);
  }}
  placeholder={field.placeholder}
  className="w-full"
  showCoordinates={true}
  showMapButton={true}
/>
```

### **5.2 Add Interactive Map**
Untuk map picker interaktif:

```tsx
<MapPicker
  onLocationSelect={(location) => {
    setValue(field.name, location.address);
    setValue(`${field.name}_lat`, location.lat);
    setValue(`${field.name}_lng`, location.lng);
  }}
  defaultCenter={{ lat: -6.2088, lng: 106.8456 }} // Jakarta
  radius={5000} // 5km radius
/>
```

---

## 🛠️ **Troubleshooting**

### **Common Issues**

**1. API Key Error**
```
Error: This API project is not authorized to use this API
```
**Solution**: Enable required APIs di Google Cloud Console

**2. Referrer Error**
```
Error: This API project is not authorized for this referrer
```
**Solution**: Add `http://localhost:3000/*` ke API key restrictions

**3. Quota Exceeded**
```
Error: You have exceeded your daily request quota
```
**Solution**: Check usage di Google Cloud Console, upgrade jika perlu

**4. No Results**
```
Warning: No address suggestions found
```
**Solution**: Check internet connection, try different search terms

### **Debug Commands**

**Check API Key Loading**:
```javascript
// Open browser console di add tutor page
console.log('API Key:', process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? 'SET' : 'MISSING');
```

**Test Geocoding**:
```javascript
// Test manual geocoding
fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=Jakarta&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`)
  .then(r => r.json())
  .then(console.log);
```

---

## 💰 **Pricing & Limits**

### **Google Maps API Pricing (2025)**

| API | Free Tier | Price After |
|-----|-----------|-------------|
| **Maps JavaScript API** | 28,000 loads/month | $7 per 1,000 loads |
| **Places API** | 17,000 requests/month | $17 per 1,000 requests |
| **Geocoding API** | 40,000 requests/month | $5 per 1,000 requests |

### **Estimated Usage**
- **Small scale** (100 tutors/month): FREE
- **Medium scale** (1000 tutors/month): ~$10-20/month
- **Large scale** (10000 tutors/month): ~$100-200/month

---

## 🔒 **Security Best Practices**

### **API Key Security**
1. ✅ **Restrict by referrer** (HTTP referrers)
2. ✅ **Restrict by API** (only needed APIs)
3. ✅ **Monitor usage** regularly
4. ✅ **Rotate keys** periodically

### **Rate Limiting**
```typescript
// Add rate limiting to prevent abuse
const RATE_LIMIT = 10; // requests per minute
const rateLimiter = new Map();
```

---

## 📊 **Features Overview**

### **Current Implementation**

**✅ Available Features**:
- Address autocomplete search
- Coordinate extraction
- Address validation
- Manual coordinate input
- Map preview button
- Error handling
- Fallback API key

**🚧 Potential Enhancements**:
- Interactive map picker
- Radius selection
- Multiple teaching locations
- Batch geocoding
- Offline coordinate cache

---

## 🎯 **Usage Examples**

### **Example 1: Simple Address Search**
```
Input: "Universitas Indonesia Depok"
Output: 
- Address: "Universitas Indonesia, Depok, Jawa Barat"
- Lat: -6.3729
- Lng: 106.8272
```

### **Example 2: Specific Location**
```
Input: "Mall Kelapa Gading Jakarta"
Output:
- Address: "Mall Kelapa Gading, Jakarta Utara"
- Lat: -6.1588
- Lng: 106.9056
```

### **Example 3: Manual Coordinates**
```
Input: "-6.2088, 106.8456"
Output:
- Address: "Jalan MH Thamrin, Jakarta Pusat"
- Lat: -6.2088
- Lng: 106.8456
```

---

## ✅ **Final Checklist**

**Setup Completion**:
- [ ] Google Cloud Project created
- [ ] APIs enabled (Maps, Places, Geocoding)
- [ ] API key generated
- [ ] API key restricted (referrers + APIs)
- [ ] Environment variable added
- [ ] Development server restarted
- [ ] Address search tested
- [ ] Coordinates verified

**Production Deployment**:
- [ ] Production domain added to referrers
- [ ] API usage monitoring setup
- [ ] Billing alerts configured
- [ ] Error logging implemented

---

## 🎉 **Success Criteria**

**System Ready When**:
- ✅ Address search returns suggestions
- ✅ Coordinates are accurate
- ✅ Map preview button works
- ✅ Error handling works properly
- ✅ No console errors
- ✅ Database integration works

---

**🗺️ Google Maps API Setup Complete!**

Sistem siap untuk mencari koordinat mengajar dengan akurasi tinggi. Tutor dapat dengan mudah menentukan titik acuan mengajar mereka.

---

*Last Updated: January 2025*  
*Status: ✅ Ready for Configuration*