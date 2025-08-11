import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export async function POST(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database not available' }, { status: 500 });
  }

  try {
    const { email, user_code, phone } = await request.json();
    
    // Check for existing email
    const { data: emailCheck, error: emailError } = await supabase
      .from('users_universal')
      .select('id, email')
      .eq('email', email)
      .single();

    // Check for existing user_code
    const { data: userCodeCheck, error: userCodeError } = await supabase
      .from('users_universal')
      .select('id, user_code')
      .eq('user_code', user_code)
      .single();

    return NextResponse.json({
      email: {
        exists: !!emailCheck,
        data: emailCheck
      },
      user_code: {
        exists: !!userCodeCheck,
        data: userCodeCheck
      },
      errors: {
        email: emailError?.message,
        user_code: userCodeError?.message
      }
    });

  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
