import { Role } from "@/shared/types/game";
import { Card } from "@/components/ui/Card";
import { RoleBadge } from "./RoleBadge";

const roleDetails = {
  [Role.WEREWOLF]: {
    title: "Werewolf",
    emoji: "🐺",
    color: "#DC2626",
    ability: "Kill one player each night",
    goal: "Eliminate all villagers",
    flavor: "The howl echoes through the night...",
  },
  [Role.SEER]: {
    title: "Seer",
    emoji: "🔮",
    color: "#3B82F6",
    ability: "Learn one player's role each night",
    goal: "Identify the werewolves",
    flavor: "The truth is hidden in the moonlight.",
  },
  [Role.WITCH]: {
    title: "Witch",
    emoji: "🧙",
    color: "#C084FC",
    ability: "Save or poison once per game",
    goal: "Help the village survive",
    flavor: "One potion can change destiny.",
  },
  [Role.VILLAGER]: {
    title: "Villager",
    emoji: "👤",
    color: "#4ADE80",
    ability: "No special power",
    goal: "Vote out the werewolves",
    flavor: "Trust no one.",
  },
  [Role.GUARD]: {
    title: "Guard",
    emoji: "🛡️",
    color: "#16A34A",
    ability: "Protect one player each night",
    goal: "Shield the innocent",
    flavor: "Your vigilance saves lives.",
  },
  [Role.HUNTER]: {
    title: "Hunter",
    emoji: "🏹",
    color: "#F59E0B",
    ability: "Take one player with you when you die",
    goal: "Revenge from beyond",
    flavor: "Your arrow flies true even in death.",
  },
};

interface RoleDescriptionPanelProps {
  role: Role;
}

export function RoleDescriptionPanel({ role }: RoleDescriptionPanelProps) {
  const details = roleDetails[role];

  return (
    <Card className="max-w-lg">
      <div className="flex items-center gap-6 mb-8">
        <div className="text-7xl" style={{ filter: `drop-shadow(0 0 25px ${details.color})` }}>
          {details.emoji}
        </div>
        <div>
          <RoleBadge role={role} size="lg" />
          <p className="mt-2 text-[#9CA3AF]">{details.flavor}</p>
        </div>
      </div>

      <div className="space-y-6 text-[#E5E7EB]">
        <div>
          <div className="uppercase text-xs tracking-widest text-[#9CA3AF] mb-1">ABILITY</div>
          <p className="text-lg">{details.ability}</p>
        </div>

        <div>
          <div className="uppercase text-xs tracking-widest text-[#9CA3AF] mb-1">OBJECTIVE</div>
          <p className="text-lg">{details.goal}</p>
        </div>
      </div>
    </Card>
  );
}
