import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ops - Eduprima Admin",
  description: "Operations level of Eduprima Learning Management System",
};

const OpsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="ops-level">
      {children}
    </div>
  );
};

export default OpsLayout; 