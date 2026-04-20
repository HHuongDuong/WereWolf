"use client";

import { Player } from "@/shared/types/game";
import { PlayerCard } from "../PlayerCard";
import { Typography } from "@/components/ui/Typography";

interface WolfTargetSelectorProps {
  players: Player[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

export function WolfTargetSelector({ players, selectedId, onSelect }: WolfTargetSelectorProps) {
  const aliveVillagers = players.filter((p) => p.isAlive && p.role !== "WEREWOLF");

  return (
    <div>
      <Typography variant="secondary" className="text-center mb-6 text-[#F87171]">
        Choose your prey tonight...
      </Typography>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {aliveVillagers.map((player) => (
          <div
            key={player.id}
            onClick={() => onSelect(player.id)}
            className={`
              relative cursor-pointer transition-all rounded-3xl overflow-hidden
              ${selectedId === player.id
                ? "ring-4 ring-[#DC2626] shadow-[0_0_35px_#DC2626]"
                : "hover:ring-2 hover:ring-[#7C3AED]/40"
              }
            `}
          >
            <PlayerCard player={player} showRole={false} />

            {selectedId === player.id && (
              <div className="absolute top-3 right-3 bg-[#DC2626] text-white text-xs px-4 py-1 rounded-xl font-bold tracking-widest">
                TARGET
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
