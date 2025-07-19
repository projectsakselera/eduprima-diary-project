import React from 'react'

export default function ViewTutorPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">View Tutor Details</h1>
        <p className="text-gray-600">Tutor information and profile</p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500">Full Name</label>
                <p className="text-sm text-gray-900">John Doe</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Email</label>
                <p className="text-sm text-gray-900">john.doe@example.com</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Phone Number</label>
                <p className="text-sm text-gray-900">+6281234567890</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Address</label>
                <p className="text-sm text-gray-900">Jl. Sudirman No. 123, Jakarta Pusat</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500">Specialization</label>
                <p className="text-sm text-gray-900">Mathematics</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Experience</label>
                <p className="text-sm text-gray-900">5 years</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Hourly Rate</label>
                <p className="text-sm text-gray-900">IDR 150,000</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Status</label>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-500">Education Background</label>
              <p className="text-sm text-gray-900">Bachelor&apos;s Degree in Mathematics from University of Indonesia</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Teaching Experience</label>
              <p className="text-sm text-gray-900">5 years of experience teaching high school mathematics, specializing in calculus and algebra</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Certifications</label>
              <p className="text-sm text-gray-900">Certified Mathematics Teacher, Teaching License</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex gap-4">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              Edit Tutor
            </button>
            <button className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500">
              Delete Tutor
            </button>
            <button className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500">
              Back to List
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 