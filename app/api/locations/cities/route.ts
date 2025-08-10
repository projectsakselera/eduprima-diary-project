import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const provinceId = searchParams.get('province_id');
    
    const supabase = createServerSupabaseClient();
    
    let query = supabase
      .from('location_cities')
      .select('id, city_code, city_name, city_local_name, province_id')
      .order('city_name');
    
    // Filter by province if provided
    if (provinceId) {
      query = query.eq('province_id', provinceId);
    }

    const { data: cities, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch cities' }, { status: 500 });
    }

    // Format for dropdown options
    const formattedCities = cities?.map(city => ({
      value: city.id,
      label: city.city_name,
      code: city.city_code,
      local_name: city.city_local_name,
      province_id: city.province_id
    })) || [];

    return NextResponse.json({
      cities: formattedCities,
      count: formattedCities.length
    });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 