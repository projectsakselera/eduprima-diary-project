import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const documentType = searchParams.get('documentType');

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    
    let query = supabase
      .from('document_storage')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Filter by document type if provided
    if (documentType) {
      query = query.eq('document_type', documentType);
    }

    const { data: documents, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch documents'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      documents: documents || [],
      count: documents?.length || 0
    });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

