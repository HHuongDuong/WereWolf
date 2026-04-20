"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (roomCode: string) => void;
}

export function JoinRoomModal({ isOpen, onClose, onJoin }: JoinRoomModalProps) {
  const [roomCode, setRoomCode] = useState("");

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Join Room">
      <Input
        label="Room Code"
        placeholder="WOLF-4831"
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value)}
      />
      <Button
        onClick={() => onJoin(roomCode)}
        className="w-full mt-6"
        disabled={!roomCode.trim()}
      >
        JOIN THE TABLE
      </Button>
    </Modal>
  );
}
