import { Metadata } from "next";

export const metadata: Metadata = {
  title: "EM Class Management (CMS) - Eduprima Admin",
  description: "EM Class Management System for Eduprima Learning Management System",
};

export default function EMCMSPage() {
  const monitoringItems = [
    {
      id: 1,
      name: "Monitoring Kelas & Presensi Tutor",
      description: "Memantau kehadiran tutor dan aktivitas kelas",
      status: "active",
      totalClasses: 45,
      activeClasses: 38,
      attendanceRate: 92,
      icon: "👁️",
    },
    {
      id: 2,
      name: "Monitoring Ruang Kelas Edufio x ILC",
      description: "Memantau ketersediaan dan penggunaan ruang kelas",
      status: "active",
      totalRooms: 12,
      occupiedRooms: 8,
      utilizationRate: 67,
      icon: "🏢",
    },
    {
      id: 3,
      name: "Monitoring Pembayaran/Tagihan",
      description: "Memantau status pembayaran dan tagihan siswa",
      status: "active",
      totalInvoices: 156,
      paidInvoices: 142,
      paymentRate: 91,
      icon: "💰",
    },
  ]

  const recentClasses = [
    {
      id: 1,
      className: "Matematika Dasar - Kelas A",
      tutor: "Ahmad Suryadi",
      students: 15,
      status: "ongoing",
      time: "09:00 - 10:30",
      attendance: "14/15",
    },
    {
      id: 2,
      className: "Bahasa Inggris - Kelas B",
      tutor: "Sarah Johnson",
      students: 12,
      status: "completed",
      time: "08:00 - 09:30",
      attendance: "12/12",
    },
    {
      id: 3,
      className: "Fisika Lanjutan - Kelas C",
      tutor: "Michael Chen",
      students: 18,
      status: "scheduled",
      time: "10:30 - 12:00",
      attendance: "0/18",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">EM Class Management (CMS)</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Mengelola dan memantau aktivitas kelas, ruang, dan pembayaran
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          + New Class
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Classes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">45</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400 text-lg">📚</span>
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
              <span className="text-green-600 dark:text-green-400 text-lg">✅</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Attendance Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">92%</p>
            </div>
            <div className="h-8 w-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 dark:text-purple-400 text-lg">📊</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Payment Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">91%</p>
            </div>
            <div className="h-8 w-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <span className="text-orange-600 dark:text-orange-400 text-lg">💳</span>
            </div>
          </div>
        </div>
      </div>

      {/* Monitoring Overview */}
      <div className="rounded-lg border bg-card">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span>📊</span>
            Monitoring Overview
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {monitoringItems.map((item) => (
              <div
                key={item.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <span className="text-blue-600 dark:text-blue-400 text-lg">{item.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {item.name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {item.description}
                </p>
                <div className="space-y-2">
                  {item.id === 1 && (
                    <>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Total Classes:</span>
                        <span className="font-medium">{item.totalClasses}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Active:</span>
                        <span className="font-medium">{item.activeClasses}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Attendance Rate:</span>
                        <span className="font-medium">{item.attendanceRate}%</span>
                      </div>
                    </>
                  )}
                  {item.id === 2 && (
                    <>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Total Rooms:</span>
                        <span className="font-medium">{item.totalRooms}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Occupied:</span>
                        <span className="font-medium">{item.occupiedRooms}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Utilization:</span>
                        <span className="font-medium">{item.utilizationRate}%</span>
                      </div>
                    </>
                  )}
                  {item.id === 3 && (
                    <>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Total Invoices:</span>
                        <span className="font-medium">{item.totalInvoices}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Paid:</span>
                        <span className="font-medium">{item.paidInvoices}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Payment Rate:</span>
                        <span className="font-medium">{item.paymentRate}%</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Classes */}
      <div className="rounded-lg border bg-card">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span>📚</span>
            Recent Classes
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentClasses.map((classItem) => (
              <div
                key={classItem.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <span className="text-blue-600 dark:text-blue-400 text-lg">🎓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {classItem.className}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {classItem.tutor} • {classItem.students} students
                    </p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ⏰ {classItem.time}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        👥 {classItem.attendance}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    classItem.status === 'ongoing' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : classItem.status === 'completed'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                  }`}>
                    {classItem.status}
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
    </div>
  )
} 