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
            {room.players.map((player, index) => (
              <PlayerSlot
                key={player.id}
                player={player}
                isHost={room.hostId === player.id}
                isCurrentUser={player.id === currentUserId}
                canKick={false}
                onKick={() => {}}
                seatIndex={index + 1}
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
            <h3 className="text-sm font-serif font-bold tracking-widest text-brand-moonlight px-3 py-2">
              ⚙ CONFIG
            </h3>
            <div className="flex-1" />
            {!isHost && (
              <div className="text-[10px] text-gray-500 tracking-widest uppercase">Host only</div>
            )}
          </div>

          <div className="flex-1 min-h-0 p-4 relative z-10">
              <RoomConfigPanel
                maxPlayers={room.maxPlayers}
                config={room.config}
                onSave={onConfigureRoom}
                disabled={!isHost}
              />
          </div>

          <div className="p-4 border-t border-white/10 relative z-10">
            <LobbyActionPanel onLeaveRoom={onLeaveRoom} />
          </div>
        </div>
      </div>
    </div>
  );
}
