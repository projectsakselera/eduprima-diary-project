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
    
  } catch (error) {
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
        
        // Prepare user data for users_universal table
        const userData = {
          user_code: userCode,
          email: uniqueEmail,
          phone: record['No. HP Utama (+62)'] || record['phone'] || `08${uniqueId}`,
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

        // Prepare user profile data (education fields moved to tutor_details)
        const profileData = {
          user_id: userId,
          full_name: record['Nama Lengkap'] || record['nama'] || 'Unknown',
          nick_name: record['Nama Panggilan'] || '',
          date_of_birth: record['Tanggal Lahir'] || null,
          gender: record['Jenis Kelamin'] || record['gender'] || null,
          headline: record['Headline'] || '',
          bio: record['Deskripsi Diri'] || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
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
          background_check_status: 'pending'
        };

        console.log(`📝 Prepared tutor details data for ${rowNumber}:`, tutorDetailsData);

        // === FUZZY MATCHING RESOLUTION ===
        console.log(`🔍 Resolving fields with fuzzy matching for record ${rowNumber}...`);
        
        // Resolve province using fuzzy matching
        let resolvedProvinceId = null;
        let resolvedProvinceName = null;
        if (record['Provinsi Domisili'] || record['provinsiDomisili_matched']) {
          const provinceInput = record['provinsiDomisili_matched'] || record['Provinsi Domisili'];
          const provinceResult = resolveFieldWithFuzzy(provinceInput, 'province', referenceData.provinces);
          resolvedProvinceId = provinceResult.id;
          resolvedProvinceName = provinceResult.matched;
        }
        
        // Resolve city using fuzzy matching (filter by province if available)
        let resolvedCityId = null;
        let resolvedCityName = null;
        if (record['Kota/Kabupaten Domisili'] || record['kotaKabupatenDomisili_matched']) {
          const cityInput = record['kotaKabupatenDomisili_matched'] || record['Kota/Kabupaten Domisili'];
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

        // Add debug logging for address data - sesuai dengan Testing_data_tutor.csv
        console.log(`🔍 Address data for record ${rowNumber}:`, {
          domicile: {
            provinsi: record['Provinsi Domisili'],
            kota: record['Kota/Kabupaten Domisili'],
            kecamatan: record['Kecamatan Domisili'],
            kelurahan: record['Kelurahan/Desa Domisili'],
            alamat: record['Alamat Lengkap Domisili'],
            kodePos: record['Kode Pos Domisili']
          },
          ktp: {
            samaDenganDomisili: record['Alamat Sama dengan KTP'],
            provinsi: record['Provinsi KTP'],
            kota: record['Kota/Kabupaten KTP'],
            kecamatan: record['Kecamatan KTP'],
            kelurahan: record['Kelurahan/Desa KTP'],
            alamat: record['Alamat Lengkap KTP'],
            kodePos: record['Kode Pos KTP']
          },
          resolved: {
            domicileProvinceId: resolvedProvinceId,
            domicileCityId: resolvedCityId
          }
        });

        // Insert address data if provided
        console.log(`📝 Creating address records for user ${userId}...`);
        
        // Create domicile address - sesuai dengan Testing_data_tutor.csv
        if (record['Provinsi Domisili'] || record['Kota/Kabupaten Domisili'] || record['Alamat Lengkap Domisili']) {
          // Pastikan insert alamat menggunakan struktur yang benar
          const domicileAddressData = {
            user_id: userId,
            address_type: 'domicile',
            street_address: record['Alamat Lengkap Domisili'] || 'Alamat belum diisi', // ✅ Handle required constraint
            postal_code: record['Kode Pos Domisili'] || null,
            province_id: resolvedProvinceId,        // ✅ Pastikan ini ada
            city_id: resolvedCityId,               // ✅ Pastikan ini ada
            district_name: record['Kecamatan Domisili'] || null,
            village_name: record['Kelurahan/Desa Domisili'] || null,
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

        // Create KTP address (ALAMAT IDENTITAS) if different from domicile
        const alamatSamaDenganKTP = record['Alamat Sama dengan KTP'] === 'true' || 
                                    record['Alamat Sama dengan KTP'] === true;

        if (!alamatSamaDenganKTP && (
          record['Provinsi KTP'] || 
          record['Kota/Kabupaten KTP'] || 
          record['Alamat Lengkap KTP']
        )) {
          // Resolve KTP province and city using fuzzy matching
          let resolvedKTPProvinceId = null;
          let resolvedKTPCityId = null;
          
          if (record['Provinsi KTP']) {
            const ktpProvinceResult = resolveFieldWithFuzzy(record['Provinsi KTP'], 'province', referenceData.provinces);
            resolvedKTPProvinceId = ktpProvinceResult.id;
          }
          
          if (record['Kota/Kabupaten KTP']) {
            const ktpCityResult = resolveFieldWithFuzzy(
              record['Kota/Kabupaten KTP'], 
              'city', 
              referenceData.cities,
              resolvedKTPProvinceId ? (city: any) => city.province_id === resolvedKTPProvinceId : undefined
            );
            resolvedKTPCityId = ktpCityResult.id;
          }

          const ktpAddressData = {
            user_id: userId,
            address_type: 'ktp', // ✅ Specify KTP address type
            street_address: record['Alamat Lengkap KTP'] || 'Alamat KTP belum diisi', // ✅ Handle required constraint
            postal_code: record['Kode Pos KTP'] || null,
            // Use resolved KTP location IDs
            province_id: resolvedKTPProvinceId,
            city_id: resolvedKTPCityId,
            district_name: record['Kecamatan KTP'] || null,
            village_name: record['Kelurahan/Desa KTP'] || null,
            is_primary: false, // ✅ Not primary address
            is_verified: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          console.log(`🆔 KTP address data for ${rowNumber}:`, ktpAddressData);

          const { error: ktpError } = await supabase
            .from('user_addresses')
            .insert(ktpAddressData);

          if (ktpError) {
            console.warn(`⚠️ Warning: Could not create KTP address for ${rowNumber}:`, ktpError);
          } else {
            console.log(`✅ Created KTP address for record ${rowNumber}`);
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
              university_s1_name: record['Nama Universitas'] || record['Nama Universitas S1'] || null,
              faculty_s1: record['Fakultas S1'] || null,
              major_s1: record['Jurusan S1'] || null,
              entry_year: record['Tahun Masuk'] ? parseInt(record['Tahun Masuk']) : null,
              // Additional education fields
              current_university: record['Nama Universitas'] || record['Nama Universitas S1'] || null,
              current_faculty: record['Fakultas S1'] || null,
              current_major: record['Jurusan S1'] || record['Fakultas/Jurusan'] || null,
              current_graduation_year: record['Tahun Lulus'] ? parseInt(record['Tahun Lulus']) : null,
              current_gpa: record['IPK/GPA'] ? parseFloat(record['IPK/GPA']) : null
            })
            .eq('user_id', userId);

          if (updateError) {
            console.warn(`⚠️ Warning: Could not update tutor_details for ${rowNumber}:`, updateError);
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
              console.warn(`⚠️ Could not create tutor_details via RPC, trying direct approach:`, createError);
              
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
                    university_s1_name: record['Nama Universitas'] || record['Nama Universitas S1'] || null,
                    faculty_s1: record['Fakultas S1'] || null,
                    major_s1: record['Jurusan S1'] || null,
                    entry_year: record['Tahun Masuk'] ? parseInt(record['Tahun Masuk']) : null,
                    // Additional education fields
                    current_university: record['Nama Universitas'] || record['Nama Universitas S1'] || null,
                    current_faculty: record['Fakultas S1'] || null,
                    current_major: record['Jurusan S1'] || record['Fakultas/Jurusan'] || null,
                    current_graduation_year: record['Tahun Lulus'] ? parseInt(record['Tahun Lulus']) : null,
                    current_gpa: record['IPK/GPA'] ? parseFloat(record['IPK/GPA']) : null
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
                  university_s1_name: record['Nama Universitas'] || record['Nama Universitas S1'] || null,
                  faculty_s1: record['Fakultas S1'] || null,
                  major_s1: record['Jurusan S1'] || null,
                  entry_year: record['Tahun Masuk'] ? parseInt(record['Tahun Masuk']) : null,
                  // Additional education fields
                  current_university: record['Nama Universitas'] || record['Nama Universitas S1'] || null,
                  current_faculty: record['Fakultas S1'] || null,
                  current_major: record['Jurusan S1'] || record['Fakultas/Jurusan'] || null,
                  current_graduation_year: record['Tahun Lulus'] ? parseInt(record['Tahun Lulus']) : null,
                  current_gpa: record['IPK/GPA'] ? parseFloat(record['IPK/GPA']) : null
                })
                .eq('user_id', userId);
              
              console.log(`✅ Created (via RPC) and updated tutor_details for record ${rowNumber}`);
            }
          } catch (createError) {
            console.warn(`⚠️ Exception creating tutor_details for ${rowNumber}:`, createError);
          }
        }

        // Create tutor management record for approval status
        const managementData = {
          user_id: userId,
          status_tutor: 'active',
          approval_level: 'junior',
          staff_notes: `Imported via bulk import from ${source || 'unknown source'}`
        };

        console.log(`📝 Prepared management data for ${rowNumber}:`, managementData);

        const { error: managementError } = await supabase
          .from('tutor_management')
          .insert(managementData);

        if (managementError) {
          console.warn(`⚠️ Warning: Could not create management record for ${rowNumber}:`, managementError);
        }

        console.log(`✅ Created profile and management record for record ${rowNumber}`);
        successCount++;

      } catch (recordError) {
        console.error(`❌ Error processing record ${rowNumber}:`, recordError);
        const errorMessage = recordError instanceof Error 
          ? recordError.message 
          : typeof recordError === 'string' 
            ? recordError 
            : `Unknown processing error: ${JSON.stringify(recordError)}`;
        
        errors.push({ 
          row: rowNumber, 
          message: errorMessage
        });
        errorCount++;
      }
    }

    const result = {
      success: true,
      message: `Successfully imported ${successCount} out of ${records.length} records`,
      successCount,
      errorCount,
      warningCount: 0,
      totalProcessed: records.length,
      errors: errors.length > 0 ? errors : [],
      details: {
        source: source || 'unknown',
        processedAt: new Date().toISOString(),
        processedBy: 'system',
        recordsCreated: successCount || 0,
        tablesUpdated: ['users_universal', 'user_profiles', 'user_demographics', 'user_addresses', 'tutor_details', 'tutor_management']
      }
    };

    console.log('✅ Bulk import completed:', result);

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Bulk import error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error during import',
        successCount: 0,
        errorCount: 0,
        errors: [{ row: 0, message: 'System error occurred' }]
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { success: false, message: 'Method not allowed' },
    { status: 405 }
  );
}
