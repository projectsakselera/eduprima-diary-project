import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Lightweight search result interface
interface SearchResult {
  id: string;
  trn: string;
  namaLengkap: string;
  namaPanggilan: string;
  email: string;
  noHp1: string;
  fotoProfil: string | null;
  status_tutor: string;
  headline: string;
  statusAkademik: string;
  namaUniversitas: string;
  selectedPrograms: string[];
}

export async function GET(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const limit = Math.min(parseInt(searchParams.get('limit') || '8'), 20); // Max 20 results

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  // Add cache headers for better performance
  const headers = {
    'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
    'Content-Type': 'application/json'
  };

  try {
    const startTime = Date.now();
    console.log(`🔍 Searching tutors with query: "${query}"`);

    // Search in users and profiles with lightweight fields only
    const { data: searchResults, error } = await supabase
      .from('users_universal')
      .select(`
        id,
        email,
        user_profiles!inner (
          full_name,
          nick_name,
          headline,
          profile_photo_url,
          mobile_phone
        ),
        tutor_details!inner (
          tutor_registration_number,
          academic_status,
          university_s1_name
        ),
        tutor_management!inner (
          status_tutor,
          approval_level
        )
      `)
      .or(`user_profiles.full_name.ilike.*${query}*,user_profiles.nick_name.ilike.*${query}*,email.ilike.*${query}*`)
      .eq('tutor_management.status_tutor', 'active')
      .limit(limit);

    if (error) {
      console.error('❌ Search error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get program mappings for found tutors (lightweight)
    const tutorIds = searchResults?.map(user => user.id) || [];
    const { data: programMappings } = await supabase
      .from('tutor_program_mappings')
      .select(`
        tutor_id,
        programs_unit!inner (
          program_name
        )
      `)
      .in('tutor_id', tutorIds);

    // Group programs by tutor
    const programsMap = new Map();
    programMappings?.forEach((mapping: any) => {
      if (!programsMap.has(mapping.tutor_id)) {
        programsMap.set(mapping.tutor_id, []);
      }
      programsMap.get(mapping.tutor_id).push(mapping.programs_unit.program_name);
    });

    // Format lightweight results
    const results: SearchResult[] = searchResults?.map((user: any) => ({
      id: user.id,
      trn: user.tutor_details[0]?.tutor_registration_number || '',
      namaLengkap: user.user_profiles[0]?.full_name || '',
      namaPanggilan: user.user_profiles[0]?.nick_name || '',
      email: user.email || '',
      noHp1: user.user_profiles[0]?.mobile_phone || '',
      fotoProfil: user.user_profiles[0]?.profile_photo_url || null,
      status_tutor: user.tutor_management[0]?.status_tutor || '',
      headline: user.user_profiles[0]?.headline || '',
      statusAkademik: user.tutor_details[0]?.academic_status || '',
      namaUniversitas: user.tutor_details[0]?.university_s1_name || '',
      selectedPrograms: programsMap.get(user.id) || []
    })) || [];

    console.log(`✅ Found ${results.length} tutors matching "${query}" in ${Date.now() - startTime}ms`);

    return NextResponse.json({ 
      results,
      total: results.length,
      query,
      responseTime: Date.now() - startTime
    }, { headers });

  } catch (error) {
    console.error('❌ Search error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Search failed' 
    }, { status: 500 });
  }
}