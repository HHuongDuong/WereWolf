import { Role } from "@/shared/types/game";

interface AvatarProps {
  name: string;
  role?: Role;
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
          ${sizeMap[size]} rounded-2xl flex items-center justify-center
          bg-[#1F2937] border-2 transition-all duration-200 overflow-hidden
          ${isDead
            ? "grayscale opacity-60 border-[#4B5563]"
            : "border-[#7C3AED]/40 hover:border-[#A78BFA]"
          }
          ${isActive ? "ring-4 ring-[#7C3AED]/60 shadow-[0_0_25px_-5px] shadow-[#7C3AED]" : ""}
        `}
      >
        <span className="font-bold text-[#E5E7EB] drop-shadow-sm">{initial}</span>
      </div>

      {showRoleIcon && role && (
        <div className="absolute -bottom-1 -right-1 bg-[#111827] rounded-xl p-1 border border-[#374151] shadow-lg">
          <RoleIcon role={role} />
        </div>
      )}

      {isDead && (
        <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center">
          <span className="text-[#DC2626] text-2xl">☠️</span>
        </div>
      )}
    </div>
  );
}

function RoleIcon({ role }: { role: Role }) {
  const emojis: Record<Role, string> = {
    WEREWOLF: "🐺",
    SEER: "🔮",
    WITCH: "🧙",
    VILLAGER: "👤",
    GUARD: "🛡️",
    HUNTER: "🏹",
  };
  return <span className="text-xl">{emojis[role]}</span>;
}
