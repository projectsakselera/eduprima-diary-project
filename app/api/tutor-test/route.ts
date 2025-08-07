import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({
        error: 'Supabase client not configured. Missing environment variables.',
        details: 'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required.'
      }, { status: 500 });
    }

    const results: any = {
      timestamp: new Date().toISOString(),
      tests: []
    };

    // Test 1: Check available tables
    try {
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');

      results.tests.push({
        test: 'List Tables',
        success: !tablesError,
        data: tables?.map(t => t.table_name) || [],
        error: tablesError?.message
      });
    } catch (err: any) {
      results.tests.push({
        test: 'List Tables',
        success: false,
        error: err.message
      });
    }

    // Test 2: Try different possible table names (focus on existing ones)
    const possibleTableNames = [
      'users_universal', // Known existing table
      'users',
      'profiles',
      // Only try these if they exist in the database
    ];

    for (const tableName of possibleTableNames) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(3);

        results.tests.push({
          test: `Query ${tableName}`,
          success: !error,
          rowCount: data?.length || 0,
          sampleData: data?.[0] ? Object.keys(data[0]) : [],
          error: error?.message
        });

        if (!error && data && data.length > 0) {
          results.recommendedTable = tableName;
        }
      } catch (err: any) {
        results.tests.push({
          test: `Query ${tableName}`,
          success: false,
          error: err.message
        });
      }
    }

    // Test 3: Test with users table (which we know exists)
    try {
      const { data, error } = await supabase
        .from('users_universal')
        .select('*')
        .limit(3);

      results.tests.push({
        test: 'Query Users Universal Table',
        success: !error,
        rowCount: data?.length || 0,
        sampleColumns: data?.[0] ? Object.keys(data[0]) : [],
        error: error?.message
      });
    } catch (err: any) {
      results.tests.push({
        test: 'Query Users Universal Table',
        success: false,
        error: err.message
      });
    }

    return NextResponse.json({
      status: 'success',
      message: 'Tutor database test completed',
      results
    });

  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Test failed',
      error: error.message
    }, { status: 500 });
  }
} 