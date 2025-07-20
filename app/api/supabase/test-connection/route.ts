import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({
        connected: false,
        error: 'Supabase client not configured'
      }, { status: 500 })
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
    
    return NextResponse.json({
      connected: true,
      message: 'Successfully connected to Supabase',
      hasData: data && data.length > 0
    })
  } catch (error: any) {
    return NextResponse.json({
      connected: false,
      error: error.message
    }, { status: 500 })
  }
} 