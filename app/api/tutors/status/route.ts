import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase-admin';
import { auth as legacyAuth } from '@/lib/auth';
import { auth as nextAuth } from '@/auth';

// PUT: Update tutor status
export async function PUT(req: NextRequest) {
  try {
    // Try NextAuth first, then fallback to legacy auth-session
    const session = (await nextAuth()) || (await legacyAuth());
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { user_id, status_tutor } = body as { user_id?: string; status_tutor?: string };
    if (!user_id || !status_tutor) {
      return NextResponse.json({ success: false, message: 'user_id and status_tutor are required' }, { status: 400 });
    }

    // Convert status to CAPS for consistent database storage
    const status_tutor_caps = status_tutor.toUpperCase();

    const supabase = createAdminSupabaseClient();

    // Get tutor_details.id from user_id first
    const { data: tutorDetails, error: tutorDetailsError } = await supabase
      .from('tutor_details')
      .select('id')
      .eq('user_id', user_id)
      .single();
    
    if (tutorDetailsError) {
      return NextResponse.json({ success: false, message: 'Tutor not found' }, { status: 404 });
    }
    
    const tutorId = tutorDetails.id;
    
    // Check if tutor_status row exists for the tutor; if not, create it
    const { data: existing, error: existingError } = await supabase
      .from('tutor_status')
      .select('id, current_status, effective_date, updated_at')
      .eq('tutor_id', tutorId)
      .single();

    const nowIso = new Date().toISOString();

    if (existingError && existingError.code !== 'PGRST116') {
      // Not found error from PostgREST is fine; any other error should stop
      return NextResponse.json({ success: false, message: existingError.message }, { status: 500 });
    }

    let upsertResult;
    if (!existing) {
      upsertResult = await supabase
        .from('tutor_status')
        .insert({
          tutor_id: tutorId,
          current_status: status_tutor_caps,
          effective_date: nowIso,
          created_at: nowIso,
          updated_at: nowIso,
        })
        .select('current_status, effective_date, updated_at')
        .single();
    } else {
      upsertResult = await supabase
        .from('tutor_status')
        .update({
          current_status: status_tutor_caps,
          effective_date: nowIso,
          updated_at: nowIso,
        })
        .eq('tutor_id', tutorId)
        .select('current_status, effective_date, updated_at')
        .single();
    }

    if (upsertResult.error) {
      return NextResponse.json({ success: false, message: upsertResult.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: upsertResult.data });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Internal server error' }, { status: 500 });
  }
}


