"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { GameLayout } from "@/components/layout/GameLayout";
import { GameStartSequenceController } from "@/components/game/GameStartSequenceController";
import { PhaseTransitionOverlay } from "@/components/game/PhaseTransitionOverlay";
import { RoleCard } from "@/components/game/RoleCard";
import { RoleDescriptionPanel } from "@/components/game/RoleDescriptionPanel";
import { useGameStore } from "@/entities/game/model/gameStore";
import { useLobbyStore } from "@/entities/room/model/lobbyStore";
import { GamePhase, Role } from "@/shared/types/game";

export default function GamePage() {
  const router = useRouter();
  const playerName = useLobbyStore((state) => state.playerName);
  const phase = useGameStore((state) => state.phase);
  const round = useGameStore((state) => state.round);
  const currentPlayerRole = useGameStore((state) => state.currentPlayerRole);
  const deadlineTimestamp = useGameStore((state) => state.deadlineTimestamp);
  const previousPhase = useGameStore((state) => state.previousPhase);
  const shouldShowPhaseTransition = useGameStore((state) => state.shouldShowPhaseTransition);
  const completePhaseTransition = useGameStore((state) => state.completePhaseTransition);
  const revealConfirmed = useGameStore((state) => state.revealConfirmed);

  const deadlineText = useMemo(() => {
    if (!deadlineTimestamp) return "Waiting for server phase deadline...";
    return `Deadline: ${new Date(deadlineTimestamp).toLocaleTimeString()}`;
  }, [deadlineTimestamp]);

  useEffect(() => {
    if (!playerName) {
      router.replace("/");
    }
  }, [playerName, router]);

  if (!playerName) return null;

  return (
    <GameLayout phase={phase || GamePhase.NIGHT} day={round || 1}>
      <GameStartSequenceController playerName={playerName} />
      <PhaseTransitionOverlay
        fromPhase={previousPhase || GamePhase.NIGHT}
        toPhase={phase || GamePhase.NIGHT}
        isVisible={shouldShowPhaseTransition}
        onComplete={completePhaseTransition}
      />

      <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
        <RoleCard role={currentPlayerRole || Role.VILLAGER} />
        <RoleDescriptionPanel role={currentPlayerRole || Role.VILLAGER} />
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-[#111827]/70 p-6">
        <p className="text-sm uppercase tracking-wider text-[#9CA3AF]">Game Status</p>
        <p className="mt-2 text-white font-semibold">{deadlineText}</p>
        <p className="mt-2 text-[#A8C0D6]">
          {revealConfirmed
            ? "Role confirmed. Waiting for synchronized phase flow..."
            : "Revealing role sequence in progress..."}
        </p>
      </div>
    </GameLayout>
  );
}
