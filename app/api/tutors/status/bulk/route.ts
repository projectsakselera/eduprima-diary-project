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

    // Convert status to CAPS for consistent database storage
    const status_tutor_caps = status_tutor.toUpperCase();

    const supabase = createAdminSupabaseClient();
    const nowIso = new Date().toISOString();

    // Get tutor_details.id from user_ids first
    const { data: tutorDetailsData, error: tutorDetailsErr } = await supabase
      .from('tutor_details')
      .select('id, user_id')
      .in('user_id', user_ids);
    
    if (tutorDetailsErr) {
      return NextResponse.json({ success: false, message: tutorDetailsErr.message }, { status: 500 });
    }
    
    if (!tutorDetailsData || tutorDetailsData.length === 0) {
      return NextResponse.json({ success: false, message: 'No tutors found for provided user_ids' }, { status: 404 });
    }
    
    const tutorIdMap = new Map(tutorDetailsData.map((td: any) => [td.user_id, td.id]));
    const tutorIds = tutorDetailsData.map((td: any) => td.id);
    
    // 1) Fetch which tutor_ids already have status rows
    const { data: existingRows, error: existingErr } = await supabase
      .from('tutor_status')
      .select('tutor_id')
      .in('tutor_id', tutorIds);
    if (existingErr) {
      return NextResponse.json({ success: false, message: existingErr.message }, { status: 500 });
    }

    const existingTutorIds = new Set((existingRows || []).map((r: any) => r.tutor_id));
    const toInsert = tutorIds.filter((tutorId: any) => !existingTutorIds.has(tutorId)).map((tutorId: any) => ({
      tutor_id: tutorId,
      current_status: status_tutor_caps,
      effective_date: nowIso,
      created_at: nowIso,
      updated_at: nowIso,
    }));

    if (toInsert.length > 0) {
      const { error: insertErr } = await supabase
        .from('tutor_status')
        .insert(toInsert);
      if (insertErr) {
        return NextResponse.json({ success: false, message: insertErr.message }, { status: 500 });
      }
    }

    // 2) Update all targeted rows
    const { error: updateErr } = await supabase
      .from('tutor_status')
      .update({
        current_status: status_tutor_caps,
        effective_date: nowIso,
        updated_at: nowIso,
      })
      .in('tutor_id', tutorIds);

    if (updateErr) {
      return NextResponse.json({ success: false, message: updateErr.message }, { status: 500 });
    }

    // Response maps for client-side state updating
    const effective_date_map: Record<string, string> = {};
    const updated_at_map: Record<string, string> = {};
    user_ids.forEach(id => {
      effective_date_map[id] = nowIso;
      updated_at_map[id] = nowIso;
    });

    return NextResponse.json({
      success: true,
      data: {
        status_tutor: status_tutor_caps,
        effective_date_map,
        updated_at_map,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Internal server error' }, { status: 500 });
  }
}


