import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Eduprima - Learning Management System",
  description: "Eduprima Learning Management System for educational institutions",
};

const EduprimaLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="eduprima-layout">
      {children}
    </div>
  );
};

export default EduprimaLayout; 