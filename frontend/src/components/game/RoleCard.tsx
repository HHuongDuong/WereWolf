import { Role } from "@/shared/types/game";
import { Card } from "@/components/ui/Card";
import { RoleBadge } from "./RoleBadge";
import { roleCardFrontImageByRole } from "@/shared/lib/roleCardAssets";

const roleVisuals = {
  [Role.WEREWOLF]: {
    bg: "from-[#450A0A] to-[#991B1B]",
    accent: "#DC2626",
    emoji: "🐺",
    description: "You hunt under the full moon.",
  },
  [Role.SEER]: {
    bg: "from-[#0C4A6E] to-[#1E3A8A]",
    accent: "#3B82F6",
    emoji: "🔮",
    description: "You see what others cannot.",
  },
  [Role.WITCH]: {
    bg: "from-[#4C1D95] to-[#6B21A8]",
    accent: "#C084FC",
    emoji: "🧙",
    description: "Potions can save or doom.",
  },
  [Role.VILLAGER]: {
    bg: "from-[#14532D] to-[#166534]",
    accent: "#4ADE80",
    emoji: "👤",
    description: "Find the monsters among you.",
  },
  [Role.GUARD]: {
    bg: "from-[#052E16] to-[#14532D]",
    accent: "#16A34A",
    emoji: "🛡️",
    description: "Protect the innocent.",
  },
  [Role.HUNTER]: {
    bg: "from-[#78350F] to-[#854D0E]",
    accent: "#F59E0B",
    emoji: "🏹",
    description: "Your final shot matters.",
  },
};

interface RoleCardProps {
  role: Role;
  isRevealed?: boolean;
  onClick?: () => void;
}

export function RoleCard({ role, isRevealed = true, onClick }: RoleCardProps) {
  const visual = roleVisuals[role];

  return (
    <Card
      glow={isRevealed}
      onClick={onClick}
      className={`
        group relative overflow-hidden cursor-pointer transition-all duration-500
        hover:scale-[1.02]
      `}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${visual.bg} opacity-80`} />

      <div className="relative p-8 flex flex-col items-center text-center min-h-[280px]">
        <div
          className="text-8xl mb-6 transition-transform group-hover:scale-110"
          style={{ filter: `drop-shadow(0 0 30px ${visual.accent})` }}
        >
          <img
            src={roleCardFrontImageByRole[role]}
            alt={`${role} card`}
            className="w-28 h-40 object-cover rounded-lg border border-white/20"
          />
        </div>

        <RoleBadge role={role} size="lg" />

        <p className="mt-6 text-[#E5E7EB]/90 text-lg leading-relaxed max-w-[240px]">
          {visual.description}
        </p>

        {isRevealed && (
          <div className="absolute top-4 right-4">
            <div className="px-3 py-1 text-xs bg-black/40 rounded-full border border-white/20">
              REVEALED
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
