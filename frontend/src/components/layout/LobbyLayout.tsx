"use client";

import { ReactNode } from "react";
import { AppLayout } from "./AppLayout";

interface LobbyLayoutProps {
  children: ReactNode;
  title?: string;
}

export function LobbyLayout({ children, title = "The Gathering" }: LobbyLayoutProps) {
  return (
    <AppLayout>
      <div className="p-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h1 className="text-6xl font-black tracking-widest text-white">{title}</h1>
            <p className="text-[#9CA3AF] mt-3 text-xl">The moon is watching. Choose your fate.</p>
          </div>
          {children}
        </div>
      </div>
    </AppLayout>
  );
}
