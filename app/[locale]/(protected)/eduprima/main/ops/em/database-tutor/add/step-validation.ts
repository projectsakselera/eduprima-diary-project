import { FormStep, TutorFormData } from './form-config';

// Step validation configuration
export const stepValidationRules = {
  'identity-basic': {
    required: ['namaLengkap', 'tanggalLahir', 'jenisKelamin', 'email', 'noHp1', 'provinsiDomisili', 'kotaKabupatenDomisili', 'alamatLengkapDomisili', 'namaNasabah', 'nomorRekening', 'namaBank'],
    description: 'Data pribadi, alamat, dan informasi perbankan'
  },
  'education-experience': {
    required: ['statusAkademik', 'namaUniversitasS1', 'fakultasS1', 'jurusanS1', 'tahunMasuk', 'ipk'],
    description: 'Latar belakang pendidikan, pengalaman, dan profil mengajar'
  },
  'subjects': {
    required: ['selectedPrograms'],
    description: 'Pilihan mata pelajaran yang dapat diajarkan'
  },
  'availability-location': {
    required: ['statusMenerimaSiswa', 'hourly_rate', 'available_schedule', 'teaching_methods'],
    description: 'Ketersediaan waktu dan jangkauan wilayah mengajar'
  },
  'documents': {
    required: ['fotoProfil', 'dokumenIdentitas', 'dokumenPendidikan'],
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

// Helper function to check if any field in step is empty (not just required fields)
const hasEmptyFields = (step: FormStep, formData: Partial<TutorFormData>): boolean => {
  // Get all visible fields in the step (excluding disabled/section dividers)
  const visibleFields = step.fields.filter(field => 
    field.type !== 'text' && 
    !field.disabled && 
    !field.className?.includes('section-divider')
  );
  
  // Check if any visible field is empty
  return visibleFields.some(field => {
    const value = formData[field.name as keyof TutorFormData];
    return isEmpty(value);
  });
};

export const getStepStatus = (stepIndex: number, currentStep: number, formData: Partial<TutorFormData>, steps: FormStep[]): StepStatus => {
  const step = steps[stepIndex];
  
  if (stepIndex === currentStep) {
    return 'active';
  }
  
  // For all non-active steps, check if they have any empty fields
  const hasEmpty = hasEmptyFields(step, formData);
  return hasEmpty ? 'warning' : 'success';
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
