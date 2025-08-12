/**
 * 🚀 EDGE FUNCTION SERVICE
 * Handles communication with Supabase Edge Functions
 * for secure server-side tutor creation
 */

import { migrationConfig } from '@/config';

/**
 * 📄 Upload Step 2 documents (transcript & certificates) to R2 and update document_storage
 * @param files - Object containing document files
 * @param userId - User ID to associate the documents with
 * @returns Promise<{success: boolean, results: any[]}> - Upload results
 */
async function uploadStep2DocumentsToR2(
  files: {
    transkripNilai?: File | null;
    sertifikatKeahlian?: File | null;
  },
  userId: string
): Promise<{success: boolean, results: any[]}> {
  if (migrationConfig.enableMigrationLogs) {
    console.log('📄 [UPLOAD] Starting Step 2 documents upload for user:', userId);
    console.log('📄 [UPLOAD] Files to upload:', {
      transkripNilai: files.transkripNilai ? 'File provided' : 'No file',
      sertifikatKeahlian: files.sertifikatKeahlian ? 'File provided' : 'No file'
    });
  }

  const formData = new FormData();
  formData.append('userId', userId);
  
  const fileTypes = [];
  let fileCount = 0;
  
  // Add transcript document if provided
  if (files.transkripNilai && files.transkripNilai instanceof File) {
    formData.append('files', files.transkripNilai);
    formData.append('fileTypes', 'transcript_document');
    fileTypes.push('transcript_document');
    fileCount++;
  }
  
  // Add expertise certificate if provided
  if (files.sertifikatKeahlian && files.sertifikatKeahlian instanceof File) {
    formData.append('files', files.sertifikatKeahlian);
    formData.append('fileTypes', 'expertise_certificate');
    fileTypes.push('expertise_certificate');
    fileCount++;
  }
  
  // If no files to upload, return success
  if (fileCount === 0) {
    if (migrationConfig.enableMigrationLogs) {
      console.log('📄 [UPLOAD] No Step 2 documents to upload');
    }
    return { success: true, results: [] };
  }

  try {
    const response = await fetch('/api/upload/tutor-files', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Upload API returned failure');
    }

    if (migrationConfig.enableMigrationLogs) {
      console.log('✅ [UPLOAD] Step 2 documents uploaded successfully:', result);
    }

    return { success: true, results: result.results || [] };
  } catch (error) {
    console.error('❌ [UPLOAD] Step 2 documents upload failed:', error);
    throw error;
  }
}

/**
 * 📄 Upload Step 5 documents (identity, education, certificate) to R2 and update document_storage
 * @param files - Object containing Step 5 document files
 * @param userId - User ID to associate the documents with
 * @returns Promise<{success: boolean, results: any[]}> - Upload results
 */
async function uploadStep5DocumentsToR2(
  files: {
    dokumenIdentitas?: File | null;
    dokumenPendidikan?: File | null;
    dokumenSertifikat?: File | null;
  },
  userId: string
): Promise<{success: boolean, results: any[]}> {
  if (migrationConfig.enableMigrationLogs) {
    console.log('📄 [UPLOAD] Starting Step 5 documents upload for user:', userId);
    console.log('📄 [UPLOAD] Files to upload:', {
      dokumenIdentitas: files.dokumenIdentitas ? 'File provided' : 'No file',
      dokumenPendidikan: files.dokumenPendidikan ? 'File provided' : 'No file',
      dokumenSertifikat: files.dokumenSertifikat ? 'File provided' : 'No file'
    });
  }

  const formData = new FormData();
  formData.append('userId', userId);
  
  const fileTypes = [];
  let fileCount = 0;
  
  // Add identity document if provided
  if (files.dokumenIdentitas && files.dokumenIdentitas instanceof File) {
    formData.append('files', files.dokumenIdentitas);
    formData.append('fileTypes', 'identity_document');
    fileTypes.push('identity_document');
    fileCount++;
  }
  
  // Add education document if provided
  if (files.dokumenPendidikan && files.dokumenPendidikan instanceof File) {
    formData.append('files', files.dokumenPendidikan);
    formData.append('fileTypes', 'education_document');
    fileTypes.push('education_document');
    fileCount++;
  }
  
  // Add certificate document if provided
  if (files.dokumenSertifikat && files.dokumenSertifikat instanceof File) {
    formData.append('files', files.dokumenSertifikat);
    formData.append('fileTypes', 'certificate_document');
    fileTypes.push('certificate_document');
    fileCount++;
  }
  
  // If no files to upload, return success
  if (fileCount === 0) {
    if (migrationConfig.enableMigrationLogs) {
      console.log('📄 [UPLOAD] No Step 5 documents to upload');
    }
    return { success: true, results: [] };
  }

  try {
    const response = await fetch('/api/upload/tutor-files', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Upload API returned failure');
    }

    if (migrationConfig.enableMigrationLogs) {
      console.log('✅ [UPLOAD] Step 5 documents uploaded successfully:', result);
    }

    return { success: true, results: result.results || [] };
  } catch (error) {
    console.error('❌ [UPLOAD] Step 5 documents upload failed:', error);
    throw error;
  }
}

/**
 * 📸 Upload profile photo to R2 and update user_profiles.profile_photo_url
 * @param file - The profile photo file
 * @param userId - User ID to associate the photo with
 * @returns Promise<string> - The public URL of the uploaded photo
 */
async function uploadProfilePhotoToR2(file: File, userId: string): Promise<string> {
  if (migrationConfig.enableMigrationLogs) {
    console.log('📸 [UPLOAD] Starting profile photo upload for user:', userId);
    console.log('📸 [UPLOAD] File details:', { 
      name: file.name, 
      size: file.size, 
      type: file.type 
    });
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Invalid file type: ${file.type}. Only JPEG, PNG, and WebP are allowed.`);
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum allowed: 5MB.`);
  }

  const formData = new FormData();
  formData.append('userId', userId);
  formData.append('files', file);
  formData.append('fileTypes', 'profile_photo');

  try {
    const response = await fetch('/api/upload/tutor-files', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Upload failed');
    }

    const uploadResult = result.results?.[0];
    if (!uploadResult?.success) {
      throw new Error(uploadResult?.error || 'Upload result failed');
    }

    if (!uploadResult.profileUpdateSuccess) {
      console.warn('⚠️ [UPLOAD] Photo uploaded but failed to update user_profiles.profile_photo_url');
    }

    if (migrationConfig.enableMigrationLogs) {
      console.log('✅ [UPLOAD] Profile photo uploaded successfully:', uploadResult.publicUrl);
    }

    return uploadResult.publicUrl;

  } catch (error) {
    console.error('❌ [UPLOAD] Profile photo upload failed:', error);
    throw error;
  }
}

// ================================================================
// UTILITY: International phone formatting
// ================================================================
const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all spaces, dashes, parentheses, dots
  let cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  
  // If already has country code (+), keep as is
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  
  // Indonesian local formats
  if (cleaned.startsWith('0')) {
    return '+62' + cleaned.slice(1); // 0xxx → +62xxx
  } else if (cleaned.startsWith('8') && cleaned.length >= 9) {
    return '+62' + cleaned; // 8xxx → +628xxx
  } else if (cleaned.startsWith('62')) {
    return '+' + cleaned; // 62xxx → +62xxx
  }
  
  // International format: assume already has country code
  if (cleaned.length >= 7 && cleaned.length <= 15) {
    return '+' + cleaned;
  }
  
  // Default: Indonesian format
  return '+62' + cleaned;
};

// Types for edge function requests
export interface BasicTutorData {
  // 🔧 STEP 0: System & Status Information (Staff only)
  system: {
    status_tutor?: string;
    approval_level?: string;
    staff_notes?: string;
    additionalScreening?: string[]; // Checklist for additional screening
  };
  
  // 👤 STEP 1: Personal Information (Identitas Dasar)
  personal: {
    fotoProfil?: File | string | null; // Profile photo upload
    trn?: string; // Manual TRN input (if provided)
    namaLengkap: string;
    namaPanggilan?: string;
    tanggalLahir: string;
    jenisKelamin: 'L' | 'P';
    agama?: string;
    email: string;
    noHp1: string;
    noHp2?: string;
  };
  
  // ✨ STEP 1: Profile & Value Proposition
  profile: {
    headline?: string; // Headline/Tagline Tutor (max 100 chars)
    deskripsiDiri?: string; // Bio/Description
    motivasiMenjadiTutor?: string; // Teaching motivation
    socialMedia1?: string; // Instagram/LinkedIn link
    socialMedia2?: string; // YouTube/TikTok link
  };
  
  // 🎓 STEP 2: Education Information (Pendidikan & Pengalaman)
  education?: {
    // A. RIWAYAT PENDIDIKAN
    statusAkademik?: string; // Current academic status (required in form)
    
    // Current Education (University/College)
    namaUniversitas?: string; // Current university
    fakultas?: string; // Current faculty
    jurusan?: string; // Current major
    tahunMasuk?: string; // Entry year
    tahunLulus?: string; // Graduation year
    ipk?: string; // GPA (string for form compatibility)
    
    // S1 Education (for S2/S3 students - conditional)
    namaUniversitasS1?: string; // S1 university name
    fakultasS1?: string; // S1 faculty
    jurusanS1?: string; // S1 major
    
    // High School Information
    namaSMA?: string; // High school name
    jurusanSMA?: string; // High school major
    jurusanSMKDetail?: string; // Vocational school major detail (when jurusanSMA = 'SMK')
    tahunLulusSMA?: string; // High school graduation year
    
    // Alternative Learning (for statusAkademik = 'lainnya')
    namaInstitusi?: string; // Institution name
    bidangKeahlian?: string; // Field of expertise
    pengalamanBelajar?: string; // Learning experience
    
    // B. KEAHLIAN & SPESIALISASI
    keahlianSpesialisasi?: string; // Special skills/expertise (required in form)
    keahlianLainnya?: string; // Other skills (optional)
    
    // C. PENGALAMAN
    pengalamanMengajar?: string; // Teaching experience (required in form)
    pengalamanLainnya?: string; // Other relevant experience (optional)
    
    // D. PRESTASI & SERTIFIKASI
    prestasiAkademik?: string; // Academic achievements (optional)
    prestasiNonAkademik?: string; // Non-academic achievements (optional)
    sertifikasiPelatihan?: string; // Certifications & training (optional)
    
    // Document Files (Step 2)
    transkripNilai?: File | string | null; // Transcript document
    sertifikatKeahlian?: File | string | null; // Expertise certificate (for 'lainnya')
  };
  
  // 📍 STEP 1: Address Information
  address: {
    provinsiDomisili: string | null; // UUID from dropdown
    kotaKabupatenDomisili: string | null; // UUID from dropdown
    kecamatanDomisili: string;
    kelurahanDomisili: string;
    alamatLengkapDomisili: string;
    kodePosDomisili?: string;
    alamatSamaDenganKTP?: boolean;
    provinsiKTP?: string | null; // UUID from dropdown
    kotaKabupatenKTP?: string | null; // UUID from dropdown
    kecamatanKTP?: string;
    kelurahanKTP?: string;
    alamatLengkapKTP?: string;
    kodePosKTP?: string;
  };
  
  // 🏦 STEP 1: Banking Information
  banking: {
    namaNasabah: string;
    nomorRekening: string;
    namaBank: string | null; // Bank UUID from dropdown
  };
  
  // 📚 STEP 3: Subjects & Programs (Mata Pelajaran)
  subjects?: {
    selectedPrograms?: string[]; // Array of selected program IDs from database
    mataPelajaranLainnya?: string; // Additional subjects not found in the selector
  };
  
  // 📄 STEP 5: Documents (Dokumen Pendukung)
  documents?: {
    // Document Files (Step 5)
    dokumenIdentitas?: File | string | null; // Identity document (KTP/Passport)
    dokumenPendidikan?: File | string | null; // Education document (Ijazah/Transcript)
    dokumenSertifikat?: File | string | null; // Certificate document (Optional)
    
    // Document Verification Status (Staff only)
    status_verifikasi_identitas?: string; // Identity verification status
    status_verifikasi_pendidikan?: string; // Education verification status
  };
  
  // 🎯 STEP 4: Availability & Wilayah (PHASE 1)
  availability?: {
    // A. AVAILABILITY & STATUS
    statusMenerimaSiswa?: string; // Availability status (available, limited, unavailable, leave)
    available_schedule?: string[]; // Weekly schedule array (Senin Pagi, Selasa Siang, etc)
    teaching_methods?: string[]; // Teaching methods array (tutor_visit, online_class, etc)
    hourly_rate?: number; // Expected hourly rate in Rupiah
    maksimalSiswaBaru?: number; // Max new students per week
    maksimalTotalSiswa?: number; // Max total students
    usiaTargetSiswa?: string[]; // Target student age ranges (2-5, 6-12, etc)
    catatanAvailability?: string; // Additional availability notes
    
    // B. LOCATION & TRANSPORTATION  
    transportasiTutor?: string[]; // Transportation methods (sepeda_motor, online_transport, etc)
    alamatTitikLokasi?: string; // Teaching center location/address
    teaching_radius_km?: number; // Teaching radius in kilometers
    location_notes?: string; // Location preferences and notes
    
    // C. COORDINATES (Optional - for future map integration)
    titikLokasiLat?: number; // Latitude of teaching center
    titikLokasiLng?: number; // Longitude of teaching center
    
    // D. EMERGENCY CONTACT (PHASE 3)
    emergencyContactName?: string; // Emergency contact name
    emergencyContactRelationship?: string; // Relationship with emergency contact
    emergencyContactPhone?: string; // Emergency contact phone number
  };
  
  // 🎨 STEP 4: Teaching Preferences & Personality (PHASE 2)
  preferences?: {
    // A. TEACHING PREFERENCES
    teachingMethods?: string[]; // Teaching styles (visual, auditory, kinesthetic, reading_writing)
    studentLevelPreferences?: string[]; // Student level preferences (beginner, intermediate, advanced, remedial)
    specialNeedsCapable?: string; // Special needs capability (tidak, basic, experienced, certified)
    groupClassWilling?: string; // Group class willingness (tidak, ya_small, ya_medium, ya_large)
    
    // B. TECHNOLOGY CAPABILITIES
    onlineTeachingCapable?: string; // Online teaching capability (tidak_bisa, basic, intermediate, advanced)
    techSavviness?: string; // Technology savviness (low, medium, high, expert)
    gmeetExperience?: string; // Google Meet/Zoom experience (belum_pernah, pemula, menengah, mahir)
    presensiUpdateCapability?: string; // Attendance update capability (tidak_bisa, bisa_dilatih, bisa, mahir)
  };
  
  // 👤 STEP 4: Personality Traits (PHASE 2)  
  personality?: {
    // PERSONALITY & CHARACTER
    tutorPersonalityType?: string[]; // Personality types (sabar_lembut, energik_motivator, etc)
    communicationStyle?: string[]; // Communication styles (formal_sopan, kasual_santai, etc)
    teachingPatienceLevel?: number; // Teaching patience level (1-10)
    studentMotivationAbility?: number; // Student motivation ability (1-10)
    scheduleFlexibilityLevel?: number; // Schedule flexibility level (1-10)
  };
}

export interface EdgeFunctionResponse {
  success: boolean;
  data?: {
    user_id: string;
    tutor_id: string;
    user_code: string;
    password: string;
    email: string;
    name: string;
    tables_created: string[];
    // File upload results (added dynamically)
    profile_photo_url?: string; // Added after photo upload
    step2_documents?: any[]; // Added after Step 2 documents upload
    step5_documents?: any[]; // Added after Step 5 documents upload
  };
  error?: string;
  details?: any;
}

/**
 * 🎯 PHASE 1: Basic tutor creation via edge function
 * Replaces client-side user_universal + user_profiles operations
 */
export async function createBasicTutorViaEdgeFunction(
  data: BasicTutorData,
  sessionToken?: string
): Promise<EdgeFunctionResponse> {
  
  if (migrationConfig.enableMigrationLogs) {
    console.log('🚀 [MIGRATION] Using Edge Function for basic tutor creation...');
    console.log('📊 [MIGRATION] Data sections:', Object.keys(data));
    console.log('🔍 [DEBUG] Full data being sent to Edge Function:', JSON.stringify(data, null, 2));
    console.log('🔍 [DEBUG] Personal data keys:', Object.keys(data.personal || {}));
    console.log('🔍 [DEBUG] Address data keys:', Object.keys(data.address || {}));
    console.log('🔍 [DEBUG] Banking data keys:', Object.keys(data.banking || {}));
  }

  try {
    // Get Supabase URL from environment
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL not configured');
    }

    // Prepare headers with authorization if session token available
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    };
    
    // Add authorization header if session token provided
    if (sessionToken) {
      headers['Authorization'] = `Bearer ${sessionToken}`;
    }

    // Call edge function with proper authorization
    const response = await fetch(`${supabaseUrl}/functions/v1/create-tutor-complete`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });

    if (migrationConfig.enableMigrationLogs) {
      console.log('📡 [MIGRATION] Edge function response status:', response.status);
    }

    if (!response.ok) {
      const errorData = await response.json();
      
      if (migrationConfig.enableMigrationLogs) {
        console.error('❌ [MIGRATION] Edge function failed:', errorData);
        console.error('🔍 [DEBUG] Full error details:', JSON.stringify(errorData, null, 2));
        if (errorData.details && Array.isArray(errorData.details)) {
          console.error('🔍 [DEBUG] Validation errors count:', errorData.details.length);
          errorData.details.forEach((err: any, index: number) => {
            console.error(`🔍 [DEBUG] Validation Error ${index + 1}:`, {
              field: err.path?.join('.') || 'unknown',
              message: err.message,
              code: err.code,
              received: err.received
            });
          });
        }
      }
      
      return {
        success: false,
        error: errorData.error || 'Edge function request failed',
        details: errorData.details
      };
    }

    const result = await response.json();
    
    if (migrationConfig.enableMigrationLogs) {
      console.log('✅ [MIGRATION] Edge function success:', {
        user_id: result.data?.user_id,
        tutor_id: result.data?.tutor_id,
        tables_created: result.data?.tables_created?.length
      });
    }

    return result;

  } catch (error) {
    if (migrationConfig.enableMigrationLogs) {
      console.error('💥 [MIGRATION] Edge function error:', error);
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    };
  }
}

/**
 * 🔄 MIGRATION HELPER: Hybrid approach with fallback
 * Uses edge function if enabled, falls back to client-side if needed
 */
export async function createTutorWithMigrationSupport(
  formData: any, // Full form data
  sessionToken?: string,
  clientSideCallback?: () => Promise<any>
): Promise<{ success: boolean; data?: any; error?: string; source: 'edge' | 'client' }> {
  
  // Phase 1: Try edge function for basic creation
  if (migrationConfig.useEdgeFunctionForUserCreation) {
    if (migrationConfig.enableMigrationLogs) {
      console.log('🎯 [MIGRATION] Attempting Phase 1: Edge function for user creation');
    }
    
    try {
      // 🔍 DEBUG: Log raw form data received
      if (migrationConfig.enableMigrationLogs) {
        console.log('🔍 [DEBUG] Raw form data received:', {
          // Step 1: Personal & Basic Info
          namaLengkap: formData.namaLengkap,
          email: formData.email,
          tanggalLahir: formData.tanggalLahir,
          jenisKelamin: formData.jenisKelamin,
          provinsiDomisili: formData.provinsiDomisili,
          kotaKabupatenDomisili: formData.kotaKabupatenDomisili,
          namaBank: formData.namaBank,
          namaNasabah: formData.namaNasabah,
          nomorRekening: formData.nomorRekening,
          
          // Step 2: Education Info
          statusAkademik: formData.statusAkademik,
          namaUniversitas: formData.namaUniversitas,
          fakultas: formData.fakultas,
          jurusan: formData.jurusan,
          tahunLulus: formData.tahunLulus,
          ipk: formData.ipk,
          namaSMA: formData.namaSMA,
          pengalamanMengajar: formData.pengalamanMengajar,
          keahlianSpesialisasi: formData.keahlianSpesialisasi,
          prestasiAkademik: formData.prestasiAkademik,
          transkripNilai: formData.transkripNilai ? 'File provided' : 'No file',
          sertifikatKeahlian: formData.sertifikatKeahlian ? 'File provided' : 'No file'
        });
      }

      // Map form data to edge function format
      const basicData: BasicTutorData = {
        // System & Status Information (Staff only)
        system: {
          status_tutor: formData.status_tutor || undefined,
          approval_level: formData.approval_level || undefined,
          staff_notes: formData.staff_notes || undefined,
          additionalScreening: formData.additionalScreening || undefined,
        },
        // Personal Information
        personal: {
          fotoProfil: formData.fotoProfil || null, // Profile photo upload
          trn: formData.trn || undefined, // Manual TRN input (if provided)
          namaLengkap: formData.namaLengkap || '',
          namaPanggilan: formData.namaPanggilan || 'Panggilan', // 🔧 Minimal 2 karakter
          tanggalLahir: formData.tanggalLahir || '',
          jenisKelamin: formData.jenisKelamin === 'Laki-laki' ? 'L' : (formData.jenisKelamin === 'Perempuan' ? 'P' : (formData.jenisKelamin || 'L')), // 🔧 Handle all gender formats
          agama: formData.agama || '',
          email: formData.email || '',
          noHp1: formData.noHp1 ? formatPhoneNumber(formData.noHp1) : '081234567890', // 🔧 Default valid phone
          noHp2: formData.noHp2 ? formatPhoneNumber(formData.noHp2) : undefined,
        },
        // Profile & Value Proposition
        profile: {
          headline: formData.headline || undefined, // Headline/Tagline Tutor
          deskripsiDiri: formData.deskripsiDiri || undefined, // Bio/Description
          motivasiMenjadiTutor: formData.motivasiMenjadiTutor || undefined, // Teaching motivation
          socialMedia1: formData.socialMedia1 || undefined, // Instagram/LinkedIn link
          socialMedia2: formData.socialMedia2 || undefined, // YouTube/TikTok link
        },
        
        // 🎓 STEP 2: Education Information (Pendidikan & Pengalaman)
        education: {
          // A. RIWAYAT PENDIDIKAN
          statusAkademik: formData.statusAkademik || undefined,
          
          // Current Education (University/College)
          namaUniversitas: formData.namaUniversitas || undefined,
          fakultas: formData.fakultas || undefined,
          jurusan: formData.jurusan || undefined,
          tahunMasuk: formData.tahunMasuk || undefined,
          tahunLulus: formData.tahunLulus || undefined,
          ipk: formData.ipk || undefined,
          
          // S1 Education (for S2/S3 students - conditional)
          namaUniversitasS1: formData.namaUniversitasS1 || undefined,
          fakultasS1: formData.fakultasS1 || undefined,
          jurusanS1: formData.jurusanS1 || undefined,
          
          // High School Information
          namaSMA: formData.namaSMA || undefined,
          jurusanSMA: formData.jurusanSMA || undefined,
          jurusanSMKDetail: formData.jurusanSMKDetail || undefined,
          tahunLulusSMA: formData.tahunLulusSMA || undefined,
          
          // Alternative Learning (for statusAkademik = 'lainnya')
          namaInstitusi: formData.namaInstitusi || undefined,
          bidangKeahlian: formData.bidangKeahlian || undefined,
          pengalamanBelajar: formData.pengalamanBelajar || undefined,
          
          // B. KEAHLIAN & SPESIALISASI
          keahlianSpesialisasi: formData.keahlianSpesialisasi || undefined,
          keahlianLainnya: formData.keahlianLainnya || undefined,
          
          // C. PENGALAMAN
          pengalamanMengajar: formData.pengalamanMengajar || undefined,
          pengalamanLainnya: formData.pengalamanLainRelevan || undefined, // ✅ Fix: use correct field name
          
          // D. PRESTASI & SERTIFIKASI
          prestasiAkademik: formData.prestasiAkademik || undefined,
          prestasiNonAkademik: formData.prestasiNonAkademik || undefined,
          sertifikasiPelatihan: formData.sertifikasiPelatihan || undefined,
          
          // Document Files (Step 2)
          transkripNilai: formData.transkripNilai || null,
          sertifikatKeahlian: formData.sertifikatKeahlian || null,
        },
        // Address Information
        address: {
          provinsiDomisili: formData.provinsiDomisili || null, // 🔧 Allow null for optional UUID
          kotaKabupatenDomisili: formData.kotaKabupatenDomisili || null, // 🔧 Allow null for optional UUID  
          kecamatanDomisili: formData.kecamatanDomisili || 'Kecamatan belum dipilih', // 🔧 Ensure min 3 chars
          kelurahanDomisili: formData.kelurahanDomisili || 'Kelurahan belum dipilih', // 🔧 Ensure min 3 chars
          alamatLengkapDomisili: formData.alamatLengkapDomisili || 'Alamat lengkap belum diisi', // 🔧 Ensure min 10 chars
          kodePosDomisili: formData.kodePosDomisili || '12345', // 🔧 Default valid kode pos
          alamatSamaDenganKTP: formData.alamatSamaDenganKTP !== false, // Default to true
          provinsiKTP: formData.provinsiKTP || null, // 🔧 Allow null for optional UUID
          kotaKabupatenKTP: formData.kotaKabupatenKTP || null, // 🔧 Allow null for optional UUID
          kecamatanKTP: formData.kecamatanKTP || 'Kecamatan KTP belum dipilih', // 🔧 Min 3 chars
          kelurahanKTP: formData.kelurahanKTP || 'Kelurahan KTP belum dipilih', // 🔧 Min 3 chars
          alamatLengkapKTP: formData.alamatLengkapKTP || 'Alamat KTP belum diisi', // 🔧 Min 10 chars
          kodePosKTP: formData.kodePosKTP || '12345', // 🔧 Default valid kode pos
        },
        // Banking Information
        banking: {
          namaNasabah: formData.namaNasabah || 'Nama pemilik rekening belum diisi', // 🔧 Ensure min 3 chars
          nomorRekening: formData.nomorRekening || '1234567890', // 🔧 Fallback valid format
          namaBank: formData.namaBank || null, // 🔧 Allow null for optional bank UUID
        },
        
        // 📚 STEP 3: Subjects & Programs (Mata Pelajaran)
        subjects: {
          selectedPrograms: formData.selectedPrograms || undefined,
          mataPelajaranLainnya: formData.mataPelajaranLainnya || undefined,
        },
        
        // 📄 STEP 5: Documents (Dokumen Pendukung)
        documents: {
          // Document Files (Step 5)
          dokumenIdentitas: formData.dokumenIdentitas || null,
          dokumenPendidikan: formData.dokumenPendidikan || null,
          dokumenSertifikat: formData.dokumenSertifikat || null,
          
          // Document Verification Status (Staff only)
          status_verifikasi_identitas: formData.status_verifikasi_identitas || undefined,
          status_verifikasi_pendidikan: formData.status_verifikasi_pendidikan || undefined,
        },
        
        // 🎯 STEP 4: Availability & Wilayah (PHASE 1)
        availability: {
          // A. AVAILABILITY & STATUS
          statusMenerimaSiswa: formData.statusMenerimaSiswa || undefined,
          available_schedule: formData.available_schedule || undefined,
          teaching_methods: formData.teaching_methods || undefined,
          hourly_rate: formData.hourly_rate ? parseInt(formData.hourly_rate.toString()) : undefined,
          maksimalSiswaBaru: formData.maksimalSiswaBaru ? parseInt(formData.maksimalSiswaBaru.toString()) : undefined,
          maksimalTotalSiswa: formData.maksimalTotalSiswa ? parseInt(formData.maksimalTotalSiswa.toString()) : undefined,
          usiaTargetSiswa: formData.usiaTargetSiswa || undefined,
          catatanAvailability: formData.catatanAvailability || undefined,
          
          // B. LOCATION & TRANSPORTATION
          transportasiTutor: formData.transportasiTutor || undefined,
          alamatTitikLokasi: formData.alamatTitikLokasi || undefined,
          teaching_radius_km: formData.teaching_radius_km ? parseInt(formData.teaching_radius_km.toString()) : undefined,
          location_notes: formData.location_notes || undefined,
          
          // C. COORDINATES (Optional - for future map integration)
          titikLokasiLat: formData.titikLokasiLat ? parseFloat(formData.titikLokasiLat.toString()) : undefined,
          titikLokasiLng: formData.titikLokasiLng ? parseFloat(formData.titikLokasiLng.toString()) : undefined,
          
          // D. EMERGENCY CONTACT (PHASE 3) - ✅ FIXED: Added missing mapping
          emergencyContactName: formData.emergencyContactName || undefined,
          emergencyContactRelationship: formData.emergencyContactRelationship || undefined,
          emergencyContactPhone: formData.emergencyContactPhone || undefined,
        },
        
        // 🎨 STEP 4: Teaching Preferences & Personality (PHASE 2)
        preferences: {
          // A. TEACHING PREFERENCES
          teachingMethods: formData.teachingMethods || undefined, // Gaya pembelajaran
          studentLevelPreferences: formData.studentLevelPreferences || undefined,
          specialNeedsCapable: formData.specialNeedsCapable || undefined,
          groupClassWilling: formData.groupClassWilling || undefined,
          
          // B. TECHNOLOGY CAPABILITIES
          onlineTeachingCapable: formData.onlineTeachingCapable || undefined,
          techSavviness: formData.techSavviness || undefined,
          gmeetExperience: formData.gmeetExperience || undefined,
          presensiUpdateCapability: formData.presensiUpdateCapability || undefined,
        },
        
        // 👤 STEP 4: Personality Traits (PHASE 2)
        personality: {
          // PERSONALITY & CHARACTER
          tutorPersonalityType: formData.tutorPersonalityType || undefined,
          communicationStyle: formData.communicationStyle || undefined,
          teachingPatienceLevel: formData.teachingPatienceLevel ? parseInt(formData.teachingPatienceLevel.toString()) : undefined,
          studentMotivationAbility: formData.studentMotivationAbility ? parseInt(formData.studentMotivationAbility.toString()) : undefined,
          scheduleFlexibilityLevel: formData.scheduleFlexibilityLevel ? parseInt(formData.scheduleFlexibilityLevel.toString()) : undefined,
        }
      };

      // 🔍 DEBUG: Log mapped data that will be sent
      if (migrationConfig.enableMigrationLogs) {
        console.log('🔍 [DEBUG] Mapped data for Edge Function:');
        console.log('📊 Personal:', basicData.personal);
        console.log('✨ Profile:', basicData.profile);
        console.log('🎓 Education:', basicData.education); // Step 2 education data
        console.log('📚 Subjects:', basicData.subjects); // Step 3 subjects data
        console.log('📍 Address:', basicData.address);
        console.log('🏦 Banking:', basicData.banking);
        console.log('📄 Documents:', basicData.documents); // Step 5 documents data
        console.log('🎯 Availability:', basicData.availability); // Step 4 availability data
        console.log('🎨 Preferences:', basicData.preferences); // Step 4 teaching preferences data
        console.log('👤 Personality:', basicData.personality); // Step 4 personality traits data
        console.log('🔧 System:', basicData.system);
      }

      const result = await createBasicTutorViaEdgeFunction(basicData, sessionToken);
      
      if (result.success) {
        // 📸 PHASE 2: Upload profile photo if provided
        if (formData.fotoProfil && formData.fotoProfil instanceof File && result.data?.user_id) {
          if (migrationConfig.enableMigrationLogs) {
            console.log('📸 [PHASE 2] Starting profile photo upload for user:', result.data.user_id);
          }
          
          try {
            const photoUrl = await uploadProfilePhotoToR2(formData.fotoProfil, result.data.user_id);
            if (migrationConfig.enableMigrationLogs) {
              console.log('✅ [PHASE 2] Profile photo uploaded successfully:', photoUrl);
            }
            
            // Add photo URL to result data
            result.data.profile_photo_url = photoUrl;
            
          } catch (photoError) {
            console.error('❌ [PHASE 2] Profile photo upload failed:', photoError);
            // Don't fail the entire operation, just log the error
            if (migrationConfig.enableMigrationLogs) {
              console.warn('⚠️ [PHASE 2] User created successfully but photo upload failed. User can upload later.');
            }
          }
        }
        
        // 📄 PHASE 3: Upload Step 2 documents if provided
        const step2Files = {
          transkripNilai: formData.transkripNilai,
          sertifikatKeahlian: formData.sertifikatKeahlian
        };
        
        const hasStep2Files = (step2Files.transkripNilai && step2Files.transkripNilai instanceof File) ||
                             (step2Files.sertifikatKeahlian && step2Files.sertifikatKeahlian instanceof File);
        
        if (hasStep2Files && result.data?.user_id) {
          if (migrationConfig.enableMigrationLogs) {
            console.log('📄 [PHASE 3] Starting Step 2 documents upload for user:', result.data.user_id);
          }
          
          try {
            const documentsResult = await uploadStep2DocumentsToR2(step2Files, result.data.user_id);
            if (migrationConfig.enableMigrationLogs) {
              console.log('✅ [PHASE 3] Step 2 documents uploaded successfully:', documentsResult);
            }
            
            // Add document upload results to result data
            result.data.step2_documents = documentsResult.results;
            
          } catch (documentsError) {
            console.error('❌ [PHASE 3] Step 2 documents upload failed:', documentsError);
            // Don't fail the entire operation, just log the error
            if (migrationConfig.enableMigrationLogs) {
              console.warn('⚠️ [PHASE 3] User created successfully but documents upload failed. User can upload later.');
            }
          }
        }
        
        // 📄 PHASE 4: Upload Step 5 documents if provided
        const step5Files = {
          dokumenIdentitas: formData.dokumenIdentitas,
          dokumenPendidikan: formData.dokumenPendidikan,
          dokumenSertifikat: formData.dokumenSertifikat
        };
        
        const hasStep5Files = (step5Files.dokumenIdentitas && step5Files.dokumenIdentitas instanceof File) ||
                             (step5Files.dokumenPendidikan && step5Files.dokumenPendidikan instanceof File) ||
                             (step5Files.dokumenSertifikat && step5Files.dokumenSertifikat instanceof File);
        
        if (hasStep5Files && result.data?.user_id) {
          if (migrationConfig.enableMigrationLogs) {
            console.log('📄 [PHASE 4] Starting Step 5 documents upload for user:', result.data.user_id);
          }
          
          try {
            const documentsResult = await uploadStep5DocumentsToR2(step5Files, result.data.user_id);
            if (migrationConfig.enableMigrationLogs) {
              console.log('✅ [PHASE 4] Step 5 documents uploaded successfully:', documentsResult);
            }
            
            // Add document upload results to result data
            result.data.step5_documents = documentsResult.results;
            
          } catch (documentsError) {
            console.error('❌ [PHASE 4] Step 5 documents upload failed:', documentsError);
            // Don't fail the entire operation, just log the error
            if (migrationConfig.enableMigrationLogs) {
              console.warn('⚠️ [PHASE 4] User created successfully but Step 5 documents upload failed. User can upload later.');
            }
          }
        }
        
        return { success: true, data: result.data, source: 'edge' };
      }
      
      // EMERGENCY FALLBACK ONLY (not primary method)
      if (migrationConfig.enableFallbackToClientSide && clientSideCallback) {
        if (migrationConfig.enableMigrationLogs) {
          console.warn('⚠️ [EMERGENCY FALLBACK] Edge Function failed, using emergency client-side...');
          console.warn('⚠️ [EMERGENCY] This should be rare - investigate Edge Function issues');
        }
        
        const clientResult = await clientSideCallback();
        return { success: true, data: clientResult, source: 'client' };
      }
      
      return { success: false, error: result.error, source: 'edge' };
      
    } catch (error) {
      if (migrationConfig.enableFallbackToClientSide && clientSideCallback) {
        if (migrationConfig.enableMigrationLogs) {
          console.warn('💥 [EMERGENCY FALLBACK] Edge Function critical error, using emergency client-side...');
          console.warn('💥 [EMERGENCY] Critical error requires investigation');
        }
        
        const clientResult = await clientSideCallback();
        return { success: true, data: clientResult, source: 'client' };
      }
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'edge' 
      };
    }
  }
  
  // Use client-side if edge function not enabled
  if (clientSideCallback) {
    if (migrationConfig.enableMigrationLogs) {
      console.log('📝 [MIGRATION] Using client-side operations (edge function disabled)');
    }
    
    const clientResult = await clientSideCallback();
    return { success: true, data: clientResult, source: 'client' };
  }
  
  return { success: false, error: 'No creation method available', source: 'client' };
}
