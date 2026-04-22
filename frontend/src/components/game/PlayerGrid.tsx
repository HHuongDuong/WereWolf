import { Player } from "@/shared/types/game";
import { PlayerCard } from "./PlayerCard";

interface PlayerGridProps {
  players: Player[];
  currentPlayerId?: string;
  onPlayerClick?: (id: string) => void;
  showRoles?: boolean;
}

export function PlayerGrid({
  players,
  currentPlayerId,
  onPlayerClick,
  showRoles = false,
}: PlayerGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {players.map((player) => (
        <PlayerCard
          key={player.id}
          player={player}
          isSelf={player.id === currentPlayerId}
          onClick={onPlayerClick}
          showRole={showRoles}
        />
      ))}
    </div>
  );
}
