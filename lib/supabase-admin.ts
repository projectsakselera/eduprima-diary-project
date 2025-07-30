import { createClient } from '@supabase/supabase-js'

// Admin client untuk Super Admin - menggunakan Service Role Key
export const createAdminSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_service_role_key'
  
  // Check if Supabase credentials are configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ SUPABASE CREDENTIALS REQUIRED! Please configure:');
    console.error('   - NEXT_PUBLIC_SUPABASE_URL');
    console.error('   - SUPABASE_SERVICE_ROLE_KEY');
    console.warn('⚠️  All authentication will FAIL until Supabase is properly configured')
    // Return a mock client that will fail gracefully with complete method chain
    return {
      from: () => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') })
            })
          })
        })
      })
    } as any;
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// User roles
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  KARYAWAN = 'karyawan'
}

// User interface
export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  is_active: boolean
  avatar_url?: string
  phone?: string
  department?: string
  position?: string
  created_at: string
  updated_at: string
}

// Admin functions
export class SupabaseAdmin {
  private supabase = createAdminSupabaseClient()

  // Get all users (super admin only)
  async getAllUsers(): Promise<User[]> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  // Create new user
  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .insert([userData])
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Update user
  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Delete user
  async deleteUser(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('users')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  // Bulk operations
  async bulkCreateUsers(users: Omit<User, 'id' | 'created_at' | 'updated_at'>[]): Promise<User[]> {
    const { data, error } = await this.supabase
      .from('users')
      .insert(users)
      .select()
    
    if (error) throw error
    return data || []
  }

  // Get users by role
  async getUsersByRole(role: UserRole): Promise<User[]> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('role', role)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  // Toggle user active status
  async toggleUserStatus(id: string): Promise<User> {
    const { data: currentUser } = await this.supabase
      .from('users')
      .select('is_active')
      .eq('id', id)
      .single()
    
    const { data, error } = await this.supabase
      .from('users')
      .update({ is_active: !currentUser?.is_active })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
} 