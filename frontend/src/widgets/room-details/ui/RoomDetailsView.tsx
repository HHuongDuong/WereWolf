"use client";

import { RoomInfoPanel } from "@/components/lobby/RoomInfoPanel";
import { Room } from "@/shared/types/lobby";

interface RoomDetailsViewProps {
  room: Room;
  currentUserId: string;
  onLeaveRoom: () => void;
  onStartGame: () => void;
  onConfigureRoom: (payload: { maxPlayers: number; config: Room["config"] }) => void;
}

export function RoomDetailsView({ room, currentUserId, onLeaveRoom, onStartGame, onConfigureRoom }: RoomDetailsViewProps) {
  return (
    <div className="w-full h-full overflow-y-auto relative z-10 custom-scrollbar">
      <div className="min-h-full w-full flex flex-col items-center justify-start py-10">
        <RoomInfoPanel
          room={room}
          currentUserId={currentUserId}
          onKickPlayer={(playerId) => {
            console.log("Kicking player:", playerId);
          }}
          onLeaveRoom={onLeaveRoom}
          onStartGame={onStartGame}
          onConfigureRoom={onConfigureRoom}
        />
      </div>
    </div>
  );
}
