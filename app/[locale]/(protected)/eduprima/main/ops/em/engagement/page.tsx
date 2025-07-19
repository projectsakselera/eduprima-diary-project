import { Metadata } from "next";

export const metadata: Metadata = {
  title: "EM Engagement - Eduprima Admin",
  description: "EM Engagement management for Eduprima Learning Management System",
};

export default function EMEngagementPage() {
  const units = [
    {
      id: 1,
      name: "Recruitment Unit",
      description: "Mengelola rekrutmen dan seleksi tutor baru",
      status: "active",
      activeRecruitments: 8,
      totalApplications: 45,
      successRate: 78,
      icon: "👥",
    },
    {
      id: 2,
      name: "Development Unit",
      description: "Mengembangkan kompetensi dan skill tutor",
      status: "active",
      activePrograms: 12,
      participants: 156,
      completionRate: 85,
      icon: "🎓",
    },
    {
      id: 3,
      name: "Relations Unit",
      description: "Mengelola hubungan dengan tutor dan stakeholder",
      status: "active",
      activeRelations: 24,
      satisfactionRate: 92,
      responseTime: "2.3h",
      icon: "🤝",
    },
  ]

  const recentActivities = [
    {
      id: 1,
      type: "recruitment",
      title: "Interview selesai untuk 5 kandidat tutor Matematika",
      description: "Proses seleksi tahap kedua untuk posisi tutor Matematika SMA",
      time: "2 jam yang lalu",
      status: "completed",
    },
    {
      id: 2,
      type: "development",
      title: "Workshop 'Effective Teaching Methods' selesai",
      description: "25 tutor berpartisipasi dalam workshop pengembangan metode mengajar",
      time: "1 hari yang lalu",
      status: "completed",
    },
    {
      id: 3,
      type: "relations",
      title: "Monthly feedback session dengan tutor senior",
      description: "Sesi feedback bulanan untuk 15 tutor senior berjalan lancar",
      time: "2 hari yang lalu",
      status: "completed",
    },
    {
      id: 4,
      type: "recruitment",
      title: "Job posting baru untuk tutor Bahasa Inggris",
      description: "Lowongan tutor Bahasa Inggris untuk program intensif",
      time: "3 hari yang lalu",
      status: "active",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">EM Engagement</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Mengelola rekrutmen, pengembangan, dan hubungan dengan tutor
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
            New Recruitment
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Schedule Workshop
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tutors</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">247</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400 text-lg">👨‍🏫</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Recruitments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">8</p>
            </div>
            <div className="h-8 w-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <span className="text-green-600 dark:text-green-400 text-lg">📋</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Development Programs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
            </div>
            <div className="h-8 w-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 dark:text-purple-400 text-lg">📚</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Satisfaction Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">92%</p>
            </div>
            <div className="h-8 w-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <span className="text-orange-600 dark:text-orange-400 text-lg">⭐</span>
            </div>
          </div>
        </div>
      </div>

      {/* Units Overview */}
      <div className="rounded-lg border bg-card">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span>🏢</span>
            Units Overview
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {units.map((unit) => (
              <div
                key={unit.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <span className="text-blue-600 dark:text-blue-400 text-lg">{unit.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {unit.name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      unit.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                    }`}>
                      {unit.status}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {unit.description}
                </p>
                <div className="space-y-2">
                  {unit.id === 1 && (
                    <>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Active Recruitments:</span>
                        <span className="font-medium">{unit.activeRecruitments}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Total Applications:</span>
                        <span className="font-medium">{unit.totalApplications}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Success Rate:</span>
                        <span className="font-medium">{unit.successRate}%</span>
                      </div>
                    </>
                  )}
                  {unit.id === 2 && (
                    <>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Active Programs:</span>
                        <span className="font-medium">{unit.activePrograms}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Participants:</span>
                        <span className="font-medium">{unit.participants}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Completion Rate:</span>
                        <span className="font-medium">{unit.completionRate}%</span>
                      </div>
                    </>
                  )}
                  {unit.id === 3 && (
                    <>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Active Relations:</span>
                        <span className="font-medium">{unit.activeRelations}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Satisfaction Rate:</span>
                        <span className="font-medium">{unit.satisfactionRate}%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Avg Response Time:</span>
                        <span className="font-medium">{unit.responseTime}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="rounded-lg border bg-card">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span>📋</span>
            Recent Activities
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className={`p-2 rounded-lg ${
                  activity.type === 'recruitment' 
                    ? 'bg-blue-100 dark:bg-blue-900' 
                    : activity.type === 'development'
                    ? 'bg-purple-100 dark:bg-purple-900'
                    : 'bg-green-100 dark:bg-green-900'
                }`}>
                  <span className={`text-lg ${
                    activity.type === 'recruitment' 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : activity.type === 'development'
                      ? 'text-purple-600 dark:text-purple-400'
                      : 'text-green-600 dark:text-green-400'
                  }`}>
                    {activity.type === 'recruitment' ? '👥' : activity.type === 'development' ? '🎓' : '🤝'}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {activity.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {activity.time}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  activity.status === 'completed' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                }`}>
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 