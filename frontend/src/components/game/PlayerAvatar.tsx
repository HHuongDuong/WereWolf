import { Role } from "@/shared/types/game";

interface PlayerAvatarProps {
  name: string;
  role?: Role;
  isAlive?: boolean;
  isActive?: boolean;
  isRevealed?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "w-12 h-12 text-2xl",
  md: "w-16 h-16 text-4xl",
  lg: "w-24 h-24 text-6xl",
  xl: "w-32 h-32 text-7xl",
};

export function PlayerAvatar({
  name,
  role,
  isAlive = true,
  isActive = false,
  isRevealed = false,
  size = "md",
}: PlayerAvatarProps) {
  const initial = name[0].toUpperCase();

  return (
    <div className="relative">
      <div
        className={`
          ${sizeClasses[size]} relative flex items-center justify-center
          transition-all duration-300
          ${!isAlive ? "grayscale opacity-80" : ""}
          ${isActive ? "ring-4 ring-[#7C3AED]/80 shadow-[0_0_30px_-5px] shadow-[#7C3AED] rounded-full" : ""}
          ${isRevealed && role === Role.WEREWOLF ? "shadow-[0_0_25px_-5px] shadow-[#DC2626] rounded-full" : ""}
        `}
      >
        <img 
          src={isAlive ? "/images/avatar/avatar_frame_alive.png" : "/images/avatar/avatar_frame_dead.png"} 
          alt="Avatar Frame"
          decoding="sync"
          className="absolute inset-0 w-full h-full object-contain"
        />
        <span className="relative z-10 font-bold text-[#E5E7EB] drop-shadow-[0_2px_8px_rgba(0,0,0,1)] text-shadow-sm">{initial}</span>
      </div>

      {isRevealed && role && (
        <div className="absolute -bottom-2 -right-2 bg-[#111827] border border-[#374151] rounded-xl p-1.5 shadow-lg z-20">
          <span className="text-2xl">
            {role === Role.WEREWOLF ? "🐺" :
              role === Role.SEER ? "🔮" :
              role === Role.WITCH ? "🧙" :
              role === Role.GUARD ? "🛡️" :
              role === Role.HUNTER ? "🏹" : "👤"}
          </span>
        </div>
      )}
    </div>
  );
}
