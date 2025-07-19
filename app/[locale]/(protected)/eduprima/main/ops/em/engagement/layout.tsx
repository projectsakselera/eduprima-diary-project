import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Engagement - Eduprima Admin",
  description: "Engagement level of Eduprima Learning Management System",
};

const EngagementLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="engagement-level">
      {children}
    </div>
  );
};

export default EngagementLayout; 