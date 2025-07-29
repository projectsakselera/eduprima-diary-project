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
import { 
  tutorFormConfig, 
  defaultFormData, 
  validateStep, 
  canProceedToNextStep, 
  getStepProgress,
  isFieldVisible,
  type TutorFormData 
} from './form-config';
import DynamicFormField from './form-field';
import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default function AddTutorPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<TutorFormData>>(defaultFormData);
  const [stepErrors, setStepErrors] = useState<Record<number, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attemptedNext, setAttemptedNext] = useState<Record<number, boolean>>({});
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const currentStepConfig = tutorFormConfig.steps[currentStep];
  const totalSteps = tutorFormConfig.steps.length;
  const progress = getStepProgress(currentStep, totalSteps);

  // Auto-validate completed steps - now always allows progress
  useEffect(() => {
    const newCompletedSteps = new Set<number>();
    tutorFormConfig.steps.forEach((step, index) => {
      // Mark all steps as accessible since validation is disabled
      newCompletedSteps.add(index);
    });
    setCompletedSteps(newCompletedSteps);
  }, [formData]);

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [fieldName]: value
      };
      
      // Handle address copy functionality
      if (fieldName === 'alamatSamaDenganKTP' && value === true) {
        // Copy domisili address to KTP address
        newData.alamatKTP = prev.alamatDomisili || '';
        newData.kelurahanKTP = prev.kelurahanDomisili || '';
        newData.kecamatanKTP = prev.kecamatanDomisili || '';
        newData.kotaKabupatenKTP = prev.kotaKabupatenDomisili || '';
        newData.provinsiKTP = prev.provinsiDomisili || '';
        newData.kodePosKTP = prev.kodePosDomisili || '';
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
    // No validation required - always return true
    return true;
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
      // Scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      router.push('/eduprima/main/ops/em/matchmaking/database-tutor');
    }
  };

  const handleStepClick = (stepIndex: number) => {
    // Allow navigation to any step freely
    setCurrentStep(stepIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Step 1: Test Supabase connection first
      console.log('Testing Supabase connection...');
      const testResult = await supabase
        ?.from('tutors')
        .select('count', { count: 'exact', head: true });
      const { data: testData, error: testError } = testResult || { data: null, error: null };
      
      if (testError) {
        console.error('Supabase connection test failed:', testError);
        throw new Error(`Database connection failed: ${testError.message}`);
      }
      
      console.log('Supabase connection successful');
      
      // Step 2: Prepare data for submission
      const submissionData = {
        // System & Status Information (Staff only)
        status_tutor: formData.status_tutor || 'pending',
        approval_level: formData.approval_level || 'junior',
        staff_notes: formData.staff_notes,

        // Personal Information
        trn: formData.trn || `EDU${Date.now().toString().slice(-7)}`, // Auto-generate if empty
        nama_lengkap: formData.namaLengkap,
        tanggal_lahir: formData.tanggalLahir,
        jenis_kelamin: formData.jenisKelamin,
        email: formData.email,
        no_hp_1: formData.noHp1,
        no_hp_2: formData.noHp2,
        
        // New Profile Identity Fields
        headline: formData.headline,
        deskripsi_diri: formData.deskripsiDiri,
        social_media_1: formData.socialMedia1,
        social_media_2: formData.socialMedia2,
        bahasa_yang_dikuasai: formData.bahasaYangDikuasai || [],
        
        // Address Information - Domisili
        alamat_domisili: formData.alamatDomisili,
        kelurahan_domisili: formData.kelurahanDomisili,
        kecamatan_domisili: formData.kecamatanDomisili,
        kota_kabupaten_domisili: formData.kotaKabupatenDomisili,
        provinsi_domisili: formData.provinsiDomisili,
        kode_pos_domisili: formData.kodePosDomisili,
        
        // Address Information - KTP/KK
        alamat_sama_dengan_ktp: formData.alamatSamaDenganKTP,
        alamat_ktp: formData.alamatKTP,
        kelurahan_ktp: formData.kelurahanKTP,
        kecamatan_ktp: formData.kecamatanKTP,
        kota_kabupaten_ktp: formData.kotaKabupatenKTP,
        provinsi_ktp: formData.provinsiKTP,
        kode_pos_ktp: formData.kodePosKTP,
        
        // Banking Information
        nama_nasabah: formData.namaNasabah,
        nomor_rekening: formData.nomorRekening,
        nama_bank: formData.namaBank,
        cabang_bank: formData.cabangBank,
        
        // Professional Information - Education History
        status_akademik: formData.statusAkademik,
        nama_universitas_s1: formData.namaUniversitasS1,
        fakultas_s1: formData.fakultasS1,
        jurusan_s1: formData.jurusanS1,
        nama_universitas: formData.namaUniversitas,
        fakultas: formData.fakultas,
        jurusan: formData.jurusan,
        akreditasi_jurusan: formData.akreditasiJurusan,
        ipk: formData.ipk,
        tahun_masuk: formData.tahunMasuk,
        tahun_lulus: formData.tahunLulus,
        transkrip_nilai: formData.transkripNilai,
        nama_sma: formData.namaSMA,
        jurusan_sma: formData.jurusanSMA,
        jurusan_smk_detail: formData.jurusanSMKDetail,
        tahun_lulus_sma: formData.tahunLulusSMA,
        ijazah_sma: formData.ijazahSMA,
        
        // Alternative Learning Background
        nama_institusi: formData.namaInstitusi,
        bidang_keahlian: formData.bidangKeahlian,
        pengalaman_belajar: formData.pengalamanBelajar,
        sertifikat_keahlian: formData.sertifikatKeahlian,
        
        // Professional Profile & Experience
        motivasi_menjadi_tutor: formData.motivasiMenjadiTutor,
        keahlian_spesialisasi: formData.keahlianSpesialisasi,
        keahlian_lainnya: formData.keahlianLainnya,
        
        // Teaching Experience - Simplified
        pengalaman_mengajar_detail: formData.pengalamanMengajar,
        pengalaman_lain_relevan: formData.pengalamanLainRelevan,
        
        // Achievements & Credentials - Simplified
        prestasi_akademik: formData.prestasiAkademik,
        prestasi_non_akademik: formData.prestasiNonAkademik,
        sertifikasi_pelatihan: formData.sertifikasiPelatihan,
        
        // Teaching Configuration
        sertifikasi: formData.sertifikasi,
        tarif_per_jam: formData.tariffPerJam || 0,
        metode_pengajaran: formData.metodePengajaran || [],
        jadwal_tersedia: formData.jadwalTersedia || [],
        
        // Profile Information (legacy)
        motivasi: formData.motivasi,
        
        // Subject Information - Mata Pelajaran per Kategori
        mata_pelajaran_sd: formData.mataPelajaran_SD_Kelas_1_6_ || [],
        mata_pelajaran_smp: formData.mataPelajaran_SMP_Kelas_7_9_ || [],
        mata_pelajaran_sma_ipa: formData.mataPelajaran_SMA_SMK_IPA || [],
        mata_pelajaran_sma_ips: formData.mataPelajaran_SMA_SMK_IPS || [],
        mata_pelajaran_smk_teknik: formData.mataPelajaran_SMK_Teknik_Teknologi || [],
        mata_pelajaran_smk_bisnis: formData.mataPelajaran_SMK_Bisnis_Manajemen || [],
        mata_pelajaran_smk_pariwisata: formData.mataPelajaran_SMK_Pariwisata_Perhotelan || [],
        mata_pelajaran_smk_kesehatan: formData.mataPelajaran_SMK_Kesehatan || [],
        mata_pelajaran_bahasa_asing: formData.mataPelajaran_Bahasa_Asing || [],
        mata_pelajaran_universitas: formData.mataPelajaran_Universitas_Perguruan_Tinggi || [],
        mata_pelajaran_keterampilan: formData.mataPelajaran_Keterampilan_Khusus || [],
        
        // Teaching Area Information
        wilayah_kota: (formData as any).wilayahKota,
        wilayah_kecamatan: (formData as any).wilayahKecamatan || [],
        radius_mengajar: formData.radiusMengajar,
        catatan_lokasi: formData.catatan_lokasi,
        
        // Location Coordinates (Dispatch Point)
        titik_lokasi_lat: formData.titikLokasiLat,
        titik_lokasi_lng: formData.titikLokasiLng,
        alamat_titik_lokasi: formData.alamatTitikLokasi,
        
        // Document Verification (Staff only)
        status_verifikasi_identitas: formData.status_verifikasi_identitas || 'pending',
        status_verifikasi_pendidikan: formData.status_verifikasi_pendidikan || 'pending',
        
        // System Settings (Staff only)
        tanggal_bergabung: formData.tanggal_bergabung || new Date().toISOString().split('T')[0],
        
        // Timestamps
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Log geocoordinates specifically for debugging
      console.log('Geocoordinates being submitted:', {
        titik_lokasi_lat: formData.titikLokasiLat,
        titik_lokasi_lng: formData.titikLokasiLng,
        alamat_titik_lokasi: formData.alamatTitikLokasi
      });
      
      console.log('Form data being submitted:', JSON.stringify(submissionData, null, 2));
      
      // Step 3: Insert data to Supabase
      console.log('Attempting database insert...');
      const insertResult = await supabase
        ?.from('tutors')
        .insert([submissionData])
        .select();
      const { data, error } = insertResult || { data: null, error: null };

      if (error) {
        console.error('Supabase insert error:', {
          message: error.message || 'No error message',
          details: error.details || 'No error details',
          hint: error.hint || 'No error hint', 
          code: error.code || 'No error code',
          fullError: error
        });
        
        // Provide specific error messages
        if (error.code === 'PGRST116') {
          throw new Error('Tabel tutors tidak ditemukan. Jalankan SQL setup script terlebih dahulu.');
        } else if (error.code === '42P01') {
          throw new Error('Tabel tutors belum dibuat. Jalankan supabase-setup-tutors.sql di Supabase SQL Editor.');
        } else if (error.code === '42501') {
          throw new Error('Tidak ada permission untuk mengakses tabel. Periksa RLS policies.');
        } else if (error.message?.includes('duplicate key')) {
          throw new Error('Data duplikat: TRN atau email sudah terdaftar.');
        } else {
          throw new Error(`Database error: ${error.message || 'Unknown error'}`);
        }
      }

      console.log('Tutor data inserted successfully:', data);

      // Step 4: Handle file uploads (skip if no files)
      const uploadPromises = [];
      
      if (formData.fotoProfil && typeof formData.fotoProfil !== 'string') {
        const fileExt = formData.fotoProfil.name.split('.').pop();
        const fileName = `${submissionData.trn}/foto-profil.${fileExt}`;
        
        uploadPromises.push(
          supabase?.storage
            .from('tutor-documents')
            .upload(fileName, formData.fotoProfil, {
              cacheControl: '3600',
              upsert: true
            })
        );
      }
      
      if (formData.dokumenIdentitas && typeof formData.dokumenIdentitas !== 'string') {
        const fileExt = formData.dokumenIdentitas.name.split('.').pop();
        const fileName = `${submissionData.trn}/identitas.${fileExt}`;
        
        uploadPromises.push(
          supabase?.storage
            .from('tutor-documents')
            .upload(fileName, formData.dokumenIdentitas, {
              cacheControl: '3600',
              upsert: true
            })
        );
      }
      
      if (formData.dokumenPendidikan && typeof formData.dokumenPendidikan !== 'string') {
        const fileExt = formData.dokumenPendidikan.name.split('.').pop();
        const fileName = `${submissionData.trn}/pendidikan.${fileExt}`;
        
        uploadPromises.push(
          supabase?.storage
            .from('tutor-documents')
            .upload(fileName, formData.dokumenPendidikan, {
              cacheControl: '3600',
              upsert: true
            })
        );
      }
      
      if (formData.dokumenSertifikat && typeof formData.dokumenSertifikat !== 'string') {
        const fileExt = formData.dokumenSertifikat.name.split('.').pop();
        const fileName = `${submissionData.trn}/sertifikat.${fileExt}`;
        
        uploadPromises.push(
          supabase?.storage
            .from('tutor-documents')
            .upload(fileName, formData.dokumenSertifikat, {
              cacheControl: '3600',
              upsert: true
            })
        );
      }

      // Wait for all file uploads to complete
      if (uploadPromises.length > 0) {
        console.log('Uploading documents...');
        try {
          const uploadResults = await Promise.all(uploadPromises);
          console.log('Document upload results:', uploadResults);
        } catch (uploadError) {
          console.warn('File upload failed but data was saved:', uploadError);
        }
      }

      // Step 5: Generate password if needed
      let generatedPassword = '';
      if (formData.generate_password) {
        generatedPassword = Math.random().toString(36).slice(-8);
        console.log('Generated password for tutor:', generatedPassword);
        
        // TODO: Hash password and save to auth table
        // TODO: Send welcome email with credentials
      }

      // Step 6: Send notifications if enabled
      if (formData.send_welcome_email) {
        console.log('TODO: Send welcome email to:', formData.email);
        // TODO: Implement email sending
      }
      
      if (formData.send_whatsapp_notification) {
        console.log('TODO: Send WhatsApp notification to:', formData.noHp1);
        // TODO: Implement WhatsApp notification
      }

      // Show success message
      alert(`✅ Data tutor berhasil disimpan!\nTRN: ${submissionData.trn}`);
      
      // Navigate back to list page
      router.push('/eduprima/main/ops/em/matchmaking/database-tutor');
      
    } catch (error) {
      console.error('Error submitting form:', error);
      
      // Show user-friendly error message
      let errorMessage = '❌ Gagal menyimpan data.\n\n';
      if (error instanceof Error) {
        errorMessage += `Detail: ${error.message}`;
      } else {
        errorMessage += 'Error tidak diketahui. Periksa console untuk detail.';
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/eduprima/main/ops/em/matchmaking/database-tutor');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background" suppressHydrationWarning>
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
                const isActive = index === currentStep;
                const isPast = index < currentStep;
                
                return (
                  <button
                    key={step.id}
                    onClick={() => handleStepClick(index)}
                    className={cn(
                      "w-full flex items-center space-x-4 p-4 rounded-xl transition-all duration-200 text-left",
                      {
                        "bg-primary text-primary-foreground shadow-lg": isActive,
                        "bg-success/10 text-success hover:bg-success/20": isPast && !isActive,
                        "hover:bg-muted text-muted-foreground hover:text-default-900": !isActive && !isPast,
                      }
                    )}
                  >
                    <div className="flex-shrink-0">
                      <Icon 
                        icon={isPast ? "ph:check-circle-fill" : step.icon} 
                        className={cn(
                          "h-6 w-6",
                          {
                            "text-primary-foreground": isActive,
                            "text-success": isPast && !isActive,
                            "text-muted-foreground": !isActive && !isPast,
                          }
                        )} 
                      />
                    </div>
                    <div className="flex-1">
                      <div className={cn(
                        "font-semibold",
                        {
                          "text-primary-foreground": isActive,
                          "text-success": isPast && !isActive,
                          "text-muted-foreground": !isActive && !isPast,
                        }
                      )}>
                        {step.title}
                      </div>
                      <div className={cn(
                        "text-sm mt-1",
                        {
                          "text-primary-foreground/80": isActive,
                          "text-success/80": isPast && !isActive,
                          "text-muted-foreground/70": !isActive && !isPast,
                        }
                      )}>
                        {step.description}
                      </div>
                    </div>
                    {isActive && (
                      <div className="w-3 h-3 bg-primary-foreground rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Desktop Progress Summary */}
            <div className="mt-8 p-4 bg-muted/50 rounded-xl">
              <div className="text-xs text-muted-foreground mb-2">Progress</div>
              <div className="text-sm font-medium text-default-900 mb-3">
                Step {currentStep + 1} / {totalSteps}
              </div>
              <Progress value={progress} className="h-3" />
              <div className="text-xs text-muted-foreground mt-2 text-center">
                {Math.round(progress)}% Complete
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
                                  field.type === 'textarea' || field.type === 'checkbox' || field.type === 'ai-core-select' || field.type === 'ai-recommendations' || field.type === 'category-program-selector' || (field.disabled && field.className === 'info-text') ? 'lg:col-span-2 xl:col-span-3' : ''
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
                const isActive = index === currentStep;
                const isPast = index < currentStep;
                
                return (
                  <button
                    key={step.id}
                    onClick={() => handleStepClick(index)}
                    className={cn(
                      "flex-shrink-0 flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      {
                        "bg-primary text-primary-foreground shadow-sm": isActive,
                        "bg-success/10 text-success": isPast && !isActive,
                        "bg-muted/50 text-muted-foreground hover:bg-muted": !isActive && !isPast,
                      }
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold border flex-shrink-0",
                      {
                        "bg-primary-foreground text-primary border-primary-foreground": isActive,
                        "bg-success text-success-foreground border-success": isPast && !isActive,
                        "border-muted-foreground/30": !isActive && !isPast,
                      }
                    )}>
                      {isPast ? <Icon icon="ph:check" className="h-3 w-3" /> : index + 1}
                    </div>
                    <span className="truncate max-w-[80px]">{step.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile Progress */}
          <div className="px-4 pb-3">
            <Progress value={progress} className="h-2" />
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
    </div>
  );
}