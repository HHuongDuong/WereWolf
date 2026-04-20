"use client";

import { Player } from "@/shared/types/game";
import { PlayerAvatar } from "./PlayerAvatar";
import { PlayerName } from "./PlayerName";

interface PlayerSeatProps {
  player: Player;
  angle: number;
  radius?: number;
  isSelf?: boolean;
  onClick?: (id: string) => void;
}

export function PlayerSeat({
  player,
  angle,
  radius = 180,
  isSelf = false,
  onClick,
}: PlayerSeatProps) {
  const x = Math.cos((angle * Math.PI) / 180) * radius;
  const y = Math.sin((angle * Math.PI) / 180) * radius;

  return (
    <div
      className="absolute flex flex-col items-center cursor-pointer transition-transform hover:scale-110"
      style={{
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        transform: "translate(-50%, -50%)",
      }}
      onClick={() => onClick?.(player.id)}
    >
      <PlayerAvatar
        name={player.name}
        isAlive={player.isAlive}
        isActive={player.isActive}
        size="lg"
      />
      <div className="mt-3 text-center">
        <PlayerName
          name={player.name}
          isAlive={player.isAlive}
          isActive={player.isActive}
        />
        {isSelf && <p className="text-[#7C3AED] text-xs tracking-widest">YOU</p>}
      </div>
    </div>
  );
}
