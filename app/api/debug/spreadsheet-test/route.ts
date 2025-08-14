import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '1';

    console.log('🔍 DEBUG: Testing spreadsheet API...');
    console.log('🔍 DEBUG: limit =', limit);

    // Get tutor_details with user_id
    const tutorsResult = await supabase
      .from('tutor_details')
      .select('id, user_id, created_at')
      .limit(parseInt(limit))
      .order('created_at', { ascending: false });

    if (tutorsResult.error) {
      console.error('❌ Error fetching tutor_details:', tutorsResult.error);
      return NextResponse.json({
        error: 'Failed to fetch tutor_details',
        details: tutorsResult.error
      }, { status: 500 });
    }

    console.log('✅ tutor_details data:', tutorsResult.data);

    if (!tutorsResult.data || tutorsResult.data.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No tutor_details found',
        data: []
      });
    }

    const tutor = tutorsResult.data[0];
    console.log('🔍 DEBUG: Testing with tutor:', tutor);

    // Get program mappings for this tutor
    const programMappingsResult = await supabase
      .from('tutor_program_mappings')
      .select('program_id')
      .eq('tutor_id', tutor.id);

    if (programMappingsResult.error) {
      console.error('❌ Error fetching program mappings:', programMappingsResult.error);
    } else {
      console.log('✅ Program mappings for tutor:', programMappingsResult.data);
    }

    // Get programs_unit data
    const programsResult = await supabase
      .from('programs_unit')
      .select('id, program_name, program_name_local')
      .limit(100);

    if (programsResult.error) {
      console.error('❌ Error fetching programs_unit:', programsResult.error);
    } else {
      console.log('✅ programs_unit data count:', programsResult.data?.length || 0);
    }

    // Simulate the spreadsheet logic
    const programsMap = new Map();
    if (programsResult.data) {
      programsResult.data.forEach(program => {
        programsMap.set(program.id, program.program_name_local || program.program_name);
      });
    }

    const programMappings = programMappingsResult.data || [];
    const selectedPrograms = programMappings.map(pm => programsMap.get(pm.program_id) || pm.program_id);

    console.log('🔍 DEBUG: Simulated selectedPrograms:', selectedPrograms);

    return NextResponse.json({
      success: true,
      tutor: tutor,
      program_mappings: programMappingsResult.data || [],
      programs_count: programsResult.data?.length || 0,
      selected_programs: selectedPrograms,
      programs_map_sample: Array.from(programsMap.entries()).slice(0, 5)
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json({
      error: 'Unexpected error occurred',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
