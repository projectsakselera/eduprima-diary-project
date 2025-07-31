import createMiddleware from 'next-intl/middleware';
import {NextRequest, NextResponse} from 'next/server';
import {locales} from '@/config';
import { auth } from "@/auth";
import { getSessionFromRequest } from "@/lib/auth"; // Keep for backward compatibility

export default async function middleware(request: NextRequest) {
  // Step 1: Check protected routes
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware for API routes, static files, and auth pages
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/auth/') ||
    pathname.includes('.') ||
    pathname.startsWith('/en/auth/') ||
    pathname.startsWith('/id/auth/') ||
    pathname.startsWith('/ar/auth/')
  ) {
    return NextResponse.next();
  }

  // Step 2: Role-based access control for protected paths
  if (pathname.includes('/eduprima/')) {
    let session = null;
    let authSystem = 'unknown';
    
    // Try NextAuth first
    try {
      const nextAuthSession = await auth();
      if (nextAuthSession?.user?.id) {
        session = nextAuthSession;
        authSystem = 'NextAuth';
        console.log('🔍 Middleware: Using NextAuth session for user:', session.user.email);
      }
    } catch (nextAuthError) {
      console.log('📝 Middleware: NextAuth not available, trying custom auth...');
    }

    // Fallback to custom auth if NextAuth not available
    if (!session?.user?.id) {
      try {
        const customAuthSession = await getSessionFromRequest(request);
        if (customAuthSession?.user?.id) {
          session = customAuthSession;
          authSystem = 'Custom Auth';
          console.log('🔍 Middleware: Using Custom Auth session for user:', session.user.email);
        }
      } catch (customAuthError) {
        console.log('📝 Middleware: Custom auth not available');
      }
    }
    
    console.log('🔍 Middleware Debug - Path:', pathname);
    console.log('🔍 Middleware Debug - Auth System:', authSystem);
    console.log('🔍 Middleware Debug - Session:', session ? 'Found' : 'Not found');
    console.log('🔍 Middleware Debug - Cookies:', request.cookies.getAll().map(c => c.name));
    
    if (!session) {
      console.log('❌ Middleware: No session found from either NextAuth or Custom Auth, redirecting to login');
      return NextResponse.redirect(new URL('/en/auth/login', request.url));
    }

    const userRole = session.user?.role;
    console.log('✅ Middleware: User role:', userRole, 'via', authSystem);
    
    // Super admin has access to everything
    if (userRole === 'super_admin') {
      // Continue to i18n middleware
    } 
    // Database tutor manager restricted to database-tutor paths only
    else if (userRole === 'database_tutor_manager') {
      if (!pathname.includes('/database-tutor') && !pathname.includes('/profile')) {
        return NextResponse.redirect(new URL('/en/eduprima/main/ops/em/matchmaking/database-tutor/view-all', request.url));
      }
    } 
    // Other roles - redirect to unauthorized
    else {
      return NextResponse.redirect(new URL('/en/auth/login?error=unauthorized', request.url));
    }
  }

  // Step 3: Use the incoming request for i18n
  const defaultLocale = request.headers.get('dashcode-locale') || 'en';
 
  // Step 4: Create and call the next-intl middleware
  const handleI18nRouting = createMiddleware({
    locales,
    defaultLocale,
    localePrefix: 'always'
  });
  
  const response = handleI18nRouting(request);
 
  // Step 5: Alter the response
  if (response) {
    response.headers.set('dashcode-locale', defaultLocale);
    return response;
  }
  
  return response;
}
 
export const config = {
  // Match only internationalized pathnames, exclude API routes and static files
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',
    
    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    '/(ar|en|id)/:path*',
    
    // Enable redirects that add missing locales but exclude:
    // - API routes (/api/*)
    // - Static files (files with extensions)
    // - NextJS internal files (_next/*)
    // - Vercel files (_vercel/*)
    // - NextAuth routes
    '/((?!api/|_next/|_vercel/|favicon.ico|.*\\..*).*)'
  ]
};