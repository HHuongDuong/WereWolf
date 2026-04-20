import { ReactNode } from "react";

interface LobbyLayoutProps {
  title: string;
  children: ReactNode;
}

export function LobbyLayout({ title, children }: LobbyLayoutProps) {
  return (
    <div className="min-h-screen bg-brand-background p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl lg:text-6xl font-black tracking-widest text-white">
            {title}
          </h1>
          <p className="mt-3 text-brand-text-muted text-lg">
            The moon is watching. Choose your fate.
          </p>
        </div>
        
        {children}
      </div>
    </div>
  );
}