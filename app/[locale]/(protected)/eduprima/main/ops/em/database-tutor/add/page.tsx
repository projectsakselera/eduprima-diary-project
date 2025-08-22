"use client";

import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Icon } from '@/components/ui/icon';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useRouter } from '@/components/navigation';
import { cn } from '@/lib/utils';
import { useCustomSession } from '@/hooks/use-custom-session';
import { useNotification } from '@/hooks/use-notification';
import { NotificationModal } from '@/components/ui/notification-modal';
// Updated: Now using NextAuth compatible session with JWT Bridge for file uploads
import { 
  tutorFormConfig, 
  defaultFormData, 
  validateStep, 
  canProceedToNextStep, 
  getStepProgress,
  getStepStatus,
  canAccessStep,
  getOverallProgress,
  isStepCompleted,
  getAllFieldsCount,
  getCompletedAllFieldsCount,
  getEmptyFieldsCount,
  isFieldVisible,
  type TutorFormData 
} from './form-config';
import DynamicFormField from './form-field';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { migrationConfig } from '@/config';
import { createTutorWithMigrationSupport, type BasicTutorData } from '@/services/tutor-edge.service';

// Local type override to add brand field without modifying the service file
interface LocalBasicTutorData extends Omit<BasicTutorData, 'system'> {
  system: {
    status_tutor?: string;
    brand?: string[];
    staff_notes?: string;
    additionalScreening?: string[];
  };
}

// Supabase Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {

}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Utility functions for data formatting
const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all spaces, dashes, plus signs and other non-digit characters
  let cleaned = phone.replace(/[\s\-\(\)\.\+]/g, '');
  
  // Handle different input formats - always return clean number without + or dashes
  if (cleaned.startsWith('0')) {
    // Replace leading 0 with 62 (e.g., 081234567890 → 6281234567890)
    cleaned = '62' + cleaned.slice(1);
  } else if (cleaned.startsWith('8')) {
    // Add 62 prefix if starts with 8 (e.g., 81234567890 → 6281234567890)  
    cleaned = '62' + cleaned;
  } else if (!cleaned.startsWith('62')) {
    // Add 62 prefix if doesn't have it
    cleaned = '62' + cleaned;
  }
  
  return cleaned;
};

const sanitizeAccountNumber = (accountNumber: string): string => {
  if (!accountNumber) return '';
  // Remove all spaces, dashes, plus signs and non-digit characters
  return accountNumber.replace(/[\s\-\(\)\.\+]/g, '');
};

// Auto-generate password from birth date (ddmmyy format)
const generatePasswordFromBirthDate = (birthDate: string): string => {
  if (!birthDate) return '';
  
  try {
    const date = new Date(birthDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // +1 because getMonth() is 0-indexed
    const year = String(date.getFullYear()).slice(-2); // Last 2 digits of year
    
    return `${day}${month}${year}`;
  } catch (error) {
    console.error('Error generating password from birth date:', error);
    return '';
  }
};

export default function AddTutorPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<TutorFormData>>(defaultFormData);
  const [stepErrors, setStepErrors] = useState<Record<number, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attemptedNext, setAttemptedNext] = useState<Record<number, boolean>>({});
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  
  // NextAuth compatible session
  const { user, loading: isAuthLoading } = useCustomSession();
  
  // Notification state
  const { notification, showSuccess, showError, hideNotification } = useNotification();

  const currentStepConfig = tutorFormConfig.steps[currentStep];
  const totalSteps = tutorFormConfig.steps.length;
  const progress = getStepProgress(currentStep, totalSteps);
  const overallProgress = getOverallProgress(formData, tutorFormConfig.steps);

  // Real-time validation for current step
  useEffect(() => {
    const errors = validateStep(currentStepConfig, formData);
    setStepErrors(prev => ({
      ...prev,
      [currentStep]: errors
    }));
  }, [formData, currentStep, currentStepConfig]);

  // Update completed steps based on validation
  useEffect(() => {
    const newCompletedSteps = new Set<number>();
    tutorFormConfig.steps.forEach((step, index) => {
      if (isStepCompleted(step, formData)) {
        newCompletedSteps.add(index);
      }
    });
    setCompletedSteps(newCompletedSteps);
  }, [formData]);

  // NextAuth session check with proper loading state and locale-aware redirect
  useEffect(() => {
    console.log('🔍 Session Check - Loading:', isAuthLoading, 'User:', user?.email || 'null');
    
    // Only redirect if we're absolutely sure there's no session
    // Add a small delay to ensure NextAuth has fully initialized
    if (!isAuthLoading && !user) {
      const timer = setTimeout(() => {
        // Double-check after a brief delay
        if (!user) {
          console.log('❌ No NextAuth session found after delay, redirecting to login');
          router.push('/auth/login');
        }
      }, 100); // 100ms delay
      
      return () => clearTimeout(timer);
    } else if (user) {
      console.log('✅ NextAuth session found for user:', user.email);
      console.log('🔑 User role:', user.role, 'Account type:', user.account_type);
    }
  }, [user, isAuthLoading, router]);

  const handleFieldChange = (fieldName: string, value: any) => {
    // Debug logging for selectedPrograms
    if (fieldName === 'selectedPrograms') {
      console.log('🔍 DEBUG: handleFieldChange called for selectedPrograms');
      console.log('🔍 DEBUG: value =', value);
      console.log('🔍 DEBUG: typeof value =', typeof value);
      console.log('🔍 DEBUG: Array.isArray(value) =', Array.isArray(value));
    }
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [fieldName]: value
      };
      
      // Handle address copy functionality
      if (fieldName === 'alamatSamaDenganKTP' && value === true) {
        // Copy domisili address to KTP address (NEW STRUCTURE)
        newData.provinsiKTP = prev.provinsiDomisili || '';
        newData.kotaKabupatenKTP = prev.kotaKabupatenDomisili || '';
        newData.kecamatanKTP = prev.kecamatanDomisili || '';
        newData.kelurahanKTP = prev.kelurahanDomisili || '';
        newData.alamatLengkapKTP = prev.alamatLengkapDomisili || '';
        newData.kodePosKTP = prev.kodePosDomisili || '';
      }
      
      // Debug logging for selectedPrograms after state update
      if (fieldName === 'selectedPrograms') {
        console.log('🔍 DEBUG: New formData.selectedPrograms =', newData.selectedPrograms);
      }
      
      return newData;
    });
    
    // Clear step errors when user starts modifying (though no longer needed)
    if (stepErrors[currentStep]?.length > 0) {
      setStepErrors(prev => ({
        ...prev,
        [currentStep]: []
      }));
    }
  };

  const validateCurrentStep = () => {
    return canProceedToNextStep(currentStepConfig, formData);
  };

  const handleNext = () => {
    // Allow free navigation - no validation required
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
      // Scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      // Clear attempted state for previous step
      setAttemptedNext(prev => ({
        ...prev,
        [currentStep - 1]: false
      }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      router.push('/eduprima/main/ops/em/database-tutor');
    }
  };

  const handleStepClick = (stepIndex: number) => {
    // Allow free navigation - user can access any step at any time
    setCurrentStep(stepIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Debug logging for formData at submit
      console.log('🔍 DEBUG: Form submitted with formData:', formData);
      console.log('🔍 DEBUG: formData.selectedPrograms =', formData.selectedPrograms);
      console.log('🔍 DEBUG: typeof formData.selectedPrograms =', typeof formData.selectedPrograms);
      console.log('🔍 DEBUG: Array.isArray(formData.selectedPrograms) =', Array.isArray(formData.selectedPrograms));
      
      // Step 0: Check authentication first (SECURITY) - Admin/Staff must be logged in
      console.log('🔐 Checking admin/staff authentication...');
      
      if (!user) {
        console.error('❌ No authenticated admin/staff found');
        throw new Error('Admin/Staff must be logged in to create tutor profile. Please login first.');
      }
      
      console.log('✅ Admin/Staff authenticated:', { email: user.email, id: user.id });
      console.log('📝 This admin will create a NEW tutor user (not using admin ID)');
      
      // Step 1: Test Supabase connection

      // DEBUGGING: Check table access and structure
      console.log('🔍 Testing table access...');
      
      // Try different possible table names
      const possibleTableNames = [
        'user_roles',
        'roles', 
        'system_roles'
      ];
      
      let rolesTable = null;
      let allRolesData = null;
      
      for (const tableName of possibleTableNames) {
        console.log(`🔍 Trying table: ${tableName}`);
        
        const testResult = await supabase
          ?.from(tableName)
          .select('*')
          .limit(5);
          
        console.log(`📋 Result for ${tableName}:`, testResult);
        
        if (testResult?.data && testResult.data.length > 0) {
          rolesTable = tableName;
          allRolesData = testResult.data;
          console.log(`✅ Found roles in table: ${tableName}`, testResult.data);
          break;
        } else if (testResult?.error) {
          console.log(`❌ Error accessing ${tableName}:`, testResult.error);
        }
      }
      
      if (!rolesTable) {
        throw new Error('No accessible roles table found. Check table names and RLS policies.');
      }

      // ✅ Search for tutor role using correct field names: role_name, role_code
      console.log('🔍 Searching for tutor role...');
      console.log('📋 Sample role data structure:', allRolesData?.[0]);
      
      let tutorRole = null;
      
      // Try by role_name field first - prioritize exact matches used in Edge Function
      const possibleRoleNames = ['Tutor', 'tutor', 'TUTOR', 'educator', 'Educator', 'EDUCATOR', 'teacher', 'Teacher'];
      
      for (const roleName of possibleRoleNames) {
        const roleResult = await supabase
          ?.from(rolesTable)
          .select('*')
          .eq('role_name', roleName)
          .single();
        
        if (roleResult?.data?.id) {
          tutorRole = roleResult.data;
          console.log(`✅ Found role by role_name "${roleName}":`, tutorRole);
          break;
        }
      }
      
      // If not found by role_name, try by role_code
      if (!tutorRole) {
        const possibleRoleCodes = ['tutor', 'TUTOR', 'educator', 'EDUCATOR', 'teacher', 'TEACHER'];
        
        for (const roleCode of possibleRoleCodes) {
          const roleResult = await supabase
            ?.from(rolesTable)
            .select('*')
            .eq('role_code', roleCode)
            .single();
          
          if (roleResult?.data?.id) {
            tutorRole = roleResult.data;
            console.log(`✅ Found role by role_code "${roleCode}":`, tutorRole);
            break;
          }
        }
      }
      
      // If still not found, show all available roles
      if (!tutorRole) {
        console.log('🔍 Searching in all roles...');
        
        const allRolesResult = await supabase
          ?.from(rolesTable)
          .select('*');
          
        console.log('📋 All roles in database:', allRolesResult?.data);
        tutorRole = allRolesResult?.data?.[0]; // Use first role as fallback for testing
        console.log('⚠️ Using first available role as fallback:', tutorRole);
      }

      if (!tutorRole) {
        console.error('❌ No tutor role found in any format');
        console.error('❌ Table used:', rolesTable);
        console.error('❌ All available roles:', allRolesData);
        
        // MANUAL FALLBACK: If you know the exact role ID, uncomment and use this:
        // tutorRole = { id: 'your-exact-role-uuid-here' };
        // console.log('🔧 Using manual role ID:', tutorRole);
        
        if (!tutorRole) {
          throw new Error(`
            🔍 DEBUGGING INFO:
            - Table found: ${rolesTable}
            - Available roles: ${JSON.stringify(allRolesData, null, 2)}
            
            💡 SOLUTION:
            1. Check browser console for role structure
            2. Find the exact role ID for tutor/educator in Supabase
            3. Uncomment the manual fallback line above and paste the UUID
            
            Or tell me the exact role name/ID you see in Supabase!
          `);
        }
      }
      
      // Get the ID field (might be 'id', 'uuid', 'role_id', etc.)
      const foundRoleId = tutorRole.id || tutorRole.uuid || tutorRole.role_id || Object.values(tutorRole)[0];
      
      if (!foundRoleId) {
        console.error('❌ Could not determine ID field for role:', tutorRole);
        throw new Error('Could not find ID field in role data');
      }

      const testResult = await supabase
        ?.from('users_universal')
        .select('count', { count: 'exact', head: true });
      const { data: testData, error: testError } = testResult || { data: null, error: null };
      
      if (testError) {

        throw new Error(`Database connection failed: ${testError.message}`);
      }
      

      
      // Step 2: Prepare data for relational insertion
      // TRN akan di-generate otomatis oleh database trigger - tidak perlu manual handling
      
      console.log('✅ Using tutor role ID:', foundRoleId, 'from role:', tutorRole);
      
      // 2a. Prepare users_universal data - CREATE NEW TUTOR USER
      const autoGeneratedPassword = generatePasswordFromBirthDate(formData.tanggalLahir || '');
      console.log('🔐 Auto-generated password for tutor:', autoGeneratedPassword);
      
      // Hash password with bcrypt (same as login system expects)
      const hashedPassword = await bcrypt.hash(autoGeneratedPassword, 10);
      console.log('🔒 Password hashed for database storage');
      
      // Generate a robust unique user_code to avoid unique constraint collisions
      const generatedUserCode = `USR-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

      const usersUniversalData = {
        user_code: generatedUserCode, // Always unique format; TRN is separate in tutor_details
        email: formData.email,
        phone: formatPhoneNumber(formData.noHp1 || ''),
        password_hash: hashedPassword, // ✅ Hashed password (not plain text)
        primary_role_id: foundRoleId, // ✅ FIXED: Use primary_role_id with UUID
        account_type: 'individual',
        user_status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // 2b. Prepare user_profiles data (will need user_id from step 3)
      const userProfilesData = {
        full_name: formData.namaLengkap || '', // ✅ full_name untuk nama lengkap
        nick_name: formData.namaPanggilan || null, // ✅ nick_name untuk nama panggilan
        date_of_birth: formData.tanggalLahir || null,
        gender: formData.jenisKelamin || null,
        // national_id: null, // Field temporarily removed to avoid schema errors
        // country_code: Schema inconsistent - removing to avoid errors
        
        // Note: Address fields removed - should be handled by user_addresses table
        // street_address will be handled separately in user_addresses table
        
        // Phone numbers with +62 formatting  
        mobile_phone: formatPhoneNumber(formData.noHp1 || ''),
        mobile_phone_2: formData.noHp2 ? formatPhoneNumber(formData.noHp2) : null,
        
        // Emergency contact fields - testing cautiously
        emergency_contact_name: formData.emergencyContactName || null,
        emergency_contact_relationship: formData.emergencyContactRelationship || null,
        emergency_contact_phone: formData.emergencyContactPhone || null,
        
        // PROFIL & VALUE PROPOSITION fields
        headline: formData.headline || null, // ✅ Fix: job_title → headline
        bio: formData.deskripsiDiri || null, // ✅ bio field exists
        social_media_1: formData.socialMedia1 || null,
        social_media_2: formData.socialMedia2 || null,
        motivation_as_tutor: formData.motivasiMenjadiTutor || null,
        
        // ✅ EDUCATION FIELDS REMOVED - Now consolidated in tutor_details only
        // education_level → tutor_details.academic_status
        // university → tutor_details.current_university  
        // major → tutor_details.current_major
        // graduation_year → tutor_details.current_graduation_year
        // gpa → tutor_details.current_gpa
        
        // ✅ REMOVED: high_school fields moved to tutor_details table
        // high_school_name and high_school_graduation_year are in tutor_details, not user_profiles
        
        // ✅ REMOVED: availability_schedule - dipindah ke tutor_availability_config
        
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // 2c. Prepare domicile address data (NEW SEPARATE TABLE)
      const domicileAddressData = {
        address_type: 'domicile',
        province_id: formData.provinsiDomisili || null,
        city_id: formData.kotaKabupatenDomisili || null,
        district_name: formData.kecamatanDomisili || null, // Manual input
        village_name: formData.kelurahanDomisili || null,  // Manual input
        street_address: formData.alamatLengkapDomisili || '',
        postal_code: formData.kodePosDomisili || null,
        is_primary: true, // Domicile is primary address
        is_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // 2d. Prepare KTP address data (if different from domicile)
      const ktpAddressData = formData.alamatSamaDenganKTP ? null : {
        address_type: 'ktp',
        province_id: formData.provinsiKTP || null,
        city_id: formData.kotaKabupatenKTP || null,
        district_name: formData.kecamatanKTP || null, // Manual input
        village_name: formData.kelurahanKTP || null,  // Manual input
        street_address: formData.alamatLengkapKTP || '',
        postal_code: formData.kodePosKTP || null,
        is_primary: false, // KTP is secondary address
        is_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // 2c. Prepare user_demographics data (will need user_id from step 3)
      const userDemographicsData = {
        religion: formData.agama || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Helper functions for safe type casting
      const toIntOrNull = (v: any) => {
        const n = parseInt(String(v), 10);
        return Number.isFinite(n) ? n : null;
      };

      const safeBool = (v: any) => v === true || v === 'true';

      const isUuid = (v?: string) => !!v && /^[0-9a-fA-F-]{36}$/.test(v || '');

      // TRN generation moved to database trigger: set_tutor_registration_number()
      // This ensures atomic operation and prevents duplicate key errors

      // 2d. Prepare tutor_details data (will need user_id from step 3)  
      const tutorDetailsData = {
        // ✅ REMOVED: tarif_per_jam, metode_pengajaran, jadwal_tersedia - dipindah ke tutor_availability_config
        
        // Skip tutor_registration_number entirely to avoid trigger
        // We'll add it in a separate update after insert
        
        // Professional Information - gunakan nama kolom yang benar
        academic_status: formData.statusAkademik || 'unknown', // ✅ Fix: status_akademik → academic_status + default
        
        // ✅ CURRENT EDUCATION (Primary Education) - consolidated from user_profiles
        current_university: formData.namaUniversitas || null,
        current_faculty: formData.fakultas || null,
        current_major: formData.jurusan || null,
        current_graduation_year: toIntOrNull(formData.tahunLulus),
        current_gpa: formData.ipk ? parseFloat(formData.ipk) : null,
        
        // ✅ S1 Education (untuk S2/S3 students) - conditional mapping
        university_s1_name: (['mahasiswa_s2', 'lulusan_s2'].includes(formData.statusAkademik || '')) 
          ? (formData.namaUniversitasS1 || null) 
          : null,
        faculty_s1: (['mahasiswa_s2', 'lulusan_s2'].includes(formData.statusAkademik || '')) 
          ? (formData.fakultasS1 || null) 
          : (formData.fakultas || null), // For other status use current faculty
        major_s1: (['mahasiswa_s2', 'lulusan_s2'].includes(formData.statusAkademik || '')) 
          ? (formData.jurusanS1 || null) 
          : null,
        entry_year: toIntOrNull(formData.tahunMasuk), // ✅ Fix: safe integer conversion
        
        // High School Information - gunakan kolom khusus
        high_school: formData.namaSMA || null, // ✅ Add: high_school column
        high_school_major: formData.jurusanSMA || null, // ✅ Add: high_school_major column
        high_school_graduation_year: toIntOrNull(formData.tahunLulusSMA), // ✅ Add: safe integer conversion
        vocational_school_detail: formData.jurusanSMKDetail || null, // ✅ FIXED: Added missing jurusanSMKDetail mapping
        
        // Alternative Learning Background (untuk statusAkademik = 'lainnya')
        alternative_institution_name: (formData.statusAkademik === 'lainnya') 
          ? (formData.namaInstitusi || null) 
          : null,
        
        // Teaching Experience - gunakan nama kolom yang benar
        teaching_experience: formData.pengalamanMengajar || null, // ✅ Fix: pengalaman_mengajar → teaching_experience
        other_skills: formData.keahlianLainnya || null, // ✅ Add: other_skills field
        special_skills: formData.keahlianSpesialisasi || null, // ✅ Fix: keahlian_spesialisasi → special_skills
        
        // ✅ REMOVED: semua field JSONB dipindah ke tabel terpisah
        // - achievements → masih di sini (sudah ada di database)
        // - subjects_taught → dipindah ke tutor_program_mappings  
        // - teaching_details → dipindah ke tutor_teaching_preferences
        // - tech_capability → dipindah ke tutor_teaching_preferences
        // - personality_profile → dipindah ke tutor_personality_traits
        // - location & availability → dipindah ke tutor_availability_config
        
        // Achievements & Credentials (tetap di sini karena ada di database)
        academic_achievements: formData.prestasiAkademik || null,
        non_academic_achievements: formData.prestasiNonAkademik || null, 
        certifications_training: formData.sertifikasiPelatihan || null,
        
        // ✅ STEP 3: Additional Subjects Description (mata pelajaran lainnya dari form)
        additional_subjects_description: formData.mataPelajaranLainnya || null,
        
        // Student acceptance info (tetap di sini) - convert string status to boolean
        form_agreement_check: safeBool(
          formData.statusMenerimaSiswa === 'aktif' || formData.statusMenerimaSiswa === 'terbatas'
        ),
        registration_notes_to_admin: formData.catatanAvailability || null,
        
        // Defaults for required operational fields in new schema
        is_top_educator: false,
        cancellation_rate: 0,
        total_teaching_hours: 0,
        average_rating: 0,
        form_submission_timestamp: new Date().toISOString(),
        
        // ✅ REMOVED: Document Verification status - dipindah ke tutor_management table
        
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // 2e. Prepare tutor_availability_config data (NEW TABLE)
      // Map Indonesian form values to English database values
      const getAvailabilityStatus = (status: string) => {
        switch (status) {
          case 'available': return 'available';
          case 'limited': return 'limited';
          case 'unavailable': return 'unavailable';
          case 'leave': return 'leave';
          default: return 'available'; // fallback
        }
      };

      const availabilityConfigData = {
        availability_status: getAvailabilityStatus(formData.statusMenerimaSiswa || 'available'),
        max_new_students_per_week: formData.maksimalSiswaBaru || null,
        max_total_students: formData.maksimalTotalSiswa || null,
        target_student_ages: formData.usiaTargetSiswa || [],
        availability_notes: formData.catatanAvailability || null,
        available_schedule: formData.available_schedule || [],
        teaching_methods: formData.teaching_methods || [],
        hourly_rate: formData.hourly_rate || 0,
        teaching_radius_km: formData.teaching_radius_km || null,
        transportation_method: formData.transportasiTutor || null,
        teaching_center_location: formData.alamatTitikLokasi || null,
        teaching_center_lat: formData.titikLokasiLat || null,
        teaching_center_lng: formData.titikLokasiLng || null,
        location_notes: formData.location_notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // 2f. Prepare tutor_teaching_preferences data (NEW TABLE)
      const teachingPreferencesData = {
        teaching_styles: formData.teachingMethods || [],
        student_level_preferences: formData.studentLevelPreferences || [],
        special_needs_capability: formData.specialNeedsCapable || 'tidak',
        group_class_willingness: formData.groupClassWilling || 'tidak',
        online_teaching_capability: formData.onlineTeachingCapable || 'tidak_bisa',
        tech_savviness_level: formData.techSavviness || 'low',
        gmeet_experience_level: formData.gmeetExperience || 'belum_pernah',
        attendance_update_capability: formData.presensiUpdateCapability || 'tidak_bisa',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // 2g. Prepare tutor_personality_traits data (NEW TABLE)
      const personalityTraitsData = {
        personality_type: formData.tutorPersonalityType || null,
        communication_style: formData.communicationStyle || null,
        teaching_patience_level: parseInt(formData.teachingPatienceLevel || '5'),
        student_motivation_ability: parseInt(formData.studentMotivationAbility || '5'),
        schedule_flexibility_level: parseInt(formData.scheduleFlexibilityLevel || '5'),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // 2h. Prepare tutor_management data (EXISTING TABLE)
      const tutorManagementData = {
        // ❌ REMOVED: status_tutor - kolom tidak ada di tabel tutor_management
        entity_code: (formData.brand && formData.brand.length > 0) ? formData.brand[0] : null,

        staff_notes: formData.staff_notes || null,
        additional_screening: formData.additionalScreening || [],
        
        // ❌ HAPUS: Document verification status fields tidak ada di database
        
        // Initialize recruitment tracking
        recruitment_stage_history: [{
          stage: 'registration', // Default stage - tidak menggunakan formData.status_tutor
          timestamp: new Date().toISOString(),
          changed_by: 'system', // Could be staff user ID in future
          notes: 'Initial registration via staff form'
        }],
        last_status_change: new Date().toISOString(),
        status_changed_by: null, // Will be staff user ID in future
        
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('🔍 Brand data:', {
        selectedBrands: formData.brand,
        entityCodeForDB: tutorManagementData.entity_code
      });

      // 2i. Get bank name from bank ID (REQUIRED FIELD!)
      let bankName = null;
      if (formData.namaBank) {
        try {
          console.log('🏦 Looking up bank name for ID:', formData.namaBank);
          const bankResponse = await fetch(`/api/banks/indonesia`);
          if (bankResponse.ok) {
            const bankData = await bankResponse.json();
            console.log('🏦 Banks API response:', bankData);
            const selectedBank = bankData.data?.find((bank: any) => bank.value === formData.namaBank);
            console.log('🏦 Found bank:', selectedBank);
            bankName = selectedBank?.fullName || selectedBank?.label || null;
            console.log('🏦 Using bank name:', bankName);
          } else {
            console.error('❌ Banks API failed:', bankResponse.status, bankResponse.statusText);
          }
        } catch (error) {
          console.error('❌ Error fetching bank name:', error);
        }
      }

      // Fallback: jika bank name tidak ketemu, coba ambil dari form validation
      if (!bankName && formData.namaBank) {
        // Cek apakah namaBank sebenarnya sudah berisi nama bank (bukan UUID)
        if (typeof formData.namaBank === 'string' && formData.namaBank.length < 50 && !formData.namaBank.includes('-')) {
          bankName = formData.namaBank; // Kemungkinan ini sudah nama bank
        } else {
          bankName = 'Bank Indonesia'; // Generic fallback yang lebih baik dari 'Unknown Bank'
        }
      }

      // 2i. Prepare banking data (EDUCATOR BANKING INFO TABLE) - only if bank selected and UUID valid
      const bankingData = (formData.namaBank && isUuid(String(formData.namaBank))) ? {
        bank_id: String(formData.namaBank), // UUID from bank dropdown
        bank_name: bankName || 'Bank Indonesia', // ✅ REQUIRED FIELD - fallback untuk avoid NULL constraint
        account_holder_name: formData.namaNasabah || '',
        account_number: sanitizeAccountNumber(formData.nomorRekening || ''),
        country_code: 'ID', // Default to Indonesia (ISO-2)
        is_verified: false,
        total_payouts: 0,
        payout_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } : null;

      // 2j. Prepare program mappings data (NEW TABLE)
      console.log('🔍 DEBUG: formData.selectedPrograms =', formData.selectedPrograms);
      console.log('🔍 DEBUG: typeof formData.selectedPrograms =', typeof formData.selectedPrograms);
      console.log('🔍 DEBUG: Array.isArray(formData.selectedPrograms) =', Array.isArray(formData.selectedPrograms));
      
      const programMappingsData = (formData.selectedPrograms || []).map(programId => ({
        program_id: programId,
        proficiency_level: 'intermediate', // Default value
        years_of_experience: 1, // Default value  
        certification_status: 'none', // Default val
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      console.log('🔍 DEBUG: programMappingsData =', programMappingsData);
      console.log('🔍 DEBUG: programMappingsData.length =', programMappingsData.length);

      // 2k. Prepare document storage data (NEW TABLE)
      const documentStorageData = [
        // Profile Photo
        ...(formData.fotoProfil ? [{
          document_type: 'profile_photo',
          original_filename: 'profile_photo',
          stored_filename: 'profile_photo',
          file_size: 0, // Will be updated after upload
          file_url: null, // Will be updated after upload
          mime_type: 'image/jpeg',
          verification_status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }] : []),
        // Identity Document
        ...(formData.dokumenIdentitas ? [{
          document_type: 'identity_document',
          original_filename: 'identity_document',
          stored_filename: 'identity_document',
          file_size: 0,
          file_url: null,
          mime_type: 'application/pdf',
          verification_status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }] : []),
        // Education Document
        ...(formData.dokumenPendidikan ? [{
          document_type: 'education_document',
          original_filename: 'education_document',
          stored_filename: 'education_document',
          file_size: 0,
          file_url: null,
          mime_type: 'application/pdf',
          verification_status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }] : []),
        // Certificate Document
        ...(formData.dokumenSertifikat ? [{
          document_type: 'certificate_document',
          original_filename: 'certificate_document',
          stored_filename: 'certificate_document',
          file_size: 0,
          file_url: null,
          mime_type: 'application/pdf',
          verification_status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }] : []),
        // Transcript Document (transkripNilai)
        ...(formData.transkripNilai ? [{
          document_type: 'transcript_document',
          original_filename: 'transcript_document',
          stored_filename: 'transcript_document',
          file_size: 0,
          file_url: null,
          mime_type: 'application/pdf',
          verification_status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }] : []),
        // Expertise Certificate (sertifikatKeahlian - untuk statusAkademik = 'lainnya')
        ...(formData.sertifikatKeahlian ? [{
          document_type: 'expertise_certificate',
          original_filename: 'expertise_certificate',
          stored_filename: 'expertise_certificate',
          file_size: 0,
          file_url: null,
          mime_type: 'application/pdf',
          verification_status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }] : [])
      ];

      
      // Step 3: Relational Database Insertion

      // 🔄 MIGRATION PHASE 1: Hybrid user creation (Edge Function + Client-side fallback)
      console.log('📊 [MIGRATION] Starting Phase 1 - User Creation');
      console.log('⚙️ [MIGRATION] Edge Function enabled:', migrationConfig.useEdgeFunctionForUserCreation);
      
      let newTutorUser: any = null;
      let userCreationError: any = null;
      let migrationSource = 'unknown';

      // 🚀 TRY EDGE FUNCTION FIRST (if enabled)
      if (migrationConfig.useEdgeFunctionForUserCreation) {
        console.log('🎯 [MIGRATION] Attempting edge function user creation...');
        console.log('📋 [DEBUG] Form data sample:', {
          // Step 1: Personal & Basic Info
          provinsi: formData.provinsiDomisili,
          kota: formData.kotaKabupatenDomisili, 
          bank: formData.namaBank,
          tanggalLahir: formData.tanggalLahir,
          jenisKelamin: formData.jenisKelamin,
          
          // Step 2: Education Info
          statusAkademik: formData.statusAkademik,
          namaUniversitas: formData.namaUniversitas,
          fakultas: formData.fakultas,
          jurusan: formData.jurusan,
          tahunLulus: formData.tahunLulus,
          ipk: formData.ipk,
          namaSMA: formData.namaSMA,
          pengalamanMengajar: formData.pengalamanMengajar,
          keahlianSpesialisasi: formData.keahlianSpesialisasi,
          prestasiAkademik: formData.prestasiAkademik,
          transkripNilai: formData.transkripNilai ? 'File provided' : 'No file',
          sertifikatKeahlian: formData.sertifikatKeahlian ? 'File provided' : 'No file',
          
          // Step 4: Availability & Wilayah Info
          statusMenerimaSiswa: formData.statusMenerimaSiswa,
          available_schedule: formData.available_schedule ? `Array(${formData.available_schedule.length})` : 'No schedule',
          teaching_methods: formData.teaching_methods ? `Array(${formData.teaching_methods.length})` : 'No methods',
          hourly_rate: formData.hourly_rate,
          transportasiTutor: formData.transportasiTutor ? `Array(${formData.transportasiTutor.length})` : 'No transport',
          alamatTitikLokasi: formData.alamatTitikLokasi,
          teaching_radius_km: formData.teaching_radius_km,
          usiaTargetSiswa: formData.usiaTargetSiswa ? `Array(${formData.usiaTargetSiswa.length})` : 'No age target',
          
          // Step 4: Teaching Preferences & Personality Info (Phase 2)
          teachingMethods: formData.teachingMethods ? `Array(${formData.teachingMethods.length})` : 'No teaching methods',
          specialNeedsCapable: formData.specialNeedsCapable,
          onlineTeachingCapable: formData.onlineTeachingCapable,
          tutorPersonalityType: formData.tutorPersonalityType ? `Array(${formData.tutorPersonalityType.length})` : 'No personality',
          communicationStyle: formData.communicationStyle ? `Array(${formData.communicationStyle.length})` : 'No comm style',
          teachingPatienceLevel: formData.teachingPatienceLevel,
          scheduleFlexibilityLevel: formData.scheduleFlexibilityLevel
        });
        
        const basicTutorData: LocalBasicTutorData = {
          system: {
            status_tutor: formData.status_tutor,
            brand: formData.brand || [],
            staff_notes: formData.staff_notes,
            additionalScreening: formData.additionalScreening,
          },
          personal: {
            fotoProfil: formData.fotoProfil,
            trn: formData.trn,
            namaLengkap: formData.namaLengkap || '',
            namaPanggilan: formData.namaPanggilan,
            tanggalLahir: formData.tanggalLahir || '',
            jenisKelamin: formData.jenisKelamin === 'Laki-laki' ? 'L' : 'P', // 🔧 Transform: "Laki-laki" → "L", "Perempuan" → "P"
            agama: formData.agama,
            email: formData.email || '',
            noHp1: formatPhoneNumber(formData.noHp1 || ''), // 🔧 Format phone for edge function
            noHp2: formData.noHp2 ? formatPhoneNumber(formData.noHp2) : undefined, // 🔧 Format phone for edge function
          },
          profile: {
            headline: formData.headline,
            deskripsiDiri: formData.deskripsiDiri,
            motivasiMenjadiTutor: formData.motivasiMenjadiTutor,
            socialMedia1: formData.socialMedia1,
            socialMedia2: formData.socialMedia2,
          },
          
          // 🎓 STEP 2: Education Information (Pendidikan & Pengalaman)
          education: {
            // A. RIWAYAT PENDIDIKAN
            statusAkademik: formData.statusAkademik,
            
            // Current Education (University/College)
            namaUniversitas: formData.namaUniversitas,
            fakultas: formData.fakultas,
            jurusan: formData.jurusan,
            tahunMasuk: formData.tahunMasuk,
            tahunLulus: formData.tahunLulus,
            ipk: formData.ipk,
            
            // S1 Education (for S2/S3 students - conditional)
            namaUniversitasS1: formData.namaUniversitasS1,
            fakultasS1: formData.fakultasS1,
            jurusanS1: formData.jurusanS1,
            
            // High School Information
            namaSMA: formData.namaSMA,
            jurusanSMA: formData.jurusanSMA,
            tahunLulusSMA: formData.tahunLulusSMA,
            
            // Alternative Learning (for statusAkademik = 'lainnya')
            namaInstitusi: formData.namaInstitusi,
            
            // B. KEAHLIAN & SPESIALISASI
            keahlianSpesialisasi: formData.keahlianSpesialisasi,
            keahlianLainnya: formData.keahlianLainnya,
            
            // C. PENGALAMAN
            pengalamanMengajar: formData.pengalamanMengajar,
            pengalamanLainnya: formData.pengalamanLainRelevan, // ✅ Fix: use correct field name
            
            // D. PRESTASI & SERTIFIKASI
            prestasiAkademik: formData.prestasiAkademik,
            prestasiNonAkademik: formData.prestasiNonAkademik,
            sertifikasiPelatihan: formData.sertifikasiPelatihan,
            
            // Document Files (Step 2)
            transkripNilai: formData.transkripNilai,
            sertifikatKeahlian: formData.sertifikatKeahlian,
          },
          address: {
            provinsiDomisili: formData.provinsiDomisili || '',
            kotaKabupatenDomisili: formData.kotaKabupatenDomisili || '',
            kecamatanDomisili: formData.kecamatanDomisili || '',
            kelurahanDomisili: formData.kelurahanDomisili || '',
            alamatLengkapDomisili: formData.alamatLengkapDomisili || '',
            kodePosDomisili: formData.kodePosDomisili,
            alamatSamaDenganKTP: formData.alamatSamaDenganKTP,
            provinsiKTP: formData.provinsiKTP,
            kotaKabupatenKTP: formData.kotaKabupatenKTP,
            kecamatanKTP: formData.kecamatanKTP,
            kelurahanKTP: formData.kelurahanKTP,
            alamatLengkapKTP: formData.alamatLengkapKTP,
            kodePosKTP: formData.kodePosKTP,
          },
          banking: {
            namaNasabah: formData.namaNasabah || '',
            nomorRekening: formData.nomorRekening || '',
            namaBank: formData.namaBank || '',
          },
          
          // 🎯 STEP 4: Availability & Wilayah (PHASE 1)
          availability: {
            // A. AVAILABILITY & STATUS
            statusMenerimaSiswa: formData.statusMenerimaSiswa,
            available_schedule: formData.available_schedule,
            teaching_methods: formData.teaching_methods,
            hourly_rate: formData.hourly_rate ? parseInt(formData.hourly_rate.toString()) : undefined,
            maksimalSiswaBaru: formData.maksimalSiswaBaru ? parseInt(formData.maksimalSiswaBaru.toString()) : undefined,
            maksimalTotalSiswa: formData.maksimalTotalSiswa ? parseInt(formData.maksimalTotalSiswa.toString()) : undefined,
            usiaTargetSiswa: formData.usiaTargetSiswa,
            catatanAvailability: formData.catatanAvailability,
            
            // B. LOCATION & TRANSPORTATION
            transportasiTutor: formData.transportasiTutor,
            alamatTitikLokasi: formData.alamatTitikLokasi,
            teaching_radius_km: formData.teaching_radius_km ? parseInt(formData.teaching_radius_km.toString()) : undefined,
            location_notes: formData.location_notes,
            
            // C. COORDINATES (Optional - for future map integration)
            titikLokasiLat: formData.titikLokasiLat ? parseFloat(formData.titikLokasiLat.toString()) : undefined,
            titikLokasiLng: formData.titikLokasiLng ? parseFloat(formData.titikLokasiLng.toString()) : undefined
          },
          
          // 🎨 STEP 4: Teaching Preferences & Personality (PHASE 2)
          preferences: {
            // A. TEACHING PREFERENCES
            teachingMethods: formData.teachingMethods, // Gaya pembelajaran
            studentLevelPreferences: formData.studentLevelPreferences,
            specialNeedsCapable: formData.specialNeedsCapable,
            groupClassWilling: formData.groupClassWilling,
            
            // B. TECHNOLOGY CAPABILITIES
            onlineTeachingCapable: formData.onlineTeachingCapable,
            techSavviness: formData.techSavviness,
            gmeetExperience: formData.gmeetExperience,
            presensiUpdateCapability: formData.presensiUpdateCapability,
          },
          
          // 👤 STEP 4: Personality Traits (PHASE 2)
          personality: {
            // PERSONALITY & CHARACTER
            tutorPersonalityType: formData.tutorPersonalityType,
            communicationStyle: formData.communicationStyle,
            teachingPatienceLevel: formData.teachingPatienceLevel ? parseInt(formData.teachingPatienceLevel.toString()) : undefined,
            studentMotivationAbility: formData.studentMotivationAbility ? parseInt(formData.studentMotivationAbility.toString()) : undefined,
            scheduleFlexibilityLevel: formData.scheduleFlexibilityLevel ? parseInt(formData.scheduleFlexibilityLevel.toString()) : undefined,
          }
        };

        try {
          // Get Supabase JWT token for Edge Function authorization
          const getSupabaseToken = async (): Promise<string | null> => {
            try {
              const response = await fetch('/api/supabase-session');
              if (!response.ok) return null;
              const result = await response.json();
              return result.supabaseToken || null;
            } catch (error) {
              console.log('⚠️ Failed to get Supabase token:', error);
              return null;
            }
          };

          const sessionToken = await getSupabaseToken();
          console.log('🔐 Supabase token obtained:', sessionToken ? 'Success' : 'Failed');

          const edgeResult = await createTutorWithMigrationSupport(
            formData,
            sessionToken || undefined, // Pass Supabase JWT token for authorization
            async () => {
              // Client-side fallback function (current implementation)
              console.log('📝 [FALLBACK] Creating new tutor user with data:', usersUniversalData);
              
              const userCreationResult = await supabase
                ?.from('users_universal')
                .insert([usersUniversalData])
                .select('id, email, user_code')
                .single();

              return userCreationResult;
            }
          );

          if (edgeResult.success) {
            console.log('✅ [MIGRATION] User creation successful via:', edgeResult.source);
            
            // 🔍 DEBUG: Log complete Edge Function response
            console.log('🔍 [DEBUG] Complete Edge Function Response:', {
              success: edgeResult.success,
              source: edgeResult.source,
              data: edgeResult.data,
              error: edgeResult.error
            });
            
            // 🔍 DEBUG: Log specific fields we need
            console.log('🔍 [DEBUG] Critical Fields from Edge Function:', {
              user_id: edgeResult.data?.user_id,
              tutor_id: edgeResult.data?.tutor_id,
              trn: edgeResult.data?.trn,
              password: edgeResult.data?.password,
              email: edgeResult.data?.email,
              name: edgeResult.data?.name
            });
            
            if (edgeResult.source === 'edge') {
              // 🔧 FIXED: Map ALL fields from Edge Function response
              newTutorUser = {
                id: edgeResult.data?.user_id,
                email: edgeResult.data?.email,
                user_code: edgeResult.data?.user_code,
                // 🔧 FIX: Add missing critical fields
                tutor_id: edgeResult.data?.tutor_id,
                trn: edgeResult.data?.trn,
                password: edgeResult.data?.password,
                name: edgeResult.data?.name
              };
              migrationSource = 'edge_function';
              console.log('🚀 [MIGRATION] Edge function returned (FIXED):', newTutorUser);
            } else {
              // Client-side fallback success
              newTutorUser = edgeResult.data?.data;
              userCreationError = edgeResult.data?.error;
              migrationSource = 'client_side_fallback';
              console.log('🔄 [MIGRATION] Client-side fallback used');
            }
          } else {
            userCreationError = new Error(edgeResult.error || 'Migration failed');
            migrationSource = 'failed';
          }
          
        } catch (migrationError) {
          console.error('💥 [MIGRATION] Migration attempt failed:', migrationError);
          userCreationError = migrationError;
          migrationSource = 'error';
        }
      } else {
        // 📝 FALLBACK: Original client-side implementation
        console.log('📝 [MIGRATION] Using original client-side user creation');
        console.log('📝 Creating new tutor user with data:', usersUniversalData);
        
        const userCreationResult = await supabase
          ?.from('users_universal')
          .insert([usersUniversalData])
          .select('id, email, user_code')
          .single();

        newTutorUser = userCreationResult?.data;
        userCreationError = userCreationResult?.error;
        migrationSource = 'client_side_original';
      }

      // Log migration result
      console.log('📊 [MIGRATION] Phase 1 Result:', {
        source: migrationSource,
        success: !userCreationError,
        user_id: newTutorUser?.id
      });

      // Handle errors regardless of migration source
      if (userCreationError) {
        console.error('❌ Failed to create new tutor user:', userCreationError);
        
        // Handle specific error cases
        if (userCreationError.message.includes('duplicate key') && userCreationError.message.includes('email')) {
          throw new Error(`Email ${formData.email} sudah digunakan. Silakan gunakan email lain.`);
        }
        
        throw new Error(`Gagal membuat user tutor: ${userCreationError.message}`);
      }

      if (!newTutorUser?.id) {
        throw new Error('Gagal mendapatkan ID user yang baru dibuat');
      }

      const userId = newTutorUser.id;
      console.log('✅ New tutor user created successfully:', {
        id: userId,
        email: newTutorUser.email,
        user_code: newTutorUser.user_code,
        password: autoGeneratedPassword
      });

      // 🔧 IMPORTANT: If Edge Function succeeded, it already created ALL required tables
      // Skip client-side inserts to avoid duplicates
      if (migrationSource === 'edge_function') {
        console.log('🎯 [EDGE FUNCTION COMPLETE] All tables created by Edge Function - skipping client inserts');
        
        // 🔍 DEBUG: Log what we're about to show in success notification
        console.log('🔍 [DEBUG] Success Notification Data BEFORE:', {
          newTutorUser: newTutorUser,
          tutor_id_from_edge: newTutorUser?.tutor_id,
          trn_from_edge: newTutorUser?.trn,
          password_from_edge: newTutorUser?.password,
          user_id: userId,
          email: formData.email,
          autoGeneratedPassword: autoGeneratedPassword
        });
        
        // Show success message and return
        const insertedData = {
          user_id: userId,
          tutor_id: newTutorUser?.tutor_id || 'Created by Edge Function',
          trn: newTutorUser?.trn || 'Generated with kelipatan 7',
          email: formData.email,
          name: formData.namaLengkap,
          religion: formData.agama || 'Not specified'
        };
        
        // 🔍 DEBUG: Log final data for success notification
        console.log('🔍 [DEBUG] Final Success Notification Data:', insertedData);

        // 🚀 FIXED: Show success notification using REAL data from Edge Function
        showSuccess('🚀 Data Tutor Berhasil Disimpan', {
          copyableData: [
            { label: 'TRN', value: newTutorUser?.trn || 'Auto-generated kelipatan 7' },
            { label: 'Email', value: newTutorUser?.email || formData.email },
            { label: 'Password', value: newTutorUser?.password || autoGeneratedPassword, sensitive: true },
            { label: 'User ID', value: newTutorUser?.id || userId },
            { label: 'Tutor ID', value: newTutorUser?.tutor_id || 'Created by Edge Function' }
          ],
          message: '⚠️ Catat password ini untuk diberikan kepada tutor!',
          actions: [
            { 
              label: 'Kembali ke Daftar', 
              action: () => {
                hideNotification();
                router.push('/eduprima/main/ops/em/database-tutor');
              },
              variant: 'default' as const
            }
          ]
        });
        // ✅ Lanjut ke file upload handling
        console.log('🎯 [EDGE FUNCTION COMPLETE] All tables created by Edge Function');
        return;
      }


      // Step 3b: Insert to user_profiles (ONLY if Edge Function didn't handle it)

      const profileResult = await supabase
        ?.from('user_profiles')
        .insert([{ ...userProfilesData, user_id: userId }])
        .select('id')
        .single();

      if (profileResult?.error) {

        throw new Error(`Failed to create user profile: ${profileResult.error.message}`);
      }



      // Step 3c: Insert to user_demographics (if religion is provided)
      if (formData.agama) {

        const demographicsResult = await supabase
          ?.from('user_demographics')
          .insert([{ ...userDemographicsData, user_id: userId }])
          .select('id')
          .single();

        if (demographicsResult?.error) {

          throw new Error(`Failed to create user demographics: ${demographicsResult.error.message}`);
        }


      }

      // Step 3d: Insert domicile address

      const domicileResult = await supabase
        ?.from('user_addresses')
        .insert([{ ...domicileAddressData, user_id: userId }])
        .select('id')
        .single();

      if (domicileResult?.error) {

        throw new Error(`Failed to create domicile address: ${domicileResult.error.message}`);
      }



      // Step 3e: Insert KTP address (if different from domicile)
      if (ktpAddressData) {

        const ktpResult = await supabase
          ?.from('user_addresses')
          .insert([{ ...ktpAddressData, user_id: userId }])
          .select('id')
          .single();

        if (ktpResult?.error) {

          throw new Error(`Failed to create KTP address: ${ktpResult.error.message}`);
        }


      }

      // Step 3f: Insert to tutor_details

      // First insert without tutor_registration_number to avoid trigger
      const tutorResult = await supabase
        ?.from('tutor_details')
        .insert([{ ...tutorDetailsData, user_id: userId }])
        .select('id')
        .single();

      if (tutorResult?.error) {
        console.error('Error inserting to tutor_details:', tutorResult.error);
        throw new Error(`Failed to create tutor details: ${tutorResult.error.message}`);
      }

      const tutorId = tutorResult?.data?.id;
      console.log('✅ Tutor details created with ID:', tutorId);

      // TRN will be auto-generated by database trigger: set_tutor_registration_number()
      // No manual generation needed - let database handle this to avoid duplicates
      console.log('🎯 TRN will be auto-generated by database trigger');

      // Step 3g: Insert to tutor_management (NEW TABLE)
      console.log('Step 3g: Inserting to tutor_management...');
      const managementResult = await supabase
        ?.from('tutor_management')
        .insert([{ ...tutorManagementData, user_id: userId }])
        .select('id')
        .single();

      if (managementResult?.error) {
        console.error('Error inserting to tutor_management:', managementResult.error);
        throw new Error(`Failed to create tutor management record: ${managementResult.error.message}`);
      }

      console.log('✅ Tutor management created with ID:', managementResult?.data?.id);

      // Step 3h: Insert tutor banking information (if provided)
      console.log('Step 3h: Inserting tutor banking information...');
      
      // Use the tutor ID from the tutor_details insert (already defined above)
      if (!tutorId) {
        throw new Error('Failed to get tutor ID from tutor_details');
      }

      console.log('✅ Using tutor ID for banking:', tutorId);

      // Insert banking info linked to tutor - only if bank was selected
      let bankingResult = null;
      if (bankingData) {
        bankingResult = await supabase
          ?.from('tutor_banking_info')
          .insert([{ ...bankingData, tutor_id: tutorId }])
          .select('id')
          .single();

        if (bankingResult?.error) {
          console.error('Error inserting tutor banking info:', bankingResult.error);
          throw new Error(`Failed to create tutor banking information: ${bankingResult.error.message}`);
        }

        console.log('✅ Educator banking information created with ID:', bankingResult?.data?.id);
      } else {
        console.log('⏩ Skipping banking info - no bank selected');
      }

      // Step 3i: Insert to tutor_availability_config (NEW TABLE)
      console.log('Step 3i: Inserting to tutor_availability_config...');
      const availabilityResult = await supabase
        ?.from('tutor_availability_config')
        .insert([{ ...availabilityConfigData, tutor_id: tutorId }])
        .select('id')
        .single();

      if (availabilityResult?.error) {
        console.error('Error inserting to tutor_availability_config:', availabilityResult.error);
        throw new Error(`Failed to create availability config: ${availabilityResult.error.message}`);
      }

      console.log('✅ Tutor availability config created with ID:', availabilityResult?.data?.id);

      // Step 3j: Insert to tutor_teaching_preferences (NEW TABLE)
      console.log('Step 3j: Inserting to tutor_teaching_preferences...');
      const preferencesResult = await supabase
        ?.from('tutor_teaching_preferences')
        .insert([{ ...teachingPreferencesData, tutor_id: tutorId }])
        .select('id')
        .single();

      if (preferencesResult?.error) {
        console.error('Error inserting to tutor_teaching_preferences:', preferencesResult.error);
        throw new Error(`Failed to create teaching preferences: ${preferencesResult.error.message}`);
      }

      console.log('✅ Tutor teaching preferences created with ID:', preferencesResult?.data?.id);

      // Step 3k: Insert to tutor_personality_traits (NEW TABLE)
      console.log('Step 3k: Inserting to tutor_personality_traits...');
      const personalityResult = await supabase
        ?.from('tutor_personality_traits')
        .insert([{ ...personalityTraitsData, tutor_id: tutorId }])
        .select('id')
        .single();

      if (personalityResult?.error) {
        console.error('Error inserting to tutor_personality_traits:', personalityResult.error);
        throw new Error(`Failed to create personality traits: ${personalityResult.error.message}`);
      }

      console.log('✅ Tutor personality traits created with ID:', personalityResult?.data?.id);

      // Step 3l: Insert to tutor_program_mappings (NEW TABLE) - multiple records
      if (programMappingsData.length > 0) {
        console.log('Step 3l: Inserting to tutor_program_mappings...');
        console.log('🔍 DEBUG: About to insert programMappingsData =', programMappingsData);
        console.log('🔍 DEBUG: tutorId =', tutorId);
        console.log('🔍 DEBUG: Final data to insert =', programMappingsData.map(mapping => ({ ...mapping, tutor_id: tutorId })));
        
        const mappingsResult = await supabase
          ?.from('tutor_program_mappings')
          .insert(programMappingsData.map(mapping => ({ ...mapping, tutor_id: tutorId })));

        if (mappingsResult?.error) {
          console.error('❌ Error inserting to tutor_program_mappings:', mappingsResult.error);
          console.error('❌ Error details:', {
            message: mappingsResult.error.message,
            details: mappingsResult.error.details,
            hint: mappingsResult.error.hint,
            code: mappingsResult.error.code
          });
          throw new Error(`Failed to create program mappings: ${mappingsResult.error.message}`);
        }

        console.log('✅ Tutor program mappings created:', programMappingsData.length, 'records');
        console.log('✅ Insert result:', mappingsResult?.data);
      } else {
        console.log('⚠️ WARNING: No program mappings to insert. programMappingsData.length =', programMappingsData.length);
      }

      // Step 3m: Document storage rows will be created by the upload API after successful uploads

      console.log('🎉 ALL 8 TABLES inserted successfully!');

      // Return the main user data for reference
      const insertedData = {
        user_id: userId,
        tutor_id: tutorId,
        email: formData.email,
        name: formData.namaLengkap,
        religion: formData.agama
      };

      // Step 4: Handle file uploads using admin client (skip if no files)
      console.log('📤 Preparing file uploads...');

      // Debug: Check form data files
      console.log('🔍 Checking files in formData:');
      console.log('fotoProfil:', formData.fotoProfil ? `${typeof formData.fotoProfil} - ${formData.fotoProfil instanceof File ? formData.fotoProfil.name : 'not a file'}` : 'null');
      console.log('dokumenIdentitas:', formData.dokumenIdentitas ? `${typeof formData.dokumenIdentitas} - ${formData.dokumenIdentitas instanceof File ? formData.dokumenIdentitas.name : 'not a file'}` : 'null');
      console.log('dokumenPendidikan:', formData.dokumenPendidikan ? `${typeof formData.dokumenPendidikan} - ${formData.dokumenPendidikan instanceof File ? formData.dokumenPendidikan.name : 'not a file'}` : 'null');
      console.log('dokumenSertifikat:', formData.dokumenSertifikat ? `${typeof formData.dokumenSertifikat} - ${formData.dokumenSertifikat instanceof File ? formData.dokumenSertifikat.name : 'not a file'}` : 'null');
      console.log('transkripNilai:', formData.transkripNilai ? `${typeof formData.transkripNilai} - ${formData.transkripNilai instanceof File ? formData.transkripNilai.name : 'not a file'}` : 'null');
      console.log('sertifikatKeahlian:', formData.sertifikatKeahlian ? `${typeof formData.sertifikatKeahlian} - ${formData.sertifikatKeahlian instanceof File ? formData.sertifikatKeahlian.name : 'not a file'}` : 'null');

      // Check if there are any files to upload
      // ✅ UPDATED: Step 2 files (transkripNilai, sertifikatKeahlian) now handled by service layer PHASE 3
      // ✅ UPDATED: Step 5 files (dokumenIdentitas, dokumenPendidikan, dokumenSertifikat) now handled by service layer PHASE 4
      // Only check for Step 1 files in legacy upload
      const hasFiles = (formData.fotoProfil && typeof formData.fotoProfil !== 'string');
                      // ❌ REMOVED: Step 2 files (transkripNilai, sertifikatKeahlian) handled by service layer PHASE 3
                      // ❌ REMOVED: Step 5 files (dokumenIdentitas, dokumenPendidikan, dokumenSertifikat) handled by service layer PHASE 4

      console.log('🎯 hasFiles result:', hasFiles);

      // ✅ Use API route for file uploads to ensure server-side environment access
      if (hasFiles) {
        console.log('📤 Uploading files via API route...');
        try {
          // Prepare FormData for API
          const uploadFormData = new FormData();
          uploadFormData.append('userId', userId);
          
          const fileTypes = [];
          
          if (formData.fotoProfil && typeof formData.fotoProfil !== 'string') {
            uploadFormData.append('files', formData.fotoProfil);
            uploadFormData.append('fileTypes', 'profile_photo');
            fileTypes.push('profile_photo');
            console.log('📸 Adding foto profil to upload queue');
          }
          
          // ✅ DISABLED: Step 5 documents now handled by service layer PHASE 4
          // This prevents double upload attempts and ensures consistency with Step 2 approach
          /*
          if (formData.dokumenIdentitas && typeof formData.dokumenIdentitas !== 'string') {
            uploadFormData.append('files', formData.dokumenIdentitas);
            uploadFormData.append('fileTypes', 'identity_document');
            fileTypes.push('identity_document');
            console.log('📄 Adding dokumen identitas to upload queue');
          }
          
          if (formData.dokumenPendidikan && typeof formData.dokumenPendidikan !== 'string') {
            uploadFormData.append('files', formData.dokumenPendidikan);
            uploadFormData.append('fileTypes', 'education_document');
            fileTypes.push('education_document');
            console.log('🎓 Adding dokumen pendidikan to upload queue');
          }
          
          if (formData.dokumenSertifikat && typeof formData.dokumenSertifikat !== 'string') {
            uploadFormData.append('files', formData.dokumenSertifikat);
            uploadFormData.append('fileTypes', 'certificate_document');
            fileTypes.push('certificate_document');
            console.log('🏆 Adding dokumen sertifikat to upload queue');
          }
          */
          
          // ✅ DISABLED: Step 2 documents now handled by service layer PHASE 3
          // This prevents double upload attempts and file object corruption
          /*
          if (formData.transkripNilai && typeof formData.transkripNilai !== 'string') {
            uploadFormData.append('files', formData.transkripNilai);
            uploadFormData.append('fileTypes', 'transcript_document');
            fileTypes.push('transcript_document');
            console.log('📜 Adding transkrip nilai to upload queue');
          }
          
          if (formData.sertifikatKeahlian && typeof formData.sertifikatKeahlian !== 'string') {
            uploadFormData.append('files', formData.sertifikatKeahlian);
            uploadFormData.append('fileTypes', 'expertise_certificate');
            fileTypes.push('expertise_certificate');
            console.log('🎯 Adding sertifikat keahlian to upload queue');
          }
          */
          
          console.log(`🚀 Starting upload of ${fileTypes.length} files via API...`);
          
          // Call API route
          const uploadResponse = await fetch('/api/upload/tutor-files', {
            method: 'POST',
            body: uploadFormData
          });
          
          const uploadResult = await uploadResponse.json();
          
          if (!uploadResponse.ok || !uploadResult.success) {
            throw new Error(uploadResult.error || 'Upload API failed');
          }
          
          console.log('✅ File uploads completed via API:', uploadResult);
          
          // Log individual results
          uploadResult.results.forEach((result: any, index: number) => {
            console.log(`📁 Upload ${index + 1} (${result.fileType}):`, {
              success: result.success,
              url: result.publicUrl,
              error: result.error
            });
          });
          
          const successCount = uploadResult.results.filter((r: any) => r.success).length;
          console.log(`✅ Successfully uploaded ${successCount}/${uploadResult.results.length} files`);
          
        } catch (uploadError) {
          console.error('❌ File upload failed:', uploadError);
          console.warn('⚠️ Data was saved to database but file upload failed');
          
          // Show warning to user but don't fail the entire operation
          const errorMsg = uploadError instanceof Error ? uploadError.message : 'Unknown upload error';
          alert(`⚠️ Data tersimpan tapi upload file gagal:\n${errorMsg}\n\nAnda bisa upload file manual nanti.`);
        }
      } else {
        console.log('⏩ No files to upload - skipping file upload step');
      }



      // Show success message with login credentials
      showSuccess('Data Tutor Berhasil Disimpan!', {
        copyableData: [
          { label: 'TRN', value: 'Auto-generated by database' },
          { label: 'Email', value: formData.email },
          { label: 'Password', value: autoGeneratedPassword, sensitive: true },
          { label: 'User ID', value: userId }
        ],
        message: '⚠️ Catat password ini untuk diberikan kepada tutor!',
        actions: [
          { 
            label: 'Kembali ke Daftar', 
            action: () => {
              hideNotification();
              router.push('/eduprima/main/ops/em/database-tutor');
            },
            variant: 'default' as const
          }
        ]
      });
      
    } catch (error) {

      
      // Show user-friendly error message
      let errorMessage = 'Detail: ';
      if (error instanceof Error) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Error tidak diketahui. Periksa console untuk detail.';
      }
      
      showError('Gagal Menyimpan Data', {
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
            router.push('/eduprima/main/ops/em/database-tutor');
  };

  // Helper function to group fields by sections
  const groupFieldsBySection = (fields: any[]) => {
    const sections: { [key: string]: any[] } = {};
    let currentSection = 'default';
    
    fields.forEach(field => {
      if (field.disabled && field.className === 'section-divider') {
        currentSection = field.name;
        if (!sections[currentSection]) {
          sections[currentSection] = [];
        }
        sections[currentSection].push(field);
      } else {
        if (!sections[currentSection]) {
          sections[currentSection] = [];
        }
        sections[currentSection].push(field);
      }
    });
    
    return sections;
  };

  const currentStepErrors = stepErrors[currentStep] || [];
  const hasAttemptedNext = attemptedNext[currentStep] || false;

  // Show loading while checking auth
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-card rounded-lg shadow-sm border p-6 flex items-center space-x-4">
          <Icon icon="ph:spinner" className="h-8 w-8 animate-spin text-primary" />
          <div>
            <div className="text-lg font-medium text-foreground">Checking authentication...</div>
            <div className="text-sm text-muted-foreground">Please wait while we verify your session</div>
          </div>
        </div>
      </div>
    );
  }

  // Show login required if no user
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-card rounded-lg shadow-sm border p-6 text-center max-w-md">
          <Icon icon="ph:lock" className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Authentication Required</h2>
          <p className="text-muted-foreground mb-4">
            You need to be logged in to access the tutor registration form.
          </p>
          <Button 
            onClick={() => router.push('/auth/supabase-login')}
            className="w-full"
          >
            <Icon icon="ph:sign-in" className="h-4 w-4 mr-2" />
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div suppressHydrationWarning>
      {/* Desktop Layout (lg+) */}
      <div className="hidden lg:flex">
        <div className="w-80 bg-card border-r border-border min-h-screen sticky top-0">
          <div className="p-6">
            {/* Desktop Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 p-3 rounded-xl">
                  <Icon icon="ph:user-plus" className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h2 className="font-bold text-default-900 text-xl">Entry Tutor</h2>
                  <p className="text-sm text-muted-foreground">Data tutor baru</p>
                </div>
              </div>
            </div>

            {/* Desktop Navigation Steps */}
            <nav className="space-y-3">
              {tutorFormConfig.steps.map((step, index) => {
                const stepStatus = getStepStatus(index, currentStep, formData, tutorFormConfig.steps);
                const canAccess = canAccessStep(index, currentStep, formData, tutorFormConfig.steps);
                const errors = validateStep(step, formData);
                const isActive = stepStatus === 'active';
                
                return (
                  <button
                    key={step.id}
                    onClick={() => handleStepClick(index)}
                    disabled={!canAccess}
                    className={cn(
                      "w-full flex items-center space-x-4 p-4 rounded-xl transition-all duration-200 text-left step-nav-enhanced",
                      {
                        // Active step - Enhanced blue with better contrast
                        "bg-primary text-primary-foreground shadow-lg ring-2 ring-primary/20": stepStatus === 'active',
                        
                        // Completed step - Enhanced green with better contrast
                        "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800": stepStatus === 'success',
                        
                        // Warning step - Enhanced amber for better visibility
                        "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950/40 border border-amber-200 dark:border-amber-800": stepStatus === 'warning',
                        
                        // Pending step - Better neutral colors
                        "bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 border border-slate-200 dark:border-slate-700": stepStatus === 'pending',
                        
                        // Disabled state
                        "opacity-50 cursor-not-allowed": !canAccess,
                      }
                    )}
                  >
                    <div className="flex-shrink-0">
                      <Icon 
                        icon={step.icon} 
                        className={cn(
                          "h-6 w-6",
                          {
                            "text-primary-foreground": stepStatus === 'active',
                            "text-emerald-600 dark:text-emerald-400": stepStatus === 'success',
                            "text-amber-600 dark:text-amber-400": stepStatus === 'warning',
                            "text-slate-500 dark:text-slate-400": stepStatus === 'pending',
                          }
                        )} 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        "font-semibold text-sm",
                        {
                          "text-primary-foreground": stepStatus === 'active',
                          "text-emerald-800 dark:text-emerald-200": stepStatus === 'success',
                          "text-amber-800 dark:text-amber-200": stepStatus === 'warning',
                          "text-slate-700 dark:text-slate-300": stepStatus === 'pending',
                        }
                      )}>
                        {step.title}
                      </div>
                      <div className={cn(
                        "text-xs mt-1 opacity-90",
                        {
                          "text-primary-foreground/80": stepStatus === 'active',
                          "text-emerald-600 dark:text-emerald-300": stepStatus === 'success',
                          "text-amber-600 dark:text-amber-300": stepStatus === 'warning',
                          "text-slate-600 dark:text-slate-400": stepStatus === 'pending',
                        }
                      )}>
                        {step.description}
                      </div>
                      

                    </div>
                    
                    {/* Status indicator dot */}
                    <div className={cn(
                      "w-3 h-3 rounded-full flex-shrink-0 shadow-sm status-indicator",
                      {
                        "bg-primary": stepStatus === 'active',
                        "bg-emerald-500 dark:bg-emerald-400 success": stepStatus === 'success',
                        "bg-amber-500 dark:bg-amber-400 warning": stepStatus === 'warning',
                        "bg-slate-400 dark:bg-slate-500": stepStatus === 'pending',
                      }
                    )} />
                  </button>
                );
              })}
            </nav>

            {/* Desktop Progress Summary */}
            <div className="mt-8 space-y-4">
              {/* Current Step Progress */}
              <div className="p-4 bg-muted/50 rounded-xl">
                <div className="text-xs text-muted-foreground mb-2">Step Saat Ini</div>
                <div className="text-sm font-medium text-default-900 mb-3">
                  Step {currentStep + 1} / {totalSteps}
                </div>
                <Progress value={progress} className="h-3" />
                <div className="text-xs text-muted-foreground mt-2 text-center">
                  {Math.round(progress)}% dari navigasi
                </div>
              </div>

              {/* Overall Completion Progress */}
              <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-slate-700 dark:text-slate-300 font-medium">Progress Keseluruhan</div>
                  <div className="text-xs text-slate-800 dark:text-slate-200 font-bold">
                    {Math.round(overallProgress)}%
                  </div>
                </div>
                <Progress value={overallProgress} className="h-2 progress-enhanced" />
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-2 text-center">
                  Form completion berdasarkan semua field
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Main Content */}
        <div className="flex-1 min-h-screen">
          {/* Desktop Header */}
          <div className="space-y-4 p-8">
            <div className="flex items-center space-x-4">
              <div className="bg-primary/10 p-3 rounded-xl">
                <Icon icon={currentStepConfig.icon} className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-default-900">
                  {currentStepConfig.title}
                </h1>
                <p className="text-muted-foreground">
                  {currentStepConfig.description}
                </p>
              </div>
            </div>

            {/* Desktop Step Progress Indicator */}
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                  {currentStep + 1}
                </div>
                <span className="text-muted-foreground">of {totalSteps}</span>
              </div>
              <div className="h-4 w-px bg-border"></div>
              <Badge className="border-primary/20 text-primary bg-primary/5 border">
                <Icon icon="ph:info" className="w-3 h-3 mr-1" />
                All fields optional
              </Badge>
            </div>
          </div>

          {/* Desktop Form Content */}
          <div className="px-8">
            {/* Info Alert */}
            <Alert variant="outline" className="border-info/20 bg-info/5 mb-8">
              <Icon icon="ph:lightbulb" className="h-5 w-5 text-info" />
              <div className="ml-3">
                <h4 className="font-semibold text-info mb-1">Staff Entry Mode</h4>
                <p className="text-sm text-info/80">
                  Mode entry data untuk staff. Semua field opsional, navigasi bebas, data dapat disimpan kapan saja.
                </p>
              </div>
            </Alert>

            {/* Desktop Form Fields - Card Based Sections */}
            <div className="space-y-6">
              {(() => {
                const visibleFields = currentStepConfig.fields.filter(field => isFieldVisible(field, formData));
                const sections = groupFieldsBySection(visibleFields);
                
                return Object.entries(sections).map(([sectionKey, sectionFields]) => {
                  // Find the section divider field to get the title
                  const sectionDivider = sectionFields.find(field => field.disabled && field.className === 'section-divider');
                  const sectionTitle = sectionDivider?.label || 'Form Fields';
                  const sectionIcon = sectionDivider?.icon || 'ph:folder';
                  
                  // Get non-divider fields for this section
                  const contentFields = sectionFields.filter(field => !(field.disabled && field.className === 'section-divider'));
                  
                  if (contentFields.length === 0) return null;
                  
                  return (
                    <Card key={sectionKey} className="overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-primary/20">
                        <CardTitle className="flex items-center space-x-3">
                          <div className="bg-primary/10 p-2 rounded-lg">
                            <Icon icon={sectionIcon} className="h-5 w-5 text-primary" />
                          </div>
                          <span className="text-primary font-semibold">{sectionTitle}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                          {contentFields.map((field) => {
                            const fieldValue = (formData as any)[field.name];
                            
                            return (
                              <div 
                                key={field.name} 
                                className={cn(
                                  "transition-all duration-200",
                                  field.type === 'textarea' || field.type === 'checkbox' || field.type === 'ai-core-select' || field.type === 'ai-recommendations' || field.type === 'category-program-selector' || (field.disabled && field.className === 'info-text') || field.className === 'full-width-field' ? 'lg:col-span-2 xl:col-span-3' : ''
                                )}
                              >
                                <DynamicFormField
                                  field={field}
                                  value={fieldValue}
                                  onChange={handleFieldChange}
                                  disabled={isSubmitting}
                                  formData={formData}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                });
              })()}
            </div>

            {/* Desktop Navigation Buttons */}
            <Card className="mt-6">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isSubmitting}
                      className="gap-2"
                    >
                      <Icon icon="ph:x" className="h-4 w-4" />
                      {tutorFormConfig.cancelText}
                    </Button>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      disabled={isSubmitting}
                      className="gap-2"
                    >
                      <Icon icon="ph:arrow-left" className="h-4 w-4" />
                      {currentStep > 0 ? tutorFormConfig.backText : 'Kembali ke Daftar'}
                    </Button>

                    {currentStep < totalSteps - 1 ? (
                      <Button
                        onClick={handleNext}
                        disabled={isSubmitting}
                        className="gap-2"
                        color="primary"
                      >
                        {tutorFormConfig.nextText}
                        <Icon icon="ph:arrow-right" className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="gap-2"
                        color="success"
                      >
                        <Icon 
                          icon={isSubmitting ? "ph:spinner" : "ph:floppy-disk"} 
                          className={cn("h-4 w-4", {
                            "animate-spin": isSubmitting
                          })}
                        />
                        {isSubmitting ? 'Menyimpan...' : tutorFormConfig.submitText}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Desktop Form Summary Footer */}
                <div className="text-center pt-6 mt-6 border-t">
                  <div className="flex justify-center items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Icon icon="ph:database" className="h-4 w-4 text-primary" />
                      <span>Auto-save enabled</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon icon="ph:shield-check" className="h-4 w-4 text-success" />
                      <span>Staff validation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon icon="ph:clock" className="h-4 w-4 text-info" />
                      <span>Created: {new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Desktop Quick Actions */}
            <Card className="bg-muted/20 mt-8">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="bg-warning/10 p-2 rounded-full">
                      <Icon icon="ph:lightning" className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-default-900 mb-2">
                        Staff Entry Actions
                      </h3>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>• Gunakan shortcut Ctrl+S untuk menyimpan cepat</p>
                        <p>• TRN akan di-generate otomatis jika kosong</p>
                        <p>• Password akan di-generate dan dikirim ke email tutor</p>
                        <p>• Data dapat disimpan sewaktu-waktu tanpa validasi</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Icon icon="ph:export" className="h-4 w-4" />
                      Preview
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Icon icon="ph:copy" className="h-4 w-4" />
                      Duplicate
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Mobile Sticky Header */}
        <div className="bg-card border-b border-border sticky top-0 z-40">
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/50">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="bg-primary/10 p-2 rounded-lg flex-shrink-0">
                <Icon icon="ph:user-plus" className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="font-bold text-default-900 text-lg truncate">Entry Tutor</h1>
                <p className="text-sm text-muted-foreground">Step {currentStep + 1}/{totalSteps}</p>
              </div>
            </div>
            <Badge className="border-primary/20 text-primary bg-primary/5 border text-xs px-2 py-1 flex-shrink-0 ml-2">
              <Icon icon="ph:info" className="w-3 h-3 mr-1" />
              Optional
            </Badge>
          </div>

          {/* Mobile Tabs */}
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex space-x-1 px-4 py-3">
              {tutorFormConfig.steps.map((step, index) => {
                const stepStatus = getStepStatus(index, currentStep, formData, tutorFormConfig.steps);
                const canAccess = canAccessStep(index, currentStep, formData, tutorFormConfig.steps);
                const errors = validateStep(step, formData);
                
                return (
                  <button
                    key={step.id}
                    onClick={() => handleStepClick(index)}
                    disabled={!canAccess}
                    className={cn(
                      "flex-shrink-0 flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border",
                      {
                        // Active step - Enhanced blue
                        "bg-primary text-primary-foreground shadow-sm border-primary/30": stepStatus === 'active',
                        
                        // Completed step - Enhanced emerald
                        "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800": stepStatus === 'success',
                        
                        // Warning step - Enhanced amber
                        "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800": stepStatus === 'warning',
                        
                        // Pending step - Better neutrals
                        "bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700": stepStatus === 'pending',
                        
                        // Disabled state
                        "opacity-50 cursor-not-allowed": !canAccess,
                      }
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold border flex-shrink-0 shadow-sm",
                      {
                        "bg-primary-foreground text-primary border-primary-foreground": stepStatus === 'active',
                        "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700": stepStatus === 'success',
                        "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-200 border-amber-300 dark:border-amber-700": stepStatus === 'warning',
                        "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600": stepStatus === 'pending',
                      }
                    )}>
                      {stepStatus === 'success' ? <Icon icon="ph:check" className="h-3 w-3" /> : 
                       stepStatus === 'warning' ? <Icon icon="ph:warning" className="h-3 w-3" /> :
                       index + 1}
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="truncate max-w-[80px] text-xs font-medium">{step.title}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile Progress */}
          <div className="px-4 pb-3 space-y-2">
            {/* Step Progress */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Step {currentStep + 1}/{totalSteps}</span>
              <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            
            {/* Overall Progress */}
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">Total Completion</span>
              <span className="text-xs text-slate-800 dark:text-slate-200 font-bold">{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-1 progress-enhanced" />
          </div>
        </div>

        {/* Mobile Content */}
        <div className="p-4 pb-20">
          {/* Mobile Current Step Info */}
          <div className="mb-4 bg-card border border-border rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 p-2 rounded-lg flex-shrink-0">
                <Icon icon={currentStepConfig.icon} className="h-6 w-6 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-default-900 text-base truncate">{currentStepConfig.title}</h2>
                <p className="text-sm text-muted-foreground truncate">{currentStepConfig.description}</p>
              </div>
            </div>
          </div>

          {/* Mobile Info Alert */}
          <div className="mb-4 bg-info/5 border border-info/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Icon icon="ph:lightbulb" className="h-5 w-5 text-info mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-info mb-1 text-sm">Staff Entry Mode</h4>
                <p className="text-sm text-info/80">
                  Mode entry data untuk staff. Semua field opsional, navigasi bebas, data dapat disimpan kapan saja.
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Form Fields - Card Based Sections */}
          <div className="space-y-4">
            {(() => {
              const visibleFields = currentStepConfig.fields.filter(field => isFieldVisible(field, formData));
              const sections = groupFieldsBySection(visibleFields);
              
              return Object.entries(sections).map(([sectionKey, sectionFields]) => {
                // Find the section divider field to get the title
                const sectionDivider = sectionFields.find(field => field.disabled && field.className === 'section-divider');
                const sectionTitle = sectionDivider?.label || 'Form Fields';
                const sectionIcon = sectionDivider?.icon || 'ph:folder';
                
                // Get non-divider fields for this section
                const contentFields = sectionFields.filter(field => !(field.disabled && field.className === 'section-divider'));
                
                if (contentFields.length === 0) return null;
                
                return (
                  <Card key={sectionKey} className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-primary/20 p-4">
                      <CardTitle className="flex items-center space-x-2 text-sm">
                        <div className="bg-primary/10 p-1.5 rounded">
                          <Icon icon={sectionIcon} className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-primary font-semibold">{sectionTitle}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        {contentFields.map((field) => {
                          const fieldValue = (formData as any)[field.name];
                          
                          return (
                            <div key={field.name} className="w-full">
                              <DynamicFormField
                                field={field}
                                value={fieldValue}
                                onChange={handleFieldChange}
                                disabled={isSubmitting}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              });
            })()}
          </div>

          {/* Mobile Navigation Buttons */}
          <div className="mt-6 pt-4 border-t border-border space-y-3">
            {currentStep < totalSteps - 1 ? (
              <Button
                onClick={handleNext}
                disabled={isSubmitting}
                className="w-full gap-2 h-12"
                color="primary"
              >
                {tutorFormConfig.nextText}
                <Icon icon="ph:arrow-right" className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full gap-2 h-12"
                color="success"
              >
                <Icon 
                  icon={isSubmitting ? "ph:spinner" : "ph:floppy-disk"} 
                  className={cn("h-4 w-4", {
                    "animate-spin": isSubmitting
                  })}
                />
                {isSubmitting ? 'Menyimpan...' : tutorFormConfig.submitText}
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isSubmitting}
              className="w-full gap-2 h-12"
            >
              <Icon icon="ph:arrow-left" className="h-4 w-4" />
              {currentStep > 0 ? tutorFormConfig.backText : 'Kembali ke Daftar'}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="w-full gap-2 h-12"
            >
              <Icon icon="ph:x" className="h-4 w-4" />
              {tutorFormConfig.cancelText}
            </Button>
          </div>

          {/* Mobile Form Summary */}
          <div className="text-center pt-4 mt-4 border-t border-border">
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-center gap-2">
                <Icon icon="ph:database" className="h-4 w-4 text-primary" />
                <span>Auto-save enabled</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Icon icon="ph:shield-check" className="h-4 w-4 text-success" />
                <span>Staff validation</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Icon icon="ph:clock" className="h-4 w-4 text-info" />
                <span>Created: {new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={hideNotification}
        title={notification.title}
        type={notification.type}
        copyableData={notification.copyableData}
        message={notification.message}
        actions={notification.actions}
        autoCloseMs={notification.autoCloseMs}
      />
    </div>
  );
}