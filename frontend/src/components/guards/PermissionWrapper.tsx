"use client";

import { ReactNode } from "react";
import { Role } from "@/shared/types/game";
import { useGameStore } from "@/store/gameStore";

interface PermissionWrapperProps {
  children: ReactNode;
  role?: Role | Role[];
  fallback?: ReactNode;
  showDisabled?: boolean;
}

export function PermissionWrapper({
  children,
  role,
  fallback = null,
  showDisabled = false,
}: PermissionWrapperProps) {
  const { currentPlayerRole, isAlive } = useGameStore();

  if (!isAlive) return fallback;

  if (!role) {
    return <>{children}</>;
  }

  const requiredRoles = Array.isArray(role) ? role : [role];
  const hasPermission = requiredRoles.includes(currentPlayerRole);

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  if (showDisabled) {
    return <div className="opacity-50 pointer-events-none">{children}</div>;
  }

  return <>{children}</>;
}
