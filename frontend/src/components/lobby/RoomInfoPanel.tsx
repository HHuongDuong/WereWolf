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
        <div className="bg-[#1A1612] border-2 border-[#3A2A1A] rounded-lg shadow-inner overflow-hidden flex flex-col min-h-[520px]">
          <div className="px-4 pt-4 pb-3 border-b border-[#3A2A1A] flex items-center gap-3">
            <button
              onClick={() => setActiveTab("chat")}
              className={[
                "text-xs font-bold tracking-widest px-3 py-2 rounded-lg border transition-all",
                activeTab === "chat"
                  ? "border-[#A8C0D6]/50 text-[#D7E6F7] bg-[#A8C0D6]/10 shadow-[0_0_18px_rgba(168,192,214,0.12)]"
                  : "border-white/10 text-gray-400 hover:text-gray-200 hover:border-white/20",
              ].join(" ")}
            >
              💬 CHAT
            </button>
            <button
              onClick={() => setActiveTab("config")}
              className={[
                "text-xs font-bold tracking-widest px-3 py-2 rounded-lg border transition-all",
                activeTab === "config"
                  ? "border-[#A8C0D6]/50 text-[#D7E6F7] bg-[#A8C0D6]/10 shadow-[0_0_18px_rgba(168,192,214,0.12)]"
                  : "border-white/10 text-gray-400 hover:text-gray-200 hover:border-white/20",
              ].join(" ")}
            >
              ⚙ CONFIG
            </button>
            <div className="flex-1" />
            {!isHost && activeTab === "config" && (
              <div className="text-[10px] text-gray-500 tracking-widest uppercase">Host only</div>
            )}
          </div>

          <div className="flex-1 min-h-0 p-4">
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

                <div className="mt-4 pt-3 border-t border-[#3A2A1A] flex gap-3">
                  <input
                    type="text"
                    placeholder="Whisper into the dark..."
                    className="flex-1 bg-[#0A0806] border border-[#2A1A1A] rounded px-4 py-2 text-gray-300 placeholder-gray-600 text-sm italic focus:outline-none focus:border-[#FF4500]/50 transition-colors"
                  />
                  <button className="px-4 py-2 bg-[#2A1A1A] hover:bg-[#3A2A1A] text-gray-400 rounded text-xs font-bold tracking-widest transition-colors border border-[#3A2A1A]">
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

          <div className="p-4 border-t border-[#3A2A1A]">
            <LobbyActionPanel onLeaveRoom={onLeaveRoom} />
          </div>
        </div>
      </div>
    </div>
  );
}
