// 🎣 TUTOR CREATION HOOK - React Hook for Form Integration
// Provides state management and error handling for tutor creation
// Author: Security Migration Team  
// Date: January 2025

import { useState, useCallback } from 'react'
import { TutorService, type CreateTutorRequest, type CreateTutorResponse, TutorCreationError, TutorValidation } from '@/services/tutor.service'
import { useNotification } from '@/hooks/use-notification'

// =============================================================================
// 📝 HOOK TYPES
// =============================================================================

export interface UseTutorCreationState {
  // Loading states
  isCreating: boolean
  isValidating: boolean
  
  // Data state
  createdTutor: CreateTutorResponse['data'] | null
  
  // Error states
  error: string | null
  validationErrors: string[]
  
  // Progress tracking
  progress: number
  currentStep: string
}

export interface UseTutorCreationActions {
  createTutor: (formData: any) => Promise<CreateTutorResponse>
  validateFormData: (formData: any) => { valid: boolean; errors: string[] }
  clearError: () => void
  clearCreatedTutor: () => void
  resetState: () => void
}

export type UseTutorCreationReturn = UseTutorCreationState & UseTutorCreationActions

// =============================================================================
// 🎣 MAIN HOOK
// =============================================================================

export function useTutorCreation(): UseTutorCreationReturn {
  // State management
  const [state, setState] = useState<UseTutorCreationState>({
    isCreating: false,
    isValidating: false,
    createdTutor: null,
    error: null,
    validationErrors: [],
    progress: 0,
    currentStep: 'idle'
  })
  
  // Notification hook for user feedback
  const { showSuccess, showError } = useNotification()
  
  // =============================================================================
  // 🔄 MAIN CREATE FUNCTION
  // =============================================================================
  
  const createTutor = useCallback(async (formData: any): Promise<CreateTutorResponse> => {
    console.log('🔄 Starting tutor creation process...')
    
    // Reset state
    setState(prev => ({
      ...prev,
      isCreating: true,
      error: null,
      validationErrors: [],
      progress: 0,
      currentStep: 'validation'
    }))
    
    try {
      // Step 1: Transform form data
      setState(prev => ({ ...prev, progress: 10, currentStep: 'transforming_data' }))
      const tutorRequest = TutorService.transformFormDataToRequest(formData)
      
      // Step 2: Validate data
      setState(prev => ({ ...prev, progress: 20, currentStep: 'validating_data' }))
      const validation = TutorValidation.validateFormData(tutorRequest)
      
      if (!validation.valid) {
        setState(prev => ({
          ...prev,
          isCreating: false,
          validationErrors: validation.errors,
          error: 'Validation failed',
          currentStep: 'validation_failed'
        }))
        
        showError('Data tidak valid. Silakan periksa kembali.')
        throw new TutorCreationError('Validation failed', validation.errors)
      }
      
      // Step 3: Call Edge Function
      setState(prev => ({ ...prev, progress: 40, currentStep: 'calling_api' }))
      const result = await TutorService.createTutor(tutorRequest)
      
      // Step 4: Process success
      setState(prev => ({ 
        ...prev, 
        progress: 100,
        currentStep: 'completed',
        isCreating: false,
        createdTutor: result.data
      }))
      
      // Show success notification
      showSuccess(`Tutor berhasil dibuat! TRN: ${result.data.tutor_registration_number}`)
      
      console.log('✅ Tutor creation completed successfully:', {
        tutorId: result.data.tutor_id,
        trn: result.data.tutor_registration_number,
        email: result.data.email
      })
      
      return result
      
    } catch (error) {
      console.error('❌ Error in tutor creation:', error)
      
      let errorMessage = 'Terjadi kesalahan saat membuat tutor'
      let validationErrors: string[] = []
      
      if (error instanceof TutorCreationError) {
        errorMessage = error.message
        
        // Handle validation errors from Edge Function
        if (error.details?.details) {
          validationErrors = error.details.details.map((err: any) => 
            `${err.path?.join?.('.') || 'Field'}: ${err.message}`
          )
        }
      }
      
      setState(prev => ({
        ...prev,
        isCreating: false,
        error: errorMessage,
        validationErrors,
        currentStep: 'error',
        progress: 0
      }))
      
      // Show error notification
      showError(errorMessage)
      
      throw error
    }
  }, [showSuccess, showError])
  
  // =============================================================================
  // 🔍 VALIDATION FUNCTION
  // =============================================================================
  
  const validateFormData = useCallback((formData: any): { valid: boolean; errors: string[] } => {
    setState(prev => ({ ...prev, isValidating: true }))
    
    try {
      const tutorRequest = TutorService.transformFormDataToRequest(formData)
      const validation = TutorValidation.validateFormData(tutorRequest)
      
      setState(prev => ({
        ...prev,
        isValidating: false,
        validationErrors: validation.errors
      }))
      
      return validation
    } catch (error) {
      setState(prev => ({
        ...prev,
        isValidating: false,
        error: 'Validation error'
      }))
      
      return { valid: false, errors: ['Validation error occurred'] }
    }
  }, [])
  
  // =============================================================================
  // 🧹 UTILITY FUNCTIONS
  // =============================================================================
  
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
      validationErrors: []
    }))
  }, [])
  
  const clearCreatedTutor = useCallback(() => {
    setState(prev => ({
      ...prev,
      createdTutor: null
    }))
  }, [])
  
  const resetState = useCallback(() => {
    setState({
      isCreating: false,
      isValidating: false,
      createdTutor: null,
      error: null,
      validationErrors: [],
      progress: 0,
      currentStep: 'idle'
    })
  }, [])
  
  // =============================================================================
  // 🔄 RETURN HOOK INTERFACE
  // =============================================================================
  
  return {
    // State
    isCreating: state.isCreating,
    isValidating: state.isValidating,
    createdTutor: state.createdTutor,
    error: state.error,
    validationErrors: state.validationErrors,
    progress: state.progress,
    currentStep: state.currentStep,
    
    // Actions
    createTutor,
    validateFormData,
    clearError,
    clearCreatedTutor,
    resetState
  }
}

// =============================================================================
// 🎯 ADDITIONAL HOOKS FOR SPECIFIC NEEDS
// =============================================================================

/**
 * Hook for real-time form validation
 * Validates form as user types (debounced)
 */
export function useTutorValidation(formData: any, debounceMs: number = 500) {
  const [validationState, setValidationState] = useState({
    isValid: false,
    errors: [] as string[],
    isValidating: false
  })
  
  const validateForm = useCallback(() => {
    if (!formData) return
    
    setValidationState(prev => ({ ...prev, isValidating: true }))
    
    setTimeout(() => {
      try {
        const tutorRequest = TutorService.transformFormDataToRequest(formData)
        const validation = TutorValidation.validateFormData(tutorRequest)
        
        setValidationState({
          isValid: validation.valid,
          errors: validation.errors,
          isValidating: false
        })
      } catch (error) {
        setValidationState({
          isValid: false,
          errors: ['Validation error'],
          isValidating: false
        })
      }
    }, debounceMs)
  }, [formData, debounceMs])
  
  return {
    ...validationState,
    validateForm
  }
}

/**
 * Hook for tracking creation progress
 * Provides detailed progress information
 */
export function useTutorCreationProgress() {
  const [progressState, setProgressState] = useState({
    currentStep: 'idle' as string,
    progress: 0,
    steps: [
      { key: 'validation', label: 'Validasi Data', progress: 20 },
      { key: 'transforming_data', label: 'Memproses Data', progress: 30 },
      { key: 'calling_api', label: 'Membuat Tutor', progress: 70 },
      { key: 'completed', label: 'Selesai', progress: 100 }
    ]
  })
  
  const updateProgress = useCallback((step: string, progress: number) => {
    setProgressState(prev => ({
      ...prev,
      currentStep: step,
      progress
    }))
  }, [])
  
  const resetProgress = useCallback(() => {
    setProgressState(prev => ({
      ...prev,
      currentStep: 'idle',
      progress: 0
    }))
  }, [])
  
  return {
    ...progressState,
    updateProgress,
    resetProgress
  }
}
