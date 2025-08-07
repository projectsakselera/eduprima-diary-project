import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    
    const { data: provinces, error } = await supabase
      .from('provinces')
      .select('id, region_code, region_name, region_local_name, capital_city')
      .eq('admin_level', 1) // Province level
      .order('region_name');

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch provinces' }, { status: 500 });
    }

    // Format for dropdown options
    const formattedProvinces = provinces?.map(province => ({
      value: province.id,
      label: province.region_name,
      code: province.region_code,
      local_name: province.region_local_name,
      capital: province.capital_city
    })) || [];

    return NextResponse.json({
      provinces: formattedProvinces,
      count: formattedProvinces.length
    });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 