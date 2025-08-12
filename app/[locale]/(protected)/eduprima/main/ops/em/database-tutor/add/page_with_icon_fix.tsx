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

// Supabase Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {

}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Utility functions for data formatting
const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Handle Indonesian phone numbers
  if (cleanPhone.startsWith('0')) {
    return `+62${cleanPhone.substring(1)}`;
  } else if (cleanPhone.startsWith('62')) {
    return `+${cleanPhone}`;
  } else if (cleanPhone.startsWith('8')) {
    return `+62${cleanPhone}`;
  }
  
  return `+62${cleanPhone}`;
};

const generatePassword = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Helper function to group fields by section
const groupFieldsBySection = (fields: any[]) => {
  const sections: { [key: string]: any[] } = {};
  let currentSection = 'default';
  
  fields.forEach(field => {
    if (field.disabled && field.className === 'section-divider') {
      currentSection = field.name;
      sections[currentSection] = sections[currentSection] || [];
      sections[currentSection].push(field);
    } else {
      sections[currentSection] = sections[currentSection] || [];
      sections[currentSection].push(field);
    }
  });
  
  return sections;
};

export default function AddTutorPage() {
  const router = useRouter();
  const { data: session, status } = useCustomSession();
  const { showSuccess, showError, hideNotification } = useNotification();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<TutorFormData>>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const totalSteps = tutorFormConfig.steps.length;
  const currentStepConfig = tutorFormConfig.steps[currentStep];

  // Calculate progress based on step navigation (not field completion)
  const progress = ((currentStep + 1) / totalSteps) * 100;
  
  // Calculate overall progress based on all field completion
  const overallProgress = getOverallProgress(formData, tutorFormConfig.steps);

  const handleFieldChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Updated submit handler with comprehensive data preparation
  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      console.log('🚀 [SUBMIT] Starting tutor creation process...');
      console.log('📋 [SUBMIT] Form data:', formData);
      
      // Generate password for the new user
      const autoGeneratedPassword = generatePassword();
      console.log('🔐 [SUBMIT] Generated password:', autoGeneratedPassword);

      // 🔧 FIXED: Prepare comprehensive form data for Edge Function
      const edgeFormData = {
        // Step 1: Basic Identity
        namaLengkap: formData.namaLengkap || '',
        namaPanggilan: formData.namaPanggilan || '',
        tanggalLahir: formData.tanggalLahir || '',
        jenisKelamin: formData.jenisKelamin || '',
        agama: formData.agama || '',
        email: formData.email || '',
        noHp1: formData.noHp1 || '',
        noHp2: formData.noHp2 || '',
        
        // Address data
        provinsiDomisili: formData.provinsiDomisili || '',
        kotaKabupatenDomisili: formData.kotaKabupatenDomisili || '',
        kecamatanDomisili: formData.kecamatanDomisili || '',
        kelurahanDomisili: formData.kelurahanDomisili || '',
        alamatLengkapDomisili: formData.alamatLengkapDomisili || '',
        
        // Banking data
        namaNasabah: formData.namaNasabah || '',
        nomorRekening: formData.nomorRekening || '',
        namaBank: formData.namaBank || '',
        
        // Profile & Value Proposition
        headline: formData.headline || '',
        deskripsiDiri: formData.deskripsiDiri || '',
        socialMedia1: formData.socialMedia1 || '',
        socialMedia2: formData.socialMedia2 || '',
        motivasiMenjadiTutor: formData.motivasiMenjadiTutor || '',
        
        // Step 2: Education & Experience
        statusAkademik: formData.statusAkademik || '',
        namaUniversitas: formData.namaUniversitas || '',
        fakultas: formData.fakultas || '',
        jurusan: formData.jurusan || '',
        ipk: formData.ipk || '',
        tahunMasuk: formData.tahunMasuk || '',
        tahunLulus: formData.tahunLulus || '',
        transkripNilai: formData.transkripNilai || null,
        
        // High school data
        namaSMA: formData.namaSMA || '',
        jurusanSMA: formData.jurusanSMA || '',
        tahunLulusSMA: formData.tahunLulusSMA || '',
        jurusanSMKDetail: formData.jurusanSMKDetail || '',
        
        // S1 data (for S2/S3 students)
        namaUniversitasS1: formData.namaUniversitasS1 || '',
        jurusanS1: formData.jurusanS1 || '',
        
        // Alternative learning
        namaInstitusi: formData.namaInstitusi || '',
        bidangKeahlian: formData.bidangKeahlian || '',
        pengalamanBelajar: formData.pengalamanBelajar || '',
        
        // Experience & Skills
        pengalamanMengajar: formData.pengalamanMengajar || '',
        pengalamanLainnya: formData.pengalamanLainnya || '',
        keahlianSpesialisasi: formData.keahlianSpesialisasi || '',
        keahlianLainnya: formData.keahlianLainnya || '',
        prestasiAkademik: formData.prestasiAkademik || '',
        prestasiNonAkademik: formData.prestasiNonAkademik || '',
        sertifikasiPelatihan: formData.sertifikasiPelatihan || '',
        
        // Step 3: Subjects
        selectedPrograms: formData.selectedPrograms || [],
        mataPelajaranLainnya: formData.mataPelajaranLainnya || '',
        
        // Step 4: Availability & Location
        statusMenerimaSiswa: formData.statusMenerimaSiswa || '',
        hourly_rate: formData.hourly_rate || null,
        available_schedule: formData.available_schedule || [],
        teaching_methods: formData.teaching_methods || [],
        max_students: formData.max_students || null,
        transportation_method: formData.transportation_method || '',
        teaching_center_location: formData.teaching_center_location || '',
        radius_km: formData.radius_km || null,
        location_notes: formData.location_notes || '',
        coordinates: formData.coordinates || null,
        
        // Teaching preferences
        teaching_styles: formData.teaching_styles || [],
        student_level_preferences: formData.student_level_preferences || [],
        special_needs_capable: formData.special_needs_capable || false,
        group_class_willing: formData.group_class_willing || false,
        online_teaching_capable: formData.online_teaching_capable || false,
        tech_savviness: formData.tech_savviness || '',
        gmeet_experience: formData.gmeet_experience || '',
        presensi_update_capability: formData.presensi_update_capability || '',
        
        // Personality traits
        tutorPersonalityType: formData.tutorPersonalityType || [],
        communicationStyle: formData.communicationStyle || [],
        teachingPatienceLevel: formData.teachingPatienceLevel || '',
        studentMotivationAbility: formData.studentMotivationAbility || '',
        scheduleFlexibilityLevel: formData.scheduleFlexibilityLevel || '',
        
        // Emergency contact
        emergencyContactName: formData.emergencyContactName || '',
        emergencyContactRelationship: formData.emergencyContactRelationship || '',
        emergencyContactPhone: formData.emergencyContactPhone || '',
        
        // Step 5: Documents
        fotoProfil: formData.fotoProfil || null,
        dokumenIdentitas: formData.dokumenIdentitas || null,
        dokumenPendidikan: formData.dokumenPendidikan || null,
        dokumenSertifikat: formData.dokumenSertifikat || null,
        
        // System fields
        password: autoGeneratedPassword,
        user_status: 'active'
      };

      console.log('📦 [SUBMIT] Prepared edge form data:', edgeFormData);

      // Call Edge Function with migration support
      const edgeResult = await createTutorWithMigrationSupport(
        edgeFormData,
        session?.access_token
      );

      console.log('🔍 [SUBMIT] Edge function result:', edgeResult);

      if (!edgeResult.success) {
        throw new Error(edgeResult.error || 'Failed to create tutor via Edge Function');
      }

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

      // 🔧 FIXED: Map ALL fields from Edge Function response
      let newTutorUser = {
        id: edgeResult.data?.user_id,
        email: edgeResult.data?.email,
        user_code: edgeResult.data?.user_code,
        // 🔧 FIX: Add missing critical fields
        tutor_id: edgeResult.data?.tutor_id,  // ✅ REAL UUID
        trn: edgeResult.data?.trn,            // ✅ REAL TRN  
        password: edgeResult.data?.password,   // ✅ REAL PASSWORD
        name: edgeResult.data?.name
      };

      console.log('👤 [SUBMIT] New tutor user object:', newTutorUser);

      // Success notification with copyable data
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

      // Reset form after successful submission
      setFormData(defaultFormData);
      setCurrentStep(0);

    } catch (error: any) {
      console.error('❌ [SUBMIT] Error:', error);
      showError('Gagal Menyimpan Data', {
        message: error.message || 'Terjadi kesalahan saat menyimpan data tutor. Silakan coba lagi.',
        actions: [
          { 
            label: 'Tutup', 
            action: hideNotification,
            variant: 'outline' as const
          }
        ]
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Icon icon="ph:spinner" className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (status === 'unauthenticated' || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-8">
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
                    <div className="flex-shrink-0 relative">
                      {/* ✅ FIXED: Original step icon - SELALU TAMPIL */}
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
                      
                      {/* ✅ FIXED: Status indicator overlay - TAMBAHAN */}
                      {stepStatus === 'success' && (
                        <div className="absolute -top-1 -right-1">
                          <Icon 
                            icon="ph:check-circle-fill" 
                            className="h-4 w-4 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 rounded-full" 
                          />
                        </div>
                      )}
                      {stepStatus === 'warning' && (
                        <div className="absolute -top-1 -right-1">
                          <Icon 
                            icon="ph:warning-circle-fill" 
                            className="h-4 w-4 text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-900 rounded-full" 
                          />
                        </div>
                      )}
                      {stepStatus === 'active' && (
                        <div className="absolute -top-1 -right-1">
                          <Icon 
                            icon="ph:circle-fill" 
                            className="h-4 w-4 text-primary bg-white dark:bg-slate-900 rounded-full" 
                          />
                        </div>
                      )}
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
            <div className="flex justify-between items-center py-8">
              <Button
                onClick={handlePrev}
                disabled={currentStep === 0}
                variant="outline"
                size="lg"
              >
                <Icon icon="ph:arrow-left" className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <div className="flex space-x-4">
                {currentStep === totalSteps - 1 ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    size="lg"
                    className="min-w-32"
                  >
                    {isSubmitting ? (
                      <>
                        <Icon icon="ph:spinner" className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Icon icon="ph:check" className="h-4 w-4 mr-2" />
                        Save Tutor
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    size="lg"
                  >
                    Next
                    <Icon icon="ph:arrow-right" className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout (< lg) */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <div className="bg-card border-b border-border sticky top-0 z-40">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Icon icon="ph:user-plus" className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="font-bold text-default-900 text-lg">Entry Tutor</h1>
                  <p className="text-xs text-muted-foreground">Step {currentStep + 1} of {totalSteps}</p>
                </div>
              </div>
            </div>

            {/* Mobile Step Navigation */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {tutorFormConfig.steps.map((step, index) => {
                const stepStatus = getStepStatus(index, currentStep, formData, tutorFormConfig.steps);
                const canAccess = canAccessStep(index, currentStep, formData, tutorFormConfig.steps);
                
                return (
                  <button
                    key={step.id}
                    onClick={() => handleStepClick(index)}
                    disabled={!canAccess}
                    className={cn(
                      "flex-shrink-0 flex flex-col items-center space-y-1 p-3 rounded-lg transition-all duration-200 min-w-20",
                      {
                        "bg-primary text-primary-foreground": stepStatus === 'active',
                        "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300": stepStatus === 'success',
                        "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300": stepStatus === 'warning',
                        "bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400": stepStatus === 'pending',
                        "opacity-50 cursor-not-allowed": !canAccess,
                      }
                    )}
                  >
                    <div className="relative">
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
                      
                      {/* Mobile Status indicator overlay */}
                      {stepStatus === 'success' && (
                        <div className="absolute -top-1 -right-1">
                          <Icon 
                            icon="ph:check-circle-fill" 
                            className="h-3 w-3 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 rounded-full" 
                          />
                        </div>
                      )}
                      {stepStatus === 'warning' && (
                        <div className="absolute -top-1 -right-1">
                          <Icon 
                            icon="ph:warning-circle-fill" 
                            className="h-3 w-3 text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-900 rounded-full" 
                          />
                        </div>
                      )}
                      {stepStatus === 'active' && (
                        <div className="absolute -top-1 -right-1">
                          <Icon 
                            icon="ph:circle-fill" 
                            className="h-3 w-3 text-primary bg-white dark:bg-slate-900 rounded-full" 
                          />
                        </div>
                      )}
                    </div>
                    <div className="text-xs font-medium text-center leading-tight">
                      {step.title.split(' ').slice(0, 2).join(' ')}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Mobile Progress Bar */}
            <div className="mt-4">
              <Progress value={overallProgress} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Progress</span>
                <span>{Math.round(overallProgress)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Main Content */}
        <div className="p-4">
          {/* Mobile Current Step Header */}
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Icon icon={currentStepConfig.icon} className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-default-900">
                  {currentStepConfig.title}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {currentStepConfig.description}
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Form Fields */}
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
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-primary/20 py-4">
                      <CardTitle className="flex items-center space-x-3 text-base">
                        <div className="bg-primary/10 p-2 rounded-lg">
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
                            <div key={field.name}>
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

          {/* Mobile Navigation Buttons */}
          <div className="flex justify-between items-center py-6 sticky bottom-0 bg-background border-t border-border mt-8 -mx-4 px-4">
            <Button
              onClick={handlePrev}
              disabled={currentStep === 0}
              variant="outline"
            >
              <Icon icon="ph:arrow-left" className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentStep === totalSteps - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="min-w-28"
              >
                {isSubmitting ? (
                  <>
                    <Icon icon="ph:spinner" className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Icon icon="ph:check" className="h-4 w-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
                <Icon icon="ph:arrow-right" className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Notification Modal */}
      <NotificationModal />
    </div>
  );
}
