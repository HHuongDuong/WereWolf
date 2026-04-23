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
  fellowWolves?: string[];
  metadata?: {
    fellowWolves?: string[];
  };
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
  voteType: "DAY" | "WOLF";
}

export interface GatewayVoteAckPayload {
  success: boolean;
  round: number;
  targetId: string;
  reason?: string;
}

export interface GatewayJoinRoomAckPayload {
  roomId: string;
  roomCode: string;
  success: boolean;
}

export interface GatewaySeerResultPayload {
  targetId: string;
  revealedRole: "VILLAGER" | "WEREWOLF";
}

export type GatewayIncomingEvent =
  | { event: "ROOM_UPDATED"; data: GatewayRoomUpdatedPayload }
  | { event: "ROOM_CANCELLED"; data: { roomId: string } }
  | { event: "ERROR"; data: GatewayErrorPayload }
  | { event: "join_room_ack"; data: GatewayJoinRoomAckPayload }
  | { event: "seer_result"; data: GatewaySeerResultPayload }
  | { event: "role_assigned"; data: GatewayRoleAssignedPayload }
  | { event: "phase_changed"; data: any }
  | { event: "night_action_ack"; data: GatewayNightActionAckPayload }
  | { event: "vote_started"; data: GatewayVoteStartedPayload }
  | { event: "vote_ack"; data: GatewayVoteAckPayload };
