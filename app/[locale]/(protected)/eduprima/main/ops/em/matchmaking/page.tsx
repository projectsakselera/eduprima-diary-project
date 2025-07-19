import { Metadata } from "next";
import { StatCard } from "@/components/ui/stat-card";
import { DivisionCard } from "@/components/ui/division-card";
import { ActivityCard } from "@/components/ui/activity-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
      status: "active" as const,
      pendingTasks: 12,
      completedToday: 45,
      icon: "📋",
    },
    {
      id: 2,
      name: "Unit Offering",
      description: "Mengelola offering privat dan open untuk siswa",
      status: "active" as const,
      pendingTasks: 8,
      completedToday: 32,
      icon: "📊",
    },
    {
      id: 3,
      name: "Unit Ganti Tutor & Case Solving",
      description: "Menangani pergantian tutor dan penyelesaian kasus",
      status: "active" as const,
      pendingTasks: 15,
      completedToday: 28,
      icon: "👥",
    },
    {
      id: 4,
      name: "EM Komunikasi",
      description: "Mengelola komunikasi tutor-tutor dan tutor-siswa",
      status: "active" as const,
      pendingTasks: 6,
      completedToday: 67,
      icon: "💬",
    },
    {
      id: 5,
      name: "Unit Penyiapan PLP",
      description: "Menyiapkan Program Latihan Praktik",
      status: "active" as const,
      pendingTasks: 3,
      completedToday: 18,
      icon: "📄",
    },
  ]

  const recentActivities = [
    {
      id: 1,
      division: "Matchmaking",
      title: "Match berhasil dibuat untuk siswa Sarah Johnson dengan Tutor Ahmad",
      description: "Proses matchmaking berjalan lancar",
      time: "2 menit yang lalu",
      status: "completed" as const,
    },
    {
      id: 2,
      division: "Follow Up",
      title: "Follow up GT selesai untuk 15 siswa",
      description: "Proses follow up berhasil diselesaikan",
      time: "15 menit yang lalu",
      status: "completed" as const,
    },
    {
      id: 3,
      division: "Case Solving",
      title: "Case solving untuk pergantian tutor Michael Chen",
      description: "Pergantian tutor berhasil diproses",
      time: "1 jam yang lalu",
      status: "ongoing" as const,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">EM Matchmaking</h1>
          <p className="text-muted-foreground mt-2">
            Mengelola proses matchmaking antara tutor dan siswa
          </p>
        </div>
        <Button>
          + New Match
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Matches"
          value="1,247"
          icon={<span className="text-lg">🔗</span>}
        />
        <StatCard
          title="Pending Tasks"
          value="44"
          icon={<span className="text-lg">⏳</span>}
        />
        <StatCard
          title="Completed Today"
          value="190"
          icon={<span className="text-lg">✅</span>}
        />
        <StatCard
          title="Success Rate"
          value="94%"
          icon={<span className="text-lg">📈</span>}
        />
      </div>

      {/* Units Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🏢</span>
            Units Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {units.map((unit) => (
              <DivisionCard
                key={unit.id}
                id={unit.id}
                name={unit.name}
                description={unit.description}
                status={unit.status}
                icon={<span>{unit.icon}</span>}
                href="#"
                stats={[
                  { label: "Pending", value: unit.pendingTasks },
                  { label: "Today", value: unit.completedToday }
                ]}
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
                     activity.division === 'Follow Up' ? '📞' : '🔧'}
                  </span>
                }
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 