/**
 * 🚀 EDGE FUNCTION SERVICE
 * Handles communication with Supabase Edge Functions
 * for secure server-side tutor creation
 */

import { migrationConfig } from '@/config';

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
  // System & Status Information (Staff only)
  system: {
    status_tutor?: string;
    approval_level?: string;
    staff_notes?: string;
    additionalScreening?: string[]; // Checklist for additional screening
  };
  // Personal Information
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
  // Profile & Value Proposition
  profile: {
    headline?: string; // Headline/Tagline Tutor (max 100 chars)
    deskripsiDiri?: string; // Bio/Description
    motivasiMenjadiTutor?: string; // Teaching motivation
    socialMedia1?: string; // Instagram/LinkedIn link
    socialMedia2?: string; // YouTube/TikTok link
  };
  // Address Information
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
  // Banking Information
  banking: {
    namaNasabah: string;
    nomorRekening: string;
    namaBank: string | null; // Bank UUID from dropdown
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
          namaLengkap: formData.namaLengkap,
          email: formData.email,
          tanggalLahir: formData.tanggalLahir,
          jenisKelamin: formData.jenisKelamin,
          provinsiDomisili: formData.provinsiDomisili,
          kotaKabupatenDomisili: formData.kotaKabupatenDomisili,
          namaBank: formData.namaBank,
          namaNasabah: formData.namaNasabah,
          nomorRekening: formData.nomorRekening
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
        }
      };

      // 🔍 DEBUG: Log mapped data that will be sent
      if (migrationConfig.enableMigrationLogs) {
        console.log('🔍 [DEBUG] Mapped data for Edge Function:', JSON.stringify(basicData, null, 2));
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
