import { FormStep, TutorFormData } from './form-config';

// Step validation configuration - Updated to match actual form structure
export const stepValidationRules = {
  'identity-basic': {
    required: ['namaLengkap', 'tanggalLahir', 'jenisKelamin', 'email', 'noHp1', 'provinsiDomisili', 'kotaKabupatenDomisili', 'alamatLengkapDomisili', 'namaNasabah', 'nomorRekening', 'namaBank'],
    description: 'Data pribadi, alamat, dan informasi perbankan'
  },
  'education-experience': {
    // ✅ FIXED: Only core required fields that are always required
    required: ['statusAkademik', 'pengalamanMengajar'],
    // Additional conditional required fields are handled by conditional logic in hasEmptyFields
    conditionalRequired: {
      // For university/college students and graduates
      university: ['namaUniversitas', 'jurusan', 'ipk', 'tahunMasuk', 'transkripNilai', 'namaSMA', 'jurusanSMA', 'tahunLulusSMA'],
      // Additional for S2/S3
      s2_s3: ['namaUniversitasS1', 'jurusanS1'],
      // For SMK graduates
      smk: ['jurusanSMKDetail'],
      // For 'lainnya' category
      alternative: ['namaInstitusi', 'bidangKeahlian', 'pengalamanBelajar']
    },
    description: 'Latar belakang pendidikan, pengalaman, dan profil mengajar'
  },
  'subjects-areas': {
    required: ['selectedPrograms'],
    description: 'Pilihan mata pelajaran yang dapat diajarkan'
  },
  'availability-location': {
    required: ['statusMenerimaSiswa', 'available_schedule', 'teaching_methods', 'emergencyContactName', 'emergencyContactRelationship', 'emergencyContactPhone'],
    description: 'Ketersediaan waktu dan jangkauan wilayah mengajar'
  },
  'documents': {
    required: [], // Semua dokumen bersifat opsional dalam mode staff entry
    // dokumenIdentitas, dokumenPendidikan, dokumenSertifikat are all optional in staff entry mode
    description: 'Dokumen pendukung dan verifikasi'
  }
};

// Step status types
export type StepStatus = 'pending' | 'warning' | 'success' | 'active';

// Helper function to check if a value is empty
const isEmpty = (value: any): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'number') return isNaN(value);
  if (value instanceof File) return false; // Files are considered valid if they exist
  return false;
};

// Validation functions
export const validateStep = (step: FormStep, formData: Partial<TutorFormData>): string[] => {
  const stepRules = stepValidationRules[step.id as keyof typeof stepValidationRules];
  if (!stepRules) return [];
  
  const errors: string[] = [];
  
  stepRules.required.forEach(fieldName => {
    const value = formData[fieldName as keyof TutorFormData];
    
    // Check if field is empty or invalid
    if (isEmpty(value)) {
      const field = step.fields.find(f => f.name === fieldName && f.type !== 'text' && !f.disabled);
      if (field) {
        const fieldLabel = field.label || fieldName;
        errors.push(`${fieldLabel} wajib diisi`);
      }
    }
  });
  
  return errors;
};

export const canProceedToNextStep = (step: FormStep, formData: Partial<TutorFormData>): boolean => {
  const errors = validateStep(step, formData);
  return errors.length === 0;
};

// Helper function to check if any REQUIRED field in step is empty (with conditional logic)
const hasEmptyFields = (step: FormStep, formData: Partial<TutorFormData>): boolean => {
  // Get step validation rules for required fields
  const stepRules = stepValidationRules[step.id as keyof typeof stepValidationRules];
  if (!stepRules) {
    // If no validation rules, fall back to checking all visible fields
    const visibleFields = step.fields.filter(field => 
      field.type !== 'text' && 
      !field.disabled && 
      !field.className?.includes('section-divider')
    );
    
    return visibleFields.some(field => {
      // Check conditional logic - if field is not visible, don't count as empty
      if (field.conditional && !field.conditional(formData)) {
        return false;
      }
      
      const value = formData[field.name as keyof TutorFormData];
      return isEmpty(value);
    });
  }
  
  // 🎯 STEP 1: Check core required fields
  const coreEmptyFields = stepRules.required.filter(fieldName => {
    // Find the field definition to check conditional logic
    const fieldDef = step.fields.find(f => f.name === fieldName);
    
    // If field has conditional logic and condition is not met, field is not required right now
    if (fieldDef?.conditional && !fieldDef.conditional(formData)) {
      return false; // Field not currently visible, so not empty
    }
    
    // Check if the required field is empty
    const value = formData[fieldName as keyof TutorFormData];
    return isEmpty(value);
  });
  
  // 🎯 STEP 2: Check conditional required fields for education-experience step
  let conditionalEmptyFields: string[] = [];
  
  if (step.id === 'education-experience' && 'conditionalRequired' in stepRules) {
    const conditionalRules = (stepRules as any).conditionalRequired;
    const statusAkademik = formData.statusAkademik;
    
    // Determine which conditional fields are required based on statusAkademik
    let requiredConditionalFields: string[] = [];
    
    if (['mahasiswa_s1', 'mahasiswa_s2', 'lulusan_s1', 'lulusan_s2', 'lulusan_d3'].includes(statusAkademik || '')) {
      // University/college fields
      requiredConditionalFields = [...conditionalRules.university];
      
      // Add S2/S3 specific fields
      if (['mahasiswa_s2', 'lulusan_s2'].includes(statusAkademik || '')) {
        requiredConditionalFields = [...requiredConditionalFields, ...conditionalRules.s2_s3];
      }
    } else if (statusAkademik === 'lainnya') {
      // Alternative learning fields
      requiredConditionalFields = [...conditionalRules.alternative];
    }
    
    // Add SMK specific field if applicable
    if (formData.jurusanSMA === 'SMK') {
      requiredConditionalFields = [...requiredConditionalFields, ...conditionalRules.smk];
    }
    
    // Check conditional required fields
    conditionalEmptyFields = requiredConditionalFields.filter(fieldName => {
      // Find the field definition to check conditional logic
      const fieldDef = step.fields.find(f => f.name === fieldName);
      
      // If field has conditional logic and condition is not met, field is not required right now
      if (fieldDef?.conditional && !fieldDef.conditional(formData)) {
        return false; // Field not currently visible, so not empty
      }
      
      // Check if the conditional required field is empty
      const value = formData[fieldName as keyof TutorFormData];
      return isEmpty(value);
    });
  }
  
  // 🎯 STEP 3: Special handling for documents step
  // In staff entry mode, documents are optional but step status should reflect progress
  if (step.id === 'documents') {
    // Check if any documents have been uploaded
    const hasAnyDocuments = formData.dokumenIdentitas || formData.dokumenPendidikan || formData.dokumenSertifikat;
    
    // If no documents uploaded yet, step should be 'pending' (not 'success')
    // This prevents the step from showing green when user hasn't started uploading
    if (!hasAnyDocuments) {
      return true; // Has empty fields - step is pending
    }
    
    // If at least one document is uploaded, step is considered complete
    return false; // No empty fields - step is complete
  }
  
  // Return true if any core or conditional required field is empty
  return coreEmptyFields.length > 0 || conditionalEmptyFields.length > 0;
};

export const getStepStatus = (stepIndex: number, currentStep: number, formData: Partial<TutorFormData>, steps: FormStep[]): StepStatus => {
  const step = steps[stepIndex];
  
  if (stepIndex === currentStep) {
    return 'active';
  }
  
  // 🔍 DEBUG: Comprehensive step analysis
  const stepRules = stepValidationRules[step.id as keyof typeof stepValidationRules];
  
  // Get all fields in step
  const allFields = step.fields.filter(field => 
    field.type !== 'text' && 
    !field.disabled && 
    !field.className?.includes('section-divider')
  );
  
  // Get visible fields (considering conditional logic)
  const visibleFields = allFields.filter(field => {
    if (!field.conditional) return true;
    return field.conditional(formData);
  });
  
  // Get required fields that are currently visible
  const visibleRequiredFields = stepRules?.required.filter(fieldName => {
    const fieldDef = step.fields.find(f => f.name === fieldName);
    if (!fieldDef?.conditional) return true;
    return fieldDef.conditional(formData);
  }) || [];
  
  // Get empty fields among visible required fields
  const emptyRequiredFields = visibleRequiredFields.filter(fieldName => {
    const value = formData[fieldName as keyof TutorFormData];
    return isEmpty(value);
  });
  
  // Get empty fields among all visible fields
  const emptyVisibleFields = visibleFields.filter(field => {
    const value = formData[field.name as keyof TutorFormData];
    return isEmpty(value);
  });
  
  // 🔍 DEBUG: Log detailed analysis for education-experience step
  if (step.id === 'education-experience') {
    console.log(`🔍 [DEBUG] Step "${step.title}" detailed analysis:`, {
      stepId: step.id,
      statusAkademik: formData.statusAkademik,
      totalFields: allFields.length,
      visibleFields: visibleFields.length,
      visibleRequiredFields: visibleRequiredFields.length,
      emptyRequiredFields: emptyRequiredFields.length,
      emptyVisibleFields: emptyVisibleFields.length,
      requiredFieldsList: stepRules?.required || [],
      visibleRequiredFieldsList: visibleRequiredFields,
      emptyRequiredFieldsList: emptyRequiredFields,
      emptyVisibleFieldsList: emptyVisibleFields.map(f => f.name),
      sampleFieldValues: {
        statusAkademik: formData.statusAkademik,
        namaUniversitas: formData.namaUniversitas ? 'Filled' : 'Empty',
        fakultas: formData.fakultas ? 'Filled' : 'Empty',
        jurusan: formData.jurusan ? 'Filled' : 'Empty',
        ipk: formData.ipk ? 'Filled' : 'Empty',
        pengalamanMengajar: formData.pengalamanMengajar ? 'Filled' : 'Empty',
        keahlianSpesialisasi: formData.keahlianSpesialisasi ? 'Filled' : 'Empty'
      }
    });
  }
  
  // For all non-active steps, check if they have any empty REQUIRED fields
  const hasEmpty = hasEmptyFields(step, formData);
  const stepStatus = hasEmpty ? 'warning' : 'success';
  
  // 🔍 DEBUG: Log final status for education-experience and documents
  if (step.id === 'education-experience') {
    console.log(`🔍 [DEBUG] Step "${step.title}" final status:`, {
      hasEmptyRequiredFields: hasEmpty,
      finalStatus: stepStatus,
      reason: hasEmpty ? 'Has empty required fields' : 'All required fields filled'
    });
  }
  
  if (step.id === 'documents') {
    const hasAnyDocuments = formData.dokumenIdentitas || formData.dokumenPendidikan || formData.dokumenSertifikat;
    console.log(`🔍 [DEBUG] Step "${step.title}" final status:`, {
      hasEmptyRequiredFields: hasEmpty,
      finalStatus: stepStatus,
      hasAnyDocuments: hasAnyDocuments,
      reason: hasEmpty ? 'No documents uploaded yet - pending' : 'At least one document uploaded - success',
      documentFields: {
        dokumenIdentitas: formData.dokumenIdentitas ? 'Uploaded' : 'Not uploaded',
        dokumenPendidikan: formData.dokumenPendidikan ? 'Uploaded' : 'Not uploaded',
        dokumenSertifikat: formData.dokumenSertifikat ? 'Uploaded' : 'Not uploaded'
      }
    });
  }
  
  return stepStatus;
};

export const canAccessStep = (stepIndex: number, currentStep: number, formData: Partial<TutorFormData>, steps: FormStep[]): boolean => {
  // Allow free navigation - user can access any step at any time
  return true;
};

export const getStepProgress = (currentStep: number, totalSteps: number): number => {
  return ((currentStep + 1) / totalSteps) * 100;
};

export const getOverallProgress = (formData: Partial<TutorFormData>, steps: FormStep[]): number => {
  let totalFields = 0;
  let completedFields = 0;
  
  steps.forEach((step) => {
    const stepTotalFields = getAllFieldsCount(step);
    const stepCompletedFields = getCompletedAllFieldsCount(step, formData);
    
    totalFields += stepTotalFields;
    completedFields += stepCompletedFields;
  });
  
  if (totalFields === 0) return 0;
  return (completedFields / totalFields) * 100;
};

// Keep the old logic for step-based completion (for required fields only)
export const getRequiredFieldsProgress = (formData: Partial<TutorFormData>, steps: FormStep[]): number => {
  let completedSteps = 0;
  
  steps.forEach((step, index) => {
    const errors = validateStep(step, formData);
    if (errors.length === 0) {
      completedSteps++;
    }
  });
  
  return (completedSteps / steps.length) * 100;
};

export const getRequiredFieldsCount = (step: FormStep): number => {
  const stepRules = stepValidationRules[step.id as keyof typeof stepValidationRules];
  return stepRules?.required.length || 0;
};

export const getCompletedFieldsCount = (step: FormStep, formData: Partial<TutorFormData>): number => {
  const stepRules = stepValidationRules[step.id as keyof typeof stepValidationRules];
  if (!stepRules) return 0;
  
  let completed = 0;
  stepRules.required.forEach(fieldName => {
    const value = formData[fieldName as keyof TutorFormData];
    if (!isEmpty(value)) {
      completed++;
    }
  });
  
  return completed;
};

// New functions for counting all fields (not just required)
export const getAllFieldsCount = (step: FormStep): number => {
  return step.fields.filter(field => 
    field.type !== 'text' && 
    !field.disabled && 
    !field.className?.includes('section-divider')
  ).length;
};

export const getCompletedAllFieldsCount = (step: FormStep, formData: Partial<TutorFormData>): number => {
  const visibleFields = step.fields.filter(field => 
    field.type !== 'text' && 
    !field.disabled && 
    !field.className?.includes('section-divider')
  );
  
  let completed = 0;
  visibleFields.forEach(field => {
    const value = formData[field.name as keyof TutorFormData];
    if (!isEmpty(value)) {
      completed++;
    }
  });
  
  return completed;
};

export const getEmptyFieldsCount = (step: FormStep, formData: Partial<TutorFormData>): number => {
  const totalFields = getAllFieldsCount(step);
  const completedFields = getCompletedAllFieldsCount(step, formData);
  return totalFields - completedFields;
};

export const isStepCompleted = (step: FormStep, formData: Partial<TutorFormData>): boolean => {
  return validateStep(step, formData).length === 0;
};
