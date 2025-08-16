import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { 
  findBestLocationMatches, 
  findBestBankMatches, 
  findBestSubjectMatches,
  type FieldMatch 
} from '@/lib/fuzzy-location-matcher';

// Supabase Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Load reference data for fuzzy matching
async function loadReferenceData() {
  if (!supabase) return { provinces: [], cities: [], banks: [], subjects: [] };
  
  try {
    console.log('🔄 Loading reference data for API fuzzy matching...');
    
    // Load provinces
    const { data: provincesData } = await supabase
      .from('location_province')
      .select('id, region_name, region_local_name')
      .eq('admin_level', 1)
      .order('region_name');
    
    const provinces = (provincesData || []).map(p => ({
      id: p.id,
      name: p.region_name,
      local_name: p.region_local_name
    }));
    
    // Load cities
    const { data: citiesData, error: citiesError } = await supabase
      .from('location_cities')
      .select('id, region_name, region_local_name, province_id')
      .eq('admin_level', 2)
      .order('region_name');
    
    if (citiesError) {
      console.error('❌ Failed to load cities:', citiesError);
    }
    
    const cities = (citiesData || []).map(c => ({
      id: c.id,
      name: c.region_name,
      local_name: c.region_local_name,
      province_id: c.province_id
    }));
    
    // Load banks
    const { data: banksData } = await supabase
      .from('finance_banks_indonesia')
      .select('id, bank_name, popular_bank_name')
      .eq('is_active', true)
      .order('popular_bank_name');
    
    const banks = (banksData || []).map(b => ({
      id: b.id,
      name: b.popular_bank_name,
      local_name: b.popular_bank_name,
      alternate_name: b.bank_name
    }));
    
    // Load subjects/programs
    const { data: subjectsData, error: subjectsError } = await supabase
      .from('programs_unit')
      .select('id, program_name, program_name_local')
      .eq('is_active', true)
      .order('program_name');
    
    if (subjectsError) {
      console.error('❌ Failed to load subjects:', subjectsError);
    }
    
    const subjects = (subjectsData || []).map(s => ({
      id: s.id,
      name: s.program_name_local || s.program_name,
      local_name: s.program_name_local,
      alternate_name: s.program_name
    }));
    
    console.log('✅ Reference data loaded for API:', {
      provinces: provinces.length,
      cities: cities.length,
      banks: banks.length,
      subjects: subjects.length
    });
    
    return { provinces, cities, banks, subjects };
    
  } catch (error: any) {
    console.error('❌ Failed to load reference data for API:', error);
    return { provinces: [], cities: [], banks: [], subjects: [] };
  }
}

// Resolve field using fuzzy matching
function resolveFieldWithFuzzy(
  inputValue: string, 
  fieldType: 'province' | 'city' | 'bank' | 'subject',
  referenceData: any[],
  additionalFilter?: (item: any) => boolean
): { id: string | null, matched: string | null, confidence: number } {
  
  if (!inputValue || !referenceData.length) {
    return { id: null, matched: null, confidence: 0 };
  }
  
  // Apply additional filter if provided (e.g., filter cities by province)
  const dataToSearch = additionalFilter ? referenceData.filter(additionalFilter) : referenceData;
  
  let matches: FieldMatch[] = [];
  
  switch (fieldType) {
    case 'province':
    case 'city':
      matches = findBestLocationMatches(inputValue, dataToSearch, fieldType === 'province' ? 'provinces' : 'cities');
      break;
    case 'bank':
      matches = findBestBankMatches(inputValue, dataToSearch);
      break;
    case 'subject':
      matches = findBestSubjectMatches(inputValue, dataToSearch);
      break;
  }
  
  if (matches.length > 0) {
    const bestMatch = matches[0];
    console.log(`✅ ${fieldType} fuzzy matched: "${inputValue}" → "${bestMatch.name}" (${bestMatch.similarity}%)`);
    return {
      id: bestMatch.id,
      matched: bestMatch.name,
      confidence: bestMatch.similarity || 0
    };
  }
  
  console.log(`❌ ${fieldType} not matched: "${inputValue}"`);
  return { id: null, matched: null, confidence: 0 };
}

export async function POST(request: NextRequest) {
  console.log('🔥 API Called: /api/tutors/bulk-import');
  
  if (!supabase) {
    return NextResponse.json(
      { success: false, message: 'Database connection not available' },
      { status: 500 }
    );
  }
  
  try {
    // Parse request body
    const body = await request.json();
    console.log('📦 Request body:', { 
      hasRecords: !!body.records, 
      recordsLength: body.records?.length,
      source: body.source 
    });
    
    const { records, source, totalRecords } = body;

    if (!records || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No records provided for import' },
        { status: 400 }
      );
    }

    console.log(`🚀 Bulk import started: ${records.length} records from ${source}`);

    // Load reference data for fuzzy matching
    const referenceData = await loadReferenceData();

    let successCount = 0;
    let errorCount = 0;
    const errors: Array<{ row: number; message: string }> = [];

    // Process each record
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const rowNumber = i + 1;
      
      try {
        console.log(`📝 Processing record ${rowNumber}:`, {
          keys: Object.keys(record),
          hasNamaLengkap: !!record['Nama Lengkap'],
          hasEmail: !!record['Email Aktif'],
          hasUserCode: !!record['User Code']
        });
        
        // Generate truly unique user_code and email for each record
        let uniqueId = crypto.randomUUID().replace(/-/g, '').slice(0, 8);
        let userCode = record['User Code'] || record['user_code'] || `TUT${uniqueId}${i.toString().padStart(2, '0')}`;
        let uniqueEmail = record['Email Aktif'] || record['email'] || `${userCode.toLowerCase()}@imported.tutor`;
        
        // If email or user_code from CSV exists, generate truly unique ones
        let { data: existingUser } = await supabase
          .from('users_universal')
          .select('email, user_code')
          .or(`email.eq.${uniqueEmail},user_code.eq.${userCode}`)
          .single();
          
        // Keep generating unique values until we find ones that don't exist
        let attempts = 0;
        while (existingUser && attempts < 10) {
          attempts++;
          uniqueId = crypto.randomUUID().replace(/-/g, '').slice(0, 8);
          userCode = `TUT${uniqueId}${i.toString().padStart(2, '0')}${attempts}`;
          uniqueEmail = `${userCode.toLowerCase()}@imported.tutor`;
          
          const { data: checkUser } = await supabase
            .from('users_universal')
            .select('email, user_code')
            .or(`email.eq.${uniqueEmail},user_code.eq.${userCode}`)
            .single();
            
          existingUser = checkUser;
        }
        
        if (existingUser && attempts >= 10) {
          console.error(`❌ Could not generate unique credentials after ${attempts} attempts for row ${rowNumber}`);
          errors.push({ 
            row: rowNumber, 
            message: `Failed to generate unique email/user_code after ${attempts} attempts` 
          });
          errorCount++;
          continue;
        }
        
        // Helper untuk normalisasi nomor HP
        function normalizePhone(phone: any) {
          if (!phone) return '';
          return String(phone).replace(/[^0-9]/g, '');
        }
        // Prepare user data for users_universal table
        const userData = {
          user_code: userCode,
          email: uniqueEmail,
          phone: normalizePhone(record['No. HP (WhatsApp)'] || record['phone'] || `08${uniqueId}`),
          account_type: 'tutor',
          user_status: 'active',
          password_hash: '$2a$10$defaulthash.for.imported.users.only', // Default hash for imported users
          email_verified: false,
          phone_verified: false,
          two_factor_enabled: false,
          login_count: 0,
          failed_login_attempts: 0,
          marketing_consent: false
        };

        console.log(`📝 Prepared user data for ${rowNumber}:`, userData);

        // Insert into users_universal
        const { data: userResult, error: userError } = await supabase
          .from('users_universal')
          .insert(userData)
          .select('id')
          .single();

        if (userError) {
          console.error(`❌ Error inserting user ${rowNumber}:`, userError);
          errors.push({ row: rowNumber, message: `Failed to create user: ${userError.message}` });
          errorCount++;
          continue;
        }

        const userId = userResult?.id;
        if (!userId) {
          console.error(`❌ User ID is undefined for record ${rowNumber}`);
          errors.push({ row: rowNumber, message: 'Failed to get user ID after creation' });
          errorCount++;
          continue;
        }
        console.log(`✅ Created user ${rowNumber} with ID: ${userId}`);

        // Assign tutor role to the user so they appear in /view-all
        console.log(`📝 Assigning tutor role to user ${userId}...`);
        
        // Get the tutor role ID (Database Tutor or similar)
        const { data: tutorRole, error: roleError } = await supabase
          .from('user_roles')
          .select('id')
          .or('role_name.ilike.%tutor%,role_name.ilike.%Tutor%,role_name.ilike.%educator%,role_name.ilike.%Educator%,role_code.eq.database_tutor_manager')
          .limit(1)
          .single();

        if (tutorRole && !roleError) {
          // Update user with primary_role_id
          const { error: roleUpdateError } = await supabase
            .from('users_universal')
            .update({ 
              primary_role_id: tutorRole.id,
              account_type: 'tutor'
            })
            .eq('id', userId);

          if (roleUpdateError) {
            console.warn(`⚠️ Warning: Could not assign role to user ${userId}:`, roleUpdateError);
          } else {
            console.log(`✅ Assigned tutor role to user ${userId}`);
          }
        } else {
          console.warn(`⚠️ Warning: Could not find tutor role:`, roleError);
        }

        // Insert demographics data (agama/religion) if provided
        if (record['Agama']) {
          const demographicsData = {
            user_id: userId,
            religion: record['Agama'],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          const { error: demoError } = await supabase
            .from('user_demographics')
            .insert(demographicsData);

          if (demoError) {
            console.warn(`⚠️ Warning: Could not create demographics record for ${rowNumber}:`, demoError);
          } else {
            console.log(`✅ Created demographics for record ${rowNumber}`);
          }
        }

        // === BULK MAPPING UNTUK FIELD YANG SUDAH ADA ===
        // User Profile
        const profileData = {
          user_id: userId,
          full_name: record['Nama Lengkap'] || '',
          nick_name: record['Nama Panggilan'] || '',
          date_of_birth: record['Tanggal Lahir'] || null,
          gender: record['Jenis Kelamin'] || null,
          headline: record['Headline/Tagline Tutor'] || '',
          bio: record['Deskripsi Diri/Bio Tutor'] || '',
          social_media_1: record['Link Media Sosial 1 (Opsional)'] || '',
          social_media_2: record['Link Media Sosial 2 (Opsional)'] || '',
          mobile_phone: normalizePhone(record['No. HP (WhatsApp)'] || ''),
          mobile_phone_2: normalizePhone(record['No. HP Alternatif (Opsional)'] || ''),
          motivation_as_tutor: record['Motivasi Menjadi Tutor'] || '',
        };

        console.log(`📝 Prepared profile data for ${rowNumber}:`, profileData);

        // Insert into user_profiles
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert(profileData);

        if (profileError) {
          console.error(`❌ Error inserting user profile ${rowNumber}:`, profileError);
          console.error(`❌ Full profile error details:`, JSON.stringify(profileError, null, 2));
          errors.push({ row: rowNumber, message: `Failed to create user profile: ${profileError.message || 'Unknown database error'}` });
          errorCount++;
          continue;
        }

        // Prepare tutor details with minimal fields to avoid trigger issues
        const tutorDetailsData = {
          user_id: userId,
          teaching_experience: record['Pengalaman Mengajar'] || null,
          special_skills: record['Keahlian Spesialisasi'] || null,
          onboarding_status: 'pending',
          background_check_status: 'pending',
          high_school: record['Nama SMA'] || null,
          high_school_major: record['Jurusan SMA'] || null,
          vocational_school_detail: record['Jurusan SMK Detail'] || null,
          alternative_institution_name: record['Nama Institusi (Alternative)'] || null,
        };

        console.log(`📝 Prepared tutor details data for ${rowNumber}:`, tutorDetailsData);

        // === FUZZY MATCHING RESOLUTION ===
        console.log(`🔍 Resolving fields with fuzzy matching for record ${rowNumber}...`);
        
        // Resolve province using fuzzy matching - UPDATE untuk Testing2.csv
        let resolvedProvinceId = null;
        let resolvedProvinceName = null;
        if (record['Provinsi'] || record['provinsiDomisili_matched']) {
          const provinceInput = record['provinsiDomisili_matched'] || record['Provinsi'];
          const provinceResult = resolveFieldWithFuzzy(provinceInput, 'province', referenceData.provinces);
          resolvedProvinceId = provinceResult.id;
          resolvedProvinceName = provinceResult.matched;
        }
        
        // Resolve city using fuzzy matching (filter by province if available) - UPDATE untuk Testing2.csv
        let resolvedCityId = null;
        let resolvedCityName = null;
        if (record['Kota/Kabupaten'] || record['kotaKabupatenDomisili_matched']) {
          const cityInput = record['kotaKabupatenDomisili_matched'] || record['Kota/Kabupaten'];
          const cityResult = resolveFieldWithFuzzy(
            cityInput, 
            'city', 
            referenceData.cities,
            resolvedProvinceId ? (city: any) => city.province_id === resolvedProvinceId : undefined
          );
          resolvedCityId = cityResult.id;
          resolvedCityName = cityResult.matched;
        }
        
        // Resolve bank using fuzzy matching
        let resolvedBankId = null;
        let resolvedBankName = null;
        if (record['Nama Bank'] || record['namaBank_matched']) {
          const bankInput = record['namaBank_matched'] || record['Nama Bank'];
          const bankResult = resolveFieldWithFuzzy(bankInput, 'bank', referenceData.banks);
          resolvedBankId = bankResult.id;
          resolvedBankName = bankResult.matched;
        }
        
        // Resolve programs using fuzzy matching
        let resolvedProgramIds: string[] = [];
        if (record['selectedPrograms'] && Array.isArray(record['selectedPrograms'])) {
          resolvedProgramIds = record['selectedPrograms'];
        } else if (record['Program yang Dipilih']) {
          const programsList = record['Program yang Dipilih'].split(/[,;]/).map((p: string) => p.trim()).filter((p: string) => p);
          for (const program of programsList) {
            const programResult = resolveFieldWithFuzzy(program, 'subject', referenceData.subjects);
            if (programResult.id) {
              resolvedProgramIds.push(programResult.id);
            }
          }
        }
        
        console.log(`✅ Fuzzy matching results for record ${rowNumber}:`, {
          province: resolvedProvinceName,
          city: resolvedCityName,
          bank: resolvedBankName,
          programs: resolvedProgramIds.length
        });

        // Add debug logging for address data - UPDATE untuk Testing2.csv
        console.log(`🔍 Address data for record ${rowNumber}:`, {
          domicile: {
            provinsi: record['Provinsi'],
            kota: record['Kota/Kabupaten'],
            kecamatan: record['Kecamatan'],
            kelurahan: record['Kelurahan/Desa'],
            alamat: record['Alamat Lengkap/Nama Jalan'],
            kodePos: record['Kode Pos']
          },
          ktp: {
            samaDenganDomisili: record['Alamat domisili saya sama dengan alamat di KTP/KK'],
            provinsi: record['Provinsi KTP/KK'],
            kota: record['Kota/Kabupaten KTP/KK'],
            kecamatan: record['Kecamatan KTP/KK'],
            kelurahan: record['Kelurahan/Desa KTP/KK'],
            alamat: record['Alamat Lengkap/Nama Jalan KTP/KK'],
            kodePos: record['Kode Pos KTP/KK']
          },
          resolved: {
            domicileProvinceId: resolvedProvinceId,
            domicileCityId: resolvedCityId
          }
        });

        // === IMPORT ALAMAT - UPDATE untuk Testing2.csv ===
        console.log(`📝 Creating address records for user ${userId}...`);
        
        // Create domicile address
        if (record['Provinsi'] || record['Kota/Kabupaten'] || record['Alamat Lengkap/Nama Jalan']) {
          const domicileAddressData = {
            user_id: userId,
            address_type: 'domicile',
            street_address: record['Alamat Lengkap/Nama Jalan'] || 'Alamat belum diisi',
            postal_code: record['Kode Pos'] || null,
            province_id: resolvedProvinceId,
            city_id: resolvedCityId,
            district_name: record['Kecamatan'] || null,
            village_name: record['Kelurahan/Desa'] || null,
            is_primary: true,
            is_verified: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          console.log(`🏠 Domicile address data for ${rowNumber}:`, domicileAddressData);

          const { error: domicileError } = await supabase
            .from('user_addresses')
            .insert(domicileAddressData);

          if (domicileError) {
            console.warn(`⚠️ Warning: Could not create domicile address for ${rowNumber}:`, domicileError);
          } else {
            console.log(`✅ Created domicile address for record ${rowNumber}`);
          }
        }

        // Create KTP address if different from domicile
        console.log(`🔍 Debug KTP check for record ${rowNumber}:`, {
          rawValue: record['Alamat domisili saya sama dengan alamat di KTP/KK'],
          valueType: typeof record['Alamat domisili saya sama dengan alamat di KTP/KK'],
          trimmedValue: String(record['Alamat domisili saya sama dengan alamat di KTP/KK']).trim(),
        });
        
        const alamatSamaDenganKTP = record['Alamat domisili saya sama dengan alamat di KTP/KK'] === 'TRUE' ||
                                    record['Alamat domisili saya sama dengan alamat di KTP/KK'] === true ||
                                    record['Alamat domisili saya sama dengan alamat di KTP/KK'] === 'true' ||
                                    String(record['Alamat domisili saya sama dengan alamat di KTP/KK']).trim().toUpperCase() === 'TRUE';
        
        console.log(`🔍 KTP check result for record ${rowNumber}: alamatSamaDenganKTP = ${alamatSamaDenganKTP}`);

        if (!alamatSamaDenganKTP && (
          record['Provinsi KTP/KK'] || 
          record['Kota/Kabupaten KTP/KK'] || 
          record['Alamat Lengkap/Nama Jalan KTP/KK']
        )) {
          // Resolve KTP province and city using fuzzy matching
          let resolvedKTPProvinceId = null;
          let resolvedKTPCityId = null;
          
          if (record['Provinsi KTP/KK']) {
            const ktpProvinceResult = resolveFieldWithFuzzy(record['Provinsi KTP/KK'], 'province', referenceData.provinces);
            resolvedKTPProvinceId = ktpProvinceResult.id;
          }
          
          if (record['Kota/Kabupaten KTP/KK']) {
            const ktpCityResult = resolveFieldWithFuzzy(
              record['Kota/Kabupaten KTP/KK'], 
              'city', 
              referenceData.cities,
              resolvedKTPProvinceId ? (city: any) => city.province_id === resolvedKTPProvinceId : undefined
            );
            resolvedKTPCityId = ktpCityResult.id;
          }

          const ktpAddressData = {
            user_id: userId,
            address_type: 'identity', // ✅ Corrected: use 'identity' instead of 'ktp'
            street_address: record['Alamat Lengkap/Nama Jalan KTP/KK'] || 'Alamat KTP belum diisi',
            postal_code: record['Kode Pos KTP/KK'] || null,
            province_id: resolvedKTPProvinceId,
            city_id: resolvedKTPCityId,
            district_name: record['Kecamatan KTP/KK'] || null,
            village_name: record['Kelurahan/Desa KTP/KK'] || null,
            is_primary: false,
            is_verified: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          console.log(`🆔 Identity/KTP address data for ${rowNumber}:`, ktpAddressData);

          const { error: ktpError } = await supabase
            .from('user_addresses')
            .insert(ktpAddressData);

          if (ktpError) {
            console.warn(`⚠️ Warning: Could not create identity address for ${rowNumber}:`, ktpError);
          } else {
            console.log(`✅ Created identity address for record ${rowNumber}`);
          }
        } else if (alamatSamaDenganKTP) {
          console.log(`ℹ️ KTP address same as domicile for record ${rowNumber} - no separate KTP record needed`);
        }

        // Try to update existing tutor_details or create via manual approach
        console.log(`📝 Attempting to store tutor details for ${rowNumber}...`);
        
        // First, check if tutor_details record already exists for this user
        const { data: existingTutorDetails, error: checkError } = await supabase
          .from('tutor_details')
          .select('id')
          .eq('user_id', userId)
          .single();

        if (existingTutorDetails && !checkError) {
          // Record exists, update it
          const { error: updateError } = await supabase
            .from('tutor_details')
            .update({
              teaching_experience: record['Pengalaman Mengajar'] || null,
              special_skills: record['Keahlian Spesialisasi'] || null,
              other_skills: record['Keahlian Lainnya'] || null,
              learning_experience: record['Deskripsi Diri'] || null,
              other_relevant_experience: record['Pengalaman Lain'] || null,
              academic_achievements: record['Prestasi Akademik'] || null,
              non_academic_achievements: record['Prestasi Non-Akademik'] || null,
              // Education data in tutor_details (moved from user_profiles)
              academic_status: record['Status Akademik'] || null,
              university_s1_name: record['Universitas S1 (untuk S2)'] || record['Nama Universitas S1'] || record['Nama Universitas'] || null,
              faculty_s1: record['Fakultas S1'] || null,
              major_s1: record['Jurusan S1'] || null,
              entry_year: record['Tahun Masuk'] ? parseInt(record['Tahun Masuk']) : null,
              // Additional education fields
              current_university: record['Universitas'] || record['Nama Universitas'] || record['Nama Universitas S1'] || null,
              current_faculty: record['Fakultas S1'] || null,
              current_major: record['Jurusan S1'] || record['Fakultas/Jurusan'] || null,
              current_graduation_year: record['Tahun Lulus'] ? parseInt(record['Tahun Lulus']) : null,
              current_gpa: record['IPK'] ? parseFloat(record['IPK']) : null,
              additional_subjects_description: record['Mata Pelajaran Lainnya (Jika Tidak Ditemukan)'] || null,
              high_school: record['Nama SMA'] || null,
              high_school_major: record['Jurusan SMA'] || null,
              high_school_graduation_year: record['Tahun Lulus SMA'] ? parseInt(record['Tahun Lulus SMA']) : null,
              vocational_school_detail: record['Jurusan SMK Detail'] || null,
              alternative_institution_name: record['Nama Institusi (Alternative)'] || null,
            })
            .eq('user_id', userId);

          if (updateError) {
            console.warn(`⚠️ Warning: Could not update tutor_details for ${rowNumber}:`, updateError && updateError.message ? updateError.message : JSON.stringify(updateError));
          } else {
            console.log(`✅ Updated existing tutor_details for record ${rowNumber}`);
          }
        } else {
          // Record doesn't exist, try to create minimal record first, then update
          console.log(`📝 Creating new tutor_details record for user ${userId}...`);
          
          try {
            // Create minimal record using SQL to bypass trigger
            const { error: createError } = await supabase.rpc('create_tutor_details_minimal', {
              p_user_id: userId
            });

            if (createError) {
              console.warn(`⚠️ Could not create tutor_details via RPC, trying direct approach:`, createError && createError.message ? createError.message : JSON.stringify(createError));
              
              // Fallback: try direct insert with minimal data
              const { error: directInsertError } = await supabase
                .from('tutor_details')
                .insert({ user_id: userId });
              
              if (directInsertError) {
                console.warn(`⚠️ Could not create tutor_details for ${rowNumber}:`, directInsertError);
              } else {
                // Successfully created, now update with data
                await supabase
                  .from('tutor_details')
                  .update({
                    teaching_experience: record['Pengalaman Mengajar'] || null,
                    special_skills: record['Keahlian Spesialisasi'] || null,
                    other_skills: record['Keahlian Lainnya'] || null,
                    learning_experience: record['Deskripsi Diri'] || null,
                    other_relevant_experience: record['Pengalaman Lain'] || null,
                    academic_achievements: record['Prestasi Akademik'] || null,
                    non_academic_achievements: record['Prestasi Non-Akademik'] || null,
                    // Education data in tutor_details (moved from user_profiles)
                    academic_status: record['Status Akademik'] || null,
                    university_s1_name: record['Universitas S1 (untuk S2)'] || record['Nama Universitas S1'] || record['Nama Universitas'] || null,
                    faculty_s1: record['Fakultas S1'] || null,
                    major_s1: record['Jurusan S1'] || null,
                    entry_year: record['Tahun Masuk'] ? parseInt(record['Tahun Masuk']) : null,
                    // Additional education fields
                    current_university: record['Universitas'] || record['Nama Universitas'] || record['Nama Universitas S1'] || null,
                    current_faculty: record['Fakultas S1'] || null,
                    current_major: record['Jurusan S1'] || record['Fakultas/Jurusan'] || null,
                    current_graduation_year: record['Tahun Lulus'] ? parseInt(record['Tahun Lulus']) : null,
                    current_gpa: record['IPK'] ? parseFloat(record['IPK']) : null,
                    additional_subjects_description: record['Mata Pelajaran Lainnya (Jika Tidak Ditemukan)'] || null,
                    high_school: record['Nama SMA'] || null,
                    high_school_major: record['Jurusan SMA'] || null,
                    high_school_graduation_year: record['Tahun Lulus SMA'] ? parseInt(record['Tahun Lulus SMA']) : null,
                    vocational_school_detail: record['Jurusan SMK Detail'] || null,
                    alternative_institution_name: record['Nama Institusi (Alternative)'] || null,
                  })
                  .eq('user_id', userId);
                
                console.log(`✅ Created and updated tutor_details for record ${rowNumber}`);
              }
            } else {
              // RPC succeeded, now update with data
              await supabase
                .from('tutor_details')
                .update({
                  teaching_experience: record['Pengalaman Mengajar'] || null,
                  special_skills: record['Keahlian Spesialisasi'] || null,
                  other_skills: record['Keahlian Lainnya'] || null,
                  learning_experience: record['Deskripsi Diri'] || null,
                  other_relevant_experience: record['Pengalaman Lain'] || null,
                  academic_achievements: record['Prestasi Akademik'] || null,
                  non_academic_achievements: record['Prestasi Non-Akademik'] || null,
                  // Education data in tutor_details (moved from user_profiles)
                  academic_status: record['Status Akademik'] || null,
                  university_s1_name: record['Universitas S1 (untuk S2)'] || record['Nama Universitas S1'] || record['Nama Universitas'] || null,
                  faculty_s1: record['Fakultas S1'] || null,
                  major_s1: record['Jurusan S1'] || null,
                  entry_year: record['Tahun Masuk'] ? parseInt(record['Tahun Masuk']) : null,
                  // Additional education fields
                  current_university: record['Universitas'] || record['Nama Universitas'] || record['Nama Universitas S1'] || null,
                  current_faculty: record['Fakultas S1'] || null,
                  current_major: record['Jurusan S1'] || record['Fakultas/Jurusan'] || null,
                  current_graduation_year: record['Tahun Lulus'] ? parseInt(record['Tahun Lulus']) : null,
                  current_gpa: record['IPK'] ? parseFloat(record['IPK']) : null,
                  additional_subjects_description: record['Mata Pelajaran Lainnya (Jika Tidak Ditemukan)'] || null,
                  high_school: record['Nama SMA'] || null,
                  high_school_major: record['Jurusan SMA'] || null,
                  high_school_graduation_year: record['Tahun Lulus SMA'] ? parseInt(record['Tahun Lulus SMA']) : null,
                  vocational_school_detail: record['Jurusan SMK Detail'] || null,
                  alternative_institution_name: record['Nama Institusi (Alternative)'] || null,
                })
                .eq('user_id', userId);
              
              console.log(`✅ Created (via RPC) and updated tutor_details for record ${rowNumber}`);
            }
          } catch (createError: any) {
            console.warn(`⚠️ Warning: Could not insert tutor_banking_info for ${rowNumber}:`, createError && createError.message ? createError.message : JSON.stringify(createError));
          }
        }

        // === BANKING INFO ===
        // Ambil tutor_id dari tabel tutor_details
        const { data: tutorDetailsRow } = await supabase
          .from('tutor_details')
          .select('id')
          .eq('user_id', userId)
          .single();
        const tutorId = tutorDetailsRow?.id;

        if (
          tutorId &&
          record['Nama Pemilik Rekening'] &&
          record['Nomor Rekening'] &&
          (resolvedBankName || record['Nama Bank'])
        ) {
          const bankingInfoData = {
            tutor_id: tutorId,
            account_holder_name: record['Nama Pemilik Rekening'],
            account_number: record['Nomor Rekening'],
            bank_name: resolvedBankName || record['Nama Bank'],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          // Cek apakah sudah ada data banking info
          const { data: existingBanking, error: bankingCheckError } = await supabase
            .from('tutor_banking_info')
            .select('id')
            .eq('tutor_id', tutorId)
            .single();

          if (existingBanking && !bankingCheckError) {
            // Update
            const { error: bankingUpdateError } = await supabase
              .from('tutor_banking_info')
              .update(bankingInfoData)
              .eq('tutor_id', tutorId);
            if (bankingUpdateError) {
              console.warn(`⚠️ Warning: Could not update tutor_banking_info for ${rowNumber}:`, bankingUpdateError && bankingUpdateError.message ? bankingUpdateError.message : JSON.stringify(bankingUpdateError));
            } else {
              console.log(`✅ Updated tutor_banking_info for record ${rowNumber}`);
            }
          } else {
            // Insert
            const { error: bankingInsertError } = await supabase
              .from('tutor_banking_info')
              .insert(bankingInfoData);
            if (bankingInsertError) {
              console.warn(`⚠️ Warning: Could not insert tutor_banking_info for ${rowNumber}:`, bankingInsertError && bankingInsertError.message ? bankingInsertError.message : JSON.stringify(bankingInsertError));
            } else {
              console.log(`✅ Inserted tutor_banking_info for record ${rowNumber}`);
            }
          }
        }
      } catch (error: any) {
        console.error(`❌ Error processing record ${rowNumber}:`, error);
        errors.push({ row: rowNumber, message: `Failed to process record: ${error.message || 'Unknown error'}` });
        errorCount++;
      }
    }

    console.log(`✅ Bulk import finished. Total records: ${records.length}, Success: ${successCount}, Errors: ${errorCount}`);
    return NextResponse.json({
      success: true,
      message: `Bulk import completed. ${successCount} records imported, ${errorCount} errors.`,
      totalRecords: totalRecords,
      importedCount: successCount,
      errors: errors
    });

  } catch (error: any) {
    console.error('❌ Bulk import failed:', error);
    return NextResponse.json(
      { success: false, message: `Bulk import failed: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}