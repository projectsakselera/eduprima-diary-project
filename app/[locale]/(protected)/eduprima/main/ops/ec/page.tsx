import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Education Consulting - Eduprima Admin",
  description: "Education consulting services for Eduprima Learning Management System",
};

export default function EducationConsultingPage() {
  const consultations = [
    {
      id: 1,
      client: "ABC Corporation",
      type: "Corporate Training",
      status: "in-progress",
      duration: "3 months",
      value: "$25,000",
      consultant: "Dr. Sarah Johnson",
    },
    {
      id: 2,
      client: "XYZ University",
      type: "Curriculum Development",
      status: "completed",
      duration: "6 months",
      value: "$45,000",
      consultant: "Prof. Michael Chen",
    },
    {
      id: 3,
      client: "TechStart Inc.",
      type: "Skills Assessment",
      status: "scheduled",
      duration: "2 months",
      value: "$15,000",
      consultant: "Dr. Emily Rodriguez",
    },
  ]

  const trainingPrograms = [
    {
      id: 1,
      name: "Leadership Development",
      category: "Management",
      participants: 24,
      status: "active",
      nextSession: "2024-02-15",
    },
    {
      id: 2,
      name: "Digital Skills Workshop",
      category: "Technology",
      participants: 18,
      status: "active",
      nextSession: "2024-02-20",
    },
    {
      id: 3,
      name: "Communication Excellence",
      category: "Soft Skills",
      participants: 32,
      status: "planning",
      nextSession: "2024-03-01",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Education Consulting</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Professional consulting services and training programs
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
            New Consultation
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Schedule Training
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Consultations</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400 text-lg">💼</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">$850K</p>
            </div>
            <div className="h-8 w-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <span className="text-green-600 dark:text-green-400 text-lg">💰</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Training Programs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">8</p>
            </div>
            <div className="h-8 w-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 dark:text-purple-400 text-lg">🎓</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Satisfaction Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">98%</p>
            </div>
            <div className="h-8 w-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <span className="text-orange-600 dark:text-orange-400 text-lg">⭐</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Consultations */}
      <div className="rounded-lg border bg-card">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span>💼</span>
            Active Consultations
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {consultations.map((consultation) => (
              <div
                key={consultation.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <span className="text-blue-600 dark:text-blue-400 text-lg">🏢</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {consultation.client}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {consultation.type} • {consultation.consultant}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Duration: {consultation.duration}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Value: {consultation.value}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    consultation.status === 'completed' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : consultation.status === 'in-progress'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                  }`}>
                    {consultation.status}
                  </span>
                  <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Training Programs */}
      <div className="rounded-lg border bg-card">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span>🎓</span>
            Training Programs
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {trainingPrograms.map((program) => (
              <div
                key={program.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <span className="text-purple-600 dark:text-purple-400 text-lg">📚</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {program.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {program.category}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Participants: {program.participants}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Next: {program.nextSession}
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
                    Manage
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