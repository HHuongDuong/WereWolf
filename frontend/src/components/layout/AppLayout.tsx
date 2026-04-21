import { ReactNode } from "react";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-background text-brand-text-primary flex flex-col">
      {children}
    </div>
  );
}