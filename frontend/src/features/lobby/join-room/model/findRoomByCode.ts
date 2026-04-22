import { Room } from "@/shared/types/lobby";

export function findRoomByCode(rooms: Room[], code: string) {
  const normalizedCode = code.trim().toUpperCase();
  if (!normalizedCode) {
    return null;
  }

  return rooms.find((room) => room.code === normalizedCode) || null;
}
