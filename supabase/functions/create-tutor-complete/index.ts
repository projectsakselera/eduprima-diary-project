import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.33.1'

interface EdgeFunctionRequest {
  personal: {
    namaLengkap: string
    namaPanggilan: string
    tanggalLahir: string
    jenisKelamin: string
    agama: string
    email: string
    noHp1: string
    noHp2?: string
  }
  address: {
    provinsiDomisili: string | null
    kotaKabupatenDomisili: string | null
    kecamatanDomisili: string
    kelurahanDomisili: string
    alamatLengkapDomisili: string
    kodePosDomisili: string
    alamatSamaDenganKTP: boolean
    provinsiKTP: string | null
    kotaKabupatenKTP: string | null
    kecamatanKTP: string
    kelurahanKTP: string
    alamatLengkapKTP: string
    kodePosKTP: string
  }
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
    console.log('📊 Personal data:', data.personal)
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
        academic_status: data.personal.agama || '',
        teaching_experience: '',
        other_skills: '',
        special_skills: '',
        academic_achievements: '',
        non_academic_achievements: '',
        certifications_training: '',
        form_agreement_check: true,
        registration_notes_to_admin: 'Created via Edge Function',
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

    console.log('✅ Edge Function - Tutor created successfully')
    console.log('📊 User ID:', userData.id)
    console.log('📊 Tutor ID:', tutorData.id)
    console.log('🎯 TRN (kelipatan 7):', tutorData.tutor_registration_number)

    // 🔧 FIXED: Match expected response structure from service
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          user_id: userData.id,
          tutor_id: tutorData.id,
          trn: tutorData.tutor_registration_number,
          password: autoPassword,
          tables_created: ['users_universal', 'tutor_details'] // For logging
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
