import { Player } from "@/shared/types/game";
import { Avatar } from "@/components/ui/Avatar";
import { HostBadge } from "./HostBadge";
import { ReadyToggle } from "./ReadyToggle";
import { KickPlayerButton } from "./KickPlayerButton";

interface PlayerSlotProps {
  player: Player;
  isHost?: boolean;
  isCurrentUser?: boolean;
  canKick?: boolean;
  onKick?: (playerId: string) => void;
  onReadyChange?: (ready: boolean) => void;
}

export function PlayerSlot({
  player,
  isHost = false,
  isCurrentUser = false,
  canKick = false,
  onKick,
  onReadyChange,
}: PlayerSlotProps) {
  return (
    <div className="bg-[#111827] border border-white/10 rounded-2xl p-5 flex items-center gap-5 group">
      <div className="relative">
        <Avatar name={player.name} isDead={false} />
        {isHost && <HostBadge isHost={true} className="absolute -top-1 -right-1" />}
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-3">
          <p className="font-semibold text-lg">{player.name}</p>
          {isCurrentUser && <span className="text-[#7C3AED] text-xs tracking-widest">(YOU)</span>}
        </div>
        <p className="text-sm text-[#9CA3AF]">{player.role || "Waiting"}</p>
      </div>

      <div className="flex items-center gap-4">
        <ReadyToggle
          isReady={player.isReady || false}
          onChange={onReadyChange}
          disabled={!isCurrentUser}
        />

        {canKick && onKick && (
          <KickPlayerButton onKick={() => onKick(player.id)} />
        )}
      </div>
    </div>
  );
}
