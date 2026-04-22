"use client";

import { Player } from "@/shared/types/game";
import { VoteTargetSelector } from "./VoteTargetSelector";
import { Typography } from "@/components/ui/Typography";

interface TieBreakerPanelProps {
  tiedPlayers: Player[];
  onBreakTie: (id: string) => void;
}

export function TieBreakerPanel({ tiedPlayers, onBreakTie }: TieBreakerPanelProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-block px-6 py-2 bg-[#F59E0B]/10 border border-[#F59E0B]/40 rounded-2xl text-amber-400 text-sm tracking-widest mb-4">
          TIE BREAKER
        </div>
        <Typography variant="secondary" size="lg">
          The village is divided. One final vote decides.
        </Typography>
      </div>

      <VoteTargetSelector
        players={tiedPlayers}
        onSelect={onBreakTie}
      />
    </div>
  );
}
