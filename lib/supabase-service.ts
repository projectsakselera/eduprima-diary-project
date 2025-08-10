import { createClient } from '@supabase/supabase-js';

// ✅ SECURE - Using Environment Variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('⚠️  Supabase environment variables are not configured');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Types based on database schema
export interface SupabaseUser {
  id: string;
  user_code: string;
  email: string;
  phone?: string;
  primary_role_id: string;
  user_status: string;
  created_at: string;
}

export interface SupabaseUserProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  display_name?: string;
  city?: string;
  mobile_phone?: string;
  education_level?: string;
  university?: string;
  major?: string;
  teaching_subjects?: string[];
  grade_level?: string;
  bio?: string;
  profile_photo_url?: string;
  created_at: string;
}

export interface SupabaseTutorDetails {
  id: string;
  user_id: string;
  tutor_registration_number?: string;
  onboarding_status: string;
  background_check_status: string;
  bio_summary?: string;
  teaching_philosophy?: string;
  education_history?: any;
  teaching_experience?: string;
  achievements?: string;
  special_skills?: string;
  teaching_service_options?: string[];
  service_areas?: any;
  personality_tags?: string[];
  average_rating: number;
  total_teaching_hours: number;
  cancellation_rate: number;
  is_top_educator: boolean;
  created_at: string;
}

export interface CombinedTutorData {
  // User basic info
  id: string;
  user_code: string;
  email: string;
  phone?: string;
  user_status: string;
  
  // Profile info
  first_name: string;
  last_name: string;
  display_name?: string;
  city?: string;
  mobile_phone?: string;
  education_level?: string;
  university?: string;
  major?: string;
  teaching_subjects?: string[];
  bio?: string;
  profile_photo_url?: string;
  
  // Tutor specific
  tutor_registration_number?: string;
  onboarding_status: string;
  background_check_status: string;
  bio_summary?: string;
  teaching_philosophy?: string;
  teaching_experience?: string;
  achievements?: string;
  special_skills?: string;
  teaching_service_options?: string[];
  service_areas?: any;
  personality_tags?: string[];
  average_rating: number;
  total_teaching_hours: number;
  cancellation_rate: number;
  is_top_educator: boolean;
  
  // Timestamps
  created_at: string;
}

export class SupabaseTutorService {
  
  /**
   * Fetch all tutors with combined data from multiple tables
   */
  static async getAllTutors(): Promise<{
    data: CombinedTutorData[] | null;
    error: string | null;
    count: number;
  }> {
    try {
      console.log('🔍 Fetching tutors from Supabase...');

      // First, get role UUIDs for educators/tutors
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('id, role_name')
        .in('role_name', ['educator', 'tutor']);

      if (rolesError || !roles || roles.length === 0) {
        console.error('❌ Error fetching roles:', rolesError);
        return { data: null, error: 'No educator/tutor roles found', count: 0 };
      }

      const roleIds = roles.map(role => role.id);
      console.log('🔍 Found role IDs:', roleIds);

      // Now get users with those role IDs
      const { data: users, error: usersError } = await supabase
        .from('users_universal')
        .select('*')
        .in('primary_role_id', roleIds)
        .eq('user_status', 'active');

      if (usersError) {
        console.error('❌ Error fetching users:', usersError);
        return { data: null, error: usersError.message, count: 0 };
      }

      if (!users || users.length === 0) {
        console.log('⚠️ No tutors found in users_universal table');
        return { data: [], error: null, count: 0 };
      }

      console.log(`✅ Found ${users.length} tutor users`);

      // Get user IDs for further queries
      const userIds = users.map(user => user.id);

      // Fetch user profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .in('user_id', userIds);

      if (profilesError) {
        console.error('❌ Error fetching profiles:', profilesError);
        return { data: null, error: profilesError.message, count: 0 };
      }

      // Fetch tutor details
      const { data: tutorDetails, error: tutorError } = await supabase
        .from('tutor_details')
        .select('*')
        .in('user_id', userIds);

      if (tutorError) {
        console.error('❌ Error fetching tutor details:', tutorError);
        return { data: null, error: tutorError.message, count: 0 };
      }

      console.log(`✅ Found ${profiles?.length || 0} profiles and ${tutorDetails?.length || 0} tutor details`);

      // Combine data
      const combinedData: CombinedTutorData[] = users.map(user => {
        const profile = profiles?.find(p => p.user_id === user.id);
        const tutor = tutorDetails?.find(e => e.user_id === user.id);

        return {
          // User info
          id: user.id,
          user_code: user.user_code,
          email: user.email,
          phone: user.phone,
          user_status: user.user_status,
          
          // Profile info
          first_name: profile?.first_name || '',
          last_name: profile?.last_name || '',
          display_name: profile?.display_name || `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim(),
          city: profile?.city,
          mobile_phone: profile?.mobile_phone,
          education_level: profile?.education_level,
          university: profile?.university,
          major: profile?.major,
          teaching_subjects: profile?.teaching_subjects || [],
          bio: profile?.bio,
          profile_photo_url: profile?.profile_photo_url,
          
          // Tutor info
          tutor_registration_number: tutor?.tutor_registration_number,
          onboarding_status: tutor?.onboarding_status || 'pending_profile',
          background_check_status: tutor?.background_check_status || 'not_started',
          bio_summary: tutor?.bio_summary,
          teaching_philosophy: tutor?.teaching_philosophy,
          teaching_experience: tutor?.teaching_experience,
          achievements: tutor?.achievements,
          special_skills: tutor?.special_skills,
          teaching_service_options: tutor?.teaching_service_options || [],
          service_areas: tutor?.service_areas,
          personality_tags: tutor?.personality_tags || [],
          average_rating: tutor?.average_rating || 0,
          total_teaching_hours: tutor?.total_teaching_hours || 0,
          cancellation_rate: tutor?.cancellation_rate || 0,
          is_top_educator: tutor?.is_top_educator || false,
          
          // Timestamps
          created_at: user.created_at || new Date().toISOString()
        };
      });

      return {
        data: combinedData,
        error: null,
        count: combinedData.length
      };

    } catch (error) {
      console.error('❌ Unexpected error in getAllTutors:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        count: 0
      };
    }
  }

  /**
   * Test database connection
   */
  static async testConnection(): Promise<{
    isConnected: boolean;
    tablesAccessible: string[];
    errorMessage?: string;
  }> {
    try {
      const tablesAccessible: string[] = [];
      
      // Test users_universal table
      const { data: usersTest, error: usersError } = await supabase
        .from('users_universal')
        .select('id')
        .limit(1);
        
      if (!usersError) {
        tablesAccessible.push('users_universal');
      }
      
      // Test user_profiles table
      const { data: profilesTest, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id')
        .limit(1);
        
      if (!profilesError) {
        tablesAccessible.push('user_profiles');
      }

      // Test tutor_details table
      const { data: tutorTest, error: tutorError } = await supabase
        .from('tutor_details')
        .select('id')
        .limit(1);
        
      if (!tutorError) {
        tablesAccessible.push('tutor_details');
      }
      
      return {
        isConnected: tablesAccessible.length >= 2, // At least users and profiles should be accessible
        tablesAccessible,
      };
      
    } catch (error) {
      return {
        isConnected: false,
        tablesAccessible: [],
        errorMessage: `Connection failed: ${error}`
      };
    }
  }
} 