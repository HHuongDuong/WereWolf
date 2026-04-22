"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/entities/game/model/gameStore";
import { useLobbyStore } from "@/entities/room/model/lobbyStore";
import { getRoomGatewaySocket } from "@/shared/network/roomGatewaySocket";
import { GamePhase, Role } from "@/shared/types/game";
import { getOrCreateGuestId } from "@/shared/lib/guestSession";

export function RealtimeGatewayBridge() {
  const router = useRouter();
  const socket = useMemo(() => getRoomGatewaySocket(), []);
  const bootstrapGame = useGameStore((state) => state.bootstrapGame);
  const startSequence = useGameStore((state) => state.startSequence);
  const setAssignedRole = useGameStore((state) => state.setAssignedRole);
  const applyPhaseChanged = useGameStore((state) => state.applyPhaseChanged);
  const setHasActed = useGameStore((state) => state.setHasActed);
  const setWitchPotions = useGameStore((state) => state.setWitchPotions);
  const setHunterTriggered = useGameStore((state) => state.setHunterTriggered);

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
        const guestId = getOrCreateGuestId();
        const currentRole = useGameStore.getState().currentPlayerRole;
        const rawPhase = String(message.data.phase || "").toLowerCase();
        const mappedPhase =
          rawPhase === "night"
            ? GamePhase.NIGHT
            : rawPhase === "day"
              ? GamePhase.DAY
              : rawPhase === "voting"
                ? GamePhase.VOTING
                : GamePhase.NIGHT;

        const rawNightRole = message.data.currentNightRole ? String(message.data.currentNightRole).toUpperCase() : null;
        const mappedNightRole =
          rawNightRole === "GUARD"
            ? Role.GUARD
            : rawNightRole === "SEER"
              ? Role.SEER
              : rawNightRole === "WEREWOLF"
                ? Role.WEREWOLF
                : rawNightRole === "WITCH"
                  ? Role.WITCH
                  : null;

        applyPhaseChanged({
          roomId: message.data.roomId,
          phase: mappedPhase,
          round: Number(message.data.round || 1),
          deadlineTimestamp: Number(message.data.deadlineTimestamp || Date.now()),
          currentNightRole: mappedPhase === GamePhase.NIGHT ? mappedNightRole : null,
        });

        const deadIds = (message.data?.metadata?.deadIds ?? []) as string[];
        const eliminatedId = (message.data?.metadata?.eliminatedId ?? null) as string | null;
        const wasKilled = deadIds.includes(guestId) || eliminatedId === guestId;
        if (currentRole === Role.HUNTER && wasKilled) {
          setHunterTriggered(true);
          setHasActed(false);
        }

        router.push("/game");
      }

      if (message.event === "night_action_ack") {
        if (message.data.success) {
          setHasActed(true);

          const role = useGameStore.getState().currentPlayerRole;
          const lastActionKey = useGameStore.getState().lastNightActionKey;
          if (role === Role.WITCH) {
            if (lastActionKey === "heal") setWitchPotions({ healUsed: true });
            if (lastActionKey === "poison") setWitchPotions({ poisonUsed: true });
          }
          if (role === Role.HUNTER && lastActionKey === "shoot") {
            setHunterTriggered(false);
          }
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [
    applyPhaseChanged,
    bootstrapGame,
    router,
    setAssignedRole,
    setHasActed,
    setHunterTriggered,
    setWitchPotions,
    socket,
    startSequence,
  ]);

  return null;
}
