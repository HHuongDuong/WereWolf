"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/entities/game/model/gameStore";
import { useLobbyStore } from "@/entities/room/model/lobbyStore";
import { getRoomGatewaySocket } from "@/shared/network/roomGatewaySocket";

export function RealtimeGatewayBridge() {
  const router = useRouter();
  const socket = useMemo(() => getRoomGatewaySocket(), []);
  const bootstrapGame = useGameStore((state) => state.bootstrapGame);
  const startSequence = useGameStore((state) => state.startSequence);
  const setAssignedRole = useGameStore((state) => state.setAssignedRole);
  const applyPhaseChanged = useGameStore((state) => state.applyPhaseChanged);

  useEffect(() => {
    socket.connect();
    const unsubscribe = socket.onEvent((message) => {
      if (message.event === "role_assigned") {
        const activeRoomId = useLobbyStore.getState().currentRoomId;
        if (activeRoomId) {
          bootstrapGame(activeRoomId);
        }
        setAssignedRole(message.data.role);
        if (useGameStore.getState().startSequenceStep === "idle") {
          startSequence();
        }
        router.push("/game");
        return;
      }

      if (message.event === "phase_changed") {
        applyPhaseChanged(message.data);
        router.push("/game");
      }
    });

    return () => {
      unsubscribe();
    };
  }, [applyPhaseChanged, bootstrapGame, router, setAssignedRole, socket, startSequence]);

  return null;
}
