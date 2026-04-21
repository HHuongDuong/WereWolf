"use client";
import { RoomCard } from "./RoomCard";
import { Room } from "@/shared/types/lobby";
import { motion } from "framer-motion";

interface RoomListProps {
  rooms: Room[];
  onJoinRoom: (roomId: string) => void;
}

export function RoomList({ rooms, onJoinRoom }: RoomListProps) {
  // Sort anchors so lower screen positions are rendered first.
  const sortedAnchors = [
    { top: "82%", left: "25%" },
    { top: "73%", left: "57%" },
    { top: "70.5%", left: "15.5%" },
    { top: "67%", left: "45%" },
    { top: "65%", left: "31%" },
  ].sort((a, b) => parseFloat(b.top) - parseFloat(a.top));

  // Take top five rooms by capacity, then by active players.
  const visibleRooms = [...rooms]
    .sort((a, b) => {
      if (b.maxPlayers !== a.maxPlayers) {
        return b.maxPlayers - a.maxPlayers;
      }
      return b.players.length - a.players.length;
    })
    .slice(0, 5);

  if (rooms.length === 0) {
    return null;
  }

  return (
    <div className="w-full h-full relative">
      {visibleRooms.map((room, index) => {
        const pos = sortedAnchors[index];

        return (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1, zIndex: 10 }}
            transition={{ delay: index * 0.1, type: "spring" }}
            className="absolute cursor-pointer -translate-x-1/2 -translate-y-1/2"
            style={{
              top: pos.top,
              left: pos.left,
            }}
          >
            <RoomCard room={room} onJoin={onJoinRoom} />
          </motion.div>
        );
      })}
    </div>
  );
}