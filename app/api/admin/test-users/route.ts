import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'

export async function GET() {
  try {
    const supabase = createAdminSupabaseClient()
    
    const { data: users, error } = await supabase
      .from('t_310_01_01_users_universal')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      return NextResponse.json({
        status: 'error',
        message: error.message
      }, { status: 400 })
    }
    
    return NextResponse.json({
      status: 'success',
      data: users,
      count: users?.length || 0
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message
    }, { status: 500 })
  }
} 