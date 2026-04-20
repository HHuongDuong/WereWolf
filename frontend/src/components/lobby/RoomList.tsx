"use client";
import { RoomCard } from "./RoomCard";
import { Room } from "@/shared/types/lobby";
import { motion, Variants } from "framer-motion";

interface RoomListProps {
  rooms: Room[];
  onJoinRoom: (roomId: string) => void;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export function RoomList({ rooms, onJoinRoom }: RoomListProps) {
  if (rooms.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center py-20"
      >
        <div className="text-7xl mb-6 opacity-30">🌕</div>
        <p className="text-brand-text-muted text-lg">No rooms available right now...</p>
        <p className="text-sm text-brand-text-dark mt-2">Create a new one or try again later</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
    >
      {rooms.map((room) => (
        <motion.div key={room.id} variants={itemVariants}>
          <RoomCard room={room} onJoin={onJoinRoom} />
        </motion.div>
      ))}
    </motion.div>
  );
}