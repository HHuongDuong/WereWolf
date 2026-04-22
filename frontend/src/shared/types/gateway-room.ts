import { RoomConfig, RoomStatus } from "@/shared/types/lobby";
import { PhaseChangedPayload, Role } from "@/shared/types/game";

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

export interface GatewayRoleAssignedPayload {
  role: Role;
}

export interface GatewayNightActionAckPayload {
  actionType: string;
  success: boolean;
  reason?: string;
}

export interface GatewayVoteStartedPayload {
  round: number;
  durationSec: number;
  candidates: string[];
}

export type GatewayIncomingEvent =
  | { event: "ROOM_UPDATED"; data: GatewayRoomUpdatedPayload }
  | { event: "ROOM_CANCELLED"; data: { roomId: string } }
  | { event: "ERROR"; data: GatewayErrorPayload }
  | { event: "role_assigned"; data: GatewayRoleAssignedPayload }
  | { event: "phase_changed"; data: any }
  | { event: "night_action_ack"; data: GatewayNightActionAckPayload }
  | { event: "vote_started"; data: GatewayVoteStartedPayload };
