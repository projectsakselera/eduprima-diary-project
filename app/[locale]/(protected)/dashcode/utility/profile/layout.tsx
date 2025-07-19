import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Eduprima Learning Platform",
  description: "Eduprima is a modern learning management platform.",
};
const Layout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default Layout;
