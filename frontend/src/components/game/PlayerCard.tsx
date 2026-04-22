import { Player } from "@/shared/types/game";
import { Card } from "@/components/ui/Card";
import { PlayerAvatar } from "./PlayerAvatar";
import { PlayerName } from "./PlayerName";
import { PlayerStatus } from "./PlayerStatus";
import { PlayerRole } from "./PlayerRole";

interface PlayerCardProps {
  player: Player;
  isSelf?: boolean;
  onClick?: (id: string) => void;
  showRole?: boolean;
}

export function PlayerCard({ player, isSelf = false, onClick, showRole = false }: PlayerCardProps) {
  const isRevealed = showRole || player.isRevealed || false;

  return (
    <Card
      glow={player.isActive}
      onClick={() => onClick?.(player.id)}
      className={`
        cursor-pointer transition-all hover:scale-[1.03]
        ${!player.isAlive ? "opacity-75" : ""}
      `}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <PlayerAvatar
          name={player.name}
          role={player.role}
          isAlive={player.isAlive}
          isActive={player.isActive}
          isRevealed={isRevealed}
          size="lg"
        />

        <div>
          <PlayerName
            name={player.name}
            isAlive={player.isAlive}
            isActive={player.isActive}
          />
          {isSelf && <p className="text-xs text-[#7C3AED] tracking-widest">YOU</p>}
        </div>

        <PlayerStatus
          isAlive={player.isAlive}
          isActive={player.isActive}
          isRevealed={isRevealed}
          role={player.role}
        />

        <PlayerRole role={player.role} isRevealed={isRevealed} />
      </div>
    </Card>
  );
}
