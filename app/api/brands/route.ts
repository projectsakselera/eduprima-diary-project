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

    console.log('🔍 Fetching distinct brands from tutor_management...');

    // Get distinct entity_code values from tutor_management table
    const { data: brandsData, error: brandsError } = await supabase
      .from('tutor_management')
      .select('entity_code')
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

    // Extract unique brands and sort them
    const uniqueBrands = [...new Set(brandsData?.map(b => b.entity_code) || [])]
      .filter(brand => brand && brand.trim() !== '')
      .sort();

    console.log(`✅ Found ${uniqueBrands.length} distinct brands:`, uniqueBrands);

    return NextResponse.json({
      success: true,
      brands: uniqueBrands,
      count: uniqueBrands.length
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
