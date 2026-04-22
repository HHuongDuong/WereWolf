"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { GameLayout } from "@/components/layout/GameLayout";
import { GameStartSequenceController } from "@/components/game/GameStartSequenceController";
import { PhaseTransitionOverlay } from "@/components/game/PhaseTransitionOverlay";
import { RoleReceivedGameplayLayout } from "@/components/game/RoleReceivedGameplayLayout";
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
  const hasActed = useGameStore((state) => state.hasActed);
  const previousPhase = useGameStore((state) => state.previousPhase);
  const shouldShowPhaseTransition = useGameStore((state) => state.shouldShowPhaseTransition);
  const completePhaseTransition = useGameStore((state) => state.completePhaseTransition);
  const revealConfirmed = useGameStore((state) => state.revealConfirmed);
  const currentRoomId = useLobbyStore((state) => state.currentRoomId);
  const rooms = useLobbyStore((state) => state.rooms);

  const currentRoomPlayers = useMemo(() => {
    if (!currentRoomId) return [];
    const room = rooms.find((item) => item.id === currentRoomId);
    return room?.players ?? [];
  }, [currentRoomId, rooms]);

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
    <GameLayout phase={phase || GamePhase.NIGHT} day={round || 1} showHeader={false}>
      <GameStartSequenceController playerName={playerName} />
      <PhaseTransitionOverlay
        fromPhase={previousPhase || GamePhase.NIGHT}
        toPhase={phase || GamePhase.NIGHT}
        isVisible={shouldShowPhaseTransition}
        onComplete={completePhaseTransition}
      />
      <RoleReceivedGameplayLayout
        players={currentRoomPlayers}
        playerName={playerName}
        currentRole={currentPlayerRole || Role.VILLAGER}
        phase={phase || GamePhase.NIGHT}
        day={round || 1}
        deadlineTimestamp={deadlineTimestamp}
        hasActed={hasActed}
      />
    </GameLayout>
  );
}
