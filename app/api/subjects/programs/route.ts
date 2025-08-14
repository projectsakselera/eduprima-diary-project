import { NextResponse } from 'next/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mainCategoryCode = searchParams.get('category');
    const subCategoryId = searchParams.get('subcategory');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = createServerSupabaseClient();
    
    console.log(`🔍 Fetching programs with params:`, { mainCategoryCode, subCategoryId, search, limit, offset });

    let query = supabase
      .from('programs_unit')
      .select(`
        id,
        program_code,
        program_name,
        program_name_local,
        program_name_short,
        subject_focus,
        target_age_min,
        target_age_max,
        grade_level,
        ideal_session_duration_minutes,
        ideal_total_sessions,
        ideal_class_size_min,
        ideal_class_size_max,
        description,
        prerequisites,
        popularity,
        is_active,
        subcategory_id,
        program_type_id
      `)
      .eq('is_active', true);

    // Filter by subcategory (we'll handle category filtering later if needed)
    if (subCategoryId) {
      query = query.eq('subcategory_id', subCategoryId);
    }

    // Search functionality
    if (search) {
      query = query.or(`program_name_local.ilike.%${search}%,program_name.ilike.%${search}%,subject_focus.ilike.%${search}%`);
    }

    // Add pagination
    query = query
      .range(offset, offset + limit - 1)
      .order('program_name_local');

    const { data: programs, error, count } = await query;

    if (error) {
      console.error('❌ Database error fetching programs:', error);
      return NextResponse.json({ 
        success: false,
        error: `Failed to fetch programs: ${error.message}`,
        programs: []
      }, { status: 500 });
    }

    console.log(`✅ Successfully fetched ${programs?.length || 0} programs`);

    const response = NextResponse.json({ 
      success: true,
      programs: programs || [],
      count: count || 0,
      pagination: {
        limit,
        offset,
        hasMore: (programs?.length || 0) === limit
      },
      timestamp: Date.now()
    });

    // Set aggressive no-cache headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    
    return response;
    
  } catch (error) {
    console.error('❌ Server error in /api/subjects/programs:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      programs: []
    }, { status: 500 });
  }
} 