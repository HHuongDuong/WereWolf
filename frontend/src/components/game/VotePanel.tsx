"use client";

import { useState } from "react";
import { Player } from "@/shared/types/game";
import { VoteTargetSelector } from "./VoteTargetSelector";
import { VoteButton } from "./VoteButton";
import { Card } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";

interface VotePanelProps {
  players: Player[];
  currentPlayerId: string;
  onVote: (targetId: string) => void;
  hasVoted?: boolean;
}

export function VotePanel({ players, currentPlayerId, onVote, hasVoted = false }: VotePanelProps) {
  const [selectedId, setSelectedId] = useState<string | undefined>();

  const handleVote = () => {
    if (selectedId) {
      onVote(selectedId);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <Typography variant="secondary" size="lg">
          The sun is high. Time to decide.
        </Typography>
        <h2 className="text-3xl font-bold tracking-wide mt-2 text-[#E5E7EB]">
          WHO IS THE MONSTER?
        </h2>
      </div>

      <VoteTargetSelector
        players={players}
        selectedId={selectedId}
        onSelect={setSelectedId}
        disabled={hasVoted}
      />

      <div className="mt-10">
        <VoteButton
          onVote={handleVote}
          disabled={!selectedId || hasVoted}
          isSelected={!!selectedId}
        />
      </div>

      {hasVoted && (
        <p className="text-center text-[#16A34A] mt-6 font-medium">
          Your vote has been cast. Waiting for others...
        </p>
      )}
    </Card>
  );
}
