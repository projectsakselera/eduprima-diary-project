'use client'
import { Metadata } from "next";
import Link from "next/link";

export default function EMMainPage() {
  const divisions = [
    {
      id: 1,
      name: "EM Matchmaking",
      description: "Mengelola proses matchmaking antara tutor dan siswa",
      status: "active",
      totalMatches: 1247,
      pendingTasks: 44,
      successRate: 94,
      icon: "🔗",
      href: "/eduprima/main/ops/em/matchmaking",
    },
    {
      id: 2,
      name: "EM Class Management (CMS)",
      description: "Mengelola dan memantau aktivitas kelas, ruang, dan pembayaran",
      status: "active",
      totalClasses: 45,
      activeClasses: 38,
      attendanceRate: 92,
      icon: "🎓",
      href: "/eduprima/main/ops/em/cms",
    },
    {
      id: 3,
      name: "EM Engagement",
      description: "Mengelola rekrutmen, pengembangan, dan hubungan dengan tutor",
      status: "active",
      totalTutors: 247,
      activeRecruitments: 8,
      satisfactionRate: 92,
      icon: "❤️",
      href: "/eduprima/main/ops/em/engagement",
    },
  ]

  const recentActivities = [
    {
      id: 1,
      division: "Matchmaking",
      title: "Match baru berhasil dibuat untuk 5 siswa",
      description: "Proses matchmaking untuk program Matematika SMA",
      time: "30 menit yang lalu",
      status: "completed",
    },
    {
      id: 2,
      division: "CMS",
      title: "Kelas baru dimulai - Bahasa Inggris Kelas B",
      description: "12 siswa hadir dari 12 yang terdaftar",
      time: "1 jam yang lalu",
      status: "ongoing",
    },
    {
      id: 3,
      division: "Engagement",
      title: "Workshop tutor selesai dengan sukses",
      description: "25 tutor berpartisipasi dalam workshop pengembangan",
      time: "2 jam yang lalu",
      status: "completed",
    },
    {
      id: 4,
      division: "Matchmaking",
      title: "Follow up GT selesai untuk 15 siswa",
      description: "Proses follow up Guru Tutor berjalan lancar",
      time: "3 jam yang lalu",
      status: "completed",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Education Management (EM)</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Mengelola semua aspek pendidikan dari matchmaking hingga engagement
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
            View Reports
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            + New Activity
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Matches</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">1,247</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400 text-lg">🔗</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Classes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">38</p>
            </div>
            <div className="h-8 w-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <span className="text-green-600 dark:text-green-400 text-lg">🎓</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tutors</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">247</p>
            </div>
            <div className="h-8 w-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 dark:text-purple-400 text-lg">👨‍🏫</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overall Success Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">93%</p>
            </div>
            <div className="h-8 w-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <span className="text-orange-600 dark:text-orange-400 text-lg">📈</span>
            </div>
          </div>
        </div>
      </div>

      {/* EM Divisions */}
      <div className="rounded-lg border bg-card">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span>🏢</span>
            EM Divisions
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {divisions.map((division) => (
              <Link
                key={division.id}
                href={division.href}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer block"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <span className="text-blue-600 dark:text-blue-400 text-lg">{division.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {division.name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      division.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                    }`}>
                      {division.status}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {division.description}
                </p>
                <div className="space-y-2">
                  {division.id === 1 && (
                    <>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Total Matches:</span>
                        <span className="font-medium">{division.totalMatches}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Pending Tasks:</span>
                        <span className="font-medium">{division.pendingTasks}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Success Rate:</span>
                        <span className="font-medium">{division.successRate}%</span>
                      </div>
                    </>
                  )}
                  {division.id === 2 && (
                    <>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Total Classes:</span>
                        <span className="font-medium">{division.totalClasses}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Active Classes:</span>
                        <span className="font-medium">{division.activeClasses}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Attendance Rate:</span>
                        <span className="font-medium">{division.attendanceRate}%</span>
                      </div>
                    </>
                  )}
                  {division.id === 3 && (
                    <>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Total Tutors:</span>
                        <span className="font-medium">{division.totalTutors}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Active Recruitments:</span>
                        <span className="font-medium">{division.activeRecruitments}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Satisfaction Rate:</span>
                        <span className="font-medium">{division.satisfactionRate}%</span>
                      </div>
                    </>
                  )}
                                 </div>
               </Link>
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
                  activity.division === 'Matchmaking' 
                    ? 'bg-blue-100 dark:bg-blue-900' 
                    : activity.division === 'CMS'
                    ? 'bg-green-100 dark:bg-green-900'
                    : 'bg-purple-100 dark:bg-purple-900'
                }`}>
                  <span className={`text-lg ${
                    activity.division === 'Matchmaking' 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : activity.division === 'CMS'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-purple-600 dark:text-purple-400'
                  }`}>
                    {activity.division === 'Matchmaking' ? '🔗' : activity.division === 'CMS' ? '🎓' : '❤️'}
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