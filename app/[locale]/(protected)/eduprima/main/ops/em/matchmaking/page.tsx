import { Metadata } from "next";

export const metadata: Metadata = {
  title: "EM Matchmaking - Eduprima Admin",
  description: "EM Matchmaking management for Eduprima Learning Management System",
};

export default function EMMatchmakingPage() {
  const units = [
    {
      id: 1,
      name: "Unit Penyiapan Data & Follow Up GT",
      description: "Menyiapkan data dan melakukan follow up untuk Guru Tutor",
      status: "active",
      pendingTasks: 12,
      completedToday: 45,
      icon: "📋",
    },
    {
      id: 2,
      name: "Unit Offering",
      description: "Mengelola offering privat dan open untuk siswa",
      status: "active",
      pendingTasks: 8,
      completedToday: 32,
      icon: "📊",
    },
    {
      id: 3,
      name: "Unit Ganti Tutor & Case Solving",
      description: "Menangani pergantian tutor dan penyelesaian kasus",
      status: "active",
      pendingTasks: 15,
      completedToday: 28,
      icon: "👥",
    },
    {
      id: 4,
      name: "EM Komunikasi",
      description: "Mengelola komunikasi tutor-tutor dan tutor-siswa",
      status: "active",
      pendingTasks: 6,
      completedToday: 67,
      icon: "💬",
    },
    {
      id: 5,
      name: "Unit Penyiapan PLP",
      description: "Menyiapkan Program Latihan Praktik",
      status: "active",
      pendingTasks: 3,
      completedToday: 18,
      icon: "📄",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">EM Matchmaking</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Mengelola proses matchmaking antara tutor dan siswa
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          + New Match
        </button>
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Tasks</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">44</p>
            </div>
            <div className="h-8 w-8 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
              <span className="text-yellow-600 dark:text-yellow-400 text-lg">⏳</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed Today</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">190</p>
            </div>
            <div className="h-8 w-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <span className="text-green-600 dark:text-green-400 text-lg">✅</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">94%</p>
            </div>
            <div className="h-8 w-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 dark:text-purple-400 text-lg">📈</span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Pending: {unit.pendingTasks}</span>
                  <span>Today: {unit.completedToday}</span>
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
            <div className="flex items-center gap-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Match berhasil dibuat untuk siswa Sarah Johnson dengan Tutor Ahmad
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">2 menit yang lalu</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Follow up GT selesai untuk 15 siswa
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">15 menit yang lalu</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Case solving untuk pergantian tutor Michael Chen
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">1 jam yang lalu</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Offering baru dibuat untuk program Matematika Dasar
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">2 jam yang lalu</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 