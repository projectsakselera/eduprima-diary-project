import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashcode Theme - Reference Components",
  description: "Dashcode theme components and examples for development reference",
};

const DashcodeLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="dashcode-theme">
      {children}
    </div>
  );
};

export default DashcodeLayout; 