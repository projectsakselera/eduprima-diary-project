import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export async function GET() {
  console.log('🔍 Debug DB endpoint called');
  
  if (!supabase) {
    return NextResponse.json({
      success: false,
      message: 'Database connection not available',
      config: {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey
      }
    });
  }

  try {
    // Test basic connection
    console.log('Testing database connection...');
    
    // Try to get existing users count
    const { data: usersCount, error: usersError } = await supabase
      .from('users_universal')
      .select('*', { count: 'exact', head: true });
    
    if (usersError) {
      console.error('Users table error:', usersError);
    }

    // Try to get tutor details count
    const { data: tutorsCount, error: tutorsError } = await supabase
      .from('tutor_details')
      .select('*', { count: 'exact', head: true });
    
    if (tutorsError) {
      console.error('Tutors table error:', tutorsError);
    }

    // Get sample user data
    const { data: sampleUsers, error: sampleError } = await supabase
      .from('users_universal')
      .select('*')
      .limit(3);

    // Try to get table schema info
    const { data: schemaInfo, error: schemaError } = await supabase
      .rpc('get_table_columns', { table_name: 'users_universal' })
      .then(result => ({ data: null, error: 'RPC not available' }))
      .catch(() => ({ data: null, error: 'RPC failed' }));

    return NextResponse.json({
      success: true,
      message: 'Database debug info',
      data: {
        connection: 'OK',
        tables: {
          users_universal: {
            error: usersError?.message || null,
            count: usersCount?.length || 0
          },
          tutor_details: {
            error: tutorsError?.message || null,
            count: tutorsCount?.length || 0
          }
        },
        sampleUsers: sampleUsers || [],
        sampleError: sampleError?.message || null,
        schemaInfo: schemaInfo || 'Not available',
        schemaError: schemaError || null
      }
    });

  } catch (error) {
    console.error('Database debug error:', error);
    return NextResponse.json({
      success: false,
      message: 'Database debug failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
