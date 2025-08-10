/**
 * 🚀 EDGE FUNCTION SERVICE
 * Handles communication with Supabase Edge Functions
 * for secure server-side tutor creation
 */

import { migrationConfig } from '@/config';

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
  personal: {
    namaLengkap: string;
    namaPanggilan?: string;
    tanggalLahir: string;
    jenisKelamin: 'L' | 'P';
    agama?: string;
    email: string;
    noHp1: string;
    noHp2?: string;
  };
  address: {
    provinsiDomisili: string;
    kotaKabupatenDomisili: string;
    kecamatanDomisili: string;
    kelurahanDomisili: string;
    alamatLengkapDomisili: string;
    kodePosDomisili?: string;
    alamatSamaDenganKTP?: boolean;
    provinsiKTP?: string;
    kotaKabupatenKTP?: string;
    kecamatanKTP?: string;
    kelurahanKTP?: string;
    alamatLengkapKTP?: string;
    kodePosKTP?: string;
  };
  banking: {
    namaNasabah: string;
    nomorRekening: string;
    namaBank: string;
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
        personal: {
          namaLengkap: formData.namaLengkap || '',
          namaPanggilan: formData.namaPanggilan || 'Panggilan', // 🔧 Minimal 2 karakter
          tanggalLahir: formData.tanggalLahir || '',
          jenisKelamin: formData.jenisKelamin === 'Laki-laki' ? 'L' : (formData.jenisKelamin === 'Perempuan' ? 'P' : (formData.jenisKelamin || 'L')), // 🔧 Handle all gender formats
          agama: formData.agama || '',
          email: formData.email || '',
          noHp1: formData.noHp1 ? formatPhoneNumber(formData.noHp1) : '081234567890', // 🔧 Default valid phone
          noHp2: formData.noHp2 ? formatPhoneNumber(formData.noHp2) : undefined,
        },
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
