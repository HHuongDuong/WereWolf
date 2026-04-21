"use client";

interface RoomHeaderProps {
  name: string;
  code: string;
  hostName: string;
  currentPlayers: number;
  maxPlayers: number;
  status?: string;
}

export function RoomHeader({
  name,
  code,
  hostName,
  currentPlayers,
  maxPlayers,
  status,
}: RoomHeaderProps) {
  const shortCode = code.split("-")[1] || code;
  const labelStatus = (status || "waiting").replaceAll("_", " ");

  return (
    <div className="panel py-3">
      <div className="panel-overlay texture-dark" />
      <div className="panel-overlay bg-gradient-to-r from-[#2B130D]/25 via-transparent to-[#102130]/25" />

      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="min-w-0 flex items-center gap-3">
          <div className="text-sm font-black tracking-widest text-[#D7E6F7] uppercase whitespace-nowrap">
            {name}
          </div>

          <div className="text-sm font-bold text-[#B7C9DB] whitespace-nowrap">
            ROOM <span className="room-code">#{shortCode}</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-300 truncate">
            <span className="opacity-70">HOST</span>
            <span className="text-white font-semibold truncate">{hostName}</span>
            <span className="opacity-30">|</span>
            <span className="whitespace-nowrap">
              {currentPlayers}/{maxPlayers} Players
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="text-xs text-gray-300 sm:hidden whitespace-nowrap">
            {currentPlayers}/{maxPlayers}
          </div>
          <span className="px-2 py-1 rounded-full border border-white/10 bg-black/30 text-[10px] font-bold tracking-widest text-[#D7C9B8] uppercase">
            {labelStatus}
          </span>
          <span className="text-xs text-gray-400 whitespace-nowrap">Waiting...</span>
        </div>
      </div>
    </div>
  );
}
