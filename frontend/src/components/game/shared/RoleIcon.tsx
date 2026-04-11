interface RoleIconProps {
  role: string | null;
  size?: number;
}

const ROLE_CONFIG: Record<string, { color: string; path: string }> = {
  Werewolf: {
    color: "var(--wolf-red)",
    path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z",
  },
  Villager: {
    color: "var(--village-blue)",
    path: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  },
  Seer: {
    color: "var(--solo-gold)",
    path: "M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z",
  },
  Witch: {
    color: "#9b59b6",
    path: "M9 3L5 6.99h3L5 21h14L16.5 6.99H20L16 3H9zm3.5 13H11v-1.5h1.5V16zm0-3H11V9h1.5v4z",
  },
  Hunter: {
    color: "#2ecc71",
    path: "M12 2L3.5 18.5h17L12 2zm0 4l6.5 11h-13L12 6z",
  },
};

export function RoleIcon({ role, size = 24 }: RoleIconProps) {
  const config = ROLE_CONFIG[role ?? "Villager"] ?? ROLE_CONFIG["Villager"]!;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={config.color}
      xmlns="http://www.w3.org/2000/svg"
      aria-label={role ?? "Unknown"}
    >
      <path d={config.path} />
    </svg>
  );
}

export function getRoleColor(role: string | null): string {
  return ROLE_CONFIG[role ?? "Villager"]?.color ?? "var(--text-muted)";
}
