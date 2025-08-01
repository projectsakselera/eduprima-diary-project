import { NextResponse } from 'next/server'
import { SupabaseAdmin, UserRole } from '@/lib/supabase-admin'
import { auth } from '@/auth'

const admin = new SupabaseAdmin()

export async function GET() {
  try {
    // 🔐 Add minimal auth check without changing core logic
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({
        status: 'error',
        message: 'Authentication required'
      }, { status: 401 })
    }

    const users = await admin.getAllUsers()
    
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

export async function POST(request: Request) {
  try {
    // 🔐 Add minimal auth check without changing core logic
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({
        status: 'error',
        message: 'Authentication required'
      }, { status: 401 })
    }

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