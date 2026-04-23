"use client";

import { LobbyLayout } from "@/components/layout/LobbyLayout";
import LobbyView from "@/features/lobby/LobbyView";
import { useLobbyStore } from "@/entities/room/model/lobbyStore";

export default function LobbyPage() {
  const playerName = useLobbyStore((state) => state.playerName);

  return (
    <LobbyLayout playerName={playerName}>
      <LobbyView />
    </LobbyLayout>
  );
}
