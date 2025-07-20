import { NextResponse } from 'next/server'
import { SupabaseAdmin, UserRole } from '@/lib/supabase-admin'

const admin = new SupabaseAdmin()

export async function GET() {
  try {
    const { data: users, error } = await admin.supabase
      .from('t_310_01_01_users_universal')
      .select('*')
      .order('created_at', { ascending: false })
    
    return NextResponse.json({
      status: 'success',
      data: users,
      count: users.length
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, name, role = UserRole.KARYAWAN, department, position, phone } = body
    
    const newUser = await admin.createUser({
      email,
      name,
      role,
      is_active: true,
      department,
      position,
      phone
    })
    
    return NextResponse.json({
      status: 'success',
      message: 'User created successfully',
      data: newUser
    }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message
    }, { status: 500 })
  }
} 