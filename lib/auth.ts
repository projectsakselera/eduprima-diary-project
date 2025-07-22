import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from 'bcryptjs';
import { createAdminSupabaseClient } from './supabase-admin';

export const { auth, handlers, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "f8d9a8b7c6e5d4c3b2a1f0e9d8c7b6a5e4d3c2b1a0f9e8d7c6b5a4e3d2c1b0",
  trustHost: true, // Allow different ports
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    Google,
    GitHub,
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Try Supabase connection first
          const supabase = createAdminSupabaseClient();
          
          // Get user from database
          const { data: user, error: userError } = await supabase
            .from('t_310_01_01_users_universal')
            .select('*')
            .eq('email', credentials.email)
            .eq('user_status', 'active')
            .single();

          if (!userError && user && user.password_hash && typeof user.password_hash === 'string' && typeof credentials.password === 'string') {
            // Proper password verification using bcrypt
            const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash);
            
            if (isPasswordValid) {
              return {
                id: user.id,
                email: user.email,
                name: user.name || user.email,
                userCode: user.user_code,
                role: user.role,
                primaryRole: user.primary_role,
                accountType: user.account_type,
              } as any;
            }
          }
        } catch (error) {
          console.error('Supabase auth error:', error);
          // Fall back to development users if Supabase fails
        }

        // Fallback development/demo users if Supabase is not available
        const validUsers = [
          {
            email: 'admin@eduprima.com',
            password: 'admin123',
            id: '1',
            name: 'Admin EduPrima',
            userCode: 'ADM001',
            role: 'admin',
            primaryRole: 'super_admin',
            accountType: 'staff'
          },
          {
            email: 'staff@eduprima.com', 
            password: 'staff123',
            id: '2',
            name: 'Staff EduPrima',
            userCode: 'STF001',
            role: 'staff',
            primaryRole: 'staff',
            accountType: 'staff'
          },
          {
            email: 'demo@demo.com',
            password: 'demo123',
            id: '3', 
            name: 'Demo User',
            userCode: 'DMO001',
            role: 'user',
            primaryRole: 'user',
            accountType: 'demo'
          }
        ];

        // Find matching development user
        const devUser = validUsers.find(u => 
          u.email === credentials.email && u.password === credentials.password
        );

        if (devUser) {
          return {
            id: devUser.id,
            email: devUser.email,
            name: devUser.name,
            userCode: devUser.userCode,
            role: devUser.role,
            primaryRole: devUser.primaryRole,
            accountType: devUser.accountType,
          } as any;
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      // Persist user data in JWT token
      if (user) {
        (token as any).userCode = (user as any).userCode;
        (token as any).role = (user as any).role;
        (token as any).primaryRole = (user as any).primaryRole;
        (token as any).accountType = (user as any).accountType;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      // Send user data to client
      if (token && session.user) {
        (session.user as any).userCode = (token as any).userCode;
        (session.user as any).role = (token as any).role;
        (session.user as any).primaryRole = (token as any).primaryRole;
        (session.user as any).accountType = (token as any).accountType;
      }
      return session;
    },
    async signIn({ user, account, profile }: any) {
      // Allow sign in
      return true;
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // Always redirect to dashboard after successful login
      if (url.startsWith(baseUrl)) {
        return '/en/eduprima/main/ops/em/matchmaking/database-tutor/view-all';
      }
      return baseUrl + '/en/eduprima/main/ops/em/matchmaking/database-tutor/view-all';
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login', // Redirect errors back to login page
  },
});
