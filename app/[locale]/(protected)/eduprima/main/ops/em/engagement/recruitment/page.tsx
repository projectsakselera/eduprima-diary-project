import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recruitment - Eduprima Admin",
  description: "Recruitment dashboard for Eduprima Learning Management System",
};

export default function RecruitmentPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Recruitment Dashboard</h1>
      </div>
      
      <div className="grid gap-6">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">Welcome to Recruitment Level</h2>
          <p className="text-muted-foreground">
            This is the recruitment level of Eduprima admin system. Manage recruitment processes and activities.
          </p>
        </div>
      </div>
    </div>
  );
} 