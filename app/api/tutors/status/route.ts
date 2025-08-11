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

    const supabase = createAdminSupabaseClient();

    // Ensure tutor_management row exists for the user; if not, create it
    const { data: existing, error: existingError } = await supabase
      .from('tutor_management')
      .select('id, status_tutor, status_changed_by, last_status_change, updated_at')
      .eq('user_id', user_id)
      .single();

    const nowIso = new Date().toISOString();

    if (existingError && existingError.code !== 'PGRST116') {
      // Not found error from PostgREST is fine; any other error should stop
      return NextResponse.json({ success: false, message: existingError.message }, { status: 500 });
    }

    let upsertResult;
    if (!existing) {
      upsertResult = await supabase
        .from('tutor_management')
        .insert({
          user_id,
          status_tutor,
          status_changed_by: session.user.id,
          last_status_change: nowIso,
          updated_at: nowIso,
        })
        .select('status_tutor, status_changed_by, last_status_change, updated_at')
        .single();
    } else {
      upsertResult = await supabase
        .from('tutor_management')
        .update({
          status_tutor,
          status_changed_by: session.user.id,
          last_status_change: nowIso,
          updated_at: nowIso,
        })
        .eq('user_id', user_id)
        .select('status_tutor, status_changed_by, last_status_change, updated_at')
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


