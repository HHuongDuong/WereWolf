"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { GameLayout } from "@/components/layout/GameLayout";
import { GameStartSequenceController } from "@/components/game/GameStartSequenceController";
import { PhaseTransitionOverlay } from "@/components/game/PhaseTransitionOverlay";
import { RoleReceivedGameplayLayout } from "@/components/game/RoleReceivedGameplayLayout";
import { GameEndScreen } from "@/components/game/GameEndScreen";
import { useGameStore } from "@/entities/game/model/gameStore";
import { useLobbyStore } from "@/entities/room/model/lobbyStore";
import { GamePhase, Role } from "@/shared/types/game";
import { getRoomGatewaySocket } from "@/shared/network/roomGatewaySocket";

export default function GamePage() {
  const router = useRouter();
  const playerName = useLobbyStore((state) => state.playerName);
  const phase = useGameStore((state) => state.phase);
  const round = useGameStore((state) => state.round);
  const currentPlayerRole = useGameStore((state) => state.currentPlayerRole);
  const deadlineTimestamp = useGameStore((state) => state.deadlineTimestamp);
  const hasActed = useGameStore((state) => state.hasActed);
  const isAlive = useGameStore((state) => state.isAlive);
  const witchPotions = useGameStore((state) => state.witchPotions);
  const hunterTriggered = useGameStore((state) => state.hunterTriggered);
  const currentNightRole = useGameStore((state) => state.currentNightRole);
  const previousPhase = useGameStore((state) => state.previousPhase);
  const shouldShowPhaseTransition = useGameStore((state) => state.shouldShowPhaseTransition);
  const completePhaseTransition = useGameStore((state) => state.completePhaseTransition);
  const revealConfirmed = useGameStore((state) => state.revealConfirmed);
  const winner = useGameStore((state) => state.winner);
  const currentRoomId = useLobbyStore((state) => state.currentRoomId);
  const setCurrentRoomId = useLobbyStore((state) => state.setCurrentRoomId);
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

  useEffect(() => {
    const nightAudio = new Audio("/sounds/night.mp3");
    const dayAudio = new Audio("/sounds/day.mp3");
    const howlAudio = new Audio("/sounds/wolf_howl.mp3");

    nightAudio.loop = true;
    dayAudio.loop = true;

    if (phase === GamePhase.NIGHT) {
      dayAudio.pause();
      dayAudio.currentTime = 0;
      nightAudio.play().catch(console.error);

      if (previousPhase !== GamePhase.NIGHT) {
        howlAudio.play().catch(console.error);
      }
    } else if (phase === GamePhase.DAY || phase === GamePhase.VOTING) {
      nightAudio.pause();
      nightAudio.currentTime = 0;
      dayAudio.play().catch(console.error);
    } else {
      nightAudio.pause();
      dayAudio.pause();
    }

    return () => {
      nightAudio.pause();
      dayAudio.pause();
      howlAudio.pause();
    };
  }, [phase, previousPhase]);

  if (!playerName) return null;

  if (phase === GamePhase.END && winner) {
    return (
      <GameEndScreen
        winner={winner}
        players={currentRoomPlayers}
        onReturnToVillage={() => {
          useGameStore.getState().resetGame();
          router.replace("/");
        }}
        onLeaveVillage={() => {
          const socket = getRoomGatewaySocket();
          if (currentRoomId) {
            socket.send("LEAVE_ROOM", { roomId: currentRoomId, guestId: playerName });
          }
          setCurrentRoomId(null);
          useGameStore.getState().resetGame();
          router.replace("/");
        }}
      />
    );
  }

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
        roomId={currentRoomId}
        isAlive={isAlive}
        witchPotions={witchPotions}
        hunterTriggered={hunterTriggered}
        currentNightRole={currentNightRole}
        roomConfig={rooms.find((r) => r.id === currentRoomId)?.config}
      />
    </GameLayout>
  );
}
