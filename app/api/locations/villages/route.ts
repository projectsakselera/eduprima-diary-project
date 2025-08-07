import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const districtId = searchParams.get('district_id');
    
    const supabase = createServerSupabaseClient();
    
    let query = supabase
      .from('location_villages') // Updated table name per mapping guide
      .select('id, village_code, village_name, village_local_name, village_type, district_id, postal_code')
      .eq('is_active', true)
      .order('village_name');
    
    // Filter by district if provided
    if (districtId) {
      query = query.eq('district_id', districtId);
    }

    const { data: villages, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch villages' }, { status: 500 });
    }

    // Format for dropdown options
    const formattedVillages = villages?.map(village => ({
      value: village.id,
      label: village.village_name,
      code: village.village_code,
      local_name: village.village_local_name,
      type: village.village_type, // 'kelurahan' or 'desa'
      district_id: village.district_id,
      postal_code: village.postal_code
    })) || [];

    return NextResponse.json({
      villages: formattedVillages,
      count: formattedVillages.length
    });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 