import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Break Time - Eduprima",
  description: "Relaxing games and activities for team break time",
};

const BreakTimeLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="break-time-layout">
      {children}
    </div>
  );
};

export default BreakTimeLayout; 