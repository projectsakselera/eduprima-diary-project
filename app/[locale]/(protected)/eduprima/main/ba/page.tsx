import { Metadata } from "next";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Business Affair - Eduprima Admin",
  description: "Business affair management for Eduprima Learning Management System",
};

export default function BusinessAffairPage() {
  const partnerships = [
    {
      id: 1,
      name: "TechCorp Solutions",
      type: "Technology Partner",
      status: "active" as const,
      value: "$50,000",
      startDate: "2024-01-15",
    },
    {
      id: 2,
      name: "EduTech Innovations",
      type: "Educational Partner",
      status: "pending" as const,
      value: "$25,000",
      startDate: "2024-03-01",
    },
    {
      id: 3,
      name: "Global Learning Systems",
      type: "Platform Partner",
      status: "active" as const,
      value: "$75,000",
      startDate: "2023-11-20",
    },
  ]

  const marketingCampaigns = [
    {
      id: 1,
      name: "Summer Enrollment Drive",
      channel: "Digital Marketing",
      budget: "$15,000",
      status: "running" as const,
      leads: 245,
    },
    {
      id: 2,
      name: "Corporate Training Promotion",
      channel: "B2B Marketing",
      budget: "$8,000",
      status: "completed" as const,
      leads: 89,
    },
    {
      id: 3,
      name: "Student Referral Program",
      channel: "Social Media",
      budget: "$5,000",
      status: "planned" as const,
      leads: 0,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return 'success';
      case 'running':
        return 'info';
      case 'pending':
      case 'planned':
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
          <h1 className="text-3xl font-bold tracking-tight">Business Affairs</h1>
          <p className="text-muted-foreground mt-2">
            Manage partnerships, marketing, and business relationships
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            New Partnership
          </Button>
          <Button>
            New Campaign
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Active Partnerships"
          value="8"
          icon={<span className="text-lg">🤝</span>}
        />
        <StatCard
          title="Total Value"
          value="$2.4M"
          icon={<span className="text-lg">💰</span>}
        />
        <StatCard
          title="Active Campaigns"
          value="3"
          icon={<span className="text-lg">📢</span>}
        />
        <StatCard
          title="Total Leads"
          value="1,234"
          icon={<span className="text-lg">👥</span>}
        />
      </div>

      {/* Partnerships */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🤝</span>
            Strategic Partnerships
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {partnerships.map((partnership) => (
              <div
                key={partnership.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <span className="text-primary text-lg">🏢</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {partnership.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {partnership.type}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-muted-foreground">
                        Value: {partnership.value}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Started: {partnership.startDate}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge color={getStatusColor(partnership.status)}>
                    {partnership.status}
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

      {/* Marketing Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📢</span>
            Marketing Campaigns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {marketingCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <span className="text-primary text-lg">📈</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {campaign.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {campaign.channel} • Budget: {campaign.budget}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Leads Generated: {campaign.leads}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge color={getStatusColor(campaign.status)}>
                    {campaign.status}
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