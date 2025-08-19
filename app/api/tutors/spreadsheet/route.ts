import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { convertTutorFileUrls } from '@/lib/url-converter';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';
export const revalidate = 0; // Disable ISR completely
export const fetchCache = 'force-no-store'; // Force no caching
export const runtime = 'nodejs';

// Supabase Configuration with debug logging
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('URL present:', !!supabaseUrl);
  console.error('Key present:', !!supabaseKey);
}

// Add connection options to prevent connection pooling issues
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false, // Don't persist session in serverless
  },
  global: {
    headers: {
      'X-Request-ID': Date.now().toString(),
      'X-No-Cache': 'true'
    }
  }
}) : null;

// Debug environment
console.log('🔍 Environment debug:', {
  hasSupabaseUrl: !!supabaseUrl,
  hasSupabaseKey: !!supabaseKey,
  nodeEnv: process.env.NODE_ENV,
  vercelEnv: process.env.VERCEL_ENV,
  timestamp: new Date().toISOString()
});

// Helper function to extract data from education_history JSONB
function extractFromEducationHistory(educationHistory: any[], level: string, field: string): any {
  if (!educationHistory || !Array.isArray(educationHistory)) return null;
  
  const education = educationHistory.find(edu => edu.level === level);
  return education ? education[field] : null;
}

// Complete Tutor Interface matching form fields
interface CompleteTutorData {
  // System & Status
  id: string;
  trn: string;
  brand: string;
  registration_current_status: string;
  operations_current_status: string;
  status_tutor: string;
  approval_level: string;
  staff_notes: string;
  
  // Personal Info
  fotoProfil: string | null;
  namaLengkap: string;
  namaPanggilan: string;
  tanggalLahir: string;
  jenisKelamin: string;
  agama: string;
  email: string;
  noHp1: string;
  noHp2: string;
  
  // Profile & Value Proposition
  headline: string;
  deskripsiDiri: string;
  motivasiMenjadiTutor: string;
  socialMedia1: string;
  socialMedia2: string;
  
  // Address - Domisili
  provinsiDomisili: string;
  kotaKabupatenDomisili: string;
  kecamatanDomisili: string;
  kelurahanDomisili: string;
  alamatLengkapDomisili: string;
  kodePosDomisili: string;
  
  // Address - KTP
  alamatSamaDenganKTP: boolean;
  provinsiKTP: string;
  kotaKabupatenKTP: string;
  kecamatanKTP: string;
  kelurahanKTP: string;
  alamatLengkapKTP: string;
  kodePosKTP: string;
  
  // Banking
  namaNasabah: string;
  nomorRekening: string;
  namaBank: string;
  
  // Education - ✅ UPDATED: Current Education (matches Edge Function structure)
  statusAkademik: string;
  namaUniversitas: string;           // Maps to current_university
  fakultas: string;                  // Maps to current_faculty  
  jurusan: string;                   // Maps to current_major
  jurusanSMKDetail: string;          // Maps to vocational_school_detail
  ipk: number;                       // Maps to current_gpa
  tahunMasuk: string;                // Maps to entry_year
  tahunLulus: string;                // Maps to current_graduation_year
  namaSMA: string;                   // Maps to high_school
  jurusanSMA: string;                // Maps to high_school_major  
  tahunLulusSMA: string;             // Maps to high_school_graduation_year
  
  // Education Documents
  transkripNilai: string | null;
  sertifikatKeahlian: string | null;
  
  
  // Education - S1 Background
  namaUniversitasS1: string;
  fakultasS1: string;
  jurusanS1: string;
  
  // Education - Alternative Learning
  namaInstitusi: string;
  bidangKeahlian: string;
  pengalamanBelajar: string;
  
  // Professional Profile
  keahlianSpesialisasi: string;
  keahlianLainnya: string;
  pengalamanMengajar: string;
  pengalamanLainRelevan: string;
  prestasiAkademik: string;
  prestasiNonAkademik: string;
  sertifikasiPelatihan: string;
  
  
  // Programs & Subjects
  selectedPrograms: string[];
  mataPelajaranLainnya: string;
  
  // Availability
  statusMenerimaSiswa: string;
  available_schedule: string[];
  teaching_methods: string[];
  hourly_rate: number;
  maksimalSiswaBaru: number;
  maksimalTotalSiswa: number;
  usiaTargetSiswa: string[];
  teaching_radius_km: number;
  alamatTitikLokasi: string;
  location_notes: string;
  catatanAvailability: string;
  
  // Transportation & Location Coordinates
  transportasiTutor: string[];
  titikLokasiLat: number | null;
  titikLokasiLng: number | null;
  
  // Teaching Preferences
  teachingMethods: string[];
  studentLevelPreferences: string[];
  specialNeedsCapable: string;
  groupClassWilling: string;
  onlineTeachingCapable: string;
  techSavviness: string;
  gmeetExperience: string;
  presensiUpdateCapability: string;
  
  // Personality - ✅ FIXED: Should be arrays
  tutorPersonalityType: string[];
  communicationStyle: string[];
  teachingPatienceLevel: string;
  studentMotivationAbility: string;
  scheduleFlexibilityLevel: string;
  
  // Emergency Contact
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
  preferredCommunicationTime: string;
  communicationLanguagePreference: string[];
  
  // Documents
  dokumenIdentitas: string | null;
  dokumenPendidikan: string | null;
  dokumenSertifikat: string | null;
  
  // ✅ ADDED: Document Preview Fields (from Form Add)
  fotoProfilPreview: string | null;
  dokumenIdentitasPreview: string | null;
  dokumenPendidikanPreview: string | null;
  dokumenSertifikatPreview: string | null;
  
  // Document Verification
  status_verifikasi_identitas: string;
  status_verifikasi_pendidikan: string;
  
  // System Management
  additionalScreening: string[];
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// Fetch all tutor data from Supabase with server-side search and filtering
async function fetchAllTutorData(limit = 25, offset = 0, search = '', columnFilters: Record<string, string[]> = {}): Promise<{data: CompleteTutorData[], error: string | null, total: number, filtered?: number}> {
  if (!supabase) {
    return { data: [], error: 'Supabase not configured', total: 0 };
  }

  try {
    console.log('🔍 Fetching all tutor data from Supabase with server-side filters...');
    console.log('🔍 Database query parameters:', {
      limit,
      offset, 
      search,
      columnFilters,
      timestamp: new Date().toISOString(),
      environment: process.env.VERCEL_ENV || 'development'
    });

    // First get all roles that match tutor/educator (case insensitive)
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('id')
      .or('role_name.ilike.%tutor%,role_name.ilike.%Tutor%,role_name.ilike.%educator%,role_name.ilike.%Educator%');
    
    if (roleError) {
      console.error('❌ Error fetching roles:', roleError);
      return { data: [], error: roleError.message, total: 0 };
    }

    const roleIds = roleData?.map(role => role.id) || [];
    
    if (roleIds.length === 0) {
      console.log('⚠️ No tutor/educator roles found');
      return { data: [], error: null, total: 0 };
    }

    let userIdsToFilter: string[] | null = null;

    // 🚀 PERFORMANCE UPGRADE: Server-side filtering for related tables
    const relatedFilters: Record<string, { table: string; column: string }> = {
        // status_tutor is handled client-side to correctly manage 'unknown' default
        approval_level: { table: 'tutor_management', column: 'approval_level' },
        brand: { table: 'tutor_management', column: 'entity_code' }
    };

    for (const column in relatedFilters) {
        if (columnFilters[column] && columnFilters[column].length > 0) {
            const config = relatedFilters[column];
            const { data: relatedData, error: relatedError } = await supabase
                .from(config.table)
                .select('user_id')
                .in(config.column, columnFilters[column]);

            if (relatedError) {
                console.error(`❌ Error fetching user_ids for ${column} filter:`, relatedError);
                continue; // Skip this filter on error
            }

            const ids = relatedData?.map(m => m.user_id) || [];
            if (userIdsToFilter === null) {
                userIdsToFilter = ids;
            } else {
                // Intersect with previous results for an "AND" condition
                userIdsToFilter = userIdsToFilter.filter(id => ids.includes(id));
            }

            // If the list of IDs is empty at any point, no need to continue.
            if (userIdsToFilter.length === 0) break;
        }
    }

    // 🚀 PERFORMANCE FIX: Server-side search query
    let userQuery = supabase
      .from('users_universal')
      .select(`
        id,
        user_code,
        email,
        phone,
        account_type,
        user_status,
        created_at,
        updated_at,
        primary_role_id,
        user_roles!inner(role_name, role_code)
      `, { count: 'exact' })
      .in('primary_role_id', roleIds);

    // Add search filtering if search term provided
    if (search && search.length >= 2) {
      const searchTerm = search.toLowerCase();
      
      // Collect all user IDs that match search across various tables
      let matchingUserIds: string[] = [];
      
      console.log(`🔍 Starting comprehensive search for: "${searchTerm}"`);
      
      try {
        // 1. Search in program mappings (tutor_program_mappings + programs_unit)
      const { data: programMappings, error: programError } = await supabase
        .from('tutor_program_mappings')
        .select(`
          tutor_id,
          programs_unit!inner(program_name, program_name_local)
        `)
        .or(`programs_unit.program_name.ilike.%${searchTerm}%,programs_unit.program_name_local.ilike.%${searchTerm}%`);
      
      if (!programError && programMappings) {
        const tutorIds = programMappings.map(pm => pm.tutor_id);
        if (tutorIds.length > 0) {
          const { data: tutorDetailsForPrograms } = await supabase
            .from('tutor_details')
            .select('user_id')
            .in('id', tutorIds);
          
          if (tutorDetailsForPrograms) {
            matchingUserIds.push(...tutorDetailsForPrograms.map(td => td.user_id));
          }
        }
      }
      
      // 2. Search in additional subjects (tutor_additional_subjects)
      const { data: additionalSubjects, error: additionalError } = await supabase
        .from('tutor_additional_subjects')
        .select('tutor_id')
        .ilike('subject_name', `%${searchTerm}%`);
      
      if (!additionalError && additionalSubjects) {
        const tutorIds = additionalSubjects.map(as => as.tutor_id);
        if (tutorIds.length > 0) {
          const { data: tutorDetailsForSubjects } = await supabase
            .from('tutor_details')
            .select('user_id')
            .in('id', tutorIds);
          
          if (tutorDetailsForSubjects) {
            matchingUserIds.push(...tutorDetailsForSubjects.map(td => td.user_id));
          }
        }
      }
      
      // 3. Search in tutor_details for education and professional fields
      const { data: tutorDetailsMatches, error: tutorDetailsError } = await supabase
        .from('tutor_details')
        .select('user_id')
        .or(`additional_subjects_description.ilike.%${searchTerm}%,current_university.ilike.%${searchTerm}%,current_faculty.ilike.%${searchTerm}%,current_major.ilike.%${searchTerm}%,special_skills.ilike.%${searchTerm}%,teaching_experience.ilike.%${searchTerm}%`);
      
      if (tutorDetailsError) {
        console.error('❌ Error searching tutor_details:', tutorDetailsError);
      }
      
      if (!tutorDetailsError && tutorDetailsMatches) {
        matchingUserIds.push(...tutorDetailsMatches.map(td => td.user_id));
        console.log(`📚 Found ${tutorDetailsMatches.length} matches in tutor_details for "${searchTerm}"`);
      }
      
      // 3b. Dedicated search for education fields only (for debugging)
      const { data: educationMatches, error: educationError } = await supabase
        .from('tutor_details')
        .select('user_id, current_university, current_faculty, current_major')
        .or(`current_university.ilike.%${searchTerm}%,current_faculty.ilike.%${searchTerm}%,current_major.ilike.%${searchTerm}%`);
      
      if (educationError) {
        console.error('❌ Error searching education fields:', educationError);
      }
      
      if (!educationError && educationMatches) {
        matchingUserIds.push(...educationMatches.map(em => em.user_id));
        console.log(`🎓 Found ${educationMatches.length} matches in education fields for "${searchTerm}":`, educationMatches.slice(0, 3));
      }
      
      // 4. Search for user IDs that have matching full names and phone numbers in user_profiles
      const { data: profileMatches, error: profileError } = await supabase
        .from('user_profiles')
        .select('user_id, full_name, mobile_phone_2')
        .or(`full_name.ilike.%${searchTerm}%,mobile_phone_2.ilike.%${searchTerm}%`);
      
      if (profileError) {
        console.error('❌ Error searching profiles:', profileError);
      }
      
      if (!profileError && profileMatches) {
        matchingUserIds.push(...profileMatches.map(pm => pm.user_id));
        const phoneMatches = profileMatches.filter(pm => pm.mobile_phone_2?.includes(searchTerm));
        if (phoneMatches.length > 0) {
          console.log(`📱 Found ${phoneMatches.length} matches in alternative phone for "${searchTerm}":`, phoneMatches.slice(0, 3));
        }
      }
      
      // 4b. Search for religion in user_demographics
      const { data: religionMatches, error: religionError } = await supabase
        .from('user_demographics')
        .select('user_id, religion')
        .ilike('religion', `%${searchTerm}%`);
      
      if (religionError) {
        console.error('❌ Error searching religion:', religionError);
      }
      
      if (!religionError && religionMatches) {
        matchingUserIds.push(...religionMatches.map(rm => rm.user_id));
        console.log(`🕌 Found ${religionMatches.length} matches in religion for "${searchTerm}":`, religionMatches.slice(0, 3));
      }
      
      // 5. Search in user_addresses for address fields
      const { data: addressMatches, error: addressError } = await supabase
        .from('user_addresses')
        .select('user_id')
        .or(`street_address.ilike.%${searchTerm}%,district_name.ilike.%${searchTerm}%,village_name.ilike.%${searchTerm}%`);
      
      if (!addressError && addressMatches) {
        matchingUserIds.push(...addressMatches.map(am => am.user_id));
      }
      
      // 5b. Search in location_province for province names (then find users)
      const { data: provinceMatches, error: provinceError } = await supabase
        .from('location_province')
        .select('id')
        .ilike('region_name', `%${searchTerm}%`);
      
      if (!provinceError && provinceMatches) {
        const provinceIds = provinceMatches.map(p => p.id);
        if (provinceIds.length > 0) {
          const { data: usersInProvince } = await supabase
            .from('user_addresses')
            .select('user_id')
            .in('province_id', provinceIds);
          
          if (usersInProvince) {
            matchingUserIds.push(...usersInProvince.map(u => u.user_id));
          }
        }
      }
      
      // 5c. Search in location_cities for city names (then find users)
      const { data: cityMatches, error: cityError } = await supabase
        .from('location_cities')
        .select('id')
        .ilike('city_name', `%${searchTerm}%`);
      
      if (!cityError && cityMatches) {
        const cityIds = cityMatches.map(c => c.id);
        if (cityIds.length > 0) {
          const { data: usersInCity } = await supabase
            .from('user_addresses')
            .select('user_id')
            .in('city_id', cityIds);
          
          if (usersInCity) {
            matchingUserIds.push(...usersInCity.map(u => u.user_id));
          }
        }
      }
      
      // 6. Search in tutor_banking_info for banking fields
      const { data: bankingMatches, error: bankingError } = await supabase
        .from('tutor_banking_info')
        .select('tutor_id')
        .or(`bank_name.ilike.%${searchTerm}%,account_holder_name.ilike.%${searchTerm}%`);
      
      if (!bankingError && bankingMatches) {
        const tutorIds = bankingMatches.map(bm => bm.tutor_id);
        if (tutorIds.length > 0) {
          const { data: tutorDetailsForBanking } = await supabase
            .from('tutor_details')
            .select('user_id')
            .in('id', tutorIds);
          
          if (tutorDetailsForBanking) {
            matchingUserIds.push(...tutorDetailsForBanking.map(td => td.user_id));
          }
        }
      }
      
      // 7. Search in tutor_management for status fields and brand/entity_code
      const { data: managementMatches, error: managementError } = await supabase
        .from('tutor_management')
        .select('user_id')
        .or(`status_tutor.ilike.%${searchTerm}%,approval_level.ilike.%${searchTerm}%,entity_code.ilike.%${searchTerm}%`);
      
      if (!managementError && managementMatches) {
        matchingUserIds.push(...managementMatches.map(mm => mm.user_id));
      }
      
      // 8. Search in tutor_availability_config for availability fields
      const { data: availabilityMatches, error: availabilityError } = await supabase
        .from('tutor_availability_config')
        .select('tutor_id')
        .or(`availability_status.ilike.%${searchTerm}%`);
      
      if (!availabilityError && availabilityMatches) {
        const tutorIds = availabilityMatches.map(am => am.tutor_id);
        if (tutorIds.length > 0) {
          const { data: tutorDetailsForAvailability } = await supabase
            .from('tutor_details')
            .select('user_id')
            .in('id', tutorIds);
          
          if (tutorDetailsForAvailability) {
            matchingUserIds.push(...tutorDetailsForAvailability.map(td => td.user_id));
          }
        }
      }
      
      // 9. Search in document_storage for document fields  
      const { data: documentMatches, error: documentError } = await supabase
        .from('document_storage')
        .select('user_id')
        .or(`document_type.ilike.%${searchTerm}%,original_filename.ilike.%${searchTerm}%`);
      
      if (!documentError && documentMatches) {
        matchingUserIds.push(...documentMatches.map(dm => dm.user_id));
      }
      
      // 10. Search for TRN (Tutor Registration Number) in tutor_details
      const { data: trnMatches, error: trnError } = await supabase
        .from('tutor_details')
        .select('user_id, tutor_registration_number')
        .ilike('tutor_registration_number', `%${searchTerm}%`);
      
      if (trnError) {
        console.error('❌ Error searching TRN:', trnError);
      }
      
      if (!trnError && trnMatches) {
        matchingUserIds.push(...trnMatches.map(tm => tm.user_id));
        console.log(`🔢 Found ${trnMatches.length} matches in TRN for "${searchTerm}":`, trnMatches.slice(0, 3));
      }
      
      // 11. Search for exact UUID if search term looks like a UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      let uuidMatches = null;
      if (uuidRegex.test(searchTerm)) {
        const { data: uuidData, error: uuidError } = await supabase
          .from('users_universal')
          .select('id')
          .eq('id', searchTerm);
        
        uuidMatches = uuidData;
        
        if (!uuidError && uuidMatches && uuidMatches.length > 0) {
          matchingUserIds.push(...uuidMatches.map(um => um.id));
          console.log(`🆔 Found exact UUID match for "${searchTerm}"`);
        }
      }
      
      // Remove duplicates from all searches
      matchingUserIds = [...new Set(matchingUserIds)];
      
      // Apply search: either direct user fields OR matches from related tables
      try {
        if (matchingUserIds.length > 0) {
          // Limit the IN clause to prevent query size issues
          const limitedUserIds = matchingUserIds.slice(0, 100); // Limit to 100 IDs
          userQuery = userQuery.or(`user_code.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,id.in.(${limitedUserIds.join(',')})`);
          
          if (matchingUserIds.length > 100) {
            console.log(`⚠️ Limited search results to first 100 user IDs (found ${matchingUserIds.length} total)`);
          }
        } else {
          userQuery = userQuery.or(`user_code.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);
        }
      } catch (queryError) {
        console.error('❌ Error building search query:', queryError);
        // Fallback to basic search if complex query fails
        userQuery = userQuery.or(`user_code.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);
      }
      
      // Debug logging untuk setiap search step
      console.log(`🔍 Detailed search results for "${search}":`, {
        step1_programs: programMappings?.length || 0,
        step2_additionalSubjects: additionalSubjects?.length || 0,
        step3_tutorDetails: tutorDetailsMatches?.length || 0,
        step3b_educationOnly: educationMatches?.length || 0,
        step4_profiles: profileMatches?.length || 0,
        step4b_religion: religionMatches?.length || 0,
        step5a_addresses: addressMatches?.length || 0,
        step5b_provinces: provinceMatches?.length || 0,
        step5c_cities: cityMatches?.length || 0,
        step6_banking: bankingMatches?.length || 0,
        step7_management: managementMatches?.length || 0,
        step8_availability: availabilityMatches?.length || 0,
        step9_documents: documentMatches?.length || 0,
        step10_trn: trnMatches?.length || 0,
        step11_uuid: uuidRegex?.test(searchTerm) ? (uuidMatches?.length || 0) : 'N/A',
        totalUniqueUsers: matchingUserIds.length
      });
      
        console.log(`🔍 Server-side search applied: "${search}" (found ${matchingUserIds.length} users with matching data across all tables)`);
      } catch (searchError) {
        console.error('❌ Error during comprehensive search:', searchError);
        // Fallback to basic search
        matchingUserIds = [];
        userQuery = userQuery.or(`user_code.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);
      }
    }

    // Apply the collected user ID filters
    if (userIdsToFilter !== null) {
        if (userIdsToFilter.length === 0) {
            // If filters result in no users, return empty set immediately
            return { data: [], error: null, total: 0, filtered: 0 };
        }
        userQuery = userQuery.in('id', userIdsToFilter);
    }

    // Apply pagination and ordering
    const { data: usersData, error: usersError, count: totalCount } = await userQuery
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return { data: [], error: usersError.message, total: 0 };
    }

    if (!usersData || usersData.length === 0) {
      console.log('⚠️ No tutor users found');
      console.log('🔍 Debug empty result:', {
        totalCount,
        hasRoleIds: roleIds.length > 0,
        roleIds: roleIds.slice(0, 3),
        query: 'users_universal',
        environment: process.env.VERCEL_ENV || 'development'
      });
      return { data: [], error: null, total: totalCount || 0 };
    }

    console.log(`✅ Found ${usersData.length} tutor users (total count: ${totalCount})`);

    // Extract user IDs for related data queries
    const userIds = usersData.map(user => user.id);

    // Parallel fetch all related data
    const [
      profilesResult,
      demographicsResult,
      addressesResult,
      tutorDetailsResult,
      managementResult,
      operationsStatusResult,
      registrationStatusResult,
      bankingResult,
      availabilityResult,
      preferencesResult,
      personalityResult,
      programMappingsResult,
      additionalSubjectsResult,
      documentsResult,
      provincesResult,
      citiesResult,
      programsResult
    ] = await Promise.all([
      // User profiles
      supabase
        .from('user_profiles')
        .select('*')
        .in('user_id', userIds),
      
      // Demographics
      supabase
        .from('user_demographics')
        .select('*')
        .in('user_id', userIds),
      
      // Addresses
      supabase
        .from('user_addresses')
        .select('*')
        .in('user_id', userIds),
      
      // Tutor details
      supabase
        .from('tutor_details')
        .select('*')
        .in('user_id', userIds),
      
      // Tutor management
      supabase
        .from('tutor_management')
        .select('*')
        .in('user_id', userIds),
      
      // Tutor operations status (via tutor_id lookup)
      supabase
        .from('tutor_operations_status')
        .select('*'),
      
      // Tutor registration status (via tutor_id lookup)  
      supabase
        .from('tutor_registration_status')
        .select('*'),
      
      // Banking info (via tutor_id)
      supabase
        .from('tutor_banking_info')
        .select('*'),
      
      // Availability config (via educator_id)
      supabase
        .from('tutor_availability_config')
        .select('*'),
      
      // Teaching preferences (via educator_id)
      supabase
        .from('tutor_teaching_preferences')
        .select('*'),
      
      // Personality traits (via educator_id)
      supabase
        .from('tutor_personality_traits')
        .select('*'),
      
      // Program mappings (via educator_id)
      supabase
        .from('tutor_program_mappings')
        .select('*'),
        
      // Additional subjects (for CSV imported program names)
      supabase
        .from('tutor_additional_subjects')
        .select('*'),
      
      // Documents
      supabase
        .from('document_storage')
        .select('*')
        .in('user_id', userIds),
      
      // Master Data - Provinces
      supabase
        .from('location_province')
        .select('id, region_name'),
      
      // Master Data - Cities  
      supabase
        .from('location_cities')
        .select('id, city_name'),
        
      // Master Data - Programs
      supabase
        .from('programs_unit')
        .select('id, program_name_local, program_name')
    ]);

    // Create lookup maps for efficient data joining
    const profilesMap = new Map(profilesResult.data?.map(p => [p.user_id, p]) || []);
    const demographicsMap = new Map(demographicsResult.data?.map(d => [d.user_id, d]) || []);
    const addressesMap = new Map();
    
    // Group addresses by user_id and type
    addressesResult.data?.forEach(addr => {
      if (!addressesMap.has(addr.user_id)) {
        addressesMap.set(addr.user_id, {});
      }
      addressesMap.get(addr.user_id)[addr.address_type] = addr;
    });

    const tutorDetailsMap = new Map(tutorDetailsResult.data?.map(td => [td.user_id, td]) || []);
    const managementMap = new Map(managementResult.data?.map(tm => [tm.user_id, tm]) || []);
    
    // Create tutor_id to user_id mapping
    const tutorIdToUserIdMap = new Map();
    tutorDetailsResult.data?.forEach(td => {
      tutorIdToUserIdMap.set(td.id, td.user_id);
    });

    // Create operations status map
    const operationsStatusMap = new Map();
    operationsStatusResult.data?.forEach(ops => {
      const userId = tutorIdToUserIdMap.get(ops.tutor_id);
      if (userId) {
        operationsStatusMap.set(userId, ops);
      }
    });

    // Create registration status map
    const registrationStatusMap = new Map();
    registrationStatusResult.data?.forEach(reg => {
      const userId = tutorIdToUserIdMap.get(reg.tutor_id);
      if (userId) {
        registrationStatusMap.set(userId, reg);
      }
    });

    console.log('📊 Status data loaded:', {
      operationsStatus: operationsStatusMap.size,
      registrationStatus: registrationStatusMap.size,
      sampleOperationsData: Array.from(operationsStatusMap.entries()).slice(0, 2),
      sampleRegistrationData: Array.from(registrationStatusMap.entries()).slice(0, 2)
    });

    const bankingMap = new Map(bankingResult.data?.map(b => [tutorIdToUserIdMap.get(b.tutor_id), b]) || []);
    // Debug tutor ID mapping first
    console.log('🔗 DEBUG tutor ID mapping:', {
      tutorDetailsCount: tutorDetailsResult.data?.length || 0,
      tutorIdToUserIdMapSize: tutorIdToUserIdMap.size,
      sampleTutorMapping: Array.from(tutorIdToUserIdMap.entries()).slice(0, 3)
    });
    
    const availabilityMap = new Map();
    availabilityResult.data?.forEach(a => {
      const userId = tutorIdToUserIdMap.get(a.tutor_id);
      console.log(`📅 Availability mapping: tutor_id ${a.tutor_id} → user_id ${userId}`, {
        availability_status: a.availability_status,
        hasUserMapping: !!userId
      });
      if (userId) {
        availabilityMap.set(userId, a);
      }
    });
    
    console.log('📅 DEBUG availability data:', {
      availabilityCount: availabilityResult.data?.length || 0,
      sampleData: availabilityResult.data?.slice(0, 3),
      mapSize: availabilityMap.size,
      mappedUserIds: Array.from(availabilityMap.keys()).slice(0, 5),
      userIds: userIds.slice(0, 5),
      availabilityError: availabilityResult.error
    });
    const preferencesMap = new Map(preferencesResult.data?.map(p => [tutorIdToUserIdMap.get(p.tutor_id), p]) || []);
    
    // 🔧 FIX: Create personality map with error handling
    const personalityMap = new Map();
    personalityResult.data?.forEach(p => {
      const userId = tutorIdToUserIdMap.get(p.tutor_id);
      if (userId) {
        personalityMap.set(userId, p);
      }
    });
    
    // Group program mappings by user_id
    const programMappingsMap = new Map();
    programMappingsResult.data?.forEach(pm => {
      const userId = tutorIdToUserIdMap.get(pm.tutor_id);
      if (userId) {
        if (!programMappingsMap.has(userId)) {
          programMappingsMap.set(userId, []);
        }
        programMappingsMap.get(userId).push(pm.program_id);
      }
    });
    
    // Group additional subjects by user_id
    const additionalSubjectsMap = new Map();
    additionalSubjectsResult.data?.forEach(sub => {
      const userId = tutorIdToUserIdMap.get(sub.tutor_id);
      if (userId) {
        if (!additionalSubjectsMap.has(userId)) {
          additionalSubjectsMap.set(userId, []);
        }
        additionalSubjectsMap.get(userId).push(sub.subject_name);
      }
    });

    // Group documents by user_id and type
    const documentsMap = new Map();
    documentsResult.data?.forEach(doc => {
      if (!documentsMap.has(doc.user_id)) {
        documentsMap.set(doc.user_id, {});
      }
      documentsMap.get(doc.user_id)[doc.document_type] = doc;
    });
    
    // Create master data lookup maps
    const provincesMap = new Map(provincesResult.data?.map(p => [p.id, p.region_name]) || []);
    const citiesMap = new Map(citiesResult.data?.map(c => [c.id, c.city_name]) || []);
    const programsMap = new Map(programsResult.data?.map(prog => [
      prog.id, 
      prog.program_name_local || prog.program_name
    ]) || []);
    
    console.log('🗺️ Master data loaded:', {
      provinces: provincesMap.size,
      cities: citiesMap.size,
      programs: programsMap.size,
      programMappings: programMappingsMap.size,
      additionalSubjects: additionalSubjectsMap.size
    });
    
    // Debug: Sample lookups
    if (provincesMap.size > 0) {
      console.log('📍 Sample province lookup:', Array.from(provincesMap.entries()).slice(0, 2));
    }
    if (citiesMap.size > 0) {
      console.log('🏙️ Sample city lookup:', Array.from(citiesMap.entries()).slice(0, 2));
    }
    if (programsMap.size > 0) {
      console.log('📚 Sample program lookup:', Array.from(programsMap.entries()).slice(0, 2));
    }

    // 🐛 DEBUG: Log document types found
    console.log('📄 Document types found in database:', 
      documentsResult.data?.map(d => d.document_type) || []
    );
    console.log('📊 Documents per user:', 
      Array.from(documentsMap.entries()).map(([userId, docs]) => ({
        userId: userId.substring(0, 8) + '...', 
        types: Object.keys(docs)
      }))
    );

    // Combine all data
    const completeTutorData: CompleteTutorData[] = usersData.map(user => {
      const profile = profilesMap.get(user.id);
      const demographics = demographicsMap.get(user.id);
      const addresses = addressesMap.get(user.id) || {};
      const tutorDetails = tutorDetailsMap.get(user.id);
      const management = managementMap.get(user.id);
      const operationsStatus = operationsStatusMap.get(user.id);
      const registrationStatus = registrationStatusMap.get(user.id);
      const banking = bankingMap.get(user.id);
      const availability = availabilityMap.get(user.id);
      const preferences = preferencesMap.get(user.id);
      const personality = personalityMap.get(user.id);
      const programMappings = programMappingsMap.get(user.id) || [];
      const documents = documentsMap.get(user.id) || {};

      const domicileAddr = addresses.domicile || {};
      const ktpAddr = addresses.identity || {};

      return {
        // System & Status
        id: user.id,
        trn: tutorDetails?.tutor_registration_number || user.user_code || '',
        brand: management?.entity_code || '',
        registration_current_status: registrationStatus?.current_status || 'pending',
        operations_current_status: operationsStatus?.operations_current_status || 'inactive',
        status_tutor: management?.status_tutor || 'unknown',
        approval_level: management?.approval_level || '',
        staff_notes: management?.staff_notes || '',
        
        // Personal Info  
        fotoProfil: profile?.profile_photo_url || documents.profile_photo?.file_url || null,
        namaLengkap: profile?.full_name || '',
        namaPanggilan: profile?.nick_name || '',
        tanggalLahir: profile?.date_of_birth || '',
        jenisKelamin: profile?.gender || '',
        agama: demographics?.religion || '',
        email: user.email || '',
        noHp1: profile?.mobile_phone || user.phone || '',
        noHp2: profile?.mobile_phone_2 || '',
        
        // Profile & Value Proposition
        headline: profile?.headline || '',
        deskripsiDiri: profile?.bio || '',
        motivasiMenjadiTutor: profile?.motivation_as_tutor || '',
        socialMedia1: profile?.social_media_1 || '',
        socialMedia2: profile?.social_media_2 || '',
        
        // Address - Domisili (with lookups to master tables)
        provinsiDomisili: provincesMap.get(domicileAddr.province_id) || domicileAddr.province_id || '',
        kotaKabupatenDomisili: citiesMap.get(domicileAddr.city_id) || domicileAddr.city_id || '',
        kecamatanDomisili: domicileAddr.district_name || '',
        kelurahanDomisili: domicileAddr.village_name || '',
        alamatLengkapDomisili: domicileAddr.street_address || '',
        kodePosDomisili: domicileAddr.postal_code || '',
        
        // Address - KTP (with lookups to master tables)
        alamatSamaDenganKTP: !ktpAddr.id, // If no KTP address, assume same as domicile
        provinsiKTP: provincesMap.get(ktpAddr.province_id) || ktpAddr.province_id || '',
        kotaKabupatenKTP: citiesMap.get(ktpAddr.city_id) || ktpAddr.city_id || '',
        kecamatanKTP: ktpAddr.district_name || '',
        kelurahanKTP: ktpAddr.village_name || '',
        alamatLengkapKTP: ktpAddr.street_address || '',
        kodePosKTP: ktpAddr.postal_code || '',
        
        // Banking
        namaNasabah: banking?.account_holder_name || '',
        nomorRekening: banking?.account_number || '',
        namaBank: banking?.bank_name || '',
        
        // ✅ FIXED: Education - Current Education (matches Edge Function corrected structure)
        statusAkademik: tutorDetails?.academic_status || '',
        namaUniversitas: tutorDetails?.current_university || '',        // ✅ FIXED: Use current_university
        fakultas: tutorDetails?.current_faculty || '',                  // ✅ FIXED: Use current_faculty
        jurusan: tutorDetails?.current_major || '',                     // ✅ FIXED: Use current_major
        jurusanSMKDetail: tutorDetails?.vocational_school_detail || '', // ✅ ALREADY CORRECT
        ipk: tutorDetails?.current_gpa || 0,                           // ✅ FIXED: Use current_gpa
        tahunMasuk: tutorDetails?.entry_year?.toString() || '',        // ✅ ALREADY CORRECT
        tahunLulus: tutorDetails?.current_graduation_year?.toString() || '', // ✅ FIXED: Use current_graduation_year
        namaSMA: tutorDetails?.high_school || '',                      // ✅ ALREADY CORRECT
        jurusanSMA: tutorDetails?.high_school_major || '',             // ✅ FIXED: Use high_school_major
        tahunLulusSMA: tutorDetails?.high_school_graduation_year?.toString() || '', // ✅ ALREADY CORRECT
        
        // Education Documents
        transkripNilai: documents.transcript_document?.file_url || null,
        sertifikatKeahlian: documents.skill_certificate?.file_url || null,
        
        // Education - Middle School

        
        // ✅ FIXED: Education - S1 Background (for S2/S3 students - use dedicated S1 columns)
        namaUniversitasS1: tutorDetails?.university_s1_name || '',  // ✅ FIXED: Use dedicated S1 column
        fakultasS1: tutorDetails?.faculty_s1 || '',                // ✅ FIXED: Use dedicated S1 column  
        jurusanS1: tutorDetails?.major_s1 || '',                   // ✅ FIXED: Use dedicated S1 column
        
        // ✅ FIXED: Education - Alternative Learning (use dedicated columns)
        namaInstitusi: tutorDetails?.alternative_institution_name || '',   // ✅ FIXED: Use dedicated alternative column
        bidangKeahlian: tutorDetails?.expertise_field || '',               // ✅ FIXED: Use dedicated alternative column
        pengalamanBelajar: tutorDetails?.learning_experience || '',        // ✅ FIXED: Use dedicated alternative column
        
        // Professional Profile
        keahlianSpesialisasi: tutorDetails?.special_skills || '',
        keahlianLainnya: tutorDetails?.other_skills || '',
        pengalamanMengajar: tutorDetails?.teaching_experience || '',
        pengalamanLainRelevan: tutorDetails?.other_relevant_experience || '',
        prestasiAkademik: tutorDetails?.academic_achievements || '',
        prestasiNonAkademik: tutorDetails?.non_academic_achievements || '',
        sertifikasiPelatihan: tutorDetails?.certifications_training || '',
        

        
        // Programs & Subjects (with lookups to program names + additional subjects)
        selectedPrograms: (() => {
          const programs = programMappings.map((programId: string) => 
            programsMap.get(programId) || programId
          );
          const additionalSubjects = additionalSubjectsMap.get(user.id) || [];
          const allPrograms = [...programs, ...additionalSubjects];
          
          console.log(`👤 User ${user.id} programs:`, {
            mappingIds: programMappings,
            resolvedNames: programs,
            additionalSubjects: additionalSubjects,
            totalPrograms: allPrograms.length
          });
          return allPrograms;
        })(),
        mataPelajaranLainnya: tutorDetails?.additional_subjects_description || '', // ✅ NEW FIELD: Simple descriptive text field for additional subjects
        
        // Availability - Map from database values to display values
        statusMenerimaSiswa: (() => {
          const status = availability?.availability_status;
          const result = (() => {
            switch (status) {
              case 'available': return 'available';
              case 'limited': return 'limited'; 
              case 'unavailable': return 'unavailable';
              case 'leave': return 'leave';
              default: 
                // If no availability data found, try to infer from other data
                // For newly imported users, default to available if they have tutor details
                if (tutorDetails && !availability) {
                  console.log(`📅 No availability data for user ${user.id}, defaulting to available for new import`);
                  return 'available';
                }
                return 'unavailable'; // fallback
            }
          })();
          
          console.log(`📅 User ${user.id} availability mapping:`, {
            hasAvailability: !!availability,
            availabilityObject: availability,
            rawStatus: status,
            mappedStatus: result,
            tutorId: tutorDetails?.id,
            availabilityInMap: availabilityMap.has(user.id),
            isNewImport: tutorDetails && !availability
          });
          
          return result;
        })(),
        available_schedule: availability?.available_schedule || [],
        teaching_methods: availability?.teaching_methods || [],
        hourly_rate: availability?.hourly_rate || 0,
        maksimalSiswaBaru: availability?.max_new_students_per_week || 0,
        maksimalTotalSiswa: availability?.max_total_students || 0,
        usiaTargetSiswa: availability?.target_student_ages || [],
        teaching_radius_km: availability?.teaching_radius_km || 0,
        alamatTitikLokasi: availability?.teaching_center_location || '',
        location_notes: availability?.location_notes || '',
        catatanAvailability: availability?.availability_notes || '',
        
        // Transportation & Location Coordinates
        transportasiTutor: Array.isArray(availability?.transportation_method) ? availability.transportation_method : (availability?.transportation_method ? [availability.transportation_method] : []),
        titikLokasiLat: availability?.teaching_center_lat || null,
        titikLokasiLng: availability?.teaching_center_lng || null,
        
        // DEBUG: Add raw availability data for troubleshooting
        _debug_availability_full: availability || {},
        _debug_schedule: {
          raw_availability_status: availability?.availability_status,
          raw_hourly_rate: availability?.hourly_rate,
          raw_max_new: availability?.max_new_students_per_week,
          raw_max_total: availability?.max_total_students,
          raw_radius: availability?.teaching_radius_km,
          has_availability: !!availability
        },
        
        // Teaching Preferences
        teachingMethods: preferences?.teaching_styles || [],
        studentLevelPreferences: preferences?.student_level_preferences || [],
        specialNeedsCapable: preferences?.special_needs_capability || '',
        groupClassWilling: preferences?.group_class_willingness || '',
        onlineTeachingCapable: preferences?.online_teaching_capability || '',
        techSavviness: preferences?.tech_savviness_level || '',
        gmeetExperience: preferences?.gmeet_experience_level || '',
        presensiUpdateCapability: preferences?.attendance_update_capability || '',
        
        // DEBUG: Add raw preferences data for troubleshooting
        _debug_preferences_full: preferences || {},
        _debug_group_class: {
          raw_value: preferences?.group_class_willingness,
          is_null: preferences?.group_class_willingness === null,
          is_empty: preferences?.group_class_willingness === '',
          type: typeof preferences?.group_class_willingness,
          has_preferences: !!preferences
        },
        
        // Personality - ✅ FIXED: Handle arrays properly
        tutorPersonalityType: (() => {
          const personalityType = personality?.personality_type;
          if (Array.isArray(personalityType)) {
            return personalityType;
          } else if (typeof personalityType === 'string' && personalityType) {
            // Handle string data from database (comma-separated or JSON)
            try {
              return personalityType.startsWith('[') ? JSON.parse(personalityType) : personalityType.split(',').map(s => s.trim());
            } catch {
              return [personalityType];
            }
          }
          return [];
        })(),
        communicationStyle: (() => {
          const commStyle = personality?.communication_style;
          if (Array.isArray(commStyle)) {
            return commStyle;
          } else if (typeof commStyle === 'string' && commStyle) {
            // Handle string data from database (comma-separated or JSON)
            try {
              return commStyle.startsWith('[') ? JSON.parse(commStyle) : commStyle.split(',').map(s => s.trim());
            } catch {
              return [commStyle];
            }
          }
          return [];
        })(),
        teachingPatienceLevel: personality?.teaching_patience_level?.toString() || '',
        studentMotivationAbility: personality?.student_motivation_ability?.toString() || '',
        scheduleFlexibilityLevel: personality?.schedule_flexibility_level?.toString() || '',
        
        // Emergency Contact
        emergencyContactName: profile?.emergency_contact_name || '',
        emergencyContactRelationship: profile?.emergency_contact_relationship || '',
        emergencyContactPhone: profile?.emergency_contact_phone || '',
        preferredCommunicationTime: '', // Need to add this field if needed
        communicationLanguagePreference: profile?.languages_mastered || [],
        
        // Documents
        dokumenIdentitas: documents.identity_document?.file_url || null,
        dokumenPendidikan: documents.education_document?.file_url || null,
        dokumenSertifikat: documents.certificate_document?.file_url || null,
        
        // ✅ ADDED: Document Preview Fields (currently null - could be implemented later)
        fotoProfilPreview: null, // Preview fields are for form UI, not stored in database
        dokumenIdentitasPreview: null,
        dokumenPendidikanPreview: null,
        dokumenSertifikatPreview: null,
        
        // Document Verification
        status_verifikasi_identitas: management?.identity_verification_status || '',
        status_verifikasi_pendidikan: management?.education_verification_status || '',
        
        // System Management
        additionalScreening: management?.additional_screening || [],
        
        // Timestamps
        created_at: user.created_at,
        updated_at: user.updated_at
      };
    });

    // 🔄 Convert Supabase Storage URLs to Cloudflare R2 URLs
    const convertedTutorData = completeTutorData.map(tutor => convertTutorFileUrls(tutor));
    console.log(`✅ Successfully processed ${convertedTutorData.length} complete tutor records with URL conversion`);

    // 🚀 COLUMN FILTERING: Apply filters if provided
    let filteredData = convertedTutorData;
    const originalCount = convertedTutorData.length;
    
    // Client-side filters are now only for columns not handled on the server
    const clientSideFilters = { ...columnFilters };
    Object.keys(relatedFilters).forEach(f => delete clientSideFilters[f]);

    if (Object.keys(clientSideFilters).length > 0) {
      filteredData = convertedTutorData.filter(tutor => {
        return Object.entries(clientSideFilters).every(([column, values]) => {
          if (values.length === 0) return true; // No filter applied
          
          const tutorValue = tutor[column as keyof CompleteTutorData];
          
          // Handle different data types
          if (Array.isArray(tutorValue)) {
            // For array fields, check if any filter value matches any array element
            return values.some(filterValue => 
              tutorValue.some(arrayItem => 
                String(arrayItem).toLowerCase().includes(filterValue.toLowerCase())
              )
            );
          } else if (tutorValue !== null && tutorValue !== undefined) {
            // For single values, check if the value matches any of the filter values
            const stringValue = String(tutorValue).toLowerCase();
            return values.some(filterValue => 
              stringValue.includes(filterValue.toLowerCase())
            );
          }
          
          return false; // Null/undefined values don't match any filter
        });
      });
      
      console.log(`🔍 Client-side filtering applied: ${originalCount} → ${filteredData.length} records`);
    }

    return {
      data: filteredData,
      error: null,
      total: totalCount || 0, // Keep original total for pagination calculations
      filtered: filteredData.length // Add filtered count
    };

  } catch (error) {
    console.error('❌ Error in fetchAllTutorData:', error);
    return {
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      total: 0
    };
  }
}


// GET endpoint - fetch all tutors for spreadsheet
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 🚀 PERFORMANCE FIX: Reasonable pagination defaults
    const limit = Math.min(parseInt(searchParams.get('limit') || '25'), 100); // Max 100 per page
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const offset = (page - 1) * limit;
    const search = searchParams.get('search')?.trim() || '';
    
    // 🚀 COLUMN FILTERS: Parse column filters from URL
    const columnFilters: Record<string, string[]> = {};
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith('filter_')) {
        const columnName = key.replace('filter_', '');
        columnFilters[columnName] = value.split(',').filter(v => v.trim() !== '');
      }
    }

    console.log(`🔍 API: Page ${page}, limit=${limit}, search="${search}", filters:`, Object.keys(columnFilters).length > 0 ? columnFilters : 'none');

    // 🚀 PERFORMANCE FIX: Pass search and filters to database level
    const result = await fetchAllTutorData(limit, offset, search, columnFilters);

    if (result.error) {
      return NextResponse.json({
        success: false,
        error: result.error,
        data: [],
        total: 0,
        page: page,
        limit: limit,
        totalPages: 0
      }, { status: 500 });
    }

    const totalPages = Math.ceil(result.total / limit);

    const response = NextResponse.json({
      success: true,
      data: result.data,
      total: result.total,
      filtered: result.filtered || result.data.length,
      page: page,
      limit: limit,
      totalPages: totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      hasActiveFilters: Object.keys(columnFilters).length > 0,
      activeFilters: Object.keys(columnFilters).length > 0 ? columnFilters : undefined,
      message: `Page ${page}/${totalPages}: ${result.data.length} tutors loaded efficiently${Object.keys(columnFilters).length > 0 ? ' (filtered)' : ''}`,
      timestamp: Date.now() // Add timestamp to response
    });

    // Set aggressive no-cache headers for Vercel Edge
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    response.headers.set('CDN-Cache-Control', 'no-store');
    response.headers.set('Vercel-CDN-Cache-Control', 'no-store');
    response.headers.set('X-No-Cache', 'true');
    response.headers.set('X-Timestamp', Date.now().toString());
    response.headers.set('X-Accel-Expires', '0');
    
    return response;

  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      data: [],
      total: 0,
      page: 1,
      limit: 25,
      totalPages: 0
    }, { status: 500 });
  }
}