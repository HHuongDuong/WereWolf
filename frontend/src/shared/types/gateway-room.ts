import { RoomConfig, RoomStatus } from "@/shared/types/lobby";

export interface GatewayRoomPlayer {
  guestId: string;
  displayName: string;
}

export interface GatewayRoomUpdatedPayload {
  roomId: string;
  roomCode: string;
  hostId: string;
  status: RoomStatus;
  maxPlayers: number;
  config: RoomConfig;
  players: GatewayRoomPlayer[];
}

export interface GatewayErrorPayload {
  code: string;
  message: string;
}

export type GatewayIncomingEvent =
  | { event: "ROOM_UPDATED"; data: GatewayRoomUpdatedPayload }
  | { event: "ROOM_CANCELLED"; data: { roomId: string } }
  | { event: "ERROR"; data: GatewayErrorPayload };
