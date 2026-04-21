"use client";

import { useEffect } from "react";
import { useGameStore } from "@/entities/game/model/gameStore";
import { useLobbyStore } from "@/entities/room/model/lobbyStore";
import { CardDealTable } from "./CardDealTable";
import { Role } from "@/shared/types/game";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

interface GameStartSequenceControllerProps {
  playerName: string;
}

export function GameStartSequenceController({ playerName }: GameStartSequenceControllerProps) {
  const startSequenceStep = useGameStore((state) => state.startSequenceStep);
  const assignedRole = useGameStore((state) => state.assignedRole);
  const setSequenceStep = useGameStore((state) => state.setSequenceStep);
  const confirmReveal = useGameStore((state) => state.confirmReveal);
  const currentRoomId = useLobbyStore((state) => state.currentRoomId);
  const currentRoom = useLobbyStore((state) => state.rooms.find(r => r.id === currentRoomId));
  const maxPlayers = currentRoom?.maxPlayers || 8;

  useEffect(() => {
    if (startSequenceStep !== "starting") return;
    const timer = setTimeout(() => setSequenceStep("dealing"), 1800);
    return () => clearTimeout(timer);
  }, [setSequenceStep, startSequenceStep]);

  useEffect(() => {
    if (startSequenceStep !== "dealing" || !assignedRole) return;
    const timer = setTimeout(() => setSequenceStep("roleReveal"), 1600);
    return () => clearTimeout(timer);
  }, [assignedRole, setSequenceStep, startSequenceStep]);

  return (
    <>
      {startSequenceStep === "starting" && <LoadingScreen />}
      <CardDealTable
        step={startSequenceStep}
        role={assignedRole}
        playerName={playerName}
        onConfirm={confirmReveal}
        seatCount={maxPlayers}
      />
    </>
  );
}
