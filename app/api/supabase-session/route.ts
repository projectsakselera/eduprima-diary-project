import { NextRequest, NextResponse } from 'next/server';
import { auth as customAuth } from '@/lib/auth';
import { auth as nextAuth } from '@/auth';
import { SignJWT } from 'jose';

export async function GET(request: NextRequest) {
  try {
    // 1. Try to get session from NextAuth first, then fallback to custom auth
    let session = null;
    let authSystem = 'unknown';

    try {
      // Try NextAuth first
      const nextAuthSession = await nextAuth();
      if (nextAuthSession?.user?.id) {
        session = nextAuthSession;
        authSystem = 'NextAuth';
        console.log('🔐 Using NextAuth session for user:', session.user.email);
      }
    } catch (nextAuthError) {
      console.log('📝 NextAuth session not available, trying custom auth...');
    }

    // Fallback to custom auth if NextAuth session not found
    if (!session?.user?.id) {
      try {
        const customAuthSession = await customAuth();
        if (customAuthSession?.user?.id) {
          session = customAuthSession;
          authSystem = 'Custom Auth';
          console.log('🔐 Using Custom Auth session for user:', session.user.email);
        }
      } catch (customAuthError) {
        console.log('📝 Custom auth session not available');
      }
    }

    // If no session from either system, reject access
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: "Unauthorized - No valid session from either NextAuth or Custom Auth" 
      }, { status: 401 });
    }

    console.log('🔐 Generating Supabase JWT for user:', session.user.email, 'via', authSystem);

    // 2. Siapkan data untuk JWT Supabase
    const supabaseJwtSecret = process.env.SUPABASE_JWT_SECRET;
    if (!supabaseJwtSecret) {
      console.error('❌ SUPABASE_JWT_SECRET is not set in environment');
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // 3. JWT payload untuk Supabase
    const payload = {
      // sub: Subject, harus ID pengguna di tabel user_universal
      sub: session.user.id,
      // aud: Audience untuk Supabase
      aud: "authenticated",
      // role: Peran standar untuk pengguna yang terotentikasi
      role: "authenticated",
      // iat: Issued at
      iat: Math.floor(Date.now() / 1000),
      // exp: Waktu kedaluwarsa token (1 jam)
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
      // Custom claims untuk user data
      user_metadata: {
        user_code: session.user.user_code,
        email: session.user.email,
        role: session.user.role,
        account_type: session.user.account_type
      },
      // App metadata
      app_metadata: {
        provider: "custom",
        providers: ["custom"]
      }
    };

    // 4. Buat dan tandatangani JWT menggunakan pustaka 'jose'
    const secretKey = new TextEncoder().encode(supabaseJwtSecret);
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .sign(secretKey);

    console.log('✅ Supabase JWT generated successfully for user:', session.user.email);

    // 5. Kirim token kembali ke klien
    return NextResponse.json({ 
      success: true,
      supabaseToken: token,
      authSystem: authSystem, // Show which auth system was used
      user: {
        id: session.user.id,
        email: session.user.email,
        user_code: session.user.user_code
      },
      expiresIn: 3600 // 1 hour in seconds
    });

  } catch (error: any) {
    console.error('❌ Supabase JWT generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}