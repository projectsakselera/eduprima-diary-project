import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Overview - Eduprima Dashboard",
  description: "Overview dashboard for Eduprima Learning Management System",
};

const OverviewPage = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Overview Dashboard</h1>
        <p className="text-gray-600 mt-2">Comprehensive overview of your educational institution</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">System Overview</h2>
        <p className="text-gray-600">
          This is the overview page for Eduprima Learning Management System. 
          Here you can see a comprehensive view of your educational institution's performance.
        </p>
      </div>
    </div>
  );
};

export default OverviewPage; 