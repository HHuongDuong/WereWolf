"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (roomName: string) => void;
}

export function CreateRoomModal({ isOpen, onClose, onCreate }: CreateRoomModalProps) {
  const [roomName, setRoomName] = useState("");

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Room">
      <Input
        label="Room Name"
        placeholder="The Howling Moon"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
      />
      <Button
        onClick={() => onCreate(roomName)}
        className="w-full mt-6"
        disabled={!roomName.trim()}
      >
        CREATE ROOM UNDER THE MOON
      </Button>
    </Modal>
  );
}
