import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
const supabaseUrl = 'https://btnsfqhgrjdyxwjiomrj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0bnNmcWhncmpkeXh3amlvbXJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzODAwOTEsImV4cCI6MjA2Nzk1NjA5MX0.AzC7DZEmzIs9paMsrPJKYdCH4J2pLKMcaPF_emVZH6Q';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
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

    // Test 2: Try different possible tutor table names
    const possibleTableNames = [
      'tutors',
      'tutor',
      't_tutors',
      't_tutor',
      'teacher',
      'teachers',
      'database_tutor',
      'database_tutors',
      't_310_01_01_users_universal'
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
        .from('t_310_01_01_users_universal')
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