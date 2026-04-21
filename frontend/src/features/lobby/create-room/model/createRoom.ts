import { Player, Role } from "@/shared/types/game";
import { Room } from "@/shared/types/lobby";

function buildRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function buildRoomId() {
  return Math.random().toString(36).substring(7);
}

export function createLobbyRoom({
  roomName,
  hostName,
  hostId,
}: {
  roomName: string;
  hostName: string;
  hostId: string;
}): Room {
  const hostPlayer: Player = {
    id: hostId,
    name: hostName,
    role: Role.VILLAGER,
    isAlive: true,
  };

  return {
    id: buildRoomId(),
    name: roomName || "Gathering",
    code: buildRoomCode(),
    hostName,
    hostId,
    maxPlayers: 12,
    players: [hostPlayer],
  };
}
