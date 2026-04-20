import { Role } from "@/shared/types/game";

interface PlayerRoleProps {
  role: Role;
  isRevealed?: boolean;
}

const roleColors: Record<Role, string> = {
  WEREWOLF: "text-[#EF4444] drop-shadow-[0_0_6px_#DC2626]",
  SEER: "text-[#60A5FA]",
  WITCH: "text-[#C084FC]",
  VILLAGER: "text-[#4ADE80]",
  GUARD: "text-[#93C5FD]",
  HUNTER: "text-[#FBBF24]",
};

export function PlayerRole({ role, isRevealed = false }: PlayerRoleProps) {
  if (!isRevealed) return null;

  return (
    <p className={`text-sm font-medium uppercase tracking-widest ${roleColors[role]}`}>
      {role.replace("_", " ")}
    </p>
  );
}
