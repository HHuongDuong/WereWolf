"use client";

import { Player } from "@/shared/types/game";
import { PlayerCard } from "./PlayerCard";
import { Typography } from "@/components/ui/Typography";

interface VoteTargetSelectorProps {
  players: Player[];
  selectedId?: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

export function VoteTargetSelector({
  players,
  selectedId,
  onSelect,
  disabled = false,
}: VoteTargetSelectorProps) {
  const alivePlayers = players.filter((p) => p.isAlive);

  return (
    <div>
      <Typography variant="secondary" className="mb-6 text-center">
        Choose who to eliminate this day
      </Typography>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {alivePlayers.map((player) => (
          <div
            key={player.id}
            onClick={() => !disabled && onSelect(player.id)}
            className={`
              relative transition-all duration-200 rounded-3xl overflow-hidden
              ${selectedId === player.id
                ? "ring-4 ring-[#DC2626] shadow-[0_0_30px_#DC2626]"
                : "hover:ring-2 hover:ring-[#7C3AED]/50"
              }
            `}
          >
            <PlayerCard
              player={player}
              showRole={false}
            />

            {selectedId === player.id && (
              <div className="absolute top-4 right-4 bg-[#DC2626] text-white text-xs font-bold px-4 py-1 rounded-xl tracking-widest">
                SELECTED
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
