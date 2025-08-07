# 🔄 URL Migration: Supabase Storage → Cloudflare R2

## Overview

Sistem telah dimigrasikan dari Supabase Storage ke Cloudflare R2 untuk file uploads. Untuk menjamin compatibility dengan data lama, dibuat automatic URL conversion yang akan mengkonversi URL Supabase Storage lama ke URL Cloudflare R2 baru secara real-time.

## Problem Statement

- **Data Lama**: File URL tersimpan sebagai Supabase Storage URLs di database
- **Upload Baru**: File baru menggunakan Cloudflare R2 URLs  
- **User Experience**: Thumbnail tidak muncul untuk data lama karena URL mismatch

## Solution

### **1. URL Converter Utility** 📝
```typescript
// lib/url-converter.ts
export function convertSupabaseUrlToR2(url: string | null): string | null {
  // Converts: https://xxx.supabase.co/storage/v1/object/public/bucket/file.jpg
  // To:       https://cdn.eduprima.com/file.jpg
}
```

### **2. API Integration** 🔌
```typescript
// app/api/tutors/spreadsheet/route.ts
import { convertTutorFileUrls } from '@/lib/url-converter';

// Apply conversion to all tutor data
const convertedTutorData = completeTutorData.map(tutor => convertTutorFileUrls(tutor));
```

### **3. Automatic Field Conversion** ⚡
Fields yang otomatis dikonversi:
- `fotoProfil` 
- `dokumenIdentitas`
- `dokumenPendidikan` 
- `dokumenSertifikat`
- `transkripNilai`
- `sertifikatKeahlian`

## URL Pattern Examples

### **Supabase Storage (Old)** ❌
```
https://abcdefghij.supabase.co/storage/v1/object/public/eduprimadiary/user-123/foto-profil.jpg
https://xyz.supabase.co/storage/v1/object/public/eduprimadiary/456-def-789/identitas.pdf
```

### **Cloudflare R2 (New)** ✅
```
https://cdn.eduprima.com/user-123/foto-profil.jpg  
https://cdn.eduprima.com/456-def-789/identitas.pdf
```

## Implementation Details

### **Detection Logic**
```typescript
// Detect Supabase URLs
function isSupabaseStorageUrl(url: string): boolean {
  return url.includes('.supabase.co/storage/') || 
         url.includes('/storage/v1/object/public/');
}

// Detect R2 URLs  
function isCloudflareR2Url(url: string): boolean {
  return url.includes('.r2.cloudflarestorage.com') ||
         url.includes('.r2.dev') ||
         url.startsWith(process.env.CLOUDFLARE_R2_PUBLIC_URL);
}
```

### **Filename Extraction**
```typescript
// Extract: "user-123/foto-profil.jpg" from Supabase URL
function extractFilenameFromSupabaseUrl(url: string): string | null {
  const pattern = /\/storage\/v1\/object\/public\/[^/]+\/(.+)$/;
  const match = url.match(pattern);
  return match ? decodeURIComponent(match[1]) : null;
}
```

### **Safe Conversion**
```typescript
// Only convert if source is Supabase, keep others unchanged
function convertSupabaseUrlToR2(url: string | null): string | null {
  if (!url || !isSupabaseStorageUrl(url)) return url;
  
  const filename = extractFilenameFromSupabaseUrl(url);
  if (!filename) return url; // Fallback to original
  
  return `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${filename}`;
}
```

## Benefits

### **✅ Backwards Compatibility**
- Data lama tetap dapat diakses
- Tidak perlu manual migration database
- Zero downtime conversion

### **✅ Real-time Conversion** 
- URL dikonversi saat data di-fetch
- Tidak ada performance impact significant
- Transparent untuk frontend

### **✅ Progressive Migration**
- Upload baru langsung ke R2
- Data lama dikonversi on-demand
- Gradual transition process

### **✅ Error Handling**
- Fallback ke original URL jika conversion gagal
- Extensive logging untuk debugging
- Graceful degradation

## Environment Setup

```bash
# Required environment variables
CLOUDFLARE_R2_PUBLIC_URL=https://cdn.eduprima.com
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_key
CLOUDFLARE_R2_BUCKET_NAME=eduprima-tutor-files
CLOUDFLARE_R2_ENDPOINT=https://account-id.r2.cloudflarestorage.com
```

## Testing

### **Run Test Script**
```bash
cd eduprima-diary
node scripts/test-url-conversion.js
```

### **Expected Results**
```
✅ Supabase URLs converted to R2 URLs
✅ R2 URLs remain unchanged  
✅ Non-storage URLs remain unchanged
✅ Null/undefined values preserved
✅ File path structure maintained
```

## Usage in Frontend

### **Before (Not Working)**
```typescript
// Old Supabase URL won't show thumbnail
fotoProfil: "https://xxx.supabase.co/storage/v1/object/public/eduprimadiary/user-123/foto.jpg"
```

### **After (Working)**  
```typescript
// Automatically converted to R2 URL
fotoProfil: "https://cdn.eduprima.com/user-123/foto.jpg"
```

## Migration Strategy

### **Phase 1: ✅ COMPLETED** 
- [x] Create URL converter utility
- [x] Integrate with spreadsheet API
- [x] Test conversion logic

### **Phase 2: 🚀 CURRENT**
- [x] Deploy to production
- [x] Monitor conversion logs
- [x] Verify thumbnail display

### **Phase 3: 📋 PLANNED**
- [ ] Optional: Bulk database update script
- [ ] Performance optimization if needed
- [ ] Cleanup old Supabase storage

## Monitoring

### **Conversion Logs**
```bash
# Check API logs for conversion activity
🔄 URL Conversion: https://xxx.supabase.co/... → https://cdn.eduprima.com/...
✅ Converted 3 URLs for tutor Ahmad Budi Santoso
```

### **Success Metrics**
- Thumbnail display rate in view-all page
- File access success rate
- API response times
- Error rates in conversion

## Troubleshooting

### **Thumbnail Still Not Showing**
1. Check environment variables
2. Verify R2 bucket public access
3. Check browser network tab for 404s
4. Verify filename extraction logic

### **URL Not Converting**
1. Check if URL matches Supabase pattern
2. Verify CLOUDFLARE_R2_PUBLIC_URL is set
3. Check conversion logs in API response
4. Test with manual URL in browser

### **Performance Issues**  
1. Monitor API response times
2. Consider caching converted URLs
3. Optimize conversion logic if needed

---

**Status**: ✅ **PRODUCTION READY**  
**Last Updated**: $(date)  
**Implementation**: Automatic URL conversion active