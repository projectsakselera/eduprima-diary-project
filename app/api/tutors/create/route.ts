import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Server-side Supabase client with service role key for secure operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables');
}

// Use service role key for server-side operations - bypasses RLS
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Zod validation schemas
const TutorPersonalSchema = z.object({
  namaLengkap: z.string().min(3, 'Nama minimal 3 karakter'),
  namaPanggilan: z.string().optional(),
  tanggalLahir: z.string().min(1, 'Tanggal lahir harus diisi'),
  jenisKelamin: z.enum(['L', 'P'], { message: 'Jenis kelamin tidak valid' }),
  agama: z.string().optional(),
  email: z.string().email('Format email tidak valid'),
  noHp1: z.string().regex(/^(\+62|62|0)[0-9]{9,13}$/, 'Format HP tidak valid'),
  noHp2: z.string().optional(),
  headline: z.string().optional(),
  deskripsiDiri: z.string().optional(),
  socialMedia1: z.string().optional(),
  socialMedia2: z.string().optional(),
});

const TutorAddressSchema = z.object({
  provinsiDomisili: z.string().min(1, 'Provinsi domisili harus dipilih'),
  kotaKabupatenDomisili: z.string().min(1, 'Kota domisili harus dipilih'),
  kecamatanDomisili: z.string().min(1, 'Kecamatan domisili harus diisi'),
  kelurahanDomisili: z.string().min(1, 'Kelurahan domisili harus diisi'),
  alamatLengkapDomisili: z.string().min(1, 'Alamat lengkap domisili harus diisi'),
  kodePosDomisili: z.string().optional(),
  alamatSamaDenganKTP: z.boolean().optional(),
  provinsiKTP: z.string().optional(),
  kotaKabupatenKTP: z.string().optional(),
  kecamatanKTP: z.string().optional(),
  kelurahanKTP: z.string().optional(),
  alamatLengkapKTP: z.string().optional(),
  kodePosKTP: z.string().optional(),
});

const TutorBankingSchema = z.object({
  namaNasabah: z.string().min(1, 'Nama nasabah harus diisi'),
  nomorRekening: z.string().min(1, 'Nomor rekening harus diisi'),
  namaBank: z.string().min(1, 'Bank harus dipilih'),
});

const TutorEducationSchema = z.object({
  statusAkademik: z.string().optional(),
  namaUniversitasS1: z.string().optional(),
  fakultasS1: z.string().optional(),
  jurusanS1: z.string().optional(),
  tahunMasuk: z.string().optional(),
  namaSMA: z.string().optional(),
  jurusanSMA: z.string().optional(),
  pengalamanMengajar: z.string().optional(),
  keahlianLainnya: z.string().optional(),
  keahlianSpesialisasi: z.string().optional(),
});

const TutorAvailabilitySchema = z.object({
  statusMenerimaSiswa: z.string().optional(),
  hourly_rate: z.number().min(0, 'Tarif per jam tidak boleh negatif').optional(),
  teaching_methods: z.array(z.string()).optional(),
  available_schedule: z.array(z.string()).optional(),
  maksimalSiswaBaru: z.number().optional(),
  maksimalTotalSiswa: z.number().optional(),
  usiaTargetSiswa: z.array(z.string()).optional(),
  catatanAvailability: z.string().optional(),
});

const TutorFormSchema = z.object({
  ...TutorPersonalSchema.shape,
  ...TutorAddressSchema.shape,
  ...TutorBankingSchema.shape,
  ...TutorEducationSchema.shape,
  ...TutorAvailabilitySchema.shape,
  selectedPrograms: z.array(z.string()).optional(),
  mataPelajaranLainnya: z.string().optional(),
  status_tutor: z.string().optional(),
  approval_level: z.string().optional(),
  staff_notes: z.string().optional(),
});

// Utility functions
const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Add +62 prefix if it doesn't exist
  if (cleanPhone.startsWith('0')) {
    return '+62' + cleanPhone.substring(1);
  } else if (cleanPhone.startsWith('62')) {
    return '+' + cleanPhone;
  } else if (!cleanPhone.startsWith('+62')) {
    return '+62' + cleanPhone;
  }
  
  return cleanPhone;
};

const generatePasswordFromBirthDate = (birthDate: string): string => {
  try {
    const date = new Date(birthDate);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    
    // Format: DDMMYYYY (e.g., 15071995)
    const password = `${day}${month}${year}`;
    console.log('Generated password from birth date:', password);
    return password;
  } catch (error) {
    console.error('Error generating password from birth date:', error);
    // Fallback to random 8-digit number
    return Math.random().toString().slice(2, 10);
  }
};

const generateUniqueUserCode = (): string => {
  return `USR-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
};

const getTutorRoleId = async () => {
  // Try different possible table names and role identifiers
  const possibleTableNames = ['user_roles', 'roles', 'system_roles'];
  const possibleRoleIdentifiers = ['tutor', 'Tutor', 'TUTOR', 'educator', 'Educator'];
  
  for (const tableName of possibleTableNames) {
    try {
      // First try to find by role_name
      for (const roleName of possibleRoleIdentifiers) {
        const { data, error } = await supabase
          .from(tableName)
          .select('id')
          .eq('role_name', roleName)
          .single();
        
        if (data?.id && !error) {
          console.log(`Found tutor role: ${data.id} in table ${tableName}`);
          return data.id;
        }
      }
      
      // If not found by role_name, try by role_code
      for (const roleCode of possibleRoleIdentifiers) {
        const { data, error } = await supabase
          .from(tableName)
          .select('id')
          .eq('role_code', roleCode)
          .single();
        
        if (data?.id && !error) {
          console.log(`Found tutor role: ${data.id} in table ${tableName}`);
          return data.id;
        }
      }
    } catch (error) {
      console.log(`Table ${tableName} not accessible:`, error);
    }
  }
  
  // Fallback: return the first available role
  for (const tableName of possibleTableNames) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('id')
        .limit(1)
        .single();
      
      if (data?.id && !error) {
        console.log(`Using fallback role: ${data.id} from table ${tableName}`);
        return data.id;
      }
    } catch (error) {
      continue;
    }
  }
  
  throw new Error('Could not find any accessible role');
};

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = TutorFormSchema.parse(body);
    
    console.log('🔐 Server-side tutor creation started');
    console.log('📝 Validated form data received');
    
    // Generate secure password from birth date
    const autoGeneratedPassword = generatePasswordFromBirthDate(validatedData.tanggalLahir);
    const hashedPassword = await bcrypt.hash(autoGeneratedPassword, 10);
    console.log('🔒 Password generated and hashed server-side');
    
    // Get tutor role ID
    const tutorRoleId = await getTutorRoleId();
    
    // Generate unique user code
    const userCode = generateUniqueUserCode();
    
    // Begin database transaction
    console.log('🏗️ Starting database transaction...');
    
    // 1. Create user account
    const usersUniversalData = {
      user_code: userCode,
      email: validatedData.email,
      phone: formatPhoneNumber(validatedData.noHp1),
      password_hash: hashedPassword,
      primary_role_id: tutorRoleId,
      account_type: 'individual',
      user_status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: newUser, error: userError } = await supabase
      .from('users_universal')
      .insert([usersUniversalData])
      .select('id, email, user_code')
      .single();
    
    if (userError) {
      console.error('❌ Failed to create user:', userError);
      if (userError.message.includes('duplicate key') && userError.message.includes('email')) {
        return NextResponse.json(
          { success: false, error: `Email ${validatedData.email} sudah digunakan. Silakan gunakan email lain.` },
          { status: 400 }
        );
      }
      throw new Error(`Failed to create user: ${userError.message}`);
    }
    
    if (!newUser?.id) {
      throw new Error('Failed to get user ID from creation');
    }
    
    const userId = newUser.id;
    console.log('✅ User created successfully:', { id: userId, email: newUser.email });
    
    // 2. Create user profile
    const userProfilesData = {
      user_id: userId,
      full_name: validatedData.namaLengkap,
      nick_name: validatedData.namaPanggilan || null,
      date_of_birth: validatedData.tanggalLahir,
      gender: validatedData.jenisKelamin,
      mobile_phone: formatPhoneNumber(validatedData.noHp1),
      mobile_phone_2: validatedData.noHp2 ? formatPhoneNumber(validatedData.noHp2) : null,
      headline: validatedData.headline || null,
      bio: validatedData.deskripsiDiri || null,
      social_media_1: validatedData.socialMedia1 || null,
      social_media_2: validatedData.socialMedia2 || null,
      country_code: 'ID',
      address_line1: validatedData.alamatLengkapDomisili,
      city: validatedData.kotaKabupatenDomisili,
      state_province: validatedData.provinsiDomisili,
      postal_code: validatedData.kodePosDomisili || null,
      education_level: validatedData.statusAkademik || null,
      university: validatedData.namaUniversitasS1 || null,
      major: validatedData.jurusanS1 || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert([userProfilesData]);
    
    if (profileError) {
      console.error('❌ Failed to create user profile:', profileError);
      throw new Error(`Failed to create user profile: ${profileError.message}`);
    }
    
    console.log('✅ User profile created successfully');
    
    // 3. Create user demographics (if religion provided)
    if (validatedData.agama) {
      const userDemographicsData = {
        user_id: userId,
        religion: validatedData.agama,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { error: demographicsError } = await supabase
        .from('user_demographics')
        .insert([userDemographicsData]);
      
      if (demographicsError) {
        console.error('❌ Failed to create user demographics:', demographicsError);
        throw new Error(`Failed to create user demographics: ${demographicsError.message}`);
      }
      
      console.log('✅ User demographics created successfully');
    }
    
    // 4. Create domicile address
    const domicileAddressData = {
      user_id: userId,
      address_type: 'domicile',
      address_label: 'Alamat Domisili',
      province_id: validatedData.provinsiDomisili,
      city_id: validatedData.kotaKabupatenDomisili,
      district_name: validatedData.kecamatanDomisili,
      village_name: validatedData.kelurahanDomisili,
      street_address: validatedData.alamatLengkapDomisili,
      postal_code: validatedData.kodePosDomisili || null,
      is_primary: true,
      is_verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { error: domicileError } = await supabase
      .from('user_addresses')
      .insert([domicileAddressData]);
    
    if (domicileError) {
      console.error('❌ Failed to create domicile address:', domicileError);
      throw new Error(`Failed to create domicile address: ${domicileError.message}`);
    }
    
    console.log('✅ Domicile address created successfully');
    
    // 5. Create KTP address (if different from domicile)
    if (!validatedData.alamatSamaDenganKTP && validatedData.provinsiKTP) {
      const ktpAddressData = {
        user_id: userId,
        address_type: 'ktp',
        address_label: 'Alamat KTP/KK',
        province_id: validatedData.provinsiKTP,
        city_id: validatedData.kotaKabupatenKTP,
        district_name: validatedData.kecamatanKTP,
        village_name: validatedData.kelurahanKTP,
        street_address: validatedData.alamatLengkapKTP || '',
        postal_code: validatedData.kodePosKTP || null,
        is_primary: false,
        is_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { error: ktpError } = await supabase
        .from('user_addresses')
        .insert([ktpAddressData]);
      
      if (ktpError) {
        console.error('❌ Failed to create KTP address:', ktpError);
        throw new Error(`Failed to create KTP address: ${ktpError.message}`);
      }
      
      console.log('✅ KTP address created successfully');
    }
    
    // 6. Create tutor details
    const tutorDetailsData = {
      user_id: userId,
      academic_status: validatedData.statusAkademik || 'unknown',
      university_s1_name: validatedData.namaUniversitasS1 || null,
      faculty_s1: validatedData.fakultasS1 || null,
      major_s1: validatedData.jurusanS1 || null,
      entry_year: validatedData.tahunMasuk ? parseInt(validatedData.tahunMasuk) : null,
      high_school: validatedData.namaSMA || null,
      teaching_experience: validatedData.pengalamanMengajar || null,
      other_skills: validatedData.keahlianLainnya || null,
      special_skills: validatedData.keahlianSpesialisasi || null,
      onboarding_status: 'registration',
      background_check_status: 'pending',
      is_top_educator: false,
      cancellation_rate: 0,
      total_teaching_hours: 0,
      average_rating: 0,
      form_submission_timestamp: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { error: tutorDetailsError } = await supabase
      .from('tutor_details')
      .insert([tutorDetailsData]);
    
    if (tutorDetailsError) {
      console.error('❌ Failed to create tutor details:', tutorDetailsError);
      throw new Error(`Failed to create tutor details: ${tutorDetailsError.message}`);
    }
    
    console.log('✅ Tutor details created successfully');
    
    // 7. Create tutor management
    const tutorManagementData = {
      user_id: userId,
      status_tutor: validatedData.status_tutor || 'registration',
      approval_level: validatedData.approval_level || 'junior',
      staff_notes: validatedData.staff_notes || null,
      identity_verification_status: 'pending',
      education_verification_status: 'pending',
      recruitment_stage_history: [{
        stage: validatedData.status_tutor || 'registration',
        timestamp: new Date().toISOString(),
        changed_by: 'system',
        notes: 'Initial registration via staff form'
      }],
      last_status_change: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { error: managementError } = await supabase
      .from('tutor_management')
      .insert([tutorManagementData]);
    
    if (managementError) {
      console.error('❌ Failed to create tutor management:', managementError);
      throw new Error(`Failed to create tutor management: ${managementError.message}`);
    }
    
    console.log('✅ Tutor management created successfully');
    
    // 8. Create availability config (if provided)
    if (validatedData.statusMenerimaSiswa || validatedData.hourly_rate) {
      const availabilityConfigData = {
        user_id: userId,
        availability_status: validatedData.statusMenerimaSiswa || 'available',
        max_new_students_per_week: validatedData.maksimalSiswaBaru || null,
        max_total_students: validatedData.maksimalTotalSiswa || null,
        target_student_ages: validatedData.usiaTargetSiswa || [],
        availability_notes: validatedData.catatanAvailability || null,
        available_schedule: validatedData.available_schedule || [],
        teaching_methods: validatedData.teaching_methods || [],
        hourly_rate: validatedData.hourly_rate || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { error: availabilityError } = await supabase
        .from('tutor_availability_config')
        .insert([availabilityConfigData]);
      
      if (availabilityError) {
        console.error('❌ Failed to create availability config:', availabilityError);
        throw new Error(`Failed to create availability config: ${availabilityError.message}`);
      }
      
      console.log('✅ Availability config created successfully');
    }
    
    // 9. Create banking info
    if (validatedData.namaBank && validatedData.nomorRekening) {
      const bankingData = {
        user_id: userId,
        bank_id: validatedData.namaBank,
        account_holder_name: validatedData.namaNasabah,
        account_number: validatedData.nomorRekening,
        account_status: 'active',
        is_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { error: bankingError } = await supabase
        .from('tutor_banking_info')
        .insert([bankingData]);
      
      if (bankingError) {
        console.error('❌ Failed to create banking info:', bankingError);
        throw new Error(`Failed to create banking info: ${bankingError.message}`);
      }
      
      console.log('✅ Banking info created successfully');
    }
    
    // 10. Create program mappings (if selected programs exist)
    if (validatedData.selectedPrograms && validatedData.selectedPrograms.length > 0) {
      const programMappingsData = validatedData.selectedPrograms.map(programId => ({
        user_id: userId,
        program_id: programId,
        proficiency_level: 'intermediate',
        years_of_experience: 1,
        certification_status: 'none',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      
      const { error: programError } = await supabase
        .from('tutor_program_mappings')
        .insert(programMappingsData);
      
      if (programError) {
        console.error('❌ Failed to create program mappings:', programError);
        throw new Error(`Failed to create program mappings: ${programError.message}`);
      }
      
      console.log('✅ Program mappings created successfully');
    }
    
    // 11. Create additional subjects (if provided)
    if (validatedData.mataPelajaranLainnya) {
      const additionalSubjectData = {
        user_id: userId,
        subject_name: validatedData.mataPelajaranLainnya,
        target_level: 'general',
        approval_status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { error: subjectError } = await supabase
        .from('tutor_additional_subjects')
        .insert([additionalSubjectData]);
      
      if (subjectError) {
        console.error('❌ Failed to create additional subject:', subjectError);
        // Don't throw error for this - it's optional
        console.log('⚠️ Additional subject creation failed, continuing...');
      } else {
        console.log('✅ Additional subject created successfully');
      }
    }
    
    console.log('🎉 Tutor creation completed successfully!');
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Tutor berhasil dibuat',
      data: {
        user_id: userId,
        email: newUser.email,
        user_code: newUser.user_code,
        password: autoGeneratedPassword, // Only for initial setup
        tutor_registration_number: null // Will be generated by database trigger
      }
    });
    
  } catch (error) {
    console.error('❌ Server error creating tutor:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}
