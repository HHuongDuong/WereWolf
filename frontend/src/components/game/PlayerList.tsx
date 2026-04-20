import { Player } from "@/shared/types/game";
import { PlayerAvatar } from "./PlayerAvatar";
import { PlayerName } from "./PlayerName";
import { PlayerStatus } from "./PlayerStatus";

interface PlayerListProps {
  players: Player[];
  currentPlayerId?: string;
  onPlayerClick?: (id: string) => void;
}

export function PlayerList({ players, currentPlayerId, onPlayerClick }: PlayerListProps) {
  return (
    <div className="space-y-3">
      {players.map((player) => (
        <div
          key={player.id}
          onClick={() => onPlayerClick?.(player.id)}
          className={`
            flex items-center gap-4 p-4 bg-[#111827] rounded-2xl border border-white/5
            hover:border-[#7C3AED]/30 transition-all cursor-pointer
            ${player.isActive ? "border-[#7C3AED]" : ""}
          `}
        >
          <PlayerAvatar
            name={player.name}
            isAlive={player.isAlive}
            isActive={player.isActive}
            size="md"
          />
          <div className="flex-1">
            <PlayerName
              name={player.name}
              isAlive={player.isAlive}
              isActive={player.isActive}
            />
          </div>
          <PlayerStatus isAlive={player.isAlive} isActive={player.isActive} />
        </div>
      ))}
    </div>
  );
}
