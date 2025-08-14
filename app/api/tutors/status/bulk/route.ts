import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase-admin';
import { auth as legacyAuth } from '@/lib/auth';
import { auth as nextAuth } from '@/auth';

// PUT: Bulk update tutor status
export async function PUT(req: NextRequest) {
  try {
    // Try NextAuth first, fallback to legacy auth-session cookie
    const session = (await nextAuth()) || (await legacyAuth());
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { user_ids, status_tutor } = body as { user_ids?: string[]; status_tutor?: string };
    if (!Array.isArray(user_ids) || user_ids.length === 0 || !status_tutor) {
      return NextResponse.json({ success: false, message: 'user_ids (array) dan status_tutor wajib diisi' }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();
    const nowIso = new Date().toISOString();

    // Upsert pattern: ensure rows exist for all user_ids
    // 1) Fetch which user_ids already have rows
    const { data: existingRows, error: existingErr } = await supabase
      .from('tutor_management')
      .select('user_id')
      .in('user_id', user_ids);
    if (existingErr) {
      return NextResponse.json({ success: false, message: existingErr.message }, { status: 500 });
    }

    const existingIds = new Set((existingRows || []).map((r: any) => r.user_id));
    const toInsert = user_ids.filter(id => !existingIds.has(id)).map(id => ({
      user_id: id,
      status_tutor,
      status_changed_by: session.user.id,
      last_status_change: nowIso,
      updated_at: nowIso,
    }));

    if (toInsert.length > 0) {
      const { error: insertErr } = await supabase
        .from('tutor_management')
        .insert(toInsert);
      if (insertErr) {
        return NextResponse.json({ success: false, message: insertErr.message }, { status: 500 });
      }
    }

    // 2) Update all targeted rows
    const { error: updateErr } = await supabase
      .from('tutor_management')
      .update({
        status_tutor,
        status_changed_by: session.user.id,
        last_status_change: nowIso,
        updated_at: nowIso,
      })
      .in('user_id', user_ids);

    if (updateErr) {
      return NextResponse.json({ success: false, message: updateErr.message }, { status: 500 });
    }

    // Response maps for client-side state updating
    const last_status_change_map: Record<string, string> = {};
    const updated_at_map: Record<string, string> = {};
    user_ids.forEach(id => {
      last_status_change_map[id] = nowIso;
      updated_at_map[id] = nowIso;
    });

    return NextResponse.json({
      success: true,
      data: {
        status_tutor,
        status_changed_by: session.user.id,
        last_status_change_map,
        updated_at_map,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Internal server error' }, { status: 500 });
  }
}


