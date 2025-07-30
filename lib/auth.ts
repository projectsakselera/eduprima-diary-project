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
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      // Include role information in JWT token
      if (user) {
        token.role = (user as any).role;
        token.userCode = (user as any).userCode;
        token.primaryRole = (user as any).primaryRole;
        token.accountType = (user as any).accountType;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      // Include role information in session
      if (token) {
        (session.user as any).role = token.role;
        (session.user as any).userCode = token.userCode;
        (session.user as any).primaryRole = token.primaryRole;
        (session.user as any).accountType = token.accountType;
      }
      return session;
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // Custom redirect logic based on URL or could be enhanced with user role
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
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
          
          // Get user from database with role information via JOIN
          const { data: user, error: userError } = await supabase
            .from('t_310_01_01_users_universal')
            .select(`
              id,
              email,
              user_code,
              user_status,
              password_hash,
              account_type,
              primary_role_id,
              t_340_01_01_roles!primary_role_id (
                role_code,
                role_name,
                role_description
              )
            `)
            .eq('email', credentials.email)
            .eq('user_status', 'active')
            .single();

          if (!userError && user && user.password_hash && typeof user.password_hash === 'string' && typeof credentials.password === 'string') {
            // Proper password verification using bcrypt
            const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash);
            
            if (isPasswordValid) {
              // Map role_code to authorization system
              const roleCode = user.t_340_01_01_roles?.role_code;
              let mappedRole = roleCode;
              
              // Map roles for backward compatibility with existing auth system
              if (roleCode === 'admin') {
                mappedRole = 'super_admin'; // Admin gets super admin access
              } else if (roleCode === 'database_tutor_manager') {
                mappedRole = 'database_tutor_manager'; // Keep same
              } else if (roleCode === 'tutor_manager') {
                mappedRole = 'database_tutor_manager'; // Map to database tutor manager
              }
              
              return {
                id: user.id,
                email: user.email,
                name: user.email, // Use email as name since name column doesn't exist
                userCode: user.user_code,
                role: mappedRole,
                roleCode: roleCode, // Original role code
                roleName: user.t_340_01_01_roles?.role_name,
                primaryRole: roleCode, // Use role_code as primary_role
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
            email: 'amhar.idn@gmail.com',
            password: 'password123',
            id: '1',
            name: 'Super Admin',
            userCode: 'ADM001',
            role: 'super_admin',
            roleCode: 'admin',
            roleName: 'Administrator',
            primaryRole: 'admin',
            accountType: 'admin'
          },
          {
            email: 'em@eduprima.id', 
            password: 'password123',
            id: '2',
            name: 'Database Tutor Manager',
            userCode: 'DTM001',
            role: 'database_tutor_manager',
            roleCode: 'database_tutor_manager',
            roleName: 'Database Tutor',
            primaryRole: 'database_tutor_manager',
            accountType: 'staff'
          },
          {
            email: 'demo@demo.com',
            password: 'demo123',
            id: '3', 
            name: 'Demo User',
            userCode: 'DMO001',
            role: 'database_tutor_manager',
            roleCode: 'tutor',
            roleName: 'Tutor',
            primaryRole: 'tutor',
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
            roleCode: devUser.roleCode,
            roleName: devUser.roleName,
            primaryRole: devUser.primaryRole,
            accountType: devUser.accountType,
          } as any;
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: '/auth/login',
    error: '/auth/login', // Redirect errors back to login page
  },
});
