"use client";

import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { HeaderBar } from "./HeaderBar";
import { FooterControls } from "./FooterControls";

interface AppLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

export function AppLayout({ children, showSidebar = true }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0B0F1A] text-[#E5E7EB] overflow-hidden">
      <div className="flex h-screen">
        {showSidebar && <Sidebar />}

        <div className="flex-1 flex flex-col overflow-hidden">
          <HeaderBar />
          <main className="flex-1 overflow-auto relative">
            {children}
          </main>
          <FooterControls />
        </div>
      </div>
    </div>
  );
}
