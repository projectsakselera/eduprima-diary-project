import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    
    const { data: simpleCategories, error } = await supabase
      .from('program_simple_categories')
      .select('id, code, label, description, icon, color_hex, sort_order, is_active')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true });

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