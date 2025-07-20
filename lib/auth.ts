import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { createAdminSupabaseClient } from './supabase-admin';

export const { auth, handlers, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
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
          const supabase = createAdminSupabaseClient();
          
          // Get user from database - same logic as custom API
          const { data: user, error: userError } = await supabase
            .from('t_310_01_01_users_universal')
            .select('*')
            .eq('email', credentials.email)
            .eq('user_status', 'active')
            .single();

          if (userError || !user) {
            return null;
          }

          // Simple password check (same as custom API)
          if (credentials.password !== 'password123') {
            return null;
          }

          // Return user object for NextAuth session
          return {
            id: user.id,
            email: user.email,
            name: user.name || user.email,
            userCode: user.user_code,
            role: user.role,
            primaryRole: user.primary_role,
            accountType: user.account_type,
          } as any;
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Persist user data in JWT token
      if (user) {
        (token as any).userCode = (user as any).userCode;
        (token as any).role = (user as any).role;
        (token as any).primaryRole = (user as any).primaryRole;
        (token as any).accountType = (user as any).accountType;
      }
      return token;
    },
    async session({ session, token }) {
      // Send user data to client
      if (token && session.user) {
        (session.user as any).userCode = (token as any).userCode;
        (session.user as any).role = (token as any).role;
        (session.user as any).primaryRole = (token as any).primaryRole;
        (session.user as any).accountType = (token as any).accountType;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
  },
});
