import { NextResponse } from 'next/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cityId = searchParams.get('city_id');
    
    const supabase = createServerSupabaseClient();
    
    let query = supabase
      .from('location_districts') // Updated table name per mapping guide
      .select('id, district_code, district_name, district_local_name, city_id, postal_code_prefix')
      .eq('is_active', true)
      .order('district_name');
    
    // Filter by city if provided
    if (cityId) {
      query = query.eq('city_id', cityId);
    }

    const { data: districts, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch districts' }, { status: 500 });
    }

    // Format for dropdown options
    const formattedDistricts = districts?.map(district => ({
      value: district.id,
      label: district.district_name,
      code: district.district_code,
      local_name: district.district_local_name,
      city_id: district.city_id,
      postal_prefix: district.postal_code_prefix
    })) || [];

    return NextResponse.json({
      districts: formattedDistricts,
      count: formattedDistricts.length
    });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 