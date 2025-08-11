import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export async function POST() {
  console.log('🧪 Test insert endpoint called');
  
  if (!supabase) {
    return NextResponse.json({
      success: false,
      message: 'Database connection not available'
    });
  }

  try {
    const uniqueId = crypto.randomUUID().replace(/-/g, '').slice(0, 8);
    const testUserCode = `TEST${uniqueId}`;
    
    // Test insert into users_universal
    const userData = {
      user_code: testUserCode,
      email: `${testUserCode.toLowerCase()}@test.imported`,
      phone: `08${uniqueId}`,
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

    console.log('Inserting test user:', userData);

    const { data: userResult, error: userError } = await supabase
      .from('users_universal')
      .insert(userData)
      .select('id')
      .single();

    if (userError) {
      console.error('User insert error:', userError);
      return NextResponse.json({
        success: false,
        message: 'Failed to insert user',
        error: userError.message,
        details: userError
      });
    }

    console.log('User inserted successfully:', userResult);

    // Test insert into tutor_details
    const tutorData = {
      user_id: userResult.id,
      nama_lengkap: 'Test Tutor',
      nama_panggilan: 'Test',
      headline: 'Test headline'
    };

    console.log('Inserting test tutor:', tutorData);

    const { data: tutorResult, error: tutorError } = await supabase
      .from('tutor_details')
      .insert(tutorData)
      .select()
      .single();

    if (tutorError) {
      console.error('Tutor insert error:', tutorError);
      return NextResponse.json({
        success: false,
        message: 'Failed to insert tutor details',
        error: tutorError.message,
        details: tutorError,
        userId: userResult.id
      });
    }

    console.log('Tutor inserted successfully:', tutorResult);

    return NextResponse.json({
      success: true,
      message: 'Test insert successful',
      data: {
        user: userResult,
        tutor: tutorResult
      }
    });

  } catch (error) {
    console.error('Test insert error:', error);
    return NextResponse.json({
      success: false,
      message: 'Test insert failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
