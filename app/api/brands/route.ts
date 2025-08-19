import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

// Supabase Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables for brands API');
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
  global: {
    headers: {
      'X-Request-ID': Date.now().toString(),
      'X-No-Cache': 'true'
    }
  }
}) : null;

export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Supabase not configured',
        brands: []
      }, { status: 500 });
    }

    console.log('🔍 Fetching brands from corporate_entities...');

    // Get entity_code and entity_name values from corporate_entities table
    const { data: brandsData, error: brandsError } = await supabase
      .from('corporate_entities')
      .select('entity_code, entity_name')
      .not('entity_code', 'is', null)
      .not('entity_code', 'eq', '');

    if (brandsError) {
      console.error('❌ Error fetching brands:', brandsError);
      return NextResponse.json({
        success: false,
        error: brandsError.message,
        brands: []
      }, { status: 500 });
    }

    // Format brands as options with value and label
    const brandOptions = brandsData?.map(brand => ({
      value: brand.entity_code,
      label: brand.entity_name || brand.entity_code
    })) || [];

    // Remove duplicates based on entity_code and sort by label
    const uniqueBrandOptions = brandOptions
      .filter((brand, index, arr) => 
        arr.findIndex(b => b.value === brand.value) === index
      )
      .sort((a, b) => a.label.localeCompare(b.label));

    console.log(`✅ Found ${uniqueBrandOptions.length} brands:`, uniqueBrandOptions);

    return NextResponse.json({
      success: true,
      brands: uniqueBrandOptions,
      count: uniqueBrandOptions.length
    });

  } catch (error: any) {
    console.error('❌ Brands API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
      brands: []
    }, { status: 500 });
  }
}
