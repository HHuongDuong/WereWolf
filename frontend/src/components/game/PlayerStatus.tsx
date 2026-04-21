import { Badge } from "@/shared/ui";
import { Role } from "@/shared/types/game";

interface PlayerStatusProps {
  isAlive: boolean;
  isActive?: boolean;
  isRevealed?: boolean;
  role?: Role;
}

export function PlayerStatus({ isAlive, isActive, isRevealed, role }: PlayerStatusProps) {
  if (!isAlive) {
    return <Badge variant="dead">DEAD</Badge>;
  }

  if (isActive) {
    return <Badge variant="active">ACTIVE</Badge>;
  }

  if (isRevealed && role) {
    return <Badge role={role}>{role}</Badge>;
  }

  return null;
}
