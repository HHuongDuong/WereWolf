"use client";

import { Player } from "@/shared/types/game";
import { PlayerCard } from "../PlayerCard";

interface GuardProtectSelectorProps {
  players: Player[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

export function GuardProtectSelector({ players, selectedId, onSelect }: GuardProtectSelectorProps) {
  return (
    <div>
      <p className="text-center text-[#16A34A] mb-6 tracking-wide">
        Choose who to shield from the darkness tonight
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {players.filter((p) => p.isAlive).map((player) => (
          <div
            key={player.id}
            onClick={() => onSelect(player.id)}
            className={`
              cursor-pointer transition-all rounded-3xl
              ${selectedId === player.id ? "ring-4 ring-[#16A34A] shadow-[0_0_30px_#16A34A]" : ""}
            `}
          >
            <PlayerCard player={player} showRole={false} />
          </div>
        ))}
      </div>
    </div>
  );
}
