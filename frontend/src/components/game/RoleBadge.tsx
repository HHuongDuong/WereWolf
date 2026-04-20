import { Role } from "@/shared/types/game";

const roleConfig = {
  [Role.WEREWOLF]: {
    color: "bg-[#991B1B] text-white border-[#EF4444]",
    glow: "shadow-[0_0_20px_#DC2626]",
    emoji: "🐺",
    label: "WEREWOLF",
  },
  [Role.SEER]: {
    color: "bg-[#1E3A8A] text-white border-[#60A5FA]",
    glow: "shadow-[0_0_20px_#3B82F6]",
    emoji: "🔮",
    label: "SEER",
  },
  [Role.WITCH]: {
    color: "bg-[#6B21A8] text-white border-[#C084FC]",
    glow: "shadow-[0_0_20px_#A855F7]",
    emoji: "🧙",
    label: "WITCH",
  },
  [Role.VILLAGER]: {
    color: "bg-[#166534] text-white border-[#4ADE80]",
    glow: "",
    emoji: "👤",
    label: "VILLAGER",
  },
  [Role.GUARD]: {
    color: "bg-[#14532D] text-white border-[#4ADE80]",
    glow: "shadow-[0_0_20px_#16A34A]",
    emoji: "🛡️",
    label: "GUARD",
  },
  [Role.HUNTER]: {
    color: "bg-[#854D0E] text-white border-[#FBBF24]",
    glow: "shadow-[0_0_15px_#F59E0B]",
    emoji: "🏹",
    label: "HUNTER",
  },
};

interface RoleBadgeProps {
  role: Role;
  size?: "sm" | "md" | "lg";
  showEmoji?: boolean;
}

export function RoleBadge({ role, size = "md", showEmoji = true }: RoleBadgeProps) {
  const config = roleConfig[role];

  const sizeClasses = {
    sm: "text-xs px-3 py-1",
    md: "text-sm px-5 py-2",
    lg: "text-base px-6 py-3",
  };

  return (
    <div
      className={`
        inline-flex items-center gap-2 font-bold uppercase tracking-[2px] rounded-2xl border
        ${config.color} ${config.glow} ${sizeClasses[size]}
        transition-all duration-300
      `}
    >
      {showEmoji && <span className="text-xl">{config.emoji}</span>}
      {config.label}
    </div>
  );
}
