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
}

export function PlayerSlot({
  player,
  isHost = false,
  isCurrentUser = false,
  canKick = false,
  onKick,
  className,
}: PlayerSlotProps) {
  return (
    <div
      className={[
        "group relative flex flex-col items-center justify-between",
        "w-full h-48 sm:h-52 rounded-xl border p-3 sm:p-4 transition-all duration-200",
        "bg-gradient-to-b from-[#14202D]/78 via-[#101924]/84 to-[#0A0F17]/90 border-[#4A5D73]/35 shadow-[0_8px_20px_rgba(0,0,0,0.35)]",
        "hover:border-[#A8C0D6]/50 hover:shadow-[0_0_22px_rgba(168,192,214,0.14)]",
        isCurrentUser ? "ring-1 ring-[#A8C0D6]/35" : "",
        className || "",
      ].join(" ")}
    >
      <div className="absolute inset-0 rounded-xl pointer-events-none opacity-35 bg-[radial-gradient(circle_at_top,rgba(168,192,214,0.2),transparent_52%)]" />
      <div className="absolute inset-0 rounded-xl pointer-events-none opacity-25" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/black-linen.png')" }} />

      {/* Top: Avatar */}
      <div className="relative mt-1 z-10">
        <Avatar name={player.name} isDead={false} />
        {isHost && (
          <div className="absolute -top-2 -right-2 bg-gradient-to-b from-[#D5A03B] to-[#8A5A1F] rounded-full p-1 shadow-[0_0_12px_rgba(213,160,59,0.45)] border border-[#F3D38A]/45">
            <Crown className="w-3 h-3 text-[#FFF5DC]" />
          </div>
        )}
      </div>

      {/* Middle: Name */}
      <div className="relative z-10 flex flex-col items-center text-center w-full">
        <p
          className={`font-serif font-bold text-sm truncate w-full ${
            isCurrentUser ? "text-[#D7E6F7]" : "text-[#E5E1D7]"
          }`}
        >
          {player.name}
        </p>
      </div>

      {/* Bottom: Role Teaser / Footer */}
      <div className="relative z-10 w-full text-center border-t border-white/10 pt-2 mt-2">
        <p className="text-[10px] text-[#8E99A6] uppercase tracking-[0.18em]">
          {isHost ? "Village Elder" : "Villager"}
        </p>
      </div>

      {/* Kick Button (Hover only) */}
      {canKick && onKick && (
        <button
          onClick={() => onKick(player.id)}
          className="absolute top-2 left-2 p-1.5 bg-[#32100F]/90 border border-[#8E3832]/45 text-[#E8AFA8] rounded opacity-0 group-hover:opacity-100 hover:text-[#FFD0CA] hover:border-[#C44C45]/70 transition-all z-20"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
