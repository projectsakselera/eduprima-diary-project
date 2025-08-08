'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface TutorInfo {
  id: string
  email: string
  full_name: string
  tutor_registration_number?: string
  status_tutor?: string
}

interface DeletePreview {
  table_name: string
  records_affected: number
  data_type: string
}

export default function DeleteTutorPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const userId = searchParams.get('id')
  
  const [tutorInfo, setTutorInfo] = useState<TutorInfo | null>(null)
  const [deletePreview, setDeletePreview] = useState<DeletePreview[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setError('User ID tidak ditemukan dalam URL')
      setIsLoading(false)
      return
    }

    loadDeletePreview()
  }, [userId])

  const loadDeletePreview = async () => {
    if (!userId) return

    setIsLoading(true)
    setError(null)

    try {
      console.log('🔍 Loading delete preview for user:', userId)
      
      const response = await fetch(`/api/tutors/delete-preview/${userId}`)
      const data = await response.json()

      console.log('📊 Delete preview response:', data)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Tutor tidak ditemukan')
        }
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      if (data.success && data.preview) {
        setDeletePreview(data.preview)
        
        // Extract tutor info from preview data
        const usersRecord = data.preview.find((p: DeletePreview) => p.table_name === 'users_universal')
        if (usersRecord && usersRecord.records_affected > 0) {
          // Get detailed tutor info
          await loadTutorDetails()
        } else {
          throw new Error('Tutor tidak ditemukan dalam database')
        }
      } else {
        throw new Error(data.error || 'Gagal memuat preview deletion')
      }
    } catch (err: any) {
      console.error('❌ Error loading delete preview:', err)
      setError(err.message)
      toast.error(`Gagal memuat preview: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const loadTutorDetails = async () => {
    if (!userId) return

    try {
      // Get tutor details from users_universal and user_profiles
      const response = await fetch(`/api/tutors/search?user_id=${userId}`)
      const data = await response.json()

      if (data.success && data.tutors && data.tutors.length > 0) {
        const tutor = data.tutors[0]
        setTutorInfo({
          id: userId,
          email: tutor.email || 'Email tidak tersedia',
          full_name: tutor.full_name || 'Nama tidak tersedia',
          tutor_registration_number: tutor.tutor_registration_number || '-',
          status_tutor: tutor.status_tutor || 'Unknown'
        })
      } else {
        setTutorInfo({
          id: userId,
          email: 'Email tidak tersedia',
          full_name: 'Nama tidak tersedia',
          tutor_registration_number: '-',
          status_tutor: 'Unknown'
        })
      }
    } catch (err) {
      console.warn('⚠️ Could not load tutor details:', err)
      setTutorInfo({
        id: userId,
        email: 'Email tidak tersedia',
        full_name: 'Nama tidak tersedia',
        tutor_registration_number: '-',
        status_tutor: 'Unknown'
      })
    }
  }

  const handleDelete = async () => {
    if (!userId || !tutorInfo) return

    setIsDeleting(true)

    try {
      console.log('🗑️ Starting delete process for user:', userId)
      
      const response = await fetch(`/api/tutors/delete/${userId}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      console.log('🗑️ Delete response:', data)

      if (!response.ok) {
        throw new Error(data.details || data.error || `HTTP ${response.status}`)
      }

      if (data.success) {
        toast.success(`✅ Tutor ${tutorInfo.full_name} berhasil dihapus dari database`)
        
        // Redirect back to tutor list after 2 seconds
        setTimeout(() => {
          router.push('/en/eduprima/main/ops/em/database-tutor/view-all')
        }, 2000)
      } else {
        throw new Error(data.error || 'Delete operation failed')
      }

    } catch (err: any) {
      console.error('❌ Error during delete:', err)
      toast.error(`Gagal menghapus tutor: ${err.message}`)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Delete Tutor</h1>
          <p className="text-gray-600">Loading...</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Menganalisis data yang akan terhapus...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Delete Tutor</h1>
          <p className="text-red-600">Error: {error}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Terjadi Kesalahan</h3>
            <p className="text-sm text-gray-500 mb-6">{error}</p>
            
            <button 
              onClick={handleCancel}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Kembali
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Konfirmasi Hapus Tutor</h1>
        <p className="text-gray-600">Hapus tutor dari database secara permanen</p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">Apakah Anda yakin?</h3>
          <p className="text-sm text-gray-500 mb-6">
            Tindakan ini tidak dapat dibatalkan. Ini akan menghapus permanen tutor
            <strong className="text-gray-900"> {tutorInfo?.full_name}</strong> dari database.
          </p>
          
          {/* Tutor Information */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Informasi Tutor:</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Nama:</strong> {tutorInfo?.full_name}</p>
              <p><strong>Email:</strong> {tutorInfo?.email}</p>
              <p><strong>TRN:</strong> {tutorInfo?.tutor_registration_number}</p>
              <p><strong>Status:</strong> {tutorInfo?.status_tutor}</p>
            </div>
          </div>

          {/* CASCADE Impact Preview */}
          {deletePreview.length > 0 && (
            <div className="bg-yellow-50 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium text-yellow-900 mb-2">Data yang akan terhapus (CASCADE):</h4>
              <div className="text-sm text-yellow-800 space-y-1 max-h-48 overflow-y-auto">
                {deletePreview
                  .filter(item => item.records_affected > 0)
                  .map((item, index) => (
                    <p key={index}>
                      <strong>• {item.table_name}:</strong> {item.records_affected} record(s) - {item.data_type}
                    </p>
                  ))}
              </div>
            </div>
          )}
          
          <div className="flex justify-center gap-4">
            <button 
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? 'Menghapus...' : 'Ya, Hapus Tutor'}
            </button>
            <button 
              onClick={handleCancel}
              disabled={isDeleting}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 