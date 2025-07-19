import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Program - Eduprima Admin",
  description: "Program management for Eduprima Learning Management System",
};

export default function ProgramPage() {
  const programs = [
    {
      id: 1,
      name: "English for Beginners",
      description: "Basic English course for beginners",
      duration: "3 months",
      students: 45,
      status: "active",
    },
    {
      id: 2,
      name: "Advanced Mathematics",
      description: "Advanced level mathematics course",
      duration: "6 months",
      students: 32,
      status: "active",
    },
    {
      id: 3,
      name: "Business Communication",
      description: "Professional business communication skills",
      duration: "4 months",
      students: 28,
      status: "draft",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Program Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage educational programs and curriculum
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <span>+</span>
          Add New Program
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Programs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400 text-lg">📚</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Programs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">8</p>
            </div>
            <div className="h-8 w-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <span className="text-green-600 dark:text-green-400 text-lg">✅</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">1,245</p>
            </div>
            <div className="h-8 w-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 dark:text-purple-400 text-lg">👥</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Duration</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">4.2 mo</p>
            </div>
            <div className="h-8 w-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <span className="text-orange-600 dark:text-orange-400 text-lg">⏱️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Programs List */}
      <div className="rounded-lg border bg-card">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span>📚</span>
            Current Programs
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {programs.map((program) => (
              <div
                key={program.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <span className="text-blue-600 dark:text-blue-400 text-lg">📖</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {program.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {program.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ⏱️ {program.duration}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        👥 {program.students} students
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    program.status === 'active' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                  }`}>
                    {program.status}
                  </span>
                  <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 