import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    
    const { data: simpleCategories, error } = await supabase
      .from('t_210_02_07_m_simple_categories')
      .select('*')
      .eq('is_active', true)
      .order('id');

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch simple categories' }, { status: 500 });
    }

    return NextResponse.json({ 
      categories: simpleCategories || [],
      count: simpleCategories?.length || 0 
    });
    
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 