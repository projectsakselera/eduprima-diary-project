// ================================================================
// LEGACY AUTH UTILITIES - BACKWARD COMPATIBILITY
// ================================================================ 
// NOTE: This file is kept for backward compatibility during NextAuth migration.
// Primary authentication now handled by NextAuth (see /auth.ts)
// These functions are used by:
// - JWT Bridge (/api/supabase-session) 
// - Middleware fallback (middleware.ts)
// ================================================================

import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';

// Session configuration (legacy)
const SESSION_SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
if (!SESSION_SECRET) {
  throw new Error('🔐 AUTH_SECRET or NEXTAUTH_SECRET must be set in environment variables');
}
const SESSION_COOKIE_NAME = 'auth-session';
const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

export interface User {
  id: string;
  email: string;
  user_code: string;
  account_type: string;
  role: string;
  role_name: string;
  primaryRole?: string;
  accountType?: string;
  userCode?: string;
}

export interface Session {
  user: User;
  expires: number;
}

// Note: createSessionToken removed - replaced by NextAuth JWT handling

// Verify and decode JWT session token
export async function verifySessionToken(token: string): Promise<Session | null> {
  try {
    console.log('🔍 verifySessionToken - Starting verification...');
    
    const secret = new TextEncoder().encode(SESSION_SECRET);
    const { payload } = await jwtVerify(token, secret);
    
    console.log('✅ verifySessionToken - JWT verification successful');
    
    return {
      user: payload.user as User,
      expires: (payload.exp as number) * 1000 // Convert to milliseconds
    };
  } catch (error: any) {
    console.error('❌ verifySessionToken - JWT verification failed:', error);
    console.error('❌ verifySessionToken - Error details:', error.message);
    return null;
  }
}

// Get current session from cookies (server-side)
export async function auth(): Promise<Session | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME);
  
  if (!sessionToken) {
    return null;
  }
  
  const session = await verifySessionToken(sessionToken.value);
  
  // Check if session is expired
  if (!session || session.expires < Date.now()) {
    return null;
  }
  
  return session;
}

// Get session from request (middleware)
export async function getSessionFromRequest(request: NextRequest): Promise<Session | null> {
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME);
  
  console.log('🔍 getSessionFromRequest - Token found:', !!sessionToken);
  
  if (!sessionToken) {
    console.log('❌ getSessionFromRequest: No session token found');
    return null;
  }
  
  const session = await verifySessionToken(sessionToken.value);
  
  console.log('🔍 getSessionFromRequest - Session verified:', !!session);
  
  // Check if session is expired
  if (!session || session.expires < Date.now()) {
    console.log('❌ getSessionFromRequest: Session expired or invalid');
    return null;
  }
  
  console.log('✅ getSessionFromRequest: Valid session for user:', session.user.email);
  return session;
}

// Note: SESSION_COOKIE_OPTIONS removed - NextAuth handles cookie management
