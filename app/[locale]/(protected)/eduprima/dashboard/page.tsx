import { Metadata } from "next";
import { useTranslations } from 'next-intl';
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, Building2, GraduationCap } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard - Eduprima Admin",
  description: "Eduprima Learning Management System Dashboard",
};

const EduprimaDashboard = () => {
  const t = useTranslations("Menu");
  
  const recentActivities = [
    {
      id: 1,
      title: "New student registered",
      time: "2 minutes ago",
      type: "student" as const,
    },
    {
      id: 2,
      title: "Grade updated for Class 10A",
      time: "15 minutes ago",
      type: "grade" as const,
    },
    {
      id: 3,
      title: "New class schedule created",
      time: "1 hour ago",
      type: "schedule" as const,
    },
  ];

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'student':
        return 'bg-blue-500';
      case 'grade':
        return 'bg-green-500';
      case 'schedule':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">{t("welcomeMessage")}</h1>
        <p className="text-muted-foreground mt-2">{t("modernLearning")}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value="1,234"
          icon={<Users className="w-6 h-6" />}
        />
        <StatCard
          title="Total Teachers"
          value="89"
          icon={<GraduationCap className="w-6 h-6" />}
        />
        <StatCard
          title="Total Classes"
          value="45"
          icon={<Building2 className="w-6 h-6" />}
        />
        <StatCard
          title="Total Subjects"
          value="12"
          icon={<BookOpen className="w-6 h-6" />}
        />
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-3 ${getActivityColor(activity.type)}`}></div>
                  <div>
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button className="w-full">
                Add New Student
              </Button>
              <Button className="w-full" variant="outline">
                Create Class Schedule
              </Button>
              <Button className="w-full" variant="outline">
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EduprimaDashboard; 