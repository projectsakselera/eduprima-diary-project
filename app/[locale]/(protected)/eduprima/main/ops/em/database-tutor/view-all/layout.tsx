import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Database Tutor - View All",
  description: "View all tutors in database",
};

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ViewAllTutorsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="tutor-view-all">
      {children}
    </div>
  );
};

export default ViewAllTutorsLayout;