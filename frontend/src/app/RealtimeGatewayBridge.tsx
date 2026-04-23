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
  const setIsAlive = useGameStore((state) => state.setIsAlive);
  const setHasActed = useGameStore((state) => state.setHasActed);
  const setWitchPotions = useGameStore((state) => state.setWitchPotions);
  const setHunterTriggered = useGameStore((state) => state.setHunterTriggered);
  const setSeerReveal = useGameStore((state) => state.setSeerReveal);
  const markPlayersDead = useLobbyStore((state) => state.markPlayersDead);

  useEffect(() => {
    socket.connect();
    const unsubscribe = socket.onEvent((message) => {
      if (message.event === "role_assigned") {
        const activeRoomId = useLobbyStore.getState().currentRoomId;
        if (activeRoomId) {
          bootstrapGame(activeRoomId);
        }
        const fellowWolves = message.data.fellowWolves || message.data.metadata?.fellowWolves;
        setAssignedRole(message.data.role, fellowWolves);
        setIsAlive(true);
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
          deadIds: message.data?.metadata?.deadIds ?? [],
          eliminatedId: message.data?.metadata?.eliminatedId ?? null,
        });

        const incomingFellowWolves = message.data.fellowWolves || message.data.metadata?.fellowWolves;
        if (incomingFellowWolves && Array.isArray(incomingFellowWolves)) {
          useGameStore.getState().setFellowWolves(incomingFellowWolves);
        }

        const deadIds = (message.data?.metadata?.deadIds ?? []) as string[];
        const eliminatedId = (message.data?.metadata?.eliminatedId ?? null) as string | null;
        const newlyDead = Array.from(new Set([...(deadIds ?? []), ...(eliminatedId ? [eliminatedId] : [])]));
        if (newlyDead.length > 0 && message.data.roomId) {
          markPlayersDead(message.data.roomId, newlyDead);
        }
        const wasKilled = deadIds.includes(guestId) || eliminatedId === guestId;
        if (wasKilled) {
          setIsAlive(false);
        }
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

      if (message.event === "seer_result") {
        const revealedRole = message.data.revealedRole === "WEREWOLF" ? Role.WEREWOLF : Role.VILLAGER;
        setSeerReveal({
          targetId: message.data.targetId,
          revealedRole,
        });
      }

      if (message.event === "vote_ack" && message.data?.success) {
        setHasActed(true);
      }

      if (message.event === "vote_started") {
        if (message.data.voteType !== "DAY") {
          return;
        }
        const roomId = useGameStore.getState().roomId ?? useLobbyStore.getState().currentRoomId;
        applyPhaseChanged({
          roomId: roomId || "",
          phase: GamePhase.VOTING,
          round: Number(message.data.round || useGameStore.getState().round || 1),
          deadlineTimestamp: Date.now() + Number(message.data.durationSec || 30) * 1000,
          currentNightRole: null,
        });
        setHasActed(false);
      }

      if (message.event === "chat_message") {
        const chatMessage = {
          senderName: message.data.senderName,
          channel: message.data.channel,
          content: message.data.content,
          sentAt: message.data.sentAt,
        };
        useGameStore.getState().addChatMessage(chatMessage);
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
    setIsAlive,
    setHasActed,
    setHunterTriggered,
    setSeerReveal,
    setWitchPotions,
    markPlayersDead,
    socket,
    startSequence,
  ]);

  return null;
}
