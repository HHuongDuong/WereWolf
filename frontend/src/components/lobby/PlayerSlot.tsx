import { Player } from "@/shared/types/game";
import { Avatar } from "@/components/ui/Avatar";
import { Flame, Crown, X } from "lucide-react";

interface PlayerSlotProps {
  player: Player;
  isHost?: boolean;
  isCurrentUser?: boolean;
  canKick?: boolean;
  onKick?: (playerId: string) => void;
}

export function PlayerSlot({
  player,
  isHost = false,
  isCurrentUser = false,
  canKick = false,
  onKick,
}: PlayerSlotProps) {
  const isReady = player.isReady;

  return (
    <div className={`relative flex flex-col items-center justify-between w-40 h-56 rounded-lg border-2 p-4 transition-all
      ${isReady 
        ? "bg-gradient-to-b from-[#2A1A1A] to-[#1A0B0B] border-[#FF4500]/60 shadow-[0_0_15px_rgba(255,69,0,0.3)]" 
        : "bg-gradient-to-b from-[#1C2331] to-[#0B0B12] border-gray-700 shadow-md"}
    `}>
      {/* Top: Avatar */}
      <div className="relative mt-2">
        <Avatar name={player.name} isDead={false} />
        {isHost && (
          <div className="absolute -top-2 -right-2 bg-yellow-600 rounded-full p-1 shadow-lg">
            <Crown className="w-3 h-3 text-white" />
          </div>
        )}
      </div>

      {/* Middle: Name & Ready Status */}
      <div className="flex flex-col items-center text-center w-full">
        <p className={`font-serif font-bold text-sm truncate w-full ${isCurrentUser ? "text-brand-moonlight" : "text-gray-200"}`}>
          {player.name}
        </p>
        <div className={`flex items-center gap-1 mt-1 text-[10px] font-bold tracking-widest ${isReady ? "text-[#FF8A00]" : "text-gray-500"}`}>
          {isReady ? "READY" : "NOT READY"}
          {isReady && <Flame className="w-3 h-3 animate-[flicker_2s_infinite]" />}
        </div>
      </div>

      {/* Bottom: Role Teaser / Footer */}
      <div className="w-full text-center border-t border-white/10 pt-2 mt-2">
        <p className="text-[10px] text-gray-400 uppercase tracking-widest">
          {isHost ? "Village Elder" : "Villager"}
        </p>
      </div>

      {/* Kick Button (Hover only) */}
      {canKick && onKick && (
        <button 
          onClick={() => onKick(player.id)}
          className="absolute top-2 left-2 p-1 bg-red-900/80 text-red-200 rounded opacity-0 hover:opacity-100 transition-opacity"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
