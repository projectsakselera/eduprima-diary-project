import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recruitment - Eduprima Admin",
  description: "Recruitment level of Eduprima Learning Management System",
};

const RecruitmentLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="recruitment-level">
      {children}
    </div>
  );
};

export default RecruitmentLayout; 