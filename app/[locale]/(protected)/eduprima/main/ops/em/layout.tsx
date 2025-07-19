import { Metadata } from "next";

export const metadata: Metadata = {
  title: "EM - Eduprima Admin",
  description: "EM level of Eduprima Learning Management System",
};

const EmLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="em-level">
      {children}
    </div>
  );
};

export default EmLayout; 