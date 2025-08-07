import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import bcrypt from 'bcryptjs'
import { z } from "zod"

// Import existing User interface from lib/auth
import type { User } from '@/lib/auth'

// Extend NextAuth types to include our custom user fields
declare module "next-auth" {
  interface User {
    id: string
    email: string
    user_code: string
    account_type: string
    role: string
    role_name: string
    primaryRole?: string
    accountType?: string
    userCode?: string
    emailVerified?: Date | null
    name?: string | null
    image?: string | null
  }

  interface Session {
    user: User
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    user: User
  }
}

// Login schema validation
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          // Validate input
          const parsed = loginSchema.safeParse(credentials)
          if (!parsed.success) {
            console.log('❌ NextAuth - Invalid credentials format')
            return null
          }

          const { email, password } = parsed.data
          console.log('🔐 NextAuth - Attempting login for:', email)

          // Get Supabase admin client
          const supabase = createAdminSupabaseClient()

          // Get user from universal table with role information
          const { data: user, error: userError } = await supabase
            .from('users_universal')
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
            .eq('email', email)
            .eq('user_status', 'active')
            .single()

          if (userError || !user) {
            console.log('❌ NextAuth - User not found or inactive:', email)
            return null
          }

          // Check password
          if (!user.password_hash) {
            console.log('❌ NextAuth - No password hash found for user:', email)
            return null
          }

          const isPasswordValid = await bcrypt.compare(password, user.password_hash)

          if (!isPasswordValid) {
            console.log('❌ NextAuth - Invalid password for user:', email)
            return null
          }

          console.log('✅ NextAuth - Login successful for:', email)

          // Map role_code to authorization system  
          const roleCode = user.t_340_01_01_roles?.role_code
          let mappedRole = roleCode
          
          // Map roles for backward compatibility with existing auth system
          if (roleCode === 'admin') {
            mappedRole = 'super_admin' // Admin gets super admin access
          } else if (roleCode === 'database_tutor_manager') {
            mappedRole = 'database_tutor_manager' // Keep same
          } else if (roleCode === 'tutor_manager') {
            mappedRole = 'database_tutor_manager' // Map to database tutor manager
          }

          // ✅ AUTHORIZATION CHECK: Only allow specific roles to access the system
          const allowedRoles = ['super_admin', 'database_tutor_manager'];
          if (!allowedRoles.includes(mappedRole || '')) {
            console.log('❌ NextAuth - User role not authorized for system access:', roleCode, '→', mappedRole)
            console.log('❌ NextAuth - Allowed roles:', allowedRoles)
            return null // Reject login for unauthorized roles
          }

          // Return user object for NextAuth session
          const userResponse: User = {
            id: user.id,
            email: user.email,
            user_code: user.user_code,
            account_type: user.account_type,
            role: mappedRole || 'user',
            role_name: user.t_340_01_01_roles?.role_name || 'User',
            primaryRole: roleCode,
            accountType: user.account_type,
            userCode: user.user_code
          }

          console.log('✅ NextAuth - User authorized and object created:', userResponse.email, userResponse.role)
          return userResponse

        } catch (error: any) {
          console.error('❌ NextAuth - Authorization error:', error)
          return null
        }
      }
    })
  ],
  
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days (same as custom auth)
  },

  callbacks: {
    async jwt({ token, user }) {
      // When user signs in, store user data in JWT
      if (user) {
        token.user = user as User
      }
      return token
    },
    
    async session({ session, token }) {
      // Pass user data from JWT to session
      if (token.user) {
        session.user = {
          ...session.user,
          ...token.user,
          emailVerified: session.user.emailVerified || null
        }
      }
      return session
    },
  },

  // Remove custom pages - let NextAuth handle default routing compatible with i18n
  // The app will handle redirect manually in login-form.tsx

  debug: process.env.NODE_ENV === 'development',
})