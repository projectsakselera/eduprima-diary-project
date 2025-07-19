import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Main - Eduprima Admin",
  description: "Main dashboard for Eduprima Learning Management System",
};

export default function MainPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Main Dashboard</h1>
      </div>
      
      <div className="grid gap-6">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">Welcome to Eduprima Main</h2>
          <p className="text-muted-foreground">
            This is the main level of Eduprima admin system. Navigate through the hierarchy to access different modules.
          </p>
        </div>
      </div>
    </div>
  );
} 