// Tutor Status Utilities - Consistent status management across the application

export type TutorStatus = 
  | 'registration' 
  | 'learning_materials' 
  | 'examination' 
  | 'exam_verification'
  | 'data_completion' 
  | 'waiting_students' 
  | 'active' 
  | 'inactive' 
  | 'suspended'
  | 'blacklisted' 
  | 'on_trial' 
  | 'additional_screening' 
  | 'pending' 
  | 'verified' 
  | 'unknown';

// All tutor status options - synchronized between add and view-all pages
export const TUTOR_STATUS_OPTIONS: TutorStatus[] = [
  // Recruitment Flow Stages
  'registration',
  'learning_materials', 
  'examination',
  'exam_verification',
  'data_completion',
  'waiting_students',
  
  // Active Status
  'active',
  
  // Management Status  
  'inactive',
  'suspended',
  'blacklisted',
  
  // Special Status
  'on_trial',
  'additional_screening',
  
  // Legacy statuses for compatibility
  'pending',
  'verified', 
  'unknown'
];

// Status labels with emojis for form display
export const TUTOR_STATUS_LABELS: Record<TutorStatus, string> = {
  // Recruitment Flow Stages
  'registration': '📝 Registrasi - Upload berkas & data',
  'learning_materials': '📚 Belajar Materi & SOP',
  'examination': '📋 Ujian Tutor Online',
  'exam_verification': '🔍 Verifikasi Hasil Ujian',
  'data_completion': '📄 Melengkapi Data Tutor',
  'waiting_students': '⏳ Menunggu Siswa Pertama',
  
  // Active Status
  'active': '✅ Aktif - Mengajar',
  
  // Management Status  
  'inactive': '⏸️ Tidak Aktif',
  'suspended': '🚫 Ditangguhkan',
  'blacklisted': '❌ Blacklist',
  
  // Special Status
  'on_trial': '🧪 Masa Percobaan',
  'additional_screening': '🔬 Additional Screening',
  
  // Legacy statuses for compatibility
  'pending': '⏳ Pending',
  'verified': '✅ Verified',
  'unknown': '❓ Unknown'
};

// Status colors for badges and UI display
export const TUTOR_STATUS_COLORS: Record<TutorStatus, { backgroundColor: string; color: string; text: string }> = {
  // Recruitment Flow Stages (Blue tones)
  'registration': {
    backgroundColor: '#3b82f6', // blue-500
    color: '#ffffff',
    text: 'REGISTRATION'
  },
  'learning_materials': {
    backgroundColor: '#6366f1', // indigo-500
    color: '#ffffff',
    text: 'LEARNING'
  },
  'examination': {
    backgroundColor: '#8b5cf6', // violet-500
    color: '#ffffff',
    text: 'EXAM'
  },
  'exam_verification': {
    backgroundColor: '#a855f7', // purple-500
    color: '#ffffff',
    text: 'VERIFYING'
  },
  'data_completion': {
    backgroundColor: '#0ea5e9', // sky-500
    color: '#ffffff',
    text: 'COMPLETING'
  },
  'waiting_students': {
    backgroundColor: '#06b6d4', // cyan-500
    color: '#ffffff',
    text: 'WAITING'
  },
  
  // Active Status (Green)
  'active': {
    backgroundColor: '#10b981', // green-500
    color: '#ffffff',
    text: 'ACTIVE'
  },
  
  // Management Status (Gray/Red)
  'inactive': {
    backgroundColor: '#6b7280', // gray-500
    color: '#ffffff',
    text: 'INACTIVE'
  },
  'suspended': {
    backgroundColor: '#ef4444', // red-500
    color: '#ffffff',
    text: 'SUSPENDED'
  },
  'blacklisted': {
    backgroundColor: '#991b1b', // red-800
    color: '#ffffff',
    text: 'BLACKLISTED'
  },
  
  // Special Status (Yellow/Orange)
  'on_trial': {
    backgroundColor: '#f59e0b', // amber-500
    color: '#ffffff',
    text: 'TRIAL'
  },
  'additional_screening': {
    backgroundColor: '#d97706', // amber-600
    color: '#ffffff',
    text: 'SCREENING'
  },
  
  // Legacy statuses for compatibility
  'pending': {
    backgroundColor: '#f59e0b', // amber-500
    color: '#ffffff',
    text: 'PENDING'
  },
  'verified': {
    backgroundColor: '#059669', // emerald-600
    color: '#ffffff',
    text: 'VERIFIED'
  },
  'unknown': {
    backgroundColor: '#9ca3af', // gray-400
    color: '#ffffff',
    text: 'UNKNOWN'
  }
};

// Get status style for a given status
export function getStatusStyle(status: string) {
  const statusLower = status?.toLowerCase() as TutorStatus;
  return TUTOR_STATUS_COLORS[statusLower] || TUTOR_STATUS_COLORS.unknown;
}

// Get status label for form display
export function getStatusLabel(status: string): string {
  const statusLower = status?.toLowerCase() as TutorStatus;
  return TUTOR_STATUS_LABELS[statusLower] || TUTOR_STATUS_LABELS.unknown;
}

// Check if status is in recruitment flow
export function isRecruitmentStatus(status: string): boolean {
  const recruitmentStatuses: TutorStatus[] = [
    'registration',
    'learning_materials',
    'examination',
    'exam_verification',
    'data_completion',
    'waiting_students'
  ];
  return recruitmentStatuses.includes(status?.toLowerCase() as TutorStatus);
}

// Check if status is active
export function isActiveStatus(status: string): boolean {
  return status?.toLowerCase() === 'active';
}

// Check if status is inactive/problematic
export function isInactiveStatus(status: string): boolean {
  const inactiveStatuses: TutorStatus[] = ['inactive', 'suspended', 'blacklisted'];
  return inactiveStatuses.includes(status?.toLowerCase() as TutorStatus);
}
