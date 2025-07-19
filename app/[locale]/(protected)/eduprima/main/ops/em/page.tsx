'use client'
import { Metadata } from "next";
import Link from "next/link";
import { useParams } from "next/navigation";
import { StatCard } from "@/components/ui/stat-card";
import { DivisionCard } from "@/components/ui/division-card";
import { ActivityCard } from "@/components/ui/activity-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function EMMainPage() {
  const params = useParams();
  const locale = params?.locale as string || 'en';

  const divisions = [
    {
      id: 1,
      name: "EM Matchmaking",
      description: "Mengelola proses matchmaking antara tutor dan siswa",
      status: "active" as const,
      totalMatches: 1247,
      pendingTasks: 44,
      successRate: 94,
      icon: "🔗",
      href: `/${locale}/eduprima/main/ops/em/matchmaking`,
    },
    {
      id: 2,
      name: "EM Class Management (CMS)",
      description: "Mengelola dan memantau aktivitas kelas, ruang, dan pembayaran",
      status: "active" as const,
      totalClasses: 45,
      activeClasses: 38,
      attendanceRate: 92,
      icon: "🎓",
      href: `/${locale}/eduprima/main/ops/em/cms`,
    },
    {
      id: 3,
      name: "EM Engagement",
      description: "Mengelola rekrutmen, pengembangan, dan hubungan dengan tutor",
      status: "active" as const,
      totalTutors: 247,
      activeRecruitments: 8,
      satisfactionRate: 92,
      icon: "❤️",
      href: `/${locale}/eduprima/main/ops/em/engagement`,
    },
  ]

  const recentActivities = [
    {
      id: 1,
      division: "Matchmaking",
      title: "Match baru berhasil dibuat untuk 5 siswa",
      description: "Proses matchmaking untuk program Matematika SMA",
      time: "30 menit yang lalu",
      status: "completed" as const,
    },
    {
      id: 2,
      division: "CMS",
      title: "Kelas baru dimulai - Bahasa Inggris Kelas B",
      description: "12 siswa hadir dari 12 yang terdaftar",
      time: "1 jam yang lalu",
      status: "ongoing" as const,
    },
    {
      id: 3,
      division: "Engagement",
      title: "Workshop tutor selesai dengan sukses",
      description: "25 tutor berpartisipasi dalam workshop pengembangan",
      time: "2 jam yang lalu",
      status: "completed" as const,
    },
    {
      id: 4,
      division: "Matchmaking",
      title: "Follow up GT selesai untuk 15 siswa",
      description: "Proses follow up Guru Tutor berjalan lancar",
      time: "3 jam yang lalu",
      status: "completed" as const,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Education Management (EM)</h1>
          <p className="text-muted-foreground mt-2">
            Mengelola semua aspek pendidikan dari matchmaking hingga engagement
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            View Reports
          </Button>
          <Button>
            + New Activity
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Matches"
          value="1,247"
          icon={<span className="text-lg">🔗</span>}
        />
        <StatCard
          title="Active Classes"
          value="38"
          icon={<span className="text-lg">🎓</span>}
        />
        <StatCard
          title="Total Tutors"
          value="247"
          icon={<span className="text-lg">👨‍🏫</span>}
        />
        <StatCard
          title="Overall Success Rate"
          value="93%"
          icon={<span className="text-lg">📈</span>}
        />
      </div>

      {/* EM Divisions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🏢</span>
            EM Divisions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {divisions.map((division) => (
              <DivisionCard
                key={division.id}
                id={division.id}
                name={division.name}
                description={division.description}
                status={division.status}
                icon={<span>{division.icon}</span>}
                href={division.href}
                                 stats={
                   division.id === 1 ? [
                     { label: "Total Matches", value: division.totalMatches || 0 },
                     { label: "Pending Tasks", value: division.pendingTasks || 0 },
                     { label: "Success Rate", value: `${division.successRate || 0}%` }
                   ] : division.id === 2 ? [
                     { label: "Total Classes", value: division.totalClasses || 0 },
                     { label: "Active Classes", value: division.activeClasses || 0 },
                     { label: "Attendance Rate", value: `${division.attendanceRate || 0}%` }
                   ] : [
                     { label: "Total Tutors", value: division.totalTutors || 0 },
                     { label: "Active Recruitments", value: division.activeRecruitments || 0 },
                     { label: "Satisfaction Rate", value: `${division.satisfactionRate || 0}%` }
                   ]
                 }
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📋</span>
            Recent Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <ActivityCard
                key={activity.id}
                id={activity.id}
                division={activity.division}
                title={activity.title}
                description={activity.description}
                time={activity.time}
                status={activity.status}
                icon={
                  <span>
                    {activity.division === 'Matchmaking' ? '🔗' : 
                     activity.division === 'CMS' ? '🎓' : '❤️'}
                  </span>
                }
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 