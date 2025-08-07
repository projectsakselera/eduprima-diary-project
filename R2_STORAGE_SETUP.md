# Cloudflare R2 Storage Setup

## Overview

Project ini telah dimigrasikan dari Supabase Storage ke Cloudflare R2 untuk file upload tutor (foto profil, dokumen identitas, dokumen pendidikan, sertifikat).

## Prerequisites

### 1. Install Dependencies

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### 2. Cloudflare R2 Setup

1. Login ke Cloudflare Dashboard
2. Go to **R2 Object Storage**
3. Create a new bucket (contoh: `eduprima-tutor-files`)
4. Create API Token:
   - Go to **Manage R2 API Tokens**
   - Click **Create API Token**
   - Permissions: Object Read & Write
   - Bucket: Select your bucket atau All buckets
   - Save **Access Key ID** dan **Secret Access Key**

### 3. Custom Domain (Optional but Recommended)

1. Go to your R2 bucket settings
2. Click **Settings** → **Custom Domains**
3. Add custom domain (contoh: `cdn.eduprima.com`)
4. Configure DNS CNAME record di Cloudflare DNS

## Environment Variables

Tambahkan variabel berikut ke file `.env.local`:

```env
# Cloudflare R2 Configuration
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key_id_here
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_access_key_here
CLOUDFLARE_R2_BUCKET_NAME=eduprima-tutor-files
CLOUDFLARE_R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
CLOUDFLARE_R2_PUBLIC_URL=https://your-custom-domain.com

# Jika belum ada custom domain, gunakan R2 public URL:
# CLOUDFLARE_R2_PUBLIC_URL=https://pub-xxxxxxxxxxxxx.r2.dev
```

### Cara mendapatkan nilai-nilai ini:

1. **ACCESS_KEY_ID** & **SECRET_ACCESS_KEY**: Dari API Token yang dibuat
2. **BUCKET_NAME**: Nama bucket yang dibuat di R2
3. **ENDPOINT**: 
   - Format: `https://[account-id].r2.cloudflarestorage.com`
   - Account ID bisa dilihat di dashboard Cloudflare, bagian kanan bawah
4. **PUBLIC_URL**: 
   - Jika menggunakan custom domain: `https://your-custom-domain.com`
   - Jika menggunakan R2 public URL: `https://pub-xxxxxxxxxxxxx.r2.dev`

## File Structure di R2

Files akan diupload dengan struktur:

```
bucket-name/
├── tutors/
│   ├── [user-id-1]/
│   │   ├── foto-profil.jpg
│   │   ├── identitas.pdf
│   │   ├── pendidikan.pdf
│   │   └── sertifikat.pdf
│   ├── [user-id-2]/
│   │   ├── foto-profil.png
│   │   └── ...
│   └── ...
```

## Features

### R2 Client Features (`lib/cloudflare-r2.ts`):

- ✅ **File Upload** dengan metadata
- ✅ **File Delete** 
- ✅ **Signed URLs** untuk akses privat
- ✅ **Public URLs** untuk akses publik
- ✅ **Error Handling** yang robust
- ✅ **File Size & Type Validation**
- ✅ **Cache Control** (1 year untuk performance)
- ✅ **Unique Filename Generation**

### Upload API Features (`/api/upload/tutor-files`):

- ✅ **Authentication Check** dengan NextAuth
- ✅ **Multiple File Upload** dalam satu request
- ✅ **File Type Mapping** (profile_photo, identity_document, dll)
- ✅ **Database Integration** (update `document_storage`)
- ✅ **Metadata Storage** (user-id, file-type, timestamp)
- ✅ **Progress Tracking** dan error reporting

### Form Upload Features:

- ✅ **Optimized Image Upload** untuk foto profil (kompresi otomatis)
- ✅ **Standard File Upload** untuk dokumen PDF
- ✅ **Real-time Preview** untuk gambar
- ✅ **Error Validation** dan feedback
- ✅ **R2 Storage Indicator** di UI

## Usage Examples

### Basic Upload

```typescript
import { r2Client } from '@/lib/cloudflare-r2';

// Upload file
const result = await r2Client.uploadFile(
  'tutors/user-123/foto-profil.jpg',
  fileBuffer,
  'image/jpeg'
);

if (result.success) {
  console.log('File uploaded:', result.url);
} else {
  console.error('Upload failed:', result.error);
}
```

### Get Public URL

```typescript
const publicUrl = r2Client.getPublicUrl('tutors/user-123/foto-profil.jpg');
// Returns: https://your-domain.com/tutors/user-123/foto-profil.jpg
```

### Generate Signed URL (Private Access)

```typescript
const signedUrl = await r2Client.getSignedUrl(
  'tutors/user-123/private-document.pdf',
  3600 // 1 hour expiry
);

if (signedUrl.success) {
  console.log('Signed URL:', signedUrl.url);
}
```

## Migration Notes

### Database Changes

Tidak ada perubahan skema database. Table `document_storage` tetap sama, hanya `file_url` yang sekarang menunjuk ke R2 URLs instead of Supabase URLs.

### File URLs

- **Before**: `https://xxx.supabase.co/storage/v1/object/public/bucket/file.jpg`
- **After**: `https://your-domain.com/tutors/user-id/file.jpg`

### Backwards Compatibility

Existing files di Supabase Storage tidak otomatis dipindah. Untuk migration existing files, buat script terpisah atau lakukan manual migration.

## Troubleshooting

### 1. "Access Denied" Error

```
Check environment variables:
- CLOUDFLARE_R2_ACCESS_KEY_ID
- CLOUDFLARE_R2_SECRET_ACCESS_KEY
- CLOUDFLARE_R2_ENDPOINT

Verify API Token permissions di Cloudflare dashboard.
```

### 2. "Bucket Not Found" Error

```
Check:
- CLOUDFLARE_R2_BUCKET_NAME matches exact bucket name
- Bucket exists di Cloudflare R2 dashboard
- API Token has access to the bucket
```

### 3. "Public URL Not Working"

```
Check:
- CLOUDFLARE_R2_PUBLIC_URL is correct
- Custom domain DNS is properly configured
- Bucket public access settings
```

### 4. Debug Mode

Enable debug logging:

```typescript
// Dalam R2 client calls, check console untuk detailed logs
console.log('R2 Upload result:', uploadResult);
```

## Performance Notes

- **Cache Headers**: Files di-cache 1 tahun untuk optimal performance
- **CDN**: R2 automatically distributed via Cloudflare global network
- **Compression**: Images auto-compressed di frontend sebelum upload
- **Parallel Uploads**: Multiple files diupload dalam batch

## Security Notes

- **Authentication**: Required untuk semua upload operations
- **File Type Validation**: Hanya JPG, PNG, PDF yang diperbolehkan
- **File Size Limits**: 2MB untuk images, 5MB untuk documents
- **Metadata**: Includes user-id, file-type, timestamp untuk auditing
- **Private Access**: Signed URLs untuk temporary private access

## Cost Estimation

Cloudflare R2 pricing (as of 2024):
- **Storage**: $0.015/GB/month
- **Class A Operations** (PUT, POST): $4.50/million
- **Class B Operations** (GET, HEAD): $0.36/million
- **Data Transfer**: FREE (major advantage vs other cloud storage)

Untuk moderate usage (~1000 tutor files/month, ~100MB total):
- Storage: ~$0.002/month
- Operations: ~$0.01/month
- **Total**: <$0.02/month

## Support

Untuk issues terkait R2 setup atau migration:

1. Check Cloudflare R2 documentation
2. Verify environment variables
3. Check console logs untuk detailed error messages
4. Test dengan small files terlebih dahulu

---

**Migration completed**: ✅ Supabase Storage → Cloudflare R2  
**Date**: $(date)  
**Files affected**: Upload API, Form components, R2 client utility