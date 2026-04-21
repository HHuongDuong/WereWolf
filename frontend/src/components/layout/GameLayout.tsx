"use client";

import { ReactNode } from "react";
import { AppLayout } from "./AppLayout";
import { GamePhase } from "@/shared/types/game";

interface GameLayoutProps {
  children: ReactNode;
  phase?: GamePhase;
  day?: number;
}

export function GameLayout({ children, phase, day }: GameLayoutProps) {
  return (
    <AppLayout>
      <div className="h-full flex flex-col">
        <div className="px-8 py-4 border-b border-white/10 bg-[#0B0F1A]/80 backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="text-sm uppercase tracking-widest text-[#9CA3AF]">DAY {day} • {phase}</div>
            <div className="text-[#7C3AED]">{phase || GamePhase.NIGHT} Phase Active</div>
          </div>
        </div>

        <div className="flex-1 p-8 overflow-auto">
          {children}
        </div>
      </div>
    </AppLayout>
  );
}
