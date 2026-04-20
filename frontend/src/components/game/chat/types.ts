export interface Message {
  id: string;
  sender?: string;
  content: string;
  timestamp: string;
  isOwn?: boolean;
  type?: "message" | "system";
  subtype?: "normal" | "death" | "vote";
  channel?: "global" | "werewolf";
}
