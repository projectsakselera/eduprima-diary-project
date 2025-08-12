import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tutorId = searchParams.get('tutor_id');
    const limit = searchParams.get('limit') || '10';

    console.log('🔍 DEBUG: Checking program mappings...');
    console.log('🔍 DEBUG: tutor_id =', tutorId);
    console.log('🔍 DEBUG: limit =', limit);

    // Get all tutor_program_mappings
    const mappingsResult = await supabase
      .from('tutor_program_mappings')
      .select('*')
      .limit(parseInt(limit));

    if (mappingsResult.error) {
      console.error('❌ Error fetching tutor_program_mappings:', mappingsResult.error);
      return NextResponse.json({
        error: 'Failed to fetch tutor_program_mappings',
        details: mappingsResult.error
      }, { status: 500 });
    }

    console.log('✅ tutor_program_mappings data:', mappingsResult.data);

    // Get all programs_unit for reference
    const programsResult = await supabase
      .from('programs_unit')
      .select('id, program_name, program_name_local')
      .limit(50);

    if (programsResult.error) {
      console.error('❌ Error fetching programs_unit:', programsResult.error);
    } else {
      console.log('✅ programs_unit sample data:', programsResult.data);
    }

    // Get tutor_details for reference
    const tutorsResult = await supabase
      .from('tutor_details')
      .select('id, user_id, created_at')
      .limit(10);

    if (tutorsResult.error) {
      console.error('❌ Error fetching tutor_details:', tutorsResult.error);
    } else {
      console.log('✅ tutor_details sample data:', tutorsResult.data);
    }

    return NextResponse.json({
      success: true,
      tutor_program_mappings: mappingsResult.data,
      programs_unit_sample: programsResult.data || [],
      tutor_details_sample: tutorsResult.data || [],
      total_mappings: mappingsResult.data?.length || 0
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json({
      error: 'Unexpected error occurred',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
