import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Complete Tutor Interface matching form fields
interface CompleteTutorData {
  // System & Status
  id: string;
  trn: string;
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
  bahasaYangDikuasai: string[];
  
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
  
  // Education
  statusAkademik: string;
  namaUniversitas: string;
  fakultas: string;
  jurusan: string;
  akreditasiJurusan: string;
  ipk: number;
  tahunMasuk: string;
  tahunLulus: string;
  namaSMA: string;
  jurusanSMA: string;
  tahunLulusSMA: string;
  
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
  
  // Teaching Preferences
  teachingMethods: string[];
  studentLevelPreferences: string[];
  specialNeedsCapable: string;
  groupClassWilling: string;
  onlineTeachingCapable: string;
  techSavviness: string;
  gmeetExperience: string;
  presensiUpdateCapability: string;
  
  // Personality
  tutorPersonalityType: string;
  communicationStyle: string;
  teachingPatienceLevel: string;
  studentMotivationAbility: string;
  scheduleFlexibilityLevel: string;
  
  // Emergency Contact
  whatsappNumber: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
  preferredCommunicationTime: string;
  communicationLanguagePreference: string[];
  
  // Documents
  dokumenIdentitas: string | null;
  dokumenPendidikan: string | null;
  dokumenSertifikat: string | null;
  
  // Document Verification
  status_verifikasi_identitas: string;
  status_verifikasi_pendidikan: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// Fetch all tutor data from Supabase
async function fetchAllTutorData(limit = 1000, offset = 0): Promise<{data: CompleteTutorData[], error: string | null, total: number}> {
  if (!supabase) {
    return { data: [], error: 'Supabase not configured', total: 0 };
  }

  try {
    console.log('🔍 Fetching all tutor data from Supabase...');

    // First get all roles that match tutor/educator
    const { data: roleData, error: roleError } = await supabase
      .from('t_340_01_01_roles')
      .select('id')
      .or('role_name.ilike.%tutor%,role_name.ilike.%educator%');
    
    if (roleError) {
      console.error('❌ Error fetching roles:', roleError);
      return { data: [], error: roleError.message, total: 0 };
    }

    const roleIds = roleData?.map(role => role.id) || [];
    
    if (roleIds.length === 0) {
      console.log('⚠️ No tutor/educator roles found');
      return { data: [], error: null, total: 0 };
    }

    // Main query: fetch users with matching role IDs
    const { data: usersData, error: usersError, count: totalCount } = await supabase
      .from('t_310_01_01_users_universal')
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
        t_340_01_01_roles!inner(role_name, role_code)
      `, { count: 'exact' })
      .in('primary_role_id', roleIds)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return { data: [], error: usersError.message, total: 0 };
    }

    if (!usersData || usersData.length === 0) {
      console.log('⚠️ No tutor users found');
      return { data: [], error: null, total: 0 };
    }

    console.log(`✅ Found ${usersData.length} tutor users`);

    // Extract user IDs for related data queries
    const userIds = usersData.map(user => user.id);

    // Parallel fetch all related data
    const [
      profilesResult,
      demographicsResult,
      addressesResult,
      educatorDetailsResult,
      managementResult,
      bankingResult,
      availabilityResult,
      preferencesResult,
      personalityResult,
      programMappingsResult,
      documentsResult,
      provincesResult,
      citiesResult,
      programsResult
    ] = await Promise.all([
      // User profiles
      supabase
        .from('t_310_01_02_user_profiles')
        .select('*')
        .in('user_id', userIds),
      
      // Demographics
      supabase
        .from('t_380_01_01_user_demographics')
        .select('*')
        .in('user_id', userIds),
      
      // Addresses
      supabase
        .from('t_310_01_03_user_addresses')
        .select('*')
        .in('user_id', userIds),
      
      // Educator details
      supabase
        .from('t_315_01_01_educator_details')
        .select('*')
        .in('user_id', userIds),
      
      // Tutor management
      supabase
        .from('t_315_02_01_tutor_management')
        .select('*')
        .in('user_id', userIds),
      
      // Banking info (via educator_id)
      supabase
        .from('t_460_02_04_educator_banking_info')
        .select('*'),
      
      // Availability config (via educator_id)
      supabase
        .from('t_315_03_01_tutor_availability_config')
        .select('*'),
      
      // Teaching preferences (via educator_id)
      supabase
        .from('t_315_04_01_tutor_teaching_preferences')
        .select('*'),
      
      // Personality traits (via educator_id)
      supabase
        .from('t_315_05_01_tutor_personality_traits')
        .select('*'),
      
      // Program mappings (via educator_id)
      supabase
        .from('t_315_06_01_tutor_program_mappings')
        .select('*'),
      
      // Documents
      supabase
        .from('t_460_03_01_document_storage')
        .select('*')
        .in('user_id', userIds),
      
      // Master Data - Provinces
      supabase
        .from('t_120_01_02_province')
        .select('id, region_name'),
      
      // Master Data - Cities  
      supabase
        .from('t_120_01_03_cities')
        .select('id, city_name'),
        
      // Master Data - Programs
      supabase
        .from('t_210_02_02_programs_catalog')
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

    const educatorDetailsMap = new Map(educatorDetailsResult.data?.map(ed => [ed.user_id, ed]) || []);
    const managementMap = new Map(managementResult.data?.map(tm => [tm.user_id, tm]) || []);
    
    // Create educator_id to user_id mapping
    const educatorIdToUserIdMap = new Map();
    educatorDetailsResult.data?.forEach(ed => {
      educatorIdToUserIdMap.set(ed.id, ed.user_id);
    });

    const bankingMap = new Map(bankingResult.data?.map(b => [educatorIdToUserIdMap.get(b.educator_id), b]) || []);
    const availabilityMap = new Map(availabilityResult.data?.map(a => [educatorIdToUserIdMap.get(a.educator_id), a]) || []);
    const preferencesMap = new Map(preferencesResult.data?.map(p => [educatorIdToUserIdMap.get(p.educator_id), p]) || []);
    const personalityMap = new Map(personalityResult.data?.map(p => [educatorIdToUserIdMap.get(p.educator_id), p]) || []);
    
    // Group program mappings by user_id
    const programMappingsMap = new Map();
    programMappingsResult.data?.forEach(pm => {
      const userId = educatorIdToUserIdMap.get(pm.educator_id);
      if (userId) {
        if (!programMappingsMap.has(userId)) {
          programMappingsMap.set(userId, []);
        }
        programMappingsMap.get(userId).push(pm.program_id);
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
      programs: programsMap.size
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
      const educatorDetails = educatorDetailsMap.get(user.id);
      const management = managementMap.get(user.id);
      const banking = bankingMap.get(user.id);
      const availability = availabilityMap.get(user.id);
      const preferences = preferencesMap.get(user.id);
      const personality = personalityMap.get(user.id);
      const programMappings = programMappingsMap.get(user.id) || [];
      const documents = documentsMap.get(user.id) || {};

      const domicileAddr = addresses.domicile || {};
      const ktpAddr = addresses.ktp || {};

      return {
        // System & Status
        id: user.id,
        trn: educatorDetails?.educator_registration_number || user.user_code || '',
        status_tutor: management?.status_tutor || '',
        approval_level: management?.approval_level || '',
        staff_notes: management?.staff_notes || '',
        
        // Personal Info
        fotoProfil: documents.profile_photo?.file_url || null,
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
        bahasaYangDikuasai: profile?.languages_mastered || [],
        
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
        
        // Education
        statusAkademik: educatorDetails?.academic_status || '',
        namaUniversitas: educatorDetails?.university_s1_name || '',
        fakultas: educatorDetails?.faculty || '',
        jurusan: educatorDetails?.major_s1 || '',
        akreditasiJurusan: '', // Need to add this field to DB if needed
        ipk: profile?.gpa || 0,
        tahunMasuk: educatorDetails?.entry_year?.toString() || '',
        tahunLulus: profile?.graduation_year?.toString() || '',
        namaSMA: educatorDetails?.high_school || '',
        jurusanSMA: '', // Need to extract from education_history if needed
        tahunLulusSMA: educatorDetails?.high_school_graduation_year?.toString() || '',
        
        // Professional Profile
        keahlianSpesialisasi: educatorDetails?.special_skills || '',
        keahlianLainnya: educatorDetails?.other_skills || '',
        pengalamanMengajar: educatorDetails?.teaching_experience || '',
        pengalamanLainRelevan: educatorDetails?.other_experience || '',
        prestasiAkademik: educatorDetails?.academic_achievements || '',
        prestasiNonAkademik: educatorDetails?.non_academic_achievements || '',
        sertifikasiPelatihan: educatorDetails?.certifications_training || '',
        
        // Programs & Subjects (with lookups to program names)
        selectedPrograms: programMappings.map((programId: string) => 
          programsMap.get(programId) || programId
        ),
        mataPelajaranLainnya: '', // This would be in notes or additional field
        
        // Availability
        statusMenerimaSiswa: availability?.availability_status || '',
        available_schedule: availability?.available_schedule || [],
        teaching_methods: availability?.teaching_methods || [],
        hourly_rate: availability?.hourly_rate || 0,
        maksimalSiswaBaru: availability?.max_new_students_per_week || 0,
        maksimalTotalSiswa: availability?.max_total_students || 0,
        usiaTargetSiswa: availability?.target_student_ages || [],
        teaching_radius_km: availability?.teaching_radius_km || 0,
        alamatTitikLokasi: availability?.teaching_center_location || '',
        location_notes: availability?.location_notes || '',
        
        // Teaching Preferences
        teachingMethods: preferences?.teaching_styles || [],
        studentLevelPreferences: preferences?.student_level_preferences || [],
        specialNeedsCapable: preferences?.special_needs_capability || '',
        groupClassWilling: preferences?.group_class_willingness || '',
        onlineTeachingCapable: preferences?.online_teaching_capability || '',
        techSavviness: preferences?.tech_savviness_level || '',
        gmeetExperience: preferences?.gmeet_experience_level || '',
        presensiUpdateCapability: preferences?.attendance_update_capability || '',
        
        // Personality
        tutorPersonalityType: personality?.personality_type || '',
        communicationStyle: personality?.communication_style || '',
        teachingPatienceLevel: personality?.teaching_patience_level?.toString() || '',
        studentMotivationAbility: personality?.student_motivation_ability?.toString() || '',
        scheduleFlexibilityLevel: personality?.schedule_flexibility_level?.toString() || '',
        
        // Emergency Contact
        whatsappNumber: profile?.whatsapp_number || profile?.mobile_phone || '',
        emergencyContactName: profile?.emergency_contact_name || '',
        emergencyContactRelationship: profile?.emergency_contact_relationship || '',
        emergencyContactPhone: profile?.emergency_contact_phone || '',
        preferredCommunicationTime: '', // Need to add this field if needed
        communicationLanguagePreference: profile?.languages_mastered || [],
        
        // Documents
        dokumenIdentitas: documents.identity_document?.file_url || null,
        dokumenPendidikan: documents.education_document?.file_url || null,
        dokumenSertifikat: documents.certificate_document?.file_url || null,
        
        // Document Verification
        status_verifikasi_identitas: management?.identity_verification_status || '',
        status_verifikasi_pendidikan: management?.education_verification_status || '',
        
        // Timestamps
        created_at: user.created_at,
        updated_at: user.updated_at
      };
    });

    console.log(`✅ Successfully processed ${completeTutorData.length} complete tutor records`);

    return {
      data: completeTutorData,
      error: null,
      total: totalCount || 0
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
    const limit = parseInt(searchParams.get('limit') || '1000');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search') || '';

    console.log(`🔍 API: Fetching tutors with limit=${limit}, offset=${offset}, search="${search}"`);

    const result = await fetchAllTutorData(limit, offset);

    if (result.error) {
      return NextResponse.json({
        success: false,
        error: result.error,
        data: [],
        total: 0
      }, { status: 500 });
    }

    // Apply search filter if provided
    let filteredData = result.data;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredData = result.data.filter(tutor => 
        tutor.namaLengkap.toLowerCase().includes(searchLower) ||
        tutor.email.toLowerCase().includes(searchLower) ||
        tutor.trn.toLowerCase().includes(searchLower) ||
        tutor.noHp1.includes(search) ||
        tutor.selectedPrograms.some(program => program.toLowerCase().includes(searchLower))
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredData,
      total: result.total,
      filtered: filteredData.length,
      message: `Successfully fetched ${filteredData.length} tutors from database`
    });

  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      data: [],
      total: 0
    }, { status: 500 });
  }
}