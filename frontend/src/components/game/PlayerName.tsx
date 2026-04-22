interface PlayerNameProps {
  name: string;
  isAlive?: boolean;
  isActive?: boolean;
}

export function PlayerName({ name, isAlive = true, isActive = false }: PlayerNameProps) {
  return (
    <p
      className={`
        font-semibold text-lg tracking-wide transition-all
        ${!isAlive ? "line-through text-[#6B7280] opacity-70" : "text-[#E5E7EB]"}
        ${isActive ? "text-[#C4B5FD] drop-shadow-[0_0_8px_#7C3AED]" : ""}
      `}
    >
      {name}
    </p>
  );
}
