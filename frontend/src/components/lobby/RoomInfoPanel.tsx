"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Room } from "@/shared/types/lobby";
import { PlayerSlot } from "./PlayerSlot";
import { EmptySlot } from "./EmptySlot";
import { RoomHeader } from "./RoomHeader";
import { GameStatusPanel } from "./GameStatusPanel";
import { LobbyActionPanel } from "./ActionPanel";
import { RoomConfigPanel } from "./RoomConfigPanel";

interface RoomInfoPanelProps {
  room: Room;
  currentUserId: string;
  onKickPlayer: (playerId: string) => void;
  onLeaveRoom: () => void;
  onStartGame: () => void;
  onConfigureRoom: (payload: { maxPlayers: number; config: Room["config"] }) => void;
}

export function RoomInfoPanel({
  room,
  currentUserId,
  onKickPlayer,
  onLeaveRoom,
  onStartGame,
  onConfigureRoom,
}: RoomInfoPanelProps) {
  const isHost = room.hostId === currentUserId;
  const enoughPlayers = room.players.length >= room.maxPlayers;
  const [activeTab, setActiveTab] = useState<"chat" | "config">("chat");
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const messages = useMemo(
    () => [
      { who: "System", text: "The blood moon rises over the square..." },
      { who: "Vesper", text: "Ready to hunt or be hunted." },
      { who: "Thorne", text: "We need two more souls before we begin." },
    ],
    [],
  );

  useEffect(() => {
    if (activeTab !== "chat") return;
    const el = chatScrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [activeTab, messages.length]);
  const gameState = {
    isHost,
    enoughPlayers,
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-4 p-4 sm:p-6 font-sans">
      <RoomHeader
        name={room.name}
        code={room.code}
        hostName={room.hostName}
        currentPlayers={room.players.length}
        maxPlayers={room.maxPlayers}
        status={room.status}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 items-start">
        {/* LEFT: Player Grid */}
        <div className="flex flex-col gap-4">
          <GameStatusPanel
            isHost={gameState.isHost}
            canStart={gameState.enoughPlayers}
            currentPlayers={room.players.length}
            maxPlayers={room.maxPlayers}
            onStart={onStartGame}
          />

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 place-items-stretch">
            {room.players.map((player) => (
              <PlayerSlot
                key={player.id}
                player={player}
                isHost={room.hostId === player.id}
                isCurrentUser={player.id === currentUserId}
                canKick={isHost && player.id !== currentUserId}
                onKick={onKickPlayer}
              />
            ))}
            {Array.from({ length: Math.max(0, room.maxPlayers - room.players.length) }).map((_, i) => (
              <EmptySlot key={i} />
            ))}
          </div>
        </div>

        {/* RIGHT: Tabs + Actions */}
        <div className="bg-black/40 border border-white/10 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-md overflow-hidden flex flex-col min-h-[520px] relative">
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/stardust.png')" }} />
          
          <div className="px-4 pt-4 pb-3 border-b border-white/10 flex items-center gap-3 relative z-10">
            <button
              onClick={() => setActiveTab("chat")}
              className={[
                "text-xs font-bold tracking-widest px-3 py-2 rounded-lg border transition-all",
                activeTab === "chat"
                  ? "border-brand-moonlight/50 text-brand-moonlight bg-brand-moonlight/10 shadow-[0_0_15px_rgba(168,192,214,0.15)]"
                  : "border-white/10 text-gray-400 hover:text-gray-200 hover:border-white/20 hover:bg-white/5",
              ].join(" ")}
            >
              💬 CHAT
            </button>
            <button
              onClick={() => setActiveTab("config")}
              className={[
                "text-xs font-bold tracking-widest px-3 py-2 rounded-lg border transition-all",
                activeTab === "config"
                  ? "border-brand-moonlight/50 text-brand-moonlight bg-brand-moonlight/10 shadow-[0_0_15px_rgba(168,192,214,0.15)]"
                  : "border-white/10 text-gray-400 hover:text-gray-200 hover:border-white/20 hover:bg-white/5",
              ].join(" ")}
            >
              ⚙ CONFIG
            </button>
            <div className="flex-1" />
            {!isHost && activeTab === "config" && (
              <div className="text-[10px] text-gray-500 tracking-widest uppercase">Host only</div>
            )}
          </div>

          <div className="flex-1 min-h-0 p-4 relative z-10">
            {activeTab === "chat" ? (
              <div className="h-full flex flex-col">
                <div
                  ref={chatScrollRef}
                  className="flex-1 min-h-0 overflow-y-auto space-y-3 text-sm font-serif pr-2 custom-scrollbar"
                >
                  {messages.map((m, idx) => (
                    <div key={idx} className="text-gray-300">
                      <span className={m.who === "System" ? "text-gray-500 italic" : "text-[#A8C0D6] font-bold"}>
                        {m.who}:
                      </span>{" "}
                      <span className={m.who === "System" ? "text-gray-500 italic" : ""}>{m.text}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex gap-3 relative z-10">
                  <input
                    type="text"
                    placeholder="Whisper into the dark..."
                    className="flex-1 bg-black/50 border border-white/10 rounded px-4 py-2 text-gray-300 placeholder-gray-600 text-sm italic focus:outline-none focus:border-brand-moonlight/50 focus:shadow-[0_0_10px_rgba(168,192,214,0.2)] transition-all"
                  />
                  <button className="px-4 py-2 bg-brand-moonlight/10 hover:bg-brand-moonlight/20 text-brand-moonlight rounded text-xs font-bold tracking-[0.2em] transition-colors border border-brand-moonlight/30 shadow-[0_0_10px_rgba(168,192,214,0.1)] hover:shadow-[0_0_15px_rgba(168,192,214,0.3)]">
                    SEND
                  </button>
                </div>
              </div>
            ) : (
              <RoomConfigPanel
                maxPlayers={room.maxPlayers}
                config={room.config}
                onSave={onConfigureRoom}
                disabled={!isHost}
              />
            )}
          </div>

          <div className="p-4 border-t border-white/10 relative z-10">
            <LobbyActionPanel onLeaveRoom={onLeaveRoom} />
          </div>
        </div>
      </div>
    </div>
  );
}
