import { Player } from "./game";

export interface Room {
  id: string;
  name: string;
  hostName: string;
  hostId: string;
  code: string;
  currentPlayers: number;
  maxPlayers: number;
  players: Player[];
}
