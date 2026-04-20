"use client";

import { GamePhase } from "@/shared/types/game";
import { PhaseBanner } from "@/components/game/PhaseBanner";

interface HeaderBarProps {
  phase?: GamePhase;
  day?: number;
  roomName?: string;
  roomCode?: string;
}

export function HeaderBar({ phase, day = 1, roomName = "The Howling Table", roomCode = "WOLF-4831" }: HeaderBarProps) {
  return (
    <header className="h-20 border-b border-white/10 bg-[#111827]/80 backdrop-blur-lg flex items-center px-8 z-50">
      <div className="flex-1 flex items-center gap-8">
        <div>
          <div className="font-bold tracking-wide text-lg">{roomName}</div>
          <div className="text-xs text-[#9CA3AF] font-mono">CODE: {roomCode}</div>
        </div>

        {phase && (
          <div className="pl-8 border-l border-white/10">
            <PhaseBanner phase={phase} day={day} />
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className="text-sm text-[#9CA3AF]">
          Ánh Dương • <span className="text-[#7C3AED]">Werewolf</span>
        </div>
        <div className="w-9 h-9 rounded-2xl bg-[#7C3AED] flex items-center justify-center text-xl">
          🌕
        </div>
      </div>
    </header>
  );
}
