'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";

export default function MigrationDashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Migration Dashboard</h1>
          <p className="text-muted-foreground">
            Central control for Google Sheet to Supabase migration
          </p>
        </div>
        <Badge className="text-sm">
          <Icon icon="heroicons:cog-6-tooth" className="w-4 h-4 mr-1" />
          Migration Tools
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Icon icon="heroicons:users" className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">Ready for migration</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Schema Status</CardTitle>
            <Icon icon="heroicons:check-circle" className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100%</div>
            <p className="text-xs text-muted-foreground">Fields compatible</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Migration</CardTitle>
            <Icon icon="heroicons:clock" className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2 days</div>
            <p className="text-xs text-muted-foreground">ago</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Icon icon="heroicons:chart-bar" className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">95%</div>
            <p className="text-xs text-muted-foreground">Migration accuracy</p>
          </CardContent>
        </Card>
      </div>

      {/* Migration Tools Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Icon icon="heroicons:link" className="w-5 h-5 text-blue-600" />
              <span>Column Mapping</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Map Google Sheet columns to database fields with visual interface
            </p>
            <Button className="w-full" variant="outline">
              <Icon icon="heroicons:arrow-right" className="w-4 h-4 mr-2" />
              Configure Mapping
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Icon icon="heroicons:check-circle" className="w-5 h-5 text-green-600" />
              <span>Schema Validation</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Validate form compatibility with Supabase schema
            </p>
            <Button className="w-full" variant="outline">
              <Icon icon="heroicons:arrow-right" className="w-4 h-4 mr-2" />
              Validate Schema
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Icon icon="heroicons:chart-bar" className="w-5 h-5 text-orange-600" />
              <span>Progress Tracking</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Monitor migration progress and view detailed logs
            </p>
            <Button className="w-full" variant="outline">
              <Icon icon="heroicons:arrow-right" className="w-4 h-4 mr-2" />
              View Progress
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Migration Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Icon icon="heroicons:document-text" className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No recent migration activity</p>
            <p className="text-sm">Start your first migration to see activity here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 