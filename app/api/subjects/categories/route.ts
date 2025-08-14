import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('🔍 Fetching program categories from program_main_categories...');
    
    const supabase = createServerSupabaseClient();
    
    const { data: categories, error } = await supabase
      .from('program_main_categories')
      .select('*')
      .eq('is_active', true)
      .order('main_name_local');

    if (error) {
      console.error('❌ Database error fetching categories:', error);
      return NextResponse.json({ 
        success: false,
        error: `Failed to fetch categories: ${error.message}`,
        categories: []
      }, { status: 500 });
    }

    console.log(`✅ Successfully fetched ${categories?.length || 0} categories`);

    const response = NextResponse.json({ 
      success: true,
      categories: categories || [],
      count: categories?.length || 0,
      timestamp: Date.now()
    });

    // Set aggressive no-cache headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    
    return response;
    
  } catch (error) {
    console.error('❌ Server error in /api/subjects/categories:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      categories: []
    }, { status: 500 });
  }
} 