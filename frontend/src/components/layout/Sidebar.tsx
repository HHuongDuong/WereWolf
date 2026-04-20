"use client";

import { Button } from "@/components/ui/Button";
import { Logo } from "./Logo";

export function Sidebar() {
  return (
    <div className="w-72 bg-[#111827] border-r border-white/10 flex flex-col">
      <div className="p-8 border-b border-white/10">
        <Logo />
      </div>

      <div className="flex-1 p-6 space-y-2">
        <Button variant="ghost" className="w-full justify-start text-left">
          🌕 Lobby
        </Button>
        <Button variant="ghost" className="w-full justify-start text-left">
          📜 How to Play
        </Button>
        <Button variant="ghost" className="w-full justify-start text-left">
          🏆 Leaderboard
        </Button>
        <Button variant="ghost" className="w-full justify-start text-left">
          ⚙️ Settings
        </Button>
      </div>

      <div className="p-6 border-t border-white/10 text-xs text-[#9CA3AF]">
        <div>Online: <span className="text-[#16A34A]">248</span> players</div>
        <div className="mt-1">Under the Full Moon</div>
      </div>
    </div>
  );
}
