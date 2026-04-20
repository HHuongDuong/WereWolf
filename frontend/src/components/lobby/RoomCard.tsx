import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { HostBadge } from "./HostBadge";
import { Moon, Swords, Users } from "lucide-react";

import { Room } from "@/shared/types/lobby";

interface RoomCardProps {
  room: Room;
  onJoin: (roomId: string) => void;
}

export function RoomCard({ room, onJoin }: RoomCardProps) {
  const isFull = room.currentPlayers >= room.maxPlayers;

  return (
    <Card className="group hover:scale-[1.02] transition-all duration-300">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-brand-text-primary">{room.name}</h3>
          <p className="text-brand-text-muted text-sm mt-1">by {room.hostName}</p>
        </div>
        <div className={`px-4 py-1.5 rounded-xl text-sm font-medium tracking-widest flex items-center gap-2
          ${isFull ? "bg-brand-surface-border text-white" : "bg-brand-success/10 text-green-400 border border-green-400/30"}`}>
          <Users className="w-4 h-4" />
          {room.currentPlayers}/{room.maxPlayers}
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <div className="text-xs bg-brand-surface px-3 py-1.5 rounded-xl flex items-center gap-1.5">
          <Moon className="w-3 h-3 text-yellow-500" />
          NIGHT MODE
        </div>
        <div className="text-xs bg-brand-surface px-3 py-1.5 rounded-xl flex items-center gap-1.5">
          <Swords className="w-3 h-3 text-red-400" />
          CLASSIC
        </div>
      </div>

      <Button
        onClick={() => onJoin(room.id)}
        disabled={isFull}
        variant={isFull ? "secondary" : "primary"}
        className="w-full mt-8"
      >
        {isFull ? "ROOM IS FULL" : "JOIN THE TABLE"}
      </Button>
    </Card>
  );
}