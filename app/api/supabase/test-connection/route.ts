import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Test koneksi dengan query sederhana
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
      })
    }

    return NextResponse.json({ 
      status: 'success',
      message: 'Supabase connection successful',
      data: data
    })
  } catch (error) {
    return NextResponse.json({ 
      status: 'error',
      message: 'Failed to connect to Supabase',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
} 