import { Player } from "@/shared/types/game";
import { RoleBadge } from "../RoleBadge";
import { Card } from "@/components/ui/Card";

interface InspectResultProps {
  target: Player;
}

export function InspectResult({ target }: InspectResultProps) {
  return (
    <Card glow className="text-center">
      <div className="text-6xl mb-6">🔮</div>
      <p className="text-[#9CA3AF] uppercase tracking-widest text-sm mb-2">You have seen...</p>

      <div className="text-4xl font-bold text-[#E5E7EB] mb-6">{target.name}</div>

      <RoleBadge role={target.role} size="lg" />

      <p className="mt-8 text-[#C4B5FD] text-lg">
        Their true nature is now known to you.
      </p>
    </Card>
  );
}
