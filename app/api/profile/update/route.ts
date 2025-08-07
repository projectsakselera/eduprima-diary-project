import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase-admin';
import { auth } from '@/lib/auth';

export async function PUT(req: NextRequest) {
  try {
    // Verify authentication
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { email, phone, primary_country, timezone, marketing_consent } = body;

    // Verify that the user can only update their own profile
    if (email !== session.user.email) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized to update this profile' },
        { status: 403 }
      );
    }

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = createAdminSupabaseClient();

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Only include fields that are provided and valid for the database
    if (phone !== undefined) updateData.phone = phone;
    if (primary_country !== undefined) updateData.primary_country = primary_country;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (marketing_consent !== undefined) updateData.marketing_consent = marketing_consent;

    // Update user profile in Supabase
    const { data, error } = await supabase
      .from('users_universal')
      .update(updateData)
      .eq('email', email)
      .eq('user_status', 'active')
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to update profile in database', error: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, message: 'User not found or inactive' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        phone: data.phone,
        primary_country: data.primary_country,
        timezone: data.timezone,
        marketing_consent: data.marketing_consent,
        updated_at: data.updated_at,
      }
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET method to retrieve profile (optional)
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = createAdminSupabaseClient();
    
    const { data, error } = await supabase
      .from('users_universal')
      .select('*')
      .eq('email', session.user.email)
      .eq('user_status', 'active')
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, message: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 