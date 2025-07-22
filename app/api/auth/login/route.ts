import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'

// This API is deprecated - use NextAuth credentials provider instead
// Keeping for reference only
export async function POST(request: Request) {
  return NextResponse.json({
    status: 'error',
    message: 'This endpoint is deprecated. Use NextAuth credentials provider instead.'
  }, { status: 410 })
} 