import { Metadata } from "next";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
      status: "in-progress" as const,
      duration: "3 months",
      value: "$25,000",
      consultant: "Dr. Sarah Johnson",
    },
    {
      id: 2,
      client: "XYZ University",
      type: "Curriculum Development",
      status: "completed" as const,
      duration: "6 months",
      value: "$45,000",
      consultant: "Prof. Michael Chen",
    },
    {
      id: 3,
      client: "TechStart Inc.",
      type: "Skills Assessment",
      status: "scheduled" as const,
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
      status: "active" as const,
      nextSession: "2024-02-15",
    },
    {
      id: 2,
      name: "Digital Skills Workshop",
      category: "Technology",
      participants: 18,
      status: "active" as const,
      nextSession: "2024-02-20",
    },
    {
      id: 3,
      name: "Communication Excellence",
      category: "Soft Skills",
      participants: 32,
      status: "planning" as const,
      nextSession: "2024-03-01",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'active':
        return 'success';
      case 'in-progress':
        return 'info';
      case 'scheduled':
      case 'planning':
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
          <h1 className="text-3xl font-bold tracking-tight">Education Consulting</h1>
          <p className="text-muted-foreground mt-2">
            Professional consulting services and training programs
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            New Consultation
          </Button>
          <Button>
            Schedule Training
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Active Consultations"
          value="12"
          icon={<span className="text-lg">💼</span>}
        />
        <StatCard
          title="Total Revenue"
          value="$850K"
          icon={<span className="text-lg">💰</span>}
        />
        <StatCard
          title="Training Programs"
          value="8"
          icon={<span className="text-lg">🎓</span>}
        />
        <StatCard
          title="Satisfaction Rate"
          value="98%"
          icon={<span className="text-lg">⭐</span>}
        />
      </div>

      {/* Active Consultations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>💼</span>
            Active Consultations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {consultations.map((consultation) => (
              <div
                key={consultation.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <span className="text-primary text-lg">🏢</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {consultation.client}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {consultation.type} • {consultation.consultant}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-muted-foreground">
                        Duration: {consultation.duration}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Value: {consultation.value}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge color={getStatusColor(consultation.status)}>
                    {consultation.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Training Programs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🎓</span>
            Training Programs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trainingPrograms.map((program) => (
              <div
                key={program.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <span className="text-primary text-lg">📚</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {program.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Category: {program.category} • {program.participants} participants
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Next Session: {program.nextSession}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge color={getStatusColor(program.status)}>
                    {program.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    Manage
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