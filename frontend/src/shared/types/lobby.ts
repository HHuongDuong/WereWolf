import { Player } from "./game";

export interface RoomConfig {
  guardDuration: number;
  seerDuration: number;
  werewolfDuration: number;
  witchDuration: number;
  discussDuration: number;
  voteDuration: number;
}

export type RoomStatus = "waiting" | "in_game" | "finished";

export interface Room {
  id: string;
  name: string;
  hostName: string;
  hostId: string;
  code: string;
  status?: RoomStatus;
  config?: RoomConfig;
  maxPlayers: number;
  players: Player[];
}
