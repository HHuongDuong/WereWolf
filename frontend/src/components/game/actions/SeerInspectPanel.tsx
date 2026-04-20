"use client";

import { Player } from "@/shared/types/game";
import { PlayerCard } from "../PlayerCard";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";

interface SeerInspectPanelProps {
  players: Player[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onInspect: () => void;
  hasInspected?: boolean;
}

export function SeerInspectPanel({
  players,
  selectedId,
  onSelect,
  onInspect,
  hasInspected = false,
}: SeerInspectPanelProps) {
  return (
    <div className="space-y-8">
      <Typography variant="secondary" className="text-center">
        Gaze into the moonlight. Choose one soul to reveal.
      </Typography>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {players.filter((p) => p.isAlive).map((player) => (
          <div
            key={player.id}
            onClick={() => !hasInspected && onSelect(player.id)}
            className={`cursor-pointer transition-all ${hasInspected ? "opacity-60" : ""}`}
          >
            <PlayerCard
              player={player}
              showRole={false}
            />
          </div>
        ))}
      </div>

      <Button
        variant="primary"
        onClick={onInspect}
        disabled={!selectedId || hasInspected}
        className="w-full"
      >
        {hasInspected ? "YOU HAVE ALREADY USED YOUR POWER" : "🔮 INSPECT TARGET"}
      </Button>
    </div>
  );
}
