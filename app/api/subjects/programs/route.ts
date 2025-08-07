import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mainCategoryCode = searchParams.get('category');
    const simpleCategoryCode = searchParams.get('simple_category'); // New parameter for simple category
    const subCategoryId = searchParams.get('subcategory');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = createServerSupabaseClient();
    
    let query = supabase
      .from('programs_catalog')
      .select(`
        *,
        subcategory:program_sub_categories!inner(
          id,
          sub_name,
          sub_name_local,
          main_category:program_main_categories!inner(
            id,
            main_code,
            main_name,
            main_name_local
          )
        ),
        program_type:program_types(
          id,
          type_name,
          type_name_local
        ),
        simple_category_info:simple_categories!simple_category(
          id,
          code,
          label,
          icon,
          color_hex
        )
      `)
      .eq('is_active', true);

    // Filter by simple category (new priority filter)
    if (simpleCategoryCode) {
      query = query.eq('simple_category', simpleCategoryCode);
    }
    // Filter by main category (legacy support)
    else if (mainCategoryCode) {
      query = query.eq('subcategory.main_category.main_code', mainCategoryCode);
    }

    // Filter by subcategory
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
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch programs' }, { status: 500 });
    }

    return NextResponse.json({ 
      programs: programs || [],
      count: count || 0,
      pagination: {
        limit,
        offset,
        hasMore: (programs?.length || 0) === limit
      }
    });
    
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 