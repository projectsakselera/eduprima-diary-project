import React from 'react'

export default function DeleteTutorPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Delete Tutor</h1>
        <p className="text-gray-600">Remove tutor from the database</p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">Are you sure?</h3>
          <p className="text-sm text-gray-500 mb-6">
            This action cannot be undone. This will permanently delete the tutor
            <strong className="text-gray-900"> John Doe</strong> from the database.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Tutor Information:</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Name:</strong> John Doe</p>
              <p><strong>Email:</strong> john.doe@example.com</p>
              <p><strong>Specialization:</strong> Mathematics</p>
              <p><strong>Experience:</strong> 5 years</p>
            </div>
          </div>
          
          <div className="flex justify-center gap-4">
            <button className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500">
              Yes, Delete Tutor
            </button>
            <button className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 