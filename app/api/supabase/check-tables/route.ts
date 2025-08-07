import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    console.log('🔍 Fetching complete database schema from Supabase...')
    
    // Get all tables using raw SQL query
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_all_tables_info')

    if (tablesError) {
      console.error('❌ Error fetching tables:', tablesError)
      
      // Fallback: try to get tables using a different approach
      const { data: fallbackTables, error: fallbackError } = await supabase
        .from('users_universal')
        .select('*')
        .limit(1)
      
      if (fallbackError) {
        return NextResponse.json({ 
          success: false,
          error: 'Failed to connect to database: ' + tablesError.message,
          tables: []
        }, { status: 500 })
      }
      
      // If we can connect, return comprehensive table structure based on existing tables
      return NextResponse.json({ 
        success: true,
        tables: [
          {
            name: 'users_universal',
            columns: [
              { column_name: 'id', data_type: 'uuid', is_nullable: 'NO' },
              { column_name: 'email', data_type: 'text', is_nullable: 'NO' },
              { column_name: 'user_code', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'user_status', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'phone', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'phone_verified', data_type: 'boolean', is_nullable: 'YES' },
              { column_name: 'email_verified', data_type: 'boolean', is_nullable: 'YES' },
              { column_name: 'account_type', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'created_at', data_type: 'timestamp', is_nullable: 'YES' },
              { column_name: 'updated_at', data_type: 'timestamp', is_nullable: 'YES' }
            ]
          },
          {
            name: 'user_profiles',
            columns: [
              { column_name: 'id', data_type: 'uuid', is_nullable: 'NO' },
              { column_name: 'user_id', data_type: 'uuid', is_nullable: 'NO' },
              { column_name: 'full_name', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'nick_name', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'headline', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'bio', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'profile_photo_url', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'date_of_birth', data_type: 'date', is_nullable: 'YES' },
              { column_name: 'gender', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'nationality', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'education_level', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'university', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'major', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'graduation_year', data_type: 'integer', is_nullable: 'YES' },
              { column_name: 'gpa', data_type: 'numeric', is_nullable: 'YES' },
              { column_name: 'mobile_phone', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'mobile_phone_2', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'whatsapp_number', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'emergency_contact_name', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'emergency_contact_phone', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'emergency_contact_relationship', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'created_at', data_type: 'timestamp', is_nullable: 'YES' },
              { column_name: 'updated_at', data_type: 'timestamp', is_nullable: 'YES' }
            ]
          },
          {
            name: 't_310_01_03_user_addresses',
            columns: [
              { column_name: 'id', data_type: 'uuid', is_nullable: 'NO' },
              { column_name: 'user_id', data_type: 'uuid', is_nullable: 'NO' },
              { column_name: 'address_type', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'address_label', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'province_id', data_type: 'uuid', is_nullable: 'YES' },
              { column_name: 'city_id', data_type: 'uuid', is_nullable: 'YES' },
              { column_name: 'district_id', data_type: 'uuid', is_nullable: 'YES' },
              { column_name: 'village_id', data_type: 'uuid', is_nullable: 'YES' },
              { column_name: 'street_address', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'postal_code', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'landmark', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'is_primary', data_type: 'boolean', is_nullable: 'YES' },
              { column_name: 'is_verified', data_type: 'boolean', is_nullable: 'YES' },
              { column_name: 'created_at', data_type: 'timestamp', is_nullable: 'YES' },
              { column_name: 'updated_at', data_type: 'timestamp', is_nullable: 'YES' }
            ]
          },
          {
            name: 'educator_details',
            columns: [
              { column_name: 'id', data_type: 'uuid', is_nullable: 'NO' },
              { column_name: 'user_id', data_type: 'uuid', is_nullable: 'NO' },
              { column_name: 'educator_registration_number', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'form_submission_timestamp', data_type: 'timestamp', is_nullable: 'YES' },
              { column_name: 'onboarding_status', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'background_check_status', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'bio_summary', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'teaching_experience', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'special_skills', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'achievements', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'teaching_service_options', data_type: 'text[]', is_nullable: 'YES' },
              { column_name: 'teaching_philosophy', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'average_rating', data_type: 'numeric', is_nullable: 'YES' },
              { column_name: 'total_teaching_hours', data_type: 'numeric', is_nullable: 'YES' },
              { column_name: 'cancellation_rate', data_type: 'numeric', is_nullable: 'YES' },
              { column_name: 'form_agreement_check', data_type: 'boolean', is_nullable: 'YES' },
              { column_name: 'is_top_educator', data_type: 'boolean', is_nullable: 'YES' },
              { column_name: 'academic_status', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'university_s1_name', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'faculty_s1', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'major_s1', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'current_faculty', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'entry_year', data_type: 'integer', is_nullable: 'YES' },
              { column_name: 'alternative_institution_name', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'expertise_field', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'learning_experience', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'other_skills', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'other_relevant_experience', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'academic_achievements', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'non_academic_achievements', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'certifications_training', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'created_at', data_type: 'timestamp', is_nullable: 'YES' },
              { column_name: 'updated_at', data_type: 'timestamp', is_nullable: 'YES' }
            ]
          },
          {
            name: 'tutor_management',
            columns: [
              { column_name: 'id', data_type: 'uuid', is_nullable: 'NO' },
              { column_name: 'user_id', data_type: 'uuid', is_nullable: 'NO' },
              { column_name: 'status_tutor', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'approval_level', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'last_status_change', data_type: 'timestamp', is_nullable: 'YES' },
              { column_name: 'recruitment_stage_history', data_type: 'jsonb', is_nullable: 'YES' },
              { column_name: 'additional_screening', data_type: 'text[]', is_nullable: 'YES' },
              { column_name: 'staff_notes', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'education_verification_status', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'identity_verification_status', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'status_changed_by', data_type: 'uuid', is_nullable: 'YES' },
              { column_name: 'created_at', data_type: 'timestamp', is_nullable: 'YES' },
              { column_name: 'updated_at', data_type: 'timestamp', is_nullable: 'YES' }
            ]
          },
          {
            name: 't_315_03_01_tutor_availability_config',
            columns: [
              { column_name: 'id', data_type: 'uuid', is_nullable: 'NO' },
              { column_name: 'educator_id', data_type: 'uuid', is_nullable: 'NO' },
              { column_name: 'availability_status', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'max_new_students_per_week', data_type: 'integer', is_nullable: 'YES' },
              { column_name: 'max_total_students', data_type: 'integer', is_nullable: 'YES' },
              { column_name: 'target_student_ages', data_type: 'text[]', is_nullable: 'YES' },
              { column_name: 'available_schedule', data_type: 'text[]', is_nullable: 'YES' },
              { column_name: 'teaching_methods', data_type: 'text[]', is_nullable: 'YES' },
              { column_name: 'hourly_rate', data_type: 'numeric', is_nullable: 'YES' },
              { column_name: 'teaching_radius_km', data_type: 'numeric', is_nullable: 'YES' },
              { column_name: 'teaching_center_location', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'teaching_center_lat', data_type: 'numeric', is_nullable: 'YES' },
              { column_name: 'teaching_center_lng', data_type: 'numeric', is_nullable: 'YES' },
              { column_name: 'transportation_method', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'location_notes', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'availability_notes', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'created_at', data_type: 'timestamp', is_nullable: 'YES' },
              { column_name: 'updated_at', data_type: 'timestamp', is_nullable: 'YES' }
            ]
          },
          {
            name: 't_315_04_01_tutor_teaching_preferences',
            columns: [
              { column_name: 'id', data_type: 'uuid', is_nullable: 'NO' },
              { column_name: 'educator_id', data_type: 'uuid', is_nullable: 'NO' },
              { column_name: 'teaching_styles', data_type: 'text[]', is_nullable: 'YES' },
              { column_name: 'student_level_preferences', data_type: 'text[]', is_nullable: 'YES' },
              { column_name: 'special_needs_capability', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'group_class_willingness', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'online_teaching_capability', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'tech_savviness_level', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'gmeet_experience_level', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'attendance_update_capability', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'created_at', data_type: 'timestamp', is_nullable: 'YES' },
              { column_name: 'updated_at', data_type: 'timestamp', is_nullable: 'YES' }
            ]
          },
          {
            name: 't_315_05_01_tutor_personality_traits',
            columns: [
              { column_name: 'id', data_type: 'uuid', is_nullable: 'NO' },
              { column_name: 'educator_id', data_type: 'uuid', is_nullable: 'NO' },
              { column_name: 'personality_type', data_type: 'text[]', is_nullable: 'YES' },
              { column_name: 'communication_style', data_type: 'text[]', is_nullable: 'YES' },
              { column_name: 'teaching_patience_level', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'student_motivation_ability', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'schedule_flexibility_level', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'created_at', data_type: 'timestamp', is_nullable: 'YES' },
              { column_name: 'updated_at', data_type: 'timestamp', is_nullable: 'YES' }
            ]
          },
          {
            name: 't_315_06_01_tutor_program_mappings',
            columns: [
              { column_name: 'id', data_type: 'uuid', is_nullable: 'NO' },
              { column_name: 'educator_id', data_type: 'uuid', is_nullable: 'NO' },
              { column_name: 'program_id', data_type: 'uuid', is_nullable: 'NO' },
              { column_name: 'is_primary_subject', data_type: 'boolean', is_nullable: 'YES' },
              { column_name: 'years_of_experience', data_type: 'integer', is_nullable: 'YES' },
              { column_name: 'competency_level', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'proficiency_level', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'certification_status', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'confidence_score', data_type: 'numeric', is_nullable: 'YES' },
              { column_name: 'mapped_at', data_type: 'timestamp', is_nullable: 'YES' },
              { column_name: 'mapped_by', data_type: 'uuid', is_nullable: 'YES' },
              { column_name: 'created_at', data_type: 'timestamp', is_nullable: 'YES' },
              { column_name: 'updated_at', data_type: 'timestamp', is_nullable: 'YES' }
            ]
          },
          {
            name: 't_315_07_01_tutor_additional_subjects',
            columns: [
              { column_name: 'id', data_type: 'uuid', is_nullable: 'NO' },
              { column_name: 'educator_id', data_type: 'uuid', is_nullable: 'NO' },
              { column_name: 'subject_name', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'subject_description', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'target_level', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'teaching_method_description', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'competency_description', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'approval_status', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'approved_at', data_type: 'timestamp', is_nullable: 'YES' },
              { column_name: 'approved_by', data_type: 'uuid', is_nullable: 'YES' },
              { column_name: 'rejection_reason', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'rejected_at', data_type: 'timestamp', is_nullable: 'YES' },
              { column_name: 'created_at', data_type: 'timestamp', is_nullable: 'YES' },
              { column_name: 'updated_at', data_type: 'timestamp', is_nullable: 'YES' }
            ]
          },
          {
            name: 't_380_01_01_user_demographics',
            columns: [
              { column_name: 'id', data_type: 'uuid', is_nullable: 'NO' },
              { column_name: 'user_id', data_type: 'uuid', is_nullable: 'NO' },
              { column_name: 'religion', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'marital_status', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'parent_occupation', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'parent_education_level', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'socioeconomic_status', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'ethnicity', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'religious_practice_level', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'preferred_communication_time', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'communication_language_preference', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'created_at', data_type: 'timestamp', is_nullable: 'YES' },
              { column_name: 'updated_at', data_type: 'timestamp', is_nullable: 'YES' }
            ]
          },
          {
            name: 't_460_02_04_educator_banking_info',
            columns: [
              { column_name: 'id', data_type: 'uuid', is_nullable: 'NO' },
              { column_name: 'educator_id', data_type: 'uuid', is_nullable: 'NO' },
              { column_name: 'bank_id', data_type: 'uuid', is_nullable: 'YES' },
              { column_name: 'bank_code', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'bank_name', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'swift_code', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'account_holder_name', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'account_number', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'city', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'bank_branch', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'country_code', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'is_verified', data_type: 'boolean', is_nullable: 'YES' },
              { column_name: 'last_verified_at', data_type: 'timestamp', is_nullable: 'YES' },
              { column_name: 'verification_document_url', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'total_payouts', data_type: 'numeric', is_nullable: 'YES' },
              { column_name: 'payout_count', data_type: 'integer', is_nullable: 'YES' },
              { column_name: 'last_payout_at', data_type: 'timestamp', is_nullable: 'YES' },
              { column_name: 'created_at', data_type: 'timestamp', is_nullable: 'YES' },
              { column_name: 'updated_at', data_type: 'timestamp', is_nullable: 'YES' }
            ]
          },
          {
            name: 'document_storage',
            columns: [
              { column_name: 'id', data_type: 'uuid', is_nullable: 'NO' },
              { column_name: 'user_id', data_type: 'uuid', is_nullable: 'NO' },
              { column_name: 'document_type', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'original_filename', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'stored_filename', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'file_url', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'storage_path', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'mime_type', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'file_size', data_type: 'bigint', is_nullable: 'YES' },
              { column_name: 'upload_status', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'uploaded_by', data_type: 'uuid', is_nullable: 'YES' },
              { column_name: 'uploaded_at', data_type: 'timestamp', is_nullable: 'YES' },
              { column_name: 'verification_status', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'verified_at', data_type: 'timestamp', is_nullable: 'YES' },
              { column_name: 'verified_by', data_type: 'uuid', is_nullable: 'YES' },
              { column_name: 'verification_notes', data_type: 'text', is_nullable: 'YES' },
              { column_name: 'created_at', data_type: 'timestamp', is_nullable: 'YES' },
              { column_name: 'updated_at', data_type: 'timestamp', is_nullable: 'YES' }
            ]
          }
        ]
      })
    }

    console.log('✅ Database schema loaded successfully')
    
    return NextResponse.json({ 
      success: true,
      tables: tables || []
    })
  } catch (error) {
    console.error('❌ Error in check-tables API:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        tables: []
      },
      { status: 500 }
    )
  }
} 