import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Main - Eduprima Admin",
  description: "Main level of Eduprima Learning Management System",
};

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="main-level">
      {children}
    </div>
  );
};

export default MainLayout; 