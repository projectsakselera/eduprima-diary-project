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
        console.log(`📝 Processing record ${rowNumber}:`, Object.keys(record));
        
        // Generate truly unique user_code and email for each record
        const uniqueId = crypto.randomUUID().replace(/-/g, '').slice(0, 8);
        const userCode = record['User Code'] || record['user_code'] || `TUT${uniqueId}${i.toString().padStart(2, '0')}`;
        const uniqueEmail = record['Email Aktif'] || record['email'] || `${userCode.toLowerCase()}@imported.tutor`;
        
        // Check if email or user_code already exists
        const { data: existingUser } = await supabase
          .from('users_universal')
          .select('email, user_code')
          .or(`email.eq.${uniqueEmail},user_code.eq.${userCode}`)
          .single();
          
        if (existingUser) {
          console.warn(`⚠️ Skipping duplicate user ${rowNumber}: email or user_code already exists`);
          errors.push({ 
            row: rowNumber, 
            message: `User with email '${uniqueEmail}' or user_code '${userCode}' already exists` 
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

        const userId = userResult.id;
        console.log(`✅ Created user ${rowNumber} with ID: ${userId}`);

        // Prepare tutor details
        const tutorData = {
          user_id: userId,
          nama_lengkap: record['Nama Lengkap'] || record['nama'] || 'Unknown',
          nama_panggilan: record['Nama Panggilan'] || '',
          tanggal_lahir: record['Tanggal Lahir'] || null,
          jenis_kelamin: record['Jenis Kelamin'] || record['gender'] || null,
          agama: record['Agama'] || null,
          headline: record['Headline'] || '',
          deskripsi_diri: record['Deskripsi Diri'] || ''
        };

        console.log(`📝 Prepared tutor data for ${rowNumber}:`, tutorData);

        // Insert into tutor_details
        const { error: tutorError } = await supabase
          .from('tutor_details')
          .insert(tutorData);

        if (tutorError) {
          console.error(`❌ Error inserting tutor details ${rowNumber}:`, tutorError);
          errors.push({ row: rowNumber, message: `Failed to create tutor details: ${tutorError.message}` });
          errorCount++;
          continue;
        }

        // Create tutor management record for approval status
        const managementData = {
          user_id: userId,
          status_tutor: 'active',
          approval_level: 'junior',
          staff_notes: `Imported via bulk import from ${source}`
        };

        console.log(`📝 Prepared management data for ${rowNumber}:`, managementData);

        const { error: managementError } = await supabase
          .from('tutor_management')
          .insert(managementData);

        if (managementError) {
          console.warn(`⚠️ Warning: Could not create management record for ${rowNumber}:`, managementError);
        }

        console.log(`✅ Created tutor details for record ${rowNumber}`);
        successCount++;

      } catch (recordError) {
        console.error(`❌ Error processing record ${rowNumber}:`, recordError);
        errors.push({ 
          row: rowNumber, 
          message: recordError instanceof Error ? recordError.message : 'Unknown processing error' 
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
        source,
        processedAt: new Date().toISOString(),
        processedBy: 'system',
        recordsCreated: successCount,
        tablesUpdated: ['users_universal', 'tutor_details', 'tutor_management']
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
