"use client";

import { Button } from "@/components/ui/Button";

interface VoteButtonProps {
  onVote: () => void;
  disabled?: boolean;
  isSelected?: boolean;
}

export function VoteButton({ onVote, disabled = false, isSelected = false }: VoteButtonProps) {
  return (
    <Button
      variant={isSelected ? "danger" : "primary"}
      onClick={onVote}
      disabled={disabled}
      className={`w-full font-bold tracking-widest ${isSelected ? "animate-pulse" : ""}`}
    >
      {isSelected ? "✓ VOTED" : "VOTE"}
    </Button>
  );
}
