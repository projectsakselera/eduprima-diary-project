export interface EducatorTestFormData {
  // From users_universal
  email: string;
  phone: string;
  
  // From t_310_01_02_user_profiles
  first_name: string;
  last_name: string;
  city: string;
}

export interface FormField {
  name: keyof EducatorTestFormData;
  label: string;
  type: 'text' | 'email' | 'tel';
  placeholder: string;
  required: boolean;
  description: string;
  table: 'users_universal' | 'user_profiles';
}

export const educatorFormConfig: FormField[] = [
  {
    name: 'email',
    label: 'Email Educator',
    type: 'email',
    placeholder: 'educator@example.com',
    required: true,
    description: 'Email unik untuk login dan komunikasi (will be stored in users_universal table)',
    table: 'users_universal'
  },
  {
    name: 'first_name',
    label: 'Nama Depan',
    type: 'text',
    placeholder: 'John',
    required: true,
    description: 'Nama depan educator (will be stored in user_profiles table)',
    table: 'user_profiles'
  },
  {
    name: 'last_name',
    label: 'Nama Belakang', 
    type: 'text',
    placeholder: 'Doe',
    required: true,
    description: 'Nama belakang educator (will be stored in user_profiles table)',
    table: 'user_profiles'
  },
  {
    name: 'phone',
    label: 'No. Telepon',
    type: 'tel',
    placeholder: '+62 812-3456-7890',
    required: true,
    description: 'Nomor telepon educator (will be stored in users_universal table)',
    table: 'users_universal'
  },
  {
    name: 'city',
    label: 'Kota',
    type: 'text',
    placeholder: 'Jakarta',
    required: true,
    description: 'Kota tempat tinggal educator (will be stored in user_profiles table)',
    table: 'user_profiles'
  }
];

// Default form data
export const defaultFormData: EducatorTestFormData = {
  email: '',
  phone: '',
  first_name: '',
  last_name: '',
  city: ''
};

// Validation helper
export const validateField = (field: FormField, value: string): string | null => {
  if (field.required && !value.trim()) {
    return `${field.label} wajib diisi`;
  }
  
  if (field.type === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Format email tidak valid';
    }
  }
  
  if (field.type === 'tel' && value) {
    const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/;
    if (!phoneRegex.test(value.replace(/[-\s]/g, ''))) {
      return 'Format nomor telepon tidak valid';
    }
  }
  
  return null;
};

// Generate random user code for testing
export const generateUserCode = (): string => {
  const prefix = 'EDU';
  const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `${prefix}${randomNum}`;
}; 