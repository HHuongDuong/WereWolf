import { Player } from "@/shared/types/game";
import { Avatar } from "@/shared/ui";
import { Crown, X } from "lucide-react";

interface PlayerSlotProps {
  player: Player;
  isHost?: boolean;
  isCurrentUser?: boolean;
  canKick?: boolean;
  onKick?: (playerId: string) => void;
  className?: string;
  seatIndex?: number;
}

export function PlayerSlot({
  player,
  isHost = false,
  isCurrentUser = false,
  canKick = false,
  onKick,
  className,
  seatIndex,
}: PlayerSlotProps) {
  return (
    <div
      className={[
        "group relative flex flex-col items-center justify-between",
        "w-full h-48 sm:h-52 rounded-xl border border-white/10 p-3 sm:p-4 transition-all duration-300",
        "bg-gradient-to-b from-black/60 to-black/80 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.5)]",
        "hover:border-brand-moonlight/40 hover:shadow-[0_0_30px_rgba(168,192,214,0.15)] hover:-translate-y-1",
        isCurrentUser ? "ring-1 ring-brand-moonlight/50 border-brand-moonlight/50 shadow-[inset_0_0_20px_rgba(168,192,214,0.1)]" : "",
        className || "",
      ].join(" ")}
    >
      <div className="absolute inset-0 rounded-xl pointer-events-none opacity-50 bg-[radial-gradient(ellipse_at_top,rgba(168,192,214,0.15),transparent_70%)]" />
      <div className="absolute inset-0 rounded-xl pointer-events-none opacity-[0.03]" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/stardust.png')" }} />

      {/* Top: Avatar */}
      <div className="relative mt-2 z-10">
        <Avatar name={player.name} isDead={false} />
        {isHost && (
          <div className="absolute -top-3 -right-3 bg-gradient-to-b from-yellow-500 to-yellow-700 rounded-full p-1.5 shadow-[0_0_15px_rgba(234,179,8,0.5)] border border-yellow-300/50">
            <Crown className="w-3.5 h-3.5 text-white" />
          </div>
        )}
      </div>

      {/* Middle: Name */}
      <div className="relative z-10 flex flex-col items-center text-center w-full mt-2">
        <p
          className={`font-serif font-bold text-base truncate w-full tracking-wide ${isCurrentUser ? "text-brand-moonlight drop-shadow-[0_0_8px_rgba(168,192,214,0.6)]" : "text-gray-200"
            }`}
        >
          {(seatIndex ?? "")}. {player.name}
        </p>
      </div>

      {/* Bottom: Role Teaser / Footer */}
      <div className="relative z-10 w-full text-center border-t border-white/10 pt-3 mt-1">
        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-[0.25em]">
          {isHost ? "Village Elder" : "Villager"}
        </p>
      </div>

      {/* Kick Button (Hover only) */}
      {canKick && onKick && (
        <button
          onClick={() => onKick(player.id)}
          className="absolute top-2 left-2 p-1.5 bg-brand-blood/20 border border-brand-blood/40 text-red-300 rounded opacity-0 group-hover:opacity-100 hover:bg-brand-blood/40 hover:text-white hover:border-brand-blood hover:shadow-[0_0_15px_rgba(159,18,57,0.5)] transition-all z-20 backdrop-blur-sm"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
