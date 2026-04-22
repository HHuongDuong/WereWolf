"use client";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (code: string) => void;
}

export function JoinRoomModal({ isOpen, onClose, onJoin }: JoinRoomModalProps) {
  const [roomCode, setRoomCode] = useState("");

  const handleJoin = () => {
    if (roomCode.trim()) {
      onJoin(roomCode.trim().toUpperCase());
      onClose();
      setRoomCode("");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Join Room">
      <Input
        label="Room Code"
        placeholder="WOLF-4831"
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value)}
        className="uppercase"
      />

      <div className="mt-8 flex gap-4">
        <Button variant="secondary" onClick={onClose} className="flex-1">
          CANCEL
        </Button>
        <Button 
          variant="primary" 
          onClick={handleJoin} 
          disabled={!roomCode.trim()}
          className="flex-1"
        >
          JOIN ROOM
        </Button>
      </div>
    </Modal>
  );
}