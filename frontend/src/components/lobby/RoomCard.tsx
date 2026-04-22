import { Flame } from "lucide-react";
import { Room } from "@/shared/types/lobby";

interface RoomCardProps {
  room: Room;
  onJoin: (roomId: string) => void;
}

export function RoomCard({ room, onJoin }: RoomCardProps) {
  const currentPlayers = room.players.length;
  const isFull = currentPlayers >= room.maxPlayers;
  const fullnessRatio = currentPlayers / room.maxPlayers;

  // Calculate flame size and glow based on players
  const flameSize = 18 + (fullnessRatio * 24); // 24px to 56px
  const glowOpacity = 0.2 + (fullnessRatio * 0.6);

  return (
    <div className="relative group cursor-pointer" onClick={() => !isFull && onJoin(room.id)}>
      {/* Campfire Hitbox & Visuals */}
      <div className="relative flex flex-col items-center justify-center group-hover:scale-110 transition-transform duration-500 w-24 h-24">
        {/* Subtle Interactive Glow on Hover only */}
        <div
          className="absolute bg-[#FF8A00] rounded-full blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500"
          style={{ width: flameSize * 2, height: flameSize * 2 }}
        />

        {/* Player Dots (Silhouettes sitting around the actual background fire) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[...Array(currentPlayers)].map((_, i) => {
            const angle = (i / room.maxPlayers) * 360;
            const radius = 25 + (flameSize / 2);
            const x = (Math.cos(angle * Math.PI / 180) * radius).toFixed(2);
            const y = (Math.sin(angle * Math.PI / 180) * radius).toFixed(2);
            return (
              <div
                key={i}
                className="absolute w-2.5 h-3 bg-[#0B0B12] rounded-t-full shadow-[0_-2px_4px_rgba(255,138,0,0.6)] border-t border-[#FF8A00]/40"
                style={{ transform: `translate(${x}px, ${y}px)` }}
              />
            );
          })}
        </div>
      </div>

      {/* Hover Tooltip (Room Info) */}
      <div className="absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 mb-4 w-48 bg-[#111]/95 backdrop-blur-md border border-white/10 rounded-xl p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20 shadow-2xl translate-y-2 group-hover:translate-y-0">
        <h3 className="text-sm font-bold text-white mb-1 tracking-wide">{room.name}</h3>
        <p className="text-[10px] text-brand-moonlight mb-3">Host: {room.hostName}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-red-500/20 border border-red-500/30 rounded-md flex items-center justify-center text-[10px] shadow-[0_0_10px_rgba(239,68,68,0.2)]">🐺</div>
            <div className="w-5 h-5 bg-blue-500/20 border border-blue-500/30 rounded-md flex items-center justify-center text-[10px] shadow-[0_0_10px_rgba(59,130,246,0.2)]">👁️</div>
          </div>
          <div className="text-xs font-bold text-[#FFB82E] bg-[#FFB82E]/10 border border-[#FFB82E]/30 px-2 py-1 rounded-lg">
            {currentPlayers}/{room.maxPlayers}
          </div>
        </div>

        {/* Pointer */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#111]/95" />
      </div>
    </div>
  );
}