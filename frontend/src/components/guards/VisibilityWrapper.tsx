"use client";

import { ReactNode } from "react";
import { Role, GamePhase } from "@/shared/types/game";
import { useGameStore } from "@/store/gameStore";

interface VisibilityWrapperProps {
  children: ReactNode;
  visibleTo?: Role | Role[];
  visibleInPhases?: GamePhase | GamePhase[];
  fallback?: ReactNode;
}

export function VisibilityWrapper({
  children,
  visibleTo,
  visibleInPhases,
  fallback = null,
}: VisibilityWrapperProps) {
  const { currentPlayerRole, phase, isAlive } = useGameStore();

  if (!isAlive) return <>{fallback}</>;

  if (visibleTo) {
    const allowedRoles = Array.isArray(visibleTo) ? visibleTo : [visibleTo];
    if (!allowedRoles.includes(currentPlayerRole)) {
      return <>{fallback}</>;
    }
  }

  if (visibleInPhases) {
    const allowedPhases = Array.isArray(visibleInPhases) ? visibleInPhases : [visibleInPhases];
    if (!allowedPhases.includes(phase)) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}
