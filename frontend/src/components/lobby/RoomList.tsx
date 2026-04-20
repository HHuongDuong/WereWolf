import { Room } from "@/shared/types/lobby";
import { RoomCard } from "./RoomCard";

interface RoomListProps {
  rooms: Room[];
  onJoinRoom: (roomId: string) => void;
}

export function RoomList({ rooms, onJoinRoom }: RoomListProps) {
  if (rooms.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-6 opacity-40">🌕</div>
        <p className="text-[#9CA3AF]">No rooms available under the moonlight...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {rooms.map((room) => (
        <RoomCard key={room.id} room={room} onJoin={onJoinRoom} />
      ))}
    </div>
  );
}
