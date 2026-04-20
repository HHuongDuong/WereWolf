import { Player } from "@/shared/types/game";
import { Card } from "@/components/ui/Card";
import { PlayerAvatar } from "../PlayerAvatar";
import { RoleBadge } from "../RoleBadge";
import { Typography } from "@/components/ui/Typography";

interface GraveyardListProps {
  deadPlayers: Player[];
}

export function GraveyardList({ deadPlayers }: GraveyardListProps) {
  if (deadPlayers.length === 0) {
    return (
      <Card className="text-center py-12">
        <Typography variant="muted">The graveyard is still empty...</Typography>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center gap-3 mb-8">
        <div className="text-4xl">🪦</div>
        <div>
          <h3 className="text-2xl font-bold tracking-wide text-[#E5E7EB]">Graveyard</h3>
          <p className="text-[#9CA3AF] text-sm">Those who fell to the night</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {deadPlayers.map((player) => (
          <div
            key={player.id}
            className="flex gap-5 items-center bg-[#0B0F1A] p-5 rounded-2xl border border-[#4B5563]/50"
          >
            <div className="relative">
              <PlayerAvatar
                name={player.name}
                isDead={true}
                size="md"
              />
              <div className="absolute -top-1 -right-1 text-2xl">🪦</div>
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-xl line-through text-[#6B7280]">
                {player.name}
              </p>
              <RoleBadge role={player.role} size="sm" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
