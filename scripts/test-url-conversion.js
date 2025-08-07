/**
 * URL Conversion Test Script
 * Test the conversion from Supabase Storage URLs to Cloudflare R2 URLs
 */

// Mock environment variable for testing
process.env.CLOUDFLARE_R2_PUBLIC_URL = 'https://cdn.eduprima.com';

// Import the conversion functions (adjust path as needed)
const {
  isSupabaseStorageUrl,
  isCloudflareR2Url,
  extractFilenameFromSupabaseUrl,
  convertSupabaseUrlToR2,
  convertTutorFileUrls,
  getStorageType
} = require('../lib/url-converter.ts');

// Test URLs
const testUrls = [
  // Supabase Storage URLs (old format)
  'https://abcdef.supabase.co/storage/v1/object/public/eduprimadiary/user-123/foto-profil.jpg',
  'https://xyz.supabase.co/storage/v1/object/public/eduprimadiary/456-def-789/dokumen-identitas.pdf',
  'https://test.supabase.co/storage/v1/object/public/eduprimadiary/tutors/user-789/pendidikan.pdf',
  
  // R2 URLs (new format) - should remain unchanged
  'https://cdn.eduprima.com/tutors/user-123/foto-profil.jpg',
  'https://pub-abc123.r2.dev/tutors/user-456/identitas.pdf',
  
  // Non-storage URLs - should remain unchanged
  'https://example.com/image.jpg',
  null,
  undefined,
  ''
];

console.log('🧪 Testing URL Conversion Functions\n');

// Test 1: Detection functions
console.log('=== 1. URL Detection Tests ===');
testUrls.forEach((url, index) => {
  if (url) {
    console.log(`URL ${index + 1}: ${url}`);
    console.log(`  - Is Supabase: ${isSupabaseStorageUrl(url)}`);
    console.log(`  - Is R2: ${isCloudflareR2Url(url)}`);
    console.log(`  - Storage Type: ${getStorageType(url)}`);
    console.log();
  }
});

// Test 2: Filename extraction
console.log('=== 2. Filename Extraction Tests ===');
testUrls.forEach((url, index) => {
  if (url && isSupabaseStorageUrl(url)) {
    console.log(`URL ${index + 1}: ${url}`);
    console.log(`  - Extracted filename: ${extractFilenameFromSupabaseUrl(url)}`);
    console.log();
  }
});

// Test 3: URL conversion
console.log('=== 3. URL Conversion Tests ===');
testUrls.forEach((url, index) => {
  console.log(`URL ${index + 1}: ${url || 'null/undefined/empty'}`);
  console.log(`  - Converted: ${convertSupabaseUrlToR2(url)}`);
  console.log();
});

// Test 4: Tutor data conversion
console.log('=== 4. Tutor Data Conversion Test ===');
const mockTutorData = {
  id: 'user-123',
  namaLengkap: 'Test Tutor',
  fotoProfil: 'https://abcdef.supabase.co/storage/v1/object/public/eduprimadiary/user-123/foto-profil.jpg',
  dokumenIdentitas: 'https://xyz.supabase.co/storage/v1/object/public/eduprimadiary/user-123/identitas.pdf',
  dokumenPendidikan: 'https://cdn.eduprima.com/tutors/user-123/pendidikan.pdf', // Already R2
  dokumenSertifikat: null,
  email: 'test@example.com'
};

console.log('Original data:');
console.log(JSON.stringify(mockTutorData, null, 2));

const convertedData = convertTutorFileUrls(mockTutorData);
console.log('\nConverted data:');
console.log(JSON.stringify(convertedData, null, 2));

// Test 5: Expected vs Actual
console.log('\n=== 5. Expected Results ===');
console.log('✅ Supabase URLs should be converted to R2 URLs');
console.log('✅ R2 URLs should remain unchanged');
console.log('✅ Non-storage URLs should remain unchanged');
console.log('✅ Null/undefined values should remain as-is');
console.log('✅ File path structure should be preserved');

console.log('\n🎯 Expected fotoProfil conversion:');
console.log('FROM: https://abcdef.supabase.co/storage/v1/object/public/eduprimadiary/user-123/foto-profil.jpg');
console.log('TO:   https://cdn.eduprima.com/user-123/foto-profil.jpg');

console.log('\n✅ Test completed!');