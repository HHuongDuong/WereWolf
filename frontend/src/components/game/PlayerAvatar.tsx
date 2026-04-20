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
          ${sizeClasses[size]} flex items-center justify-center
          rounded-2xl bg-[#1F2937] border-2 font-bold text-[#E5E7EB]
          transition-all duration-300 overflow-hidden
          ${!isAlive
            ? "grayscale opacity-60 border-[#4B5563]"
            : isActive
              ? "border-[#7C3AED] shadow-[0_0_30px_-5px] shadow-[#7C3AED]"
              : "border-[#7C3AED]/30 hover:border-[#A78BFA]"
          }
          ${isRevealed && role === Role.WEREWOLF ? "shadow-[0_0_25px_-5px] shadow-[#DC2626]" : ""}
        `}
      >
        <span>{initial}</span>
      </div>

      {isRevealed && role && (
        <div className="absolute -bottom-2 -right-2 bg-[#111827] border border-[#374151] rounded-xl p-1.5 shadow-lg">
          <span className="text-2xl">
            {role === Role.WEREWOLF ? "🐺" :
              role === Role.SEER ? "🔮" :
              role === Role.WITCH ? "🧙" :
              role === Role.GUARD ? "🛡️" :
              role === Role.HUNTER ? "🏹" : "👤"}
          </span>
        </div>
      )}

      {!isAlive && (
        <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
          <span className="text-4xl">☠️</span>
        </div>
      )}
    </div>
  );
}
