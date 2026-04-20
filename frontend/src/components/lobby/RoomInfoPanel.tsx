"use client";

import { Room } from "@/shared/types/lobby";
import { PlayerSlot } from "./PlayerSlot";
import { EmptySlot } from "./EmptySlot";
import { StartGameButton } from "./StartGameButton";
import { LeaveRoomButton } from "./LeaveRoomButton";

interface RoomInfoPanelProps {
  room: Room;
  currentUserId: string;
  onReadyChange: (ready: boolean) => void;
  onKickPlayer: (playerId: string) => void;
  onLeaveRoom: () => void;
  onStartGame: () => void;
}

export function RoomInfoPanel({
  room,
  currentUserId,
  onReadyChange,
  onKickPlayer,
  onLeaveRoom,
  onStartGame,
}: RoomInfoPanelProps) {
  const isHost = room.hostId === currentUserId;
  const allReady = room.players.every((p) => p.isReady) && room.players.length >= 6;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold tracking-wide">{room.name}</h1>
          <p className="text-[#9CA3AF]">Room Code: <span className="font-mono text-[#7C3AED]">{room.code}</span></p>
        </div>
        <LeaveRoomButton onLeave={onLeaveRoom} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {room.players.map((player) => (
              <PlayerSlot
                key={player.id}
                player={player}
                isHost={room.hostId === player.id}
                isCurrentUser={player.id === currentUserId}
                canKick={isHost && player.id !== currentUserId}
                onKick={onKickPlayer}
                onReadyChange={onReadyChange}
              />
            ))}

            {Array.from({ length: room.maxPlayers - room.players.length }).map((_, i) => (
              <EmptySlot key={i} />
            ))}
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="sticky top-8 space-y-6">
            <div className="bg-[#111827] rounded-3xl p-8">
              <h4 className="uppercase tracking-widest text-sm text-[#9CA3AF] mb-6">ROOM SETTINGS</h4>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between"><span>Players</span><span>{room.currentPlayers}/{room.maxPlayers}</span></div>
                <div className="flex justify-between"><span>Game Speed</span><span>Normal</span></div>
                <div className="flex justify-between"><span>Roles</span><span>Classic Set</span></div>
              </div>
            </div>

            {isHost && (
              <StartGameButton
                onStart={onStartGame}
                disabled={!allReady}
                playerCount={room.currentPlayers}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
