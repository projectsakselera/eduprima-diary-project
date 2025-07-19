import { Metadata } from "next";
import { StatCard } from "@/components/ui/stat-card";
import { DivisionCard } from "@/components/ui/division-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
      status: "active" as const,
      totalClasses: 45,
      activeClasses: 38,
      attendanceRate: 92,
      icon: "👁️",
    },
    {
      id: 2,
      name: "Monitoring Ruang Kelas Edufio x ILC",
      description: "Memantau ketersediaan dan penggunaan ruang kelas",
      status: "active" as const,
      totalRooms: 12,
      occupiedRooms: 8,
      utilizationRate: 67,
      icon: "🏢",
    },
    {
      id: 3,
      name: "Monitoring Pembayaran/Tagihan",
      description: "Memantau status pembayaran dan tagihan siswa",
      status: "active" as const,
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
      status: "ongoing" as const,
      time: "09:00 - 10:30",
      attendance: "14/15",
    },
    {
      id: 2,
      className: "Bahasa Inggris - Kelas B",
      tutor: "Sarah Johnson",
      students: 12,
      status: "completed" as const,
      time: "08:00 - 09:30",
      attendance: "12/12",
    },
    {
      id: 3,
      className: "Fisika Lanjutan - Kelas C",
      tutor: "Michael Chen",
      students: 18,
      status: "scheduled" as const,
      time: "10:30 - 12:00",
      attendance: "0/18",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing':
        return 'info';
      case 'completed':
        return 'success';
      case 'scheduled':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">EM Class Management (CMS)</h1>
          <p className="text-muted-foreground mt-2">
            Mengelola dan memantau aktivitas kelas, ruang, dan pembayaran
          </p>
        </div>
        <Button>
          + New Class
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Classes"
          value="45"
          icon={<span className="text-lg">📚</span>}
        />
        <StatCard
          title="Active Classes"
          value="38"
          icon={<span className="text-lg">✅</span>}
        />
        <StatCard
          title="Attendance Rate"
          value="92%"
          icon={<span className="text-lg">📊</span>}
        />
        <StatCard
          title="Payment Rate"
          value="91%"
          icon={<span className="text-lg">💳</span>}
        />
      </div>

      {/* Monitoring Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📊</span>
            Monitoring Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {monitoringItems.map((item) => (
              <DivisionCard
                key={item.id}
                id={item.id}
                name={item.name}
                description={item.description}
                status={item.status}
                icon={<span>{item.icon}</span>}
                href="#"
                                 stats={
                   item.id === 1 ? [
                     { label: "Total Classes", value: item.totalClasses || 0 },
                     { label: "Active", value: item.activeClasses || 0 },
                     { label: "Attendance Rate", value: `${item.attendanceRate || 0}%` }
                   ] : item.id === 2 ? [
                     { label: "Total Rooms", value: item.totalRooms || 0 },
                     { label: "Occupied", value: item.occupiedRooms || 0 },
                     { label: "Utilization Rate", value: `${item.utilizationRate || 0}%` }
                   ] : [
                     { label: "Total Invoices", value: item.totalInvoices || 0 },
                     { label: "Paid", value: item.paidInvoices || 0 },
                     { label: "Payment Rate", value: `${item.paymentRate || 0}%` }
                   ]
                 }
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Classes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📚</span>
            Recent Classes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentClasses.map((classItem) => (
              <div
                key={classItem.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-semibold">{classItem.className}</h3>
                  <p className="text-sm text-muted-foreground">
                    Tutor: {classItem.tutor} • {classItem.students} students
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {classItem.time} • Attendance: {classItem.attendance}
                  </p>
                </div>
                <Badge color={getStatusColor(classItem.status)}>
                  {classItem.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 