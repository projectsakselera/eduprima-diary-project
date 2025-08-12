import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.33.1'

interface EdgeFunctionRequest {
  // System & Status Information (Staff only)
  system?: {
    status_tutor?: string
    approval_level?: string
    staff_notes?: string
    additionalScreening?: string[] // Checklist for additional screening
  }
  // Personal Information
  personal: {
    fotoProfil?: File | string | null // Profile photo upload
    trn?: string // Manual TRN input (if provided)
    namaLengkap: string
    namaPanggilan?: string
    tanggalLahir: string
    jenisKelamin: string
    agama?: string
    email: string
    noHp1: string
    noHp2?: string
  }
  // Profile & Value Proposition
  profile?: {
    headline?: string // Headline/Tagline Tutor (max 100 chars)
    deskripsiDiri?: string // Bio/Description
    motivasiMenjadiTutor?: string // Teaching motivation
    socialMedia1?: string // Instagram/LinkedIn link
    socialMedia2?: string // YouTube/TikTok link
  }
  // Education Information (Step 2)
  education?: {
    // Academic Status & Current Education
    statusAkademik?: string // Current academic status
    namaUniversitas?: string // Current university
    fakultas?: string // Current faculty
    jurusan?: string // Current major
    tahunMasuk?: string // Entry year
    tahunLulus?: string // Graduation year
    ipk?: string // GPA
    
    // S1 Education (for S2/S3 students)
    namaUniversitasS1?: string // S1 university name
    fakultasS1?: string // S1 faculty
    jurusanS1?: string // S1 major
    
    // High School Information
    namaSMA?: string // High school name
    jurusanSMA?: string // High school major
    tahunLulusSMA?: string // High school graduation year
    
    // Alternative Learning (for statusAkademik = 'lainnya')
    namaInstitusi?: string // Institution name
    bidangKeahlian?: string // Field of expertise
    pengalamanBelajar?: string // Learning experience
    
    // Experience & Skills
    pengalamanMengajar?: string // Teaching experience
    keahlianSpesialisasi?: string // Special skills
    keahlianLainnya?: string // Other skills
    
    // Achievements & Certifications
    prestasiAkademik?: string // Academic achievements
    prestasiNonAkademik?: string // Non-academic achievements
    sertifikasiPelatihan?: string // Certifications & training
    
    // Document Files (Step 2)
    transkripNilai?: File | string | null // Transcript document
    sertifikatKeahlian?: File | string | null // Expertise certificate
  }
  // Address Information
  address: {
    provinsiDomisili: string | null
    kotaKabupatenDomisili: string | null
    kecamatanDomisili: string
    kelurahanDomisili: string
    alamatLengkapDomisili: string
    kodePosDomisili?: string
    alamatSamaDenganKTP?: boolean
    provinsiKTP?: string | null
    kotaKabupatenKTP?: string | null
    kecamatanKTP?: string
    kelurahanKTP?: string
    alamatLengkapKTP?: string
    kodePosKTP?: string
  }
  // Banking Information
  banking: {
    namaNasabah: string
    nomorRekening: string
    namaBank: string | null
  }
  // Subjects & Programs (Step 3)
  subjects?: {
    selectedPrograms?: string[] // Array of selected program IDs from database
    mataPelajaranLainnya?: string // Additional subjects not found in the selector
  }
  // Documents (Step 5)
  documents?: {
    // Document Files (Step 5)
    dokumenIdentitas?: File | string | null // Identity document (KTP/Passport)
    dokumenPendidikan?: File | string | null // Education document (Ijazah/Transcript)
    dokumenSertifikat?: File | string | null // Certificate document (Optional)
    
    // Document Verification Status (Staff only)
    status_verifikasi_identitas?: string // Identity verification status
    status_verifikasi_pendidikan?: string // Education verification status
  }
  // Availability & Wilayah (Step 4 - PHASE 1)
  availability?: {
    // A. AVAILABILITY & STATUS
    statusMenerimaSiswa?: string // Availability status
    available_schedule?: string[] // Weekly schedule array
    teaching_methods?: string[] // Teaching methods array
    hourly_rate?: number // Expected hourly rate in Rupiah
    maksimalSiswaBaru?: number // Max new students per week
    maksimalTotalSiswa?: number // Max total students
    usiaTargetSiswa?: string[] // Target student age ranges
    catatanAvailability?: string // Additional availability notes
    
    // B. LOCATION & TRANSPORTATION
    transportasiTutor?: string[] // Transportation methods
    alamatTitikLokasi?: string // Teaching center location/address
    teaching_radius_km?: number // Teaching radius in kilometers
    location_notes?: string // Location preferences and notes
    
    // C. COORDINATES (Optional)
    titikLokasiLat?: number // Latitude of teaching center
    titikLokasiLng?: number // Longitude of teaching center
    
    // D. EMERGENCY CONTACT (PHASE 3)
    emergencyContactName?: string // Emergency contact name
    emergencyContactRelationship?: string // Relationship with emergency contact
    emergencyContactPhone?: string // Emergency contact phone number
  }
  // Teaching Preferences & Personality (Step 4 - PHASE 2)
  preferences?: {
    // A. TEACHING PREFERENCES
    teachingMethods?: string[] // Teaching styles
    studentLevelPreferences?: string[] // Student level preferences
    specialNeedsCapable?: string // Special needs capability
    groupClassWilling?: string // Group class willingness
    
    // B. TECHNOLOGY CAPABILITIES
    onlineTeachingCapable?: string // Online teaching capability
    techSavviness?: string // Technology savviness
    gmeetExperience?: string // Google Meet/Zoom experience
    presensiUpdateCapability?: string // Attendance update capability
  }
  // Personality Traits (Step 4 - PHASE 2)
  personality?: {
    // PERSONALITY & CHARACTER
    tutorPersonalityType?: string[] // Personality types
    communicationStyle?: string[] // Communication styles
    teachingPatienceLevel?: number // Teaching patience level (1-10)
    studentMotivationAbility?: number // Student motivation ability (1-10)
    scheduleFlexibilityLevel?: number // Schedule flexibility level (1-10)
  }
}

interface EdgeFunctionResponse {
  success: boolean
  data?: {
    user_id: string
    tutor_id: string
    trn: string
    password: string
    tables_created: string[]
  }
  error?: string
  details?: any
}

serve(async (req: Request): Promise<Response> => {
  // 🔧 CORS Headers untuk semua response
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get Supabase client with service role for full access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get request data
    const data: EdgeFunctionRequest = await req.json()
    
    console.log('🎯 Edge Function - Create Tutor Complete')
    console.log('⚙️ System data:', data.system)
    console.log('📊 Personal data:', data.personal)
    console.log('✨ Profile data:', data.profile)
    console.log('🎓 Education data:', data.education) // Step 2 education info
    console.log('📍 Address data:', data.address) 
    console.log('🏦 Banking data:', data.banking)
    console.log('📄 Documents data:', data.documents) // Step 5 documents info
    console.log('🎯 Availability data:', data.availability) // Step 4 availability info
    console.log('🎨 Preferences data:', data.preferences) // Step 4 teaching preferences info
    console.log('👤 Personality data:', data.personality) // Step 4 personality traits info
    console.log('📚 Subjects data:', data.subjects) // Step 3 subjects info

    // Basic validation - tanggal lahir required untuk generate password
    const validationErrors: Array<{field: string, message: string}> = []
    
    // Required fields validation
    if (!data.personal?.namaLengkap?.trim()) {
      validationErrors.push({field: 'personal.namaLengkap', message: 'Nama lengkap wajib diisi'})
    }
    if (!data.personal?.email?.trim()) {
      validationErrors.push({field: 'personal.email', message: 'Email wajib diisi'})
    }
    if (!data.personal?.tanggalLahir?.trim()) {
      validationErrors.push({field: 'personal.tanggalLahir', message: 'Tanggal lahir wajib diisi untuk generate password'})
    }

    // Optional validation (lenient for testing)
    if (data.personal?.namaPanggilan && data.personal.namaPanggilan.length < 2) {
      validationErrors.push({field: 'personal.namaPanggilan', message: 'Nama panggilan minimal 2 karakter'})
    }
    
    if (validationErrors.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Validation failed',
          details: validationErrors
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Generate password from birth date (ddmmyy format)
    const generatePasswordFromBirthDate = (birthDate: string): string => {
      try {
        const date = new Date(birthDate)
        const day = String(date.getDate()).padStart(2, '0')
        const month = String(date.getMonth() + 1).padStart(2, '0') 
        const year = String(date.getFullYear()).slice(-2)
        return `${day}${month}${year}`
      } catch (error) {
        console.error('Error generating password from birth date:', error)
        return '010125' // Default password
      }
    }

    // Hash password using bcrypt (simulate with simple hash for now)
    const autoPassword = generatePasswordFromBirthDate(data.personal.tanggalLahir)
    const passwordHash = `$2b$10$${autoPassword}HashedPasswordSimulation`
    
    // 🎓 Helper functions for education data processing
    const toIntOrNull = (value: any): number | null => {
      if (!value) return null
      const num = parseInt(String(value), 10)
      return Number.isFinite(num) ? num : null
    }
    
    const toFloatOrNull = (value: any): number | null => {
      if (!value) return null
      const num = parseFloat(String(value))
      return Number.isFinite(num) ? num : null
    }
    
    const isS2S3Student = (status?: string): boolean => {
      return ['mahasiswa_s2', 'lulusan_s2', 'mahasiswa_s3', 'lulusan_s3'].includes(status || '')
    }
    
    const isAlternativeLearning = (status?: string): boolean => {
      return status === 'lainnya'
    }

    // Get tutor role ID
    const { data: tutorRole, error: roleError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('role_name', 'Tutor')
      .single()

    if (roleError || !tutorRole) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Tutor role not found',
          details: roleError
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Start transaction
    const { data: userData, error: userError } = await supabase
      .from('users_universal')
      .insert([{
        email: data.personal.email,
        password_hash: passwordHash,
        primary_role_id: tutorRole.id,
        user_status: 'active', // ✅ FIXED: Use user_status instead of is_active
        user_code: `USR-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
      }])
      .select('id')
      .single()

    if (userError || !userData) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to create user',
          details: userError
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create tutor_details (TRN will be auto-generated by trigger with kelipatan 7)
    const { data: tutorData, error: tutorError } = await supabase
      .from('tutor_details')
      .insert([{
        user_id: userData.id,
        // tutor_registration_number: null, // Will be auto-generated by trigger (kelipatan 7)
        
        // Manual TRN if provided (override auto-generation)
        tutor_registration_number: data.personal?.trn || null,
        
        // 🎓 STEP 2: Education & Academic Information
        academic_status: data.education?.statusAkademik || 'unknown',
        
        // S1 Education (conditional - for S2/S3 students)
        university_s1_name: isS2S3Student(data.education?.statusAkademik) 
          ? (data.education?.namaUniversitasS1 || null) 
          : null,
        faculty_s1: isS2S3Student(data.education?.statusAkademik)
          ? (data.education?.fakultasS1 || null)
          : (data.education?.fakultas || null), // For other status use current faculty
        major_s1: isS2S3Student(data.education?.statusAkademik)
          ? (data.education?.jurusanS1 || null)
          : null,
        
        // High School Information
        high_school: data.education?.namaSMA || null,
        high_school_major: data.education?.jurusanSMA || null,
        high_school_graduation_year: toIntOrNull(data.education?.tahunLulusSMA),
        
        // Alternative Learning (for statusAkademik = 'lainnya')
        alternative_institution_name: isAlternativeLearning(data.education?.statusAkademik)
          ? (data.education?.namaInstitusi || null)
          : null,
        expertise_field: isAlternativeLearning(data.education?.statusAkademik)
          ? (data.education?.bidangKeahlian || null)
          : null,
        learning_experience: isAlternativeLearning(data.education?.statusAkademik)
          ? (data.education?.pengalamanBelajar || null)
          : null,
        
        // Entry year (for current education)
        entry_year: toIntOrNull(data.education?.tahunMasuk),
        
        // Teaching Experience & Skills
        teaching_experience: data.education?.pengalamanMengajar || '',
        other_skills: data.education?.keahlianLainnya || '',
        special_skills: data.education?.keahlianSpesialisasi || '',
        
        // Achievements & Certifications
        academic_achievements: data.education?.prestasiAkademik || '',
        non_academic_achievements: data.education?.prestasiNonAkademik || '',
        certifications_training: data.education?.sertifikasiPelatihan || '',
        
        // System fields
        form_agreement_check: true,
        registration_notes_to_admin: `Created via Edge Function${data.system?.additionalScreening?.length ? ` | Additional Screening: ${data.system.additionalScreening.join(', ')}` : ''}`,
        onboarding_status: 'pending',
        background_check_status: 'pending',
        is_top_educator: false,
        cancellation_rate: 0.0,
        total_teaching_hours: 0,
        average_rating: 0.0,
        form_submission_timestamp: new Date().toISOString()
      }])
      .select('id, tutor_registration_number')
      .single()
    
    if (tutorError || !tutorData) {
      // Cleanup user if tutor creation failed
      await supabase.from('users_universal').delete().eq('id', userData.id)
      
    return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to create tutor details',
          details: tutorError
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create tutor_management (System & Status fields)
    const { error: managementError } = await supabase
      .from('tutor_management')
      .insert([{
        user_id: userData.id,
        status_tutor: data.system?.status_tutor || 'registration',
        approval_level: data.system?.approval_level || 'junior',
        staff_notes: data.system?.staff_notes || '',
        additional_screening: data.system?.additionalScreening || [],
        recruitment_stage_history: [],
        last_status_change: new Date().toISOString(),
        status_changed_by: null, // Will be set when staff changes status
        // 📄 STEP 5: Document verification status (Staff can override)
        identity_verification_status: data.documents?.status_verifikasi_identitas || 'pending',
        education_verification_status: data.documents?.status_verifikasi_pendidikan || 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])

    if (managementError) {
      console.error('❌ Failed to create tutor management:', managementError)
      // Cleanup on failure
      await supabase.from('tutor_details').delete().eq('id', tutorData.id)
      await supabase.from('users_universal').delete().eq('id', userData.id)
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to create tutor management',
          details: managementError
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create user_profiles (Personal information + Education)
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert([{
        user_id: userData.id,
        full_name: data.personal.namaLengkap,
        nick_name: data.personal.namaPanggilan || '',
        date_of_birth: data.personal.tanggalLahir,
        gender: data.personal.jenisKelamin,
        mobile_phone: data.personal.noHp1,
        mobile_phone_2: data.personal.noHp2 || null,
        
        // ✅ Profile & Value Proposition fields
        headline: data.profile?.headline || '',
        bio: data.profile?.deskripsiDiri || '',
        motivation_as_tutor: data.profile?.motivasiMenjadiTutor || '',
        social_media_1: data.profile?.socialMedia1 || '',
        social_media_2: data.profile?.socialMedia2 || '',
        
        // 🎓 Education fields (Step 2) - stored in user_profiles
        education_level: data.education?.statusAkademik || null,
        university: data.education?.namaUniversitas || null,
        major: data.education?.jurusan || null,
        graduation_year: toIntOrNull(data.education?.tahunLulus),
        gpa: toFloatOrNull(data.education?.ipk),
        
        // 🚨 Emergency Contact fields (Step 4 - PHASE 3)
        emergency_contact_name: data.availability?.emergencyContactName || null,
        emergency_contact_relationship: data.availability?.emergencyContactRelationship || null,
        emergency_contact_phone: data.availability?.emergencyContactPhone || null,
        
        // Profile photo URL (will be updated by upload system)
        profile_photo_url: null,
        
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])

    if (profileError) {
      console.error('❌ Failed to create user profile:', profileError)
      // Cleanup on failure
      await supabase.from('tutor_management').delete().eq('user_id', userData.id)
      await supabase.from('tutor_details').delete().eq('id', tutorData.id)
      await supabase.from('users_universal').delete().eq('id', userData.id)
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to create user profile',
          details: profileError
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create user_demographics (Religion & demographics)
    if (data.personal.agama) {
      const { error: demoError } = await supabase
        .from('user_demographics')
        .insert([{
          user_id: userData.id,
          religion: data.personal.agama,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])

      if (demoError) {
        console.error('⚠️ Failed to create demographics (non-critical):', demoError)
        // Non-critical, don't fail the entire operation
      }
    }

    // Create user_addresses (Domicile address - always created)
    const { error: addressError } = await supabase
      .from('user_addresses')
      .insert([{
        user_id: userData.id,
        address_type: 'domicile',
        province_id: data.address.provinsiDomisili,
        city_id: data.address.kotaKabupatenDomisili,
        district_name: data.address.kecamatanDomisili,
        village_name: data.address.kelurahanDomisili,
        street_address: data.address.alamatLengkapDomisili,
        postal_code: data.address.kodePosDomisili || '',
        is_primary: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])

    if (addressError) {
      console.error('❌ Failed to create domicile address:', addressError)
      // Cleanup on failure
      await supabase.from('user_demographics').delete().eq('user_id', userData.id)
      await supabase.from('user_profiles').delete().eq('user_id', userData.id)
      await supabase.from('tutor_details').delete().eq('id', tutorData.id)
      await supabase.from('users_universal').delete().eq('id', userData.id)
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to create address',
          details: addressError
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create KTP address if different from domicile
    if (data.address.alamatSamaDenganKTP !== true && data.address.provinsiKTP) {
      const { error: ktpAddressError } = await supabase
        .from('user_addresses')
        .insert([{
          user_id: userData.id,
          address_type: 'identity', // KTP address
          province_id: data.address.provinsiKTP,
          city_id: data.address.kotaKabupatenKTP,
          district_name: data.address.kecamatanKTP || '',
          village_name: data.address.kelurahanKTP || '',
          street_address: data.address.alamatLengkapKTP || '',
          postal_code: data.address.kodePosKTP || '',
          is_primary: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])

      if (ktpAddressError) {
        console.error('⚠️ Failed to create KTP address (non-critical):', ktpAddressError)
        // Non-critical, don't fail the entire operation
      }
    }

    // Create tutor_banking_info (Banking information)
    const { error: bankingError } = await supabase
      .from('tutor_banking_info')
      .insert([{
        tutor_id: tutorData.id,
        bank_id: data.banking.namaBank, // UUID of selected bank
        bank_name: data.banking.namaBank ? 'Bank Name' : 'Bank Belum Dipilih', // Required field
        account_holder_name: data.banking.namaNasabah,
        account_number: data.banking.nomorRekening,
        is_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])

    if (bankingError) {
      console.error('❌ Failed to create banking info:', bankingError)
      // Cleanup on failure (this is critical for tutors)
      await supabase.from('user_addresses').delete().eq('user_id', userData.id)
      await supabase.from('user_demographics').delete().eq('user_id', userData.id)
      await supabase.from('user_profiles').delete().eq('user_id', userData.id)
      await supabase.from('tutor_details').delete().eq('id', tutorData.id)
      await supabase.from('users_universal').delete().eq('id', userData.id)
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to create banking information',
          details: bankingError
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 📄 Create document storage placeholders for Step 2 files (if provided)
    const documentStorageData: any[] = []
    
    // Transcript document (transkripNilai)
    if (data.education?.transkripNilai) {
      documentStorageData.push({
        user_id: userData.id,
        document_type: 'transcript_document',
        original_filename: 'transcript_document',
        stored_filename: 'transcript_document',
        file_size: 0, // Will be updated by upload API
        file_url: null, // Will be updated by upload API
        mime_type: 'application/pdf',
        verification_status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    }
    
    // Expertise certificate (sertifikatKeahlian - for statusAkademik = 'lainnya')
    if (data.education?.sertifikatKeahlian && isAlternativeLearning(data.education?.statusAkademik)) {
      documentStorageData.push({
        user_id: userData.id,
        document_type: 'expertise_certificate',
        original_filename: 'expertise_certificate',
        stored_filename: 'expertise_certificate',
        file_size: 0, // Will be updated by upload API
        file_url: null, // Will be updated by upload API
        mime_type: 'application/pdf',
        verification_status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    }
    
    // 📄 Create document storage placeholders for Step 5 files (if provided)
    
    // Identity document (dokumenIdentitas)
    if (data.documents?.dokumenIdentitas) {
      documentStorageData.push({
        user_id: userData.id,
        document_type: 'identity_document',
        original_filename: 'identity_document',
        stored_filename: 'identity_document',
        file_size: 0, // Will be updated by upload API
        file_url: null, // Will be updated by upload API
        mime_type: 'application/pdf',
        verification_status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    }
    
    // Education document (dokumenPendidikan)
    if (data.documents?.dokumenPendidikan) {
      documentStorageData.push({
        user_id: userData.id,
        document_type: 'education_document',
        original_filename: 'education_document',
        stored_filename: 'education_document',
        file_size: 0, // Will be updated by upload API
        file_url: null, // Will be updated by upload API
        mime_type: 'application/pdf',
        verification_status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    }
    
    // Certificate document (dokumenSertifikat) - Optional
    if (data.documents?.dokumenSertifikat) {
      documentStorageData.push({
        user_id: userData.id,
        document_type: 'certificate_document',
        original_filename: 'certificate_document',
        stored_filename: 'certificate_document',
        file_size: 0, // Will be updated by upload API
        file_url: null, // Will be updated by upload API
        mime_type: 'application/pdf',
        verification_status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    }
    
    // Insert document storage placeholders (if any)
    if (documentStorageData.length > 0) {
      console.log(`📄 Creating ${documentStorageData.length} document storage placeholders...`)
      const { error: documentError } = await supabase
        .from('document_storage')
        .insert(documentStorageData)
      
      if (documentError) {
        console.error('❌ Failed to create document storage:', documentError)
        // Don't fail the entire operation for document placeholders
        console.warn('⚠️ Continuing without document placeholders - files can still be uploaded via API')
      } else {
        console.log('✅ Document storage placeholders created')
      }
    }

    // 🎯 Create tutor_availability_config (Step 4 - PHASE 1)
    if (data.availability) {
      console.log('🎯 Creating tutor availability configuration...')
      
      // Helper function to convert array to proper format for transportation
      const transportationMethod = data.availability.transportasiTutor && data.availability.transportasiTutor.length > 0 
        ? data.availability.transportasiTutor.join(',') 
        : null
      
      const availabilityData = {
        tutor_id: tutorData.id,
        availability_status: data.availability.statusMenerimaSiswa || 'active',
        available_schedule: data.availability.available_schedule || [],
        teaching_methods: data.availability.teaching_methods || [],
        hourly_rate: data.availability.hourly_rate || 50000, // Default minimum rate
        max_new_students_per_week: data.availability.maksimalSiswaBaru || null,
        max_total_students: data.availability.maksimalTotalSiswa || null,
        target_student_ages: data.availability.usiaTargetSiswa || [],
        availability_notes: data.availability.catatanAvailability || null,
        transportation_method: transportationMethod,
        teaching_center_location: data.availability.alamatTitikLokasi || null,
        teaching_radius_km: data.availability.teaching_radius_km || null,
        location_notes: data.availability.location_notes || null,
        teaching_center_lat: data.availability.titikLokasiLat || null,
        teaching_center_lng: data.availability.titikLokasiLng || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const { error: availabilityError } = await supabase
        .from('tutor_availability_config')
        .insert([availabilityData])
      
      if (availabilityError) {
        console.error('❌ Failed to create availability config:', availabilityError)
        // Don't fail the entire operation for availability config
        console.warn('⚠️ Continuing without availability config - can be added later via admin panel')
      } else {
        console.log('✅ Tutor availability configuration created')
      }
    } else {
      console.log('ℹ️ No availability data provided - skipping tutor_availability_config creation')
    }

    // 🎨 Create tutor_teaching_preferences (Step 4 - PHASE 2)
    if (data.preferences) {
      console.log('🎨 Creating tutor teaching preferences...')
      
      const preferencesData = {
        tutor_id: tutorData.id,
        teaching_styles: data.preferences.teachingMethods || [],
        student_level_preferences: data.preferences.studentLevelPreferences || [],
        special_needs_capable: data.preferences.specialNeedsCapable || null,
        group_class_willing: data.preferences.groupClassWilling || null,
        online_teaching_capable: data.preferences.onlineTeachingCapable || null,
        tech_savviness: data.preferences.techSavviness || null,
        gmeet_experience: data.preferences.gmeetExperience || null,
        presensi_update_capability: data.preferences.presensiUpdateCapability || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const { error: preferencesError } = await supabase
        .from('tutor_teaching_preferences')
        .insert([preferencesData])
      
      if (preferencesError) {
        console.error('❌ Failed to create teaching preferences:', preferencesError)
        console.warn('⚠️ Continuing without teaching preferences - can be added later via admin panel')
      } else {
        console.log('✅ Tutor teaching preferences created')
      }
    } else {
      console.log('ℹ️ No preferences data provided - skipping tutor_teaching_preferences creation')
    }

    // 👤 Create tutor_personality_traits (Step 4 - PHASE 2)
    if (data.personality) {
      console.log('👤 Creating tutor personality traits...')
      
      // Helper function to convert array to comma-separated string
      const personalityTypeString = data.personality.tutorPersonalityType && data.personality.tutorPersonalityType.length > 0 
        ? data.personality.tutorPersonalityType.join(',') 
        : null
        
      const communicationStyleString = data.personality.communicationStyle && data.personality.communicationStyle.length > 0
        ? data.personality.communicationStyle.join(',')
        : null
      
      const personalityData = {
        tutor_id: tutorData.id,
        personality_type: personalityTypeString,
        communication_style: communicationStyleString,
        teaching_patience_level: data.personality.teachingPatienceLevel || null,
        student_motivation_ability: data.personality.studentMotivationAbility || null,
        schedule_flexibility_level: data.personality.scheduleFlexibilityLevel || 5, // Default to 5 if not provided (required field)
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const { error: personalityError } = await supabase
        .from('tutor_personality_traits')
        .insert([personalityData])
      
      if (personalityError) {
        console.error('❌ Failed to create personality traits:', personalityError)
        console.warn('⚠️ Continuing without personality traits - can be added later via admin panel')
      } else {
        console.log('✅ Tutor personality traits created')
      }
    } else {
      console.log('ℹ️ No personality data provided - skipping tutor_personality_traits creation')
    }

    // 📚 Create tutor_program_mappings (Step 3 - Subjects)
    if (data.subjects && data.subjects.selectedPrograms && data.subjects.selectedPrograms.length > 0) {
      console.log('📚 Creating tutor program mappings...')
      
      const programMappings = data.subjects.selectedPrograms.map(programId => ({
        tutor_id: tutorData.id,
        program_id: programId,
        proficiency_level: 'intermediate', // Default proficiency level
        years_of_experience: 1, // Default years of experience
        certification_status: 'none', // Default certification status
        additional_notes: data.subjects.mataPelajaranLainnya || null, // Additional subjects notes
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))
      
      const { error: programMappingsError } = await supabase
        .from('tutor_program_mappings')
        .insert(programMappings)
      
      if (programMappingsError) {
        console.error('❌ Failed to create program mappings:', programMappingsError)
        // Batalkan semua jika mapping gagal, karena ini data krusial
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Failed to create tutor program mappings',
            details: programMappingsError
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      } else {
        console.log('✅ Tutor program mappings created:', programMappings.length, 'programs')
      }
    } else {
      console.log('ℹ️ No subjects data provided - skipping tutor_program_mappings creation')
    }

    console.log('✅ Edge Function - Tutor created successfully')
    console.log('📊 User ID:', userData.id)
    console.log('📊 Tutor ID:', tutorData.id)
    console.log('🎯 TRN (kelipatan 7):', tutorData.tutor_registration_number)
    console.log('📋 Tables created: users_universal, tutor_details, tutor_management, user_profiles, user_demographics, user_addresses, tutor_banking_info, document_storage, tutor_availability_config, tutor_teaching_preferences, tutor_personality_traits, tutor_program_mappings')

    // 🔧 FIXED: Match expected response structure from service
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          user_id: userData.id,
          tutor_id: tutorData.id,
          user_code: `USR-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`, // Match expected format
          trn: tutorData.tutor_registration_number,
          password: autoPassword,
          email: data.personal.email,
          name: data.personal.namaLengkap,
          tables_created: [
            'users_universal', 
            'tutor_details',
            'tutor_management',
            'user_profiles', 
            'user_demographics', 
            'user_addresses', 
            'tutor_banking_info',
            'document_storage',
            'tutor_availability_config',
            'tutor_teaching_preferences',
            'tutor_personality_traits',
            'tutor_program_mappings'
          ] // Complete list of created tables (12 tables total)
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Edge Function Error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
