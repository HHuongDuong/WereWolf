"use client";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (roomName: string) => void;
}

export function CreateRoomModal({ isOpen, onClose, onCreate }: CreateRoomModalProps) {
  const [roomName, setRoomName] = useState("");

  const handleCreate = () => {
    if (roomName.trim()) {
      onCreate(roomName.trim());
      onClose();
      setRoomName("");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Room">
      <Input
        label="Room Name"
        placeholder="The Howling Table"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
      />

      <div className="mt-8 flex gap-4">
        <Button variant="secondary" onClick={onClose} className="flex-1">
          CANCEL
        </Button>
        <Button 
          variant="primary" 
          onClick={handleCreate} 
          disabled={!roomName.trim()}
          className="flex-1"
        >
          CREATE ROOM
        </Button>
      </div>
    </Modal>
  );
}