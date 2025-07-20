import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase-admin';

export async function POST() {
  try {
    const supabase = createAdminSupabaseClient();

    // Check if users already exist to avoid duplicates
    const { data: existingUsers, error: checkError } = await supabase
      .from('t_310_01_01_users_universal')
      .select('email')
      .in('email', ['amhar.idn@gmail.com', 'em@eduprima.id', 'test@eduprima.id']);

    if (checkError) {
      console.error('Error checking existing users:', checkError);
      return NextResponse.json(
        { success: false, message: 'Failed to check existing users' },
        { status: 500 }
      );
    }

    const existingEmails = existingUsers?.map(u => u.email) || [];

    // Sample users to create
    const sampleUsers = [
      {
        email: 'amhar.idn@gmail.com',
        name: 'Amhar Ahmad',
        user_code: 'USR001',
        phone: '+62 812-3456-7890',
        address: 'Jakarta, Indonesia',
        bio: 'Full-stack developer with passion for education technology. Working on making education more accessible through digital platforms.',
        role: 'super_admin',
        primary_role: 'Administrator',
        account_type: 'premium',
        user_status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        email: 'em@eduprima.id',
        name: 'Emma Manager',
        user_code: 'USR002',
        phone: '+62 821-9876-5432',
        address: 'Bandung, Indonesia',
        bio: 'Education Manager focused on curriculum development and student engagement. 5+ years experience in educational leadership.',
        role: 'admin',
        primary_role: 'Manager',
        account_type: 'standard',
        user_status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        email: 'test@eduprima.id',
        name: 'Test User',
        user_code: 'USR003',
        phone: '+62 855-1122-3344',
        address: 'Surabaya, Indonesia',
        bio: 'Test user account for development and quality assurance purposes. Enthusiastic about educational technology testing.',
        role: 'karyawan',
        primary_role: 'Staff',
        account_type: 'basic',
        user_status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    // Filter out users that already exist
    const newUsers = sampleUsers.filter(user => !existingEmails.includes(user.email));

    if (newUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All sample users already exist',
        usersCreated: 0,
        existingUsers: existingEmails,
      });
    }

    // Insert new users
    const { data: insertedUsers, error: insertError } = await supabase
      .from('t_310_01_01_users_universal')
      .insert(newUsers)
      .select();

    if (insertError) {
      console.error('Error inserting users:', insertError);
      return NextResponse.json(
        { success: false, message: 'Failed to insert sample users', error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully created ${newUsers.length} sample users`,
      usersCreated: newUsers.length,
      existingUsers: existingEmails,
      newUsers: insertedUsers?.map(u => ({ email: u.email, name: u.name, role: u.role })) || [],
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET method to check current users
export async function GET() {
  try {
    const supabase = createAdminSupabaseClient();
    
    const { data: users, error } = await supabase
      .from('t_310_01_01_users_universal')
      .select('email, name, role, user_status, created_at')
      .eq('user_status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, message: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      users: users || [],
      count: users?.length || 0,
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 