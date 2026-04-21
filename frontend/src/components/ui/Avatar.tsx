interface AvatarProps {
  name: string;
  role?: string;
  isDead?: boolean;
  isActive?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  showRoleIcon?: boolean;
}

const sizeMap = {
  sm: "w-10 h-10 text-xl",
  md: "w-14 h-14 text-3xl",
  lg: "w-20 h-20 text-5xl",
  xl: "w-28 h-28 text-7xl",
};

export function Avatar({
  name,
  role,
  isDead = false,
  isActive = false,
  size = "md",
  showRoleIcon = false,
}: AvatarProps) {
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="relative inline-block">
      <div
        className={`
          ${sizeMap[size]} relative flex items-center justify-center
          transition-all duration-200
          ${isDead ? "grayscale opacity-80" : ""}
          ${isActive ? "ring-4 ring-[#7C3AED]/60 shadow-[0_0_25px_-5px] shadow-[#7C3AED] rounded-full" : ""}
        `}
      >
        <img 
          src={isDead ? "/images/avatar/avatar_frame_dead.png" : "/images/avatar/avatar_frame_alive.png"} 
          alt="Avatar Frame"
          decoding="sync"
          className="absolute inset-0 w-full h-full object-contain"
        />
        <span className="relative z-10 font-bold text-[#E5E7EB] drop-shadow-[0_2px_8px_rgba(0,0,0,1)] text-shadow-sm">{initial}</span>
      </div>

      {showRoleIcon && role && (
        <div className="absolute -bottom-1 -right-1 bg-[#111827] rounded-xl p-1 border border-[#374151] shadow-lg z-20">
          <RoleIcon role={role} />
        </div>
      )}
    </div>
  );
}

function RoleIcon({ role }: { role: string }) {
  const emojis: Record<string, string> = {
    WEREWOLF: "🐺",
    SEER: "🔮",
    WITCH: "🧙",
    VILLAGER: "👤",
    GUARD: "🛡️",
    HUNTER: "🏹",
  };
  return <span className="text-xl">{emojis[role] || "👤"}</span>;
}
