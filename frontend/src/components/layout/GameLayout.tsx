"use client";

import { ReactNode } from "react";
import { AppLayout } from "./AppLayout";
import { GamePhase } from "@/shared/types/game";

interface GameLayoutProps {
  children: ReactNode;
  phase?: GamePhase;
  day?: number;
  showHeader?: boolean;
}

export function GameLayout({ children, phase, day, showHeader = true }: GameLayoutProps) {
  const resolvedPhase = phase || GamePhase.NIGHT;
  const backgroundImage =
    resolvedPhase === GamePhase.NIGHT
      ? "/images/background/background_night.webp"
      : "/images/background/background_day.webp";

  return (
    <AppLayout>
      <div className="relative h-full flex flex-col overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
        <div className="absolute inset-0 bg-[#060A14]/70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.12),transparent_45%)]" />

        <div className="relative z-10 h-full flex flex-col">
        {showHeader && (
          <div className="px-8 py-4 border-b border-white/10 bg-[#0B0F1A]/80 backdrop-blur">
            <div className="flex items-center justify-between">
              <div className="text-sm uppercase tracking-widest text-[#9CA3AF]">DAY {day} • {resolvedPhase}</div>
              <div className="text-[#7C3AED]">{resolvedPhase} Phase Active</div>
            </div>
          </div>
        )}

        <div className="flex-1 p-8 overflow-auto">
          {children}
        </div>
        </div>
      </div>
    </AppLayout>
  );
}
