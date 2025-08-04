import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tutor Profile - Eduprima",
  description: "Complete your tutor profile on Eduprima platform",
};

export default function TutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}