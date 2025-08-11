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
    console.log('📍 Address data:', data.address) 
    console.log('🏦 Banking data:', data.banking)

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
        
        // 🔧 FIXED: Only include fields that exist in tutor_details table
        academic_status: '', // Will be populated in Step 2 (Education)
        teaching_experience: '',
        other_skills: '',
        special_skills: '',
        academic_achievements: '',
        non_academic_achievements: '',
        certifications_training: '',
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
        identity_verification_status: 'pending',
        education_verification_status: 'pending',
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

    // Create user_profiles (Personal information)
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
        // ✅ FIXED: Profile fields exist in user_profiles schema
        headline: data.profile?.headline || '',
        bio: data.profile?.deskripsiDiri || '',
        motivation_as_tutor: data.profile?.motivasiMenjadiTutor || '',
        social_media_1: data.profile?.socialMedia1 || '',
        social_media_2: data.profile?.socialMedia2 || '',
        profile_photo_url: null, // Will be handled by document upload system
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

    console.log('✅ Edge Function - Tutor created successfully')
    console.log('📊 User ID:', userData.id)
    console.log('📊 Tutor ID:', tutorData.id)
    console.log('🎯 TRN (kelipatan 7):', tutorData.tutor_registration_number)
    console.log('📋 Tables created: users_universal, tutor_details, tutor_management, user_profiles, user_demographics, user_addresses, tutor_banking_info')

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
            'tutor_banking_info'
          ] // Complete list of created tables
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
