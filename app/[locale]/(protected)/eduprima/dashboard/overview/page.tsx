import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Overview - Eduprima Dashboard",
  description: "Overview dashboard for Eduprima Learning Management System",
};

const OverviewPage = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Overview Dashboard</h1>
        <p className="text-muted-foreground mt-2">Comprehensive overview of your educational institution</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>System Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This is the overview page for Eduprima Learning Management System. 
            Here you can see a comprehensive view of your educational institution&apos;s performance.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewPage; 