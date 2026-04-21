"use client";

import { useEffect } from "react";
import { useGameStore } from "@/entities/game/model/gameStore";
import { RoleDistributionAnimation } from "./RoleDistributionAnimation";
import { RoleRevealModal } from "./RoleRevealModal";
import { CardDealTable } from "./CardDealTable";
import { Role } from "@/shared/types/game";
import { backCardImage } from "@/shared/lib/roleCardAssets";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

interface GameStartSequenceControllerProps {
  playerName: string;
}

export function GameStartSequenceController({ playerName }: GameStartSequenceControllerProps) {
  const startSequenceStep = useGameStore((state) => state.startSequenceStep);
  const assignedRole = useGameStore((state) => state.assignedRole);
  const setSequenceStep = useGameStore((state) => state.setSequenceStep);
  const confirmReveal = useGameStore((state) => state.confirmReveal);

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
        isVisible={startSequenceStep === "dealing"}
        backCardSrc={backCardImage}
      />
      <RoleDistributionAnimation
        isVisible={startSequenceStep === "roleReveal"}
        playerRole={assignedRole}
        playerName={playerName}
      />
      <RoleRevealModal
        isOpen={startSequenceStep === "roleReveal"}
        onClose={confirmReveal}
        role={assignedRole}
        playerName={playerName}
      />
    </>
  );
}
