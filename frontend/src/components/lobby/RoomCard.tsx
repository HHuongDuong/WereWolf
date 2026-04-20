import { Room } from "@/shared/types/lobby";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { HostBadge } from "./HostBadge";

interface RoomCardProps {
  room: Room;
  onJoin: (roomId: string) => void;
}

export function RoomCard({ room, onJoin }: RoomCardProps) {
  const isFull = room.currentPlayers >= room.maxPlayers;

  return (
    <Card className="hover:scale-[1.02] transition-all group">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-bold tracking-wide text-[#E5E7EB]">{room.name}</h3>
            <HostBadge isHost={true} size="sm" />
          </div>
          <p className="text-[#9CA3AF] text-sm mt-1">Hosted by {room.hostName}</p>
        </div>

        <div className={`px-4 py-1 rounded-xl text-sm font-medium tracking-widest
          ${isFull ? "bg-[#4B5563] text-white" : "bg-[#16A34A]/10 text-[#4ADE80]"}`}>
          {room.currentPlayers}/{room.maxPlayers}
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <div className="text-xs px-3 py-1 bg-[#1F2937] rounded-xl">🌕 NIGHT MODE</div>
        <div className="text-xs px-3 py-1 bg-[#1F2937] rounded-xl">6-12 PLAYERS</div>
      </div>

      <Button
        onClick={() => onJoin(room.id)}
        disabled={isFull}
        variant={isFull ? "secondary" : "primary"}
        className="w-full"
      >
        {isFull ? "ROOM FULL" : "JOIN THE TABLE"}
      </Button>
    </Card>
  );
}
