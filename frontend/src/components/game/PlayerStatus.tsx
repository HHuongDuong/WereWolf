import { Badge } from "@/components/ui/Badge";

interface PlayerStatusProps {
  isAlive: boolean;
  isActive?: boolean;
  isRevealed?: boolean;
  role?: string;
}

export function PlayerStatus({ isAlive, isActive, isRevealed, role }: PlayerStatusProps) {
  if (!isAlive) {
    return <Badge variant="dead">DEAD</Badge>;
  }

  if (isActive) {
    return <Badge variant="active">ACTIVE</Badge>;
  }

  if (isRevealed && role) {
    return <Badge role={role as any}>{role}</Badge>;
  }

  return null;
}
