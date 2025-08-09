import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

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
          .or('role_name.ilike.%tutor%,role_name.ilike.%educator%,role_code.eq.database_tutor_manager')
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

        // Prepare user profile data
        const profileData = {
          user_id: userId,
          full_name: record['Nama Lengkap'] || record['nama'] || 'Unknown',
          nick_name: record['Nama Panggilan'] || '',
          date_of_birth: record['Tanggal Lahir'] || null,
          gender: record['Jenis Kelamin'] || record['gender'] || null,
          headline: record['Headline'] || '',
          bio: record['Deskripsi Diri'] || '',
          // Education data
          education_level: record['Status Akademik'] || null,
          university: record['Nama Universitas'] || record['Nama Universitas S1'] || null,
          major: record['Jurusan S1'] || record['Fakultas/Jurusan'] || null,
          graduation_year: record['Tahun Lulus'] ? parseInt(record['Tahun Lulus']) : null,
          gpa: record['IPK/GPA'] ? parseFloat(record['IPK/GPA']) : null,
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

        // Insert address data if provided
        console.log(`📝 Creating address records for user ${userId}...`);
        
        // Create domicile address
        if (record['Provinsi Domisili'] || record['Kota/Kabupaten Domisili'] || record['Alamat Lengkap Domisili']) {
          const domicileAddressData = {
            user_id: userId,
            address_type: 'domicile',
            address_label: 'Alamat Domisili',
            street_address: record['Alamat Lengkap Domisili'] || null,
            postal_code: record['Kode Pos Domisili'] || null,
            is_primary: true,
            is_verified: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

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
        if (record['Alamat Sama Dengan KTP'] !== 'true' && (record['Provinsi KTP'] || record['Kota/Kabupaten KTP'] || record['Alamat Lengkap KTP'])) {
          const ktpAddressData = {
            user_id: userId,
            address_type: 'ktp',
            address_label: 'Alamat KTP',
            street_address: record['Alamat Lengkap KTP'] || null,
            postal_code: record['Kode Pos KTP'] || null,
            is_primary: false,
            is_verified: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          const { error: ktpError } = await supabase
            .from('user_addresses')
            .insert(ktpAddressData);

          if (ktpError) {
            console.warn(`⚠️ Warning: Could not create KTP address for ${rowNumber}:`, ktpError);
          } else {
            console.log(`✅ Created KTP address for record ${rowNumber}`);
          }
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
              // Education data in tutor_details
              academic_status: record['Status Akademik'] || null,
              university_s1_name: record['Nama Universitas'] || record['Nama Universitas S1'] || null,
              faculty_s1: record['Fakultas S1'] || null,
              major_s1: record['Jurusan S1'] || null,
              entry_year: record['Tahun Masuk'] ? parseInt(record['Tahun Masuk']) : null
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
                    // Education data in tutor_details
                    academic_status: record['Status Akademik'] || null,
                    university_s1_name: record['Nama Universitas'] || record['Nama Universitas S1'] || null,
                    faculty_s1: record['Fakultas S1'] || null,
                    major_s1: record['Jurusan S1'] || null,
                    entry_year: record['Tahun Masuk'] ? parseInt(record['Tahun Masuk']) : null
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
                  // Education data in tutor_details
                  academic_status: record['Status Akademik'] || null,
                  university_s1_name: record['Nama Universitas'] || record['Nama Universitas S1'] || null,
                  faculty_s1: record['Fakultas S1'] || null,
                  major_s1: record['Jurusan S1'] || null,
                  entry_year: record['Tahun Masuk'] ? parseInt(record['Tahun Masuk']) : null
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
