import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ops - Eduprima Admin",
  description: "Operations dashboard for Eduprima Learning Management System",
};

export default function OpsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Operations Dashboard</h1>
      </div>
      
      <div className="grid gap-6">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">Welcome to Ops Level</h2>
          <p className="text-muted-foreground">
            This is the operations level of Eduprima admin system. Manage operational aspects of the platform.
          </p>
        </div>
      </div>
    </div>
  );
} 