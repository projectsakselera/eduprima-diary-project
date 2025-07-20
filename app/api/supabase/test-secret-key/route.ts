import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    
    // Test query menggunakan Secret API key
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (error) {
      return NextResponse.json({
        status: 'error',
        message: error.message,
        code: error.code,
        details: error.details
      }, { status: 400 })
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'Anon key is working correctly',
      data: data
    })
    
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message
    }, { status: 500 })
  }
} 