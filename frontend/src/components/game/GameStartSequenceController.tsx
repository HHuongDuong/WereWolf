"use client";

import { useEffect } from "react";
import { useGameStore } from "@/entities/game/model/gameStore";
import { useLobbyStore } from "@/entities/room/model/lobbyStore";
import { CardDealTable } from "./CardDealTable";
import { Role } from "@/shared/types/game";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { backCardImage, roleCardFrontImageByRole } from "@/shared/lib/roleCardAssets";

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
    if (!assignedRole) return;

    let isMounted = true;
    const imagesToPreload = [backCardImage];
    imagesToPreload.push(roleCardFrontImageByRole[assignedRole]);

    const preloadPromises = imagesToPreload.map((src) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = resolve;
        img.onerror = resolve; // Continue even if one fails
      });
    });

    // Ensure at least 1800ms loading screen for cinematic effect, but also wait for images
    Promise.all([
      ...preloadPromises,
      new Promise((resolve) => setTimeout(resolve, 1800))
    ]).then(() => {
      if (isMounted) {
        setSequenceStep("dealing");
      }
    });

    return () => {
      isMounted = false;
    };
  }, [assignedRole, setSequenceStep, startSequenceStep]);

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
