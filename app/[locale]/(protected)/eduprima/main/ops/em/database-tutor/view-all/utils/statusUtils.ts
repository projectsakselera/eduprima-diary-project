/**
 * Status utility functions for tutor management
 * Handles styling and formatting for different status types
 */

export interface StatusStyle {
  backgroundColor: string;
  color: string;
  text: string;
}

/**
 * Get status color and style for tutor status
 */
export const getStatusStyle = (status: string): StatusStyle => {
  const statusLower = status?.toLowerCase() || '';
  
  switch (statusLower) {
    // Recruitment Flow Stages (Blue tones)
    case 'registration':
      return {
        backgroundColor: '#3b82f6', // blue-500
        color: '#ffffff',
        text: 'REGISTRATION'
      };
    case 'learning_materials':
      return {
        backgroundColor: '#6366f1', // indigo-500
        color: '#ffffff',
        text: 'LEARNING'
      };
    case 'examination':
      return {
        backgroundColor: '#8b5cf6', // violet-500
        color: '#ffffff',
        text: 'EXAM'
      };
    case 'exam_verification':
      return {
        backgroundColor: '#a855f7', // purple-500
        color: '#ffffff',
        text: 'VERIFYING'
      };
    case 'data_completion':
      return {
        backgroundColor: '#0ea5e9', // sky-500
        color: '#ffffff',
        text: 'COMPLETING'
      };
    case 'waiting_students':
      return {
        backgroundColor: '#06b6d4', // cyan-500
        color: '#ffffff',
        text: 'WAITING'
      };
    
    // Active Status (Green)
    case 'active':
      return {
        backgroundColor: '#10b981', // green-500
        color: '#ffffff',
        text: 'ACTIVE'
      };
    
    // Management Status (Gray/Red)
    case 'inactive':
      return {
        backgroundColor: '#6b7280', // gray-500
        color: '#ffffff',
        text: 'INACTIVE'
      };
    case 'suspended':
      return {
        backgroundColor: '#ef4444', // red-500
        color: '#ffffff',
        text: 'SUSPENDED'
      };
    case 'blacklisted':
      return {
        backgroundColor: '#991b1b', // red-800
        color: '#ffffff',
        text: 'BLACKLISTED'
      };
    
    // Special Status (Yellow/Orange)
    case 'on_trial':
      return {
        backgroundColor: '#f59e0b', // amber-500
        color: '#ffffff',
        text: 'TRIAL'
      };
    case 'additional_screening':
      return {
        backgroundColor: '#d97706', // amber-600
        color: '#ffffff',
        text: 'SCREENING'
      };
    
    // Legacy statuses for compatibility
    case 'pending':
      return {
        backgroundColor: '#f59e0b', // amber-500
        color: '#ffffff',
        text: 'PENDING'
      };
    case 'verified':
      return {
        backgroundColor: '#059669', // emerald-600
        color: '#ffffff',
        text: 'VERIFIED'
      };
    case 'unknown':
      return {
        backgroundColor: '#9ca3af', // gray-400
        color: '#ffffff',
        text: 'UNKNOWN'
      };
    default:
      return {
        backgroundColor: '#9ca3af', // gray-400
        color: '#ffffff',
        text: status?.toUpperCase() || 'UNKNOWN'
      };
  }
};

/**
 * Get availability status color and style for status menerima siswa
 */
export const getAvailabilityStatusStyle = (status: string): StatusStyle => {
  const statusLower = status?.toLowerCase() || '';
  
  switch (statusLower) {
    case 'available':
      return {
        backgroundColor: '#10b981', // green-500
        color: '#ffffff',
        text: 'AVAILABLE'
      };
    case 'limited':
      return {
        backgroundColor: '#f59e0b', // amber-500
        color: '#ffffff',
        text: 'LIMITED'
      };
    case 'unavailable':
      return {
        backgroundColor: '#ef4444', // red-500
        color: '#ffffff',
        text: 'UNAVAILABLE'
      };
    case 'leave':
      return {
        backgroundColor: '#6b7280', // gray-500
        color: '#ffffff',
        text: 'LEAVE'
      };
    default:
      return {
        backgroundColor: '#9ca3af', // gray-400
        color: '#ffffff',
        text: status?.toUpperCase() || 'UNKNOWN'
      };
  }
};