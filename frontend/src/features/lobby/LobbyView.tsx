"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { RoomList } from "@/components/lobby/RoomList";
import { CreateRoomModal } from "@/components/lobby/CreateRoomModal";
import { JoinRoomModal } from "@/components/lobby/JoinRoomModal";

import { useLobbyStore } from "@/shared/store/useLobbyStore";

export default function LobbyView() {
  const rooms = useLobbyStore((state) => state.rooms);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const handleCreateRoom = (name: string) => {
    console.log("Creating room:", name);
    // Sau này sẽ gọi API hoặc WebSocket
  };

  const handleJoinRoom = (code: string) => {
    console.log("Joining room with code:", code);
    // Sau này sẽ điều hướng vào phòng
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-4 mb-12">
        <Button 
          variant="primary" 
          size="lg"
          onClick={() => setShowCreateModal(true)}
        >
          CREATE ROOM
        </Button>
        <Button 
          variant="secondary" 
          size="lg"
          onClick={() => setShowJoinModal(true)}
        >
          JOIN ROOM
        </Button>
      </div>

      <RoomList 
        rooms={rooms} 
        onJoinRoom={handleJoinRoom} 
      />

      <CreateRoomModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
        onCreate={handleCreateRoom}
      />

      <JoinRoomModal 
        isOpen={showJoinModal} 
        onClose={() => setShowJoinModal(false)} 
        onJoin={handleJoinRoom}
      />
    </div>
  );
}