/**
 * URL Converter Utility - Convert Supabase Storage URLs to Cloudflare R2 URLs
 * 
 * This utility handles the migration from Supabase Storage to Cloudflare R2
 * by converting old URLs to new R2 URLs automatically.
 */

/**
 * Check if a URL is from Supabase Storage
 */
export function isSupabaseStorageUrl(url: string | null): boolean {
  if (!url) return false;
  
  return url.includes('.supabase.co/storage/') || 
         url.includes('supabase.co/storage/') ||
         url.includes('/storage/v1/object/public/');
}

/**
 * Check if a URL is from Cloudflare R2
 */
export function isCloudflareR2Url(url: string | null): boolean {
  if (!url) return false;
  
  // Check for R2 patterns
  return url.includes('.r2.cloudflarestorage.com') ||
         url.includes('.r2.dev') ||
         (process.env.CLOUDFLARE_R2_PUBLIC_URL && url.startsWith(process.env.CLOUDFLARE_R2_PUBLIC_URL));
}

/**
 * Extract filename from Supabase Storage URL
 * Example: "https://xxx.supabase.co/storage/v1/object/public/eduprimadiary/user-id/foto-profil.jpg"
 * Returns: "user-id/foto-profil.jpg"
 */
export function extractFilenameFromSupabaseUrl(url: string): string | null {
  try {
    if (!isSupabaseStorageUrl(url)) return null;
    
    // Pattern for Supabase Storage URL
    const supabasePattern = /\/storage\/v1\/object\/public\/[^/]+\/(.+)$/;
    const match = url.match(supabasePattern);
    
    if (match && match[1]) {
      return decodeURIComponent(match[1]);
    }
    
    // Alternative pattern if the above doesn't work
    const parts = url.split('/');
    const bucketIndex = parts.findIndex(part => part === 'public') + 1;
    if (bucketIndex > 0 && bucketIndex < parts.length - 1) {
      // Skip bucket name, get the rest
      return parts.slice(bucketIndex + 1).join('/');
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting filename from Supabase URL:', error);
    return null;
  }
}

/**
 * Convert Supabase Storage URL to Cloudflare R2 URL
 */
export function convertSupabaseUrlToR2(url: string | null): string | null {
  if (!url) return null;
  
  // If already R2 URL, return as-is
  if (isCloudflareR2Url(url)) {
    return url;
  }
  
  // If not Supabase URL, return as-is (might be other storage)
  if (!isSupabaseStorageUrl(url)) {
    return url;
  }
  
  // Extract filename from Supabase URL
  const filename = extractFilenameFromSupabaseUrl(url);
  if (!filename) {
    console.warn('Could not extract filename from Supabase URL:', url);
    return url; // Return original if conversion fails
  }
  
  // Check if we have R2 configuration
  const r2PublicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;
  if (!r2PublicUrl) {
    console.warn('CLOUDFLARE_R2_PUBLIC_URL not configured, returning original URL');
    return url;
  }
  
  // Convert to R2 URL
  // Remove leading slash from filename to avoid double slashes
  const cleanFilename = filename.startsWith('/') ? filename.slice(1) : filename;
  const r2Url = `${r2PublicUrl}/${cleanFilename}`;
  
  console.log(`🔄 URL Conversion: ${url} → ${r2Url}`);
  
  return r2Url;
}

/**
 * Convert multiple URLs (useful for batch operations)
 */
export function convertMultipleUrlsToR2(urls: (string | null)[]): (string | null)[] {
  return urls.map(url => convertSupabaseUrlToR2(url));
}

/**
 * Get storage type from URL
 */
export function getStorageType(url: string | null): 'supabase' | 'cloudflare-r2' | 'unknown' | null {
  if (!url) return null;
  
  if (isSupabaseStorageUrl(url)) return 'supabase';
  if (isCloudflareR2Url(url)) return 'cloudflare-r2';
  
  return 'unknown';
}

/**
 * Batch convert file URLs in tutor data
 */
export function convertTutorFileUrls(tutorData: any): any {
  if (!tutorData) return tutorData;
  
  // List of file URL fields that might need conversion
  const fileFields = [
    'fotoProfil',
    'dokumenIdentitas', 
    'dokumenPendidikan',
    'dokumenSertifikat',
    'transkripNilai',
    'sertifikatKeahlian'
  ];
  
  const converted = { ...tutorData };
  let conversionCount = 0;
  
  fileFields.forEach(field => {
    if (converted[field]) {
      const originalUrl = converted[field];
      const convertedUrl = convertSupabaseUrlToR2(originalUrl);
      
      if (convertedUrl !== originalUrl) {
        converted[field] = convertedUrl;
        conversionCount++;
      }
    }
  });
  
  if (conversionCount > 0) {
    console.log(`✅ Converted ${conversionCount} URLs for tutor ${tutorData.namaLengkap || tutorData.id}`);
  }
  
  return converted;
}

/**
 * Migration helper: Check if file exists in R2 before converting URL
 * This is useful for testing if the file was actually migrated
 */
export async function verifyR2FileExists(filename: string): Promise<boolean> {
  try {
    const r2PublicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;
    if (!r2PublicUrl) return false;
    
    const url = `${r2PublicUrl}/${filename}`;
    const response = await fetch(url, { method: 'HEAD' });
    
    return response.ok;
  } catch (error) {
    console.error('Error verifying R2 file existence:', error);
    return false;
  }
}

/**
 * Safe URL conversion with fallback
 * Only converts to R2 if the file exists, otherwise keeps original
 */
export async function safeConvertToR2(url: string | null): Promise<string | null> {
  if (!url || !isSupabaseStorageUrl(url)) return url;
  
  const filename = extractFilenameFromSupabaseUrl(url);
  if (!filename) return url;
  
  // Check if file exists in R2
  const exists = await verifyR2FileExists(filename);
  if (exists) {
    return convertSupabaseUrlToR2(url);
  }
  
  console.warn(`File not found in R2, keeping Supabase URL: ${filename}`);
  return url;
}

export default {
  isSupabaseStorageUrl,
  isCloudflareR2Url,
  extractFilenameFromSupabaseUrl,
  convertSupabaseUrlToR2,
  convertMultipleUrlsToR2,
  getStorageType,
  convertTutorFileUrls,
  verifyR2FileExists,
  safeConvertToR2
};