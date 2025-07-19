import { Metadata } from "next";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Admin - Eduprima Admin",
  description: "System administration for Eduprima Learning Management System",
};

export default function AdminPage() {
  const users = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@eduprima.com",
      role: "admin",
      status: "active" as const,
      lastLogin: "2024-01-15 10:30",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@eduprima.com",
      role: "manager",
      status: "active" as const,
      lastLogin: "2024-01-14 15:45",
    },
    {
      id: 3,
      name: "Bob Johnson",
      email: "bob.johnson@eduprima.com",
      role: "user",
      status: "inactive" as const,
      lastLogin: "2024-01-10 09:20",
    },
  ]

  const permissions = [
    {
      id: 1,
      name: "User Management",
      description: "Create, edit, and delete users",
      assignedRoles: ["admin"],
      status: "enabled" as const,
    },
    {
      id: 2,
      name: "Content Management",
      description: "Manage educational content and materials",
      assignedRoles: ["admin", "manager"],
      status: "enabled" as const,
    },
    {
      id: 3,
      name: "Financial Reports",
      description: "Access to financial data and reports",
      assignedRoles: ["admin"],
      status: "enabled" as const,
    },
    {
      id: 4,
      name: "Student Data",
      description: "View and manage student information",
      assignedRoles: ["admin", "manager", "user"],
      status: "enabled" as const,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'enabled':
        return 'success';
      case 'inactive':
      case 'disabled':
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
          <h1 className="text-3xl font-bold tracking-tight">System Administration</h1>
          <p className="text-muted-foreground mt-2">
            Manage users, permissions, and system settings
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            Add User
          </Button>
          <Button>
            System Settings
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value="156"
          icon={<span className="text-lg">👥</span>}
        />
        <StatCard
          title="Active Users"
          value="142"
          icon={<span className="text-lg">✅</span>}
        />
        <StatCard
          title="Admin Users"
          value="8"
          icon={<span className="text-lg">🔐</span>}
        />
        <StatCard
          title="System Health"
          value="98%"
          icon={<span className="text-lg">💚</span>}
        />
      </div>

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>👥</span>
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <span className="text-primary text-lg">👤</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {user.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-muted-foreground">
                        Role: {user.role}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Last Login: {user.lastLogin}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge color={getStatusColor(user.status)}>
                    {user.status}
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

      {/* Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🔐</span>
            Permission Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {permissions.map((permission) => (
              <div
                key={permission.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <span className="text-primary text-lg">🔑</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {permission.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {permission.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground">
                        Roles:
                      </span>
                                             {permission.assignedRoles.map((role) => (
                         <Badge key={role} color="secondary" className="text-xs">
                           {role}
                         </Badge>
                       ))}
                    </div>
                  </div>
                </div>
                <Badge color={getStatusColor(permission.status)}>
                  {permission.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 