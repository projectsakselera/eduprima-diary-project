import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json({
        status: 'error',
        message: 'Email and password are required'
      }, { status: 400 })
    }
    
    const supabase = createAdminSupabaseClient()
    
    // Get user from database
    const { data: user, error: userError } = await supabase
      .from('t_310_01_01_users_universal')
      .select('*')
      .eq('email', email)
      .eq('user_status', 'active')
      .single()
    
    if (userError || !user) {
      return NextResponse.json({
        status: 'error',
        message: 'Invalid email or password'
      }, { status: 401 })
    }
    
    // For development: simple password check (replace with bcrypt later)
    if (password !== 'password123') {
      return NextResponse.json({
        status: 'error',
        message: 'Invalid email or password'
      }, { status: 401 })
    }
    
    // Return user data without sensitive info
    const userData = {
      id: user.id,
      email: user.email,
      user_code: user.user_code,
      role: user.role,
      primary_role: user.primary_role,
      account_type: user.account_type
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'Login successful',
      user: userData,
      redirect_url: user.role === 'super_admin' 
        ? '/eduprima/main' 
        : '/eduprima/main/ops/em/matchmaking/database-tutor'
    })
    
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Internal server error'
    }, { status: 500 })
  }
} 