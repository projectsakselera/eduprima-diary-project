import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    
    const results: {
      canAccessUsers: boolean;
      canBypassRLS: boolean;
      canAccessAuthUsers: boolean;
      canBulkDelete: boolean;
      errors: string[];
    } = {
      canAccessUsers: false,
      canBypassRLS: false,
      canAccessAuthUsers: false,
      canBulkDelete: false,
      errors: []
    }
    
    // Test 1: Akses tabel users (akan gagal jika RLS aktif)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .limit(1)
      
      if (error) {
        results.errors.push(`Users table: ${error.message}`)
      } else {
        results.canAccessUsers = true
      }
    } catch (error: any) {
      results.errors.push(`Users table error: ${error.message}`)
    }
    
    // Test 2: Akses auth.users (akan gagal dengan anon key)
    try {
      const { data, error } = await supabase
        .from('auth.users')
        .select('*')
        .limit(1)
      
      if (error) {
        results.errors.push(`Auth users: ${error.message}`)
      } else {
        results.canAccessAuthUsers = true
      }
    } catch (error: any) {
      results.errors.push(`Auth users error: ${error.message}`)
    }
    
    // Test 3: Bulk delete (akan gagal jika RLS aktif)
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // dummy condition
      
      if (error) {
        results.errors.push(`Bulk delete: ${error.message}`)
      } else {
        results.canBulkDelete = true
      }
    } catch (error: any) {
      results.errors.push(`Bulk delete error: ${error.message}`)
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'Anon key limitations test',
      results: results,
      recommendation: 'Use service role key for admin operations'
    })
    
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message
    }, { status: 500 })
  }
} 