import { Metadata } from "next";
import { StatCard } from "@/components/ui/stat-card";
import { DivisionCard } from "@/components/ui/division-card";
import { ActivityCard } from "@/components/ui/activity-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
      status: "active" as const,
      activeRecruitments: 8,
      totalApplications: 45,
      successRate: 78,
      icon: "👥",
    },
    {
      id: 2,
      name: "Development Unit",
      description: "Mengembangkan kompetensi dan skill tutor",
      status: "active" as const,
      activePrograms: 12,
      participants: 156,
      completionRate: 85,
      icon: "🎓",
    },
    {
      id: 3,
      name: "Relations Unit",
      description: "Mengelola hubungan dengan tutor dan stakeholder",
      status: "active" as const,
      activeRelations: 24,
      satisfactionRate: 92,
      responseTime: "2.3h",
      icon: "🤝",
    },
  ]

  const recentActivities = [
    {
      id: 1,
      division: "Recruitment",
      title: "Interview selesai untuk 5 kandidat tutor Matematika",
      description: "Proses seleksi tahap kedua untuk posisi tutor Matematika SMA",
      time: "2 jam yang lalu",
      status: "completed" as const,
    },
    {
      id: 2,
      division: "Development",
      title: "Workshop 'Effective Teaching Methods' selesai",
      description: "25 tutor berpartisipasi dalam workshop pengembangan metode mengajar",
      time: "1 hari yang lalu",
      status: "completed" as const,
    },
    {
      id: 3,
      division: "Relations",
      title: "Monthly feedback session dengan tutor senior",
      description: "Sesi feedback bulanan untuk 15 tutor senior berjalan lancar",
      time: "2 hari yang lalu",
      status: "completed" as const,
    },
    {
      id: 4,
      division: "Recruitment",
      title: "Job posting baru untuk tutor Bahasa Inggris",
      description: "Lowongan tutor Bahasa Inggris untuk program intensif",
      time: "3 hari yang lalu",
      status: "ongoing" as const,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">EM Engagement</h1>
          <p className="text-muted-foreground mt-2">
            Mengelola rekrutmen, pengembangan, dan hubungan dengan tutor
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            New Recruitment
          </Button>
          <Button>
            Schedule Workshop
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Tutors"
          value="247"
          icon={<span className="text-lg">👨‍🏫</span>}
        />
        <StatCard
          title="Active Recruitments"
          value="8"
          icon={<span className="text-lg">📋</span>}
        />
        <StatCard
          title="Development Programs"
          value="12"
          icon={<span className="text-lg">📚</span>}
        />
        <StatCard
          title="Satisfaction Rate"
          value="92%"
          icon={<span className="text-lg">⭐</span>}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {units.map((unit) => (
              <DivisionCard
                key={unit.id}
                id={unit.id}
                name={unit.name}
                description={unit.description}
                status={unit.status}
                icon={<span>{unit.icon}</span>}
                href="#"
                stats={
                  unit.id === 1 ? [
                    { label: "Active Recruitments", value: unit.activeRecruitments || 0 },
                    { label: "Total Applications", value: unit.totalApplications || 0 },
                    { label: "Success Rate", value: `${unit.successRate || 0}%` }
                  ] : unit.id === 2 ? [
                    { label: "Active Programs", value: unit.activePrograms || 0 },
                    { label: "Participants", value: unit.participants || 0 },
                    { label: "Completion Rate", value: `${unit.completionRate || 0}%` }
                  ] : [
                    { label: "Active Relations", value: unit.activeRelations || 0 },
                    { label: "Satisfaction Rate", value: `${unit.satisfactionRate || 0}%` },
                    { label: "Response Time", value: unit.responseTime || "N/A" }
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
                    {activity.division === 'Recruitment' ? '👥' : 
                     activity.division === 'Development' ? '🎓' : '🤝'}
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