import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('🔄 Fetching programs for lookup...');
    const supabase = createServerSupabaseClient();
    
    const { data: programs, error } = await supabase
      .from('t_210_02_02_programs_catalog')
      .select('id, program_name, program_name_local, program_code, subject_focus')
      .eq('is_active', true)
      .order('program_name_local');

    if (error) {
      console.error('❌ Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch programs' }, { status: 500 });
    }

    console.log(`✅ Successfully fetched ${programs?.length || 0} programs for lookup`);

    // Create a simple lookup object
    const lookup: Record<string, string> = {};
    programs?.forEach((program) => {
      lookup[program.id] = program.program_name_local || program.program_name || program.id;
    });

    return NextResponse.json({ 
      success: true,
      data: programs || [],
      lookup,
      count: programs?.length || 0 
    });
    
  } catch (error) {
    console.error('❌ Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}