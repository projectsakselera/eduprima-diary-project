import { Metadata } from "next";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
      status: "active" as const,
    },
    {
      id: 2,
      name: "Advanced Mathematics",
      description: "Advanced level mathematics course",
      duration: "6 months",
      students: 32,
      status: "active" as const,
    },
    {
      id: 3,
      name: "Business Communication",
      description: "Professional business communication skills",
      duration: "4 months",
      students: 28,
      status: "draft" as const,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'draft':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Program Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage educational programs and curriculum
          </p>
        </div>
        <Button>
          <span>+</span>
          Add New Program
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Programs"
          value="12"
          icon={<span className="text-lg">📚</span>}
        />
        <StatCard
          title="Active Programs"
          value="8"
          icon={<span className="text-lg">✅</span>}
        />
        <StatCard
          title="Total Students"
          value="1,245"
          icon={<span className="text-lg">👥</span>}
        />
        <StatCard
          title="Avg. Duration"
          value="4.2 mo"
          icon={<span className="text-lg">⏱️</span>}
        />
      </div>

      {/* Programs List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📚</span>
            Current Programs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {programs.map((program) => (
              <div
                key={program.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <span className="text-primary text-lg">📖</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {program.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {program.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-muted-foreground">
                        ⏱️ {program.duration}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        👥 {program.students} students
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge color={getStatusColor(program.status)}>
                    {program.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 