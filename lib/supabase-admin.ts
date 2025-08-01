import { createClient } from '@supabase/supabase-js'

// Admin client untuk Super Admin - menggunakan Service Role Key
export const createAdminSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_service_role_key'
  
  // Debug logging for environment check
  console.log('🔍 Environment Variables Check:');
  console.log('   - NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'FOUND' : 'MISSING');
  console.log('   - SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'FOUND' : 'MISSING');
  
  // Additional debug: show actual values (masked for security)
  console.log('🔍 Actual Values Check:');
  console.log('   - NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30)}...` : 'undefined');
  console.log('   - SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? `${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...` : 'undefined');
  
  // Check if Supabase credentials are configured
  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('🔍 Detailed Check:');
  console.log('   - hasUrl:', hasUrl);
  console.log('   - hasKey:', hasKey);
  console.log('   - Both present:', hasUrl && hasKey);
  
  if (!hasUrl || !hasKey) {
    console.error('❌ SUPABASE CREDENTIALS REQUIRED! Please configure:');
    if (!hasUrl) console.error('   - NEXT_PUBLIC_SUPABASE_URL is missing');
    if (!hasKey) console.error('   - SUPABASE_SERVICE_ROLE_KEY is missing');
    console.warn('⚠️  All authentication will FAIL until Supabase is properly configured')
    console.warn('🚫 RETURNING MOCK CLIENT - All uploads will fail');
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
      }),
      storage: {
        from: () => ({
          upload: () => Promise.resolve({ data: null, error: new Error('Supabase storage not configured') }),
          getPublicUrl: () => ({ data: { publicUrl: '' } })
        })
      }
    } as any;
  }
  
  console.log('✅ Creating REAL Supabase Admin Client with valid credentials');
  console.log('🚀 Service Role Key found, client will have full admin access');
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