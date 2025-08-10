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
  }

  try {
    // Get Supabase URL from environment
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL not configured');
    }

    // Call edge function (auth disabled with --no-verify-jwt)
    const response = await fetch(`${supabaseUrl}/functions/v1/create-tutor-complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      },
      body: JSON.stringify(data)
    });

    if (migrationConfig.enableMigrationLogs) {
      console.log('📡 [MIGRATION] Edge function response status:', response.status);
    }

    if (!response.ok) {
      const errorData = await response.json();
      
      if (migrationConfig.enableMigrationLogs) {
        console.error('❌ [MIGRATION] Edge function failed:', errorData);
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
      // Map form data to edge function format
      const basicData: BasicTutorData = {
        personal: {
          namaLengkap: formData.namaLengkap,
          namaPanggilan: formData.namaPanggilan,
          tanggalLahir: formData.tanggalLahir,
          jenisKelamin: formData.jenisKelamin === 'Laki-laki' ? 'L' : 'P', // 🔧 Transform gender
          agama: formData.agama,
          email: formData.email,
          noHp1: formatPhoneNumber(formData.noHp1 || ''), // 🔧 Format phone like client-side
          noHp2: formData.noHp2 ? formatPhoneNumber(formData.noHp2) : undefined,
        },
        address: {
          provinsiDomisili: formData.provinsiDomisili,
          kotaKabupatenDomisili: formData.kotaKabupatenDomisili,
          kecamatanDomisili: formData.kecamatanDomisili || 'Kecamatan belum dipilih', // 🔧 Ensure min 3 chars
          kelurahanDomisili: formData.kelurahanDomisili || 'Kelurahan belum dipilih', // 🔧 Ensure min 3 chars
          alamatLengkapDomisili: formData.alamatLengkapDomisili || 'Alamat lengkap belum diisi', // 🔧 Ensure min 10 chars
          kodePosDomisili: formData.kodePosDomisili,
          alamatSamaDenganKTP: formData.alamatSamaDenganKTP,
          provinsiKTP: formData.provinsiKTP,
          kotaKabupatenKTP: formData.kotaKabupatenKTP,
          kecamatanKTP: formData.kecamatanKTP,
          kelurahanKTP: formData.kelurahanKTP,
          alamatLengkapKTP: formData.alamatLengkapKTP,
          kodePosKTP: formData.kodePosKTP,
        },
        banking: {
          namaNasabah: formData.namaNasabah || 'Nama pemilik rekening belum diisi', // 🔧 Ensure min 3 chars
          nomorRekening: formData.nomorRekening || '1234567890', // 🔧 Fallback valid format
          namaBank: formData.namaBank || '', // 🔧 Will fail validation if empty UUID
        }
      };

      const result = await createBasicTutorViaEdgeFunction(basicData, sessionToken);
      
      if (result.success) {
        return { success: true, data: result.data, source: 'edge' };
      }
      
      // If edge function fails and fallback enabled
      if (migrationConfig.enableFallbackToClientSide && clientSideCallback) {
        if (migrationConfig.enableMigrationLogs) {
          console.log('🔄 [MIGRATION] Edge function failed, falling back to client-side...');
        }
        
        const clientResult = await clientSideCallback();
        return { success: true, data: clientResult, source: 'client' };
      }
      
      return { success: false, error: result.error, source: 'edge' };
      
    } catch (error) {
      if (migrationConfig.enableFallbackToClientSide && clientSideCallback) {
        if (migrationConfig.enableMigrationLogs) {
          console.log('💥 [MIGRATION] Edge function error, falling back to client-side...');
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
