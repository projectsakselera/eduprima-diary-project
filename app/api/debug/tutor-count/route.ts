import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
}) : null;

export async function GET(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  try {
    const timestamp = new Date().toISOString();
    
    // Get role IDs
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('id, role_name')
      .or('role_name.ilike.%tutor%,role_name.ilike.%Tutor%,role_name.ilike.%educator%,role_name.ilike.%Educator%');
    
    const roleIds = roleData?.map(role => role.id) || [];
    
    // Count total users with tutor roles
    const { count: totalUsers, error: countError } = await supabase
      .from('users_universal')
      .select('id', { count: 'exact' })
      .in('primary_role_id', roleIds);
    
    // Get actual users (limit 5 for debug)
    const { data: sampleUsers, error: usersError } = await supabase
      .from('users_universal')
      .select('id, user_code, email, created_at')
      .in('primary_role_id', roleIds)
      .limit(5)
      .order('created_at', { ascending: false });

    const response = NextResponse.json({
      success: true,
      timestamp,
      environment: process.env.VERCEL_ENV || 'development',
      debug: {
        supabaseUrl: supabaseUrl?.substring(0, 30) + '...',
        hasKey: !!supabaseKey,
        roles: roleData,
        roleIds,
        totalUsers,
        sampleUsers,
        errors: {
          roleError,
          countError,
          usersError
        }
      }
    });

    // Anti-cache headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('X-Timestamp', Date.now().toString());
    
    return response;

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}