"use client";

import { ReactNode } from "react";
import { GamePhase } from "@/shared/types/game";
import { useGameStore } from "@/store/gameStore";

interface PhaseGuardProps {
  children: ReactNode;
  allowedPhases: GamePhase | GamePhase[];
  fallback?: ReactNode;
}

export function PhaseGuard({
  children,
  allowedPhases,
  fallback = null,
}: PhaseGuardProps) {
  const { phase } = useGameStore();

  const phases = Array.isArray(allowedPhases) ? allowedPhases : [allowedPhases];
  const isAllowed = phases.includes(phase);

  if (!isAllowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
