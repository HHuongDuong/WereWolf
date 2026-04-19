"use client";

import { useEffect } from "react";
import { socketManger } from "@/lib/socket";
import { useGameStore } from "@/store/gameStore";

export function useGameSocket() {
  const { setRoomState, setRole, updateChat, setToast } = useGameStore();

  useEffect(() => {
    socketManger.connect();

    // Handlers
    const onRoomUpdated = (data: any) => {
      setRoomState({
        roomId: data.roomId,
        roomCode: data.roomCode,
        hostId: data.hostId,
        roomStatus: data.status,
        maxPlayers: data.maxPlayers,
        config: data.config || {},
        players: data.players || [],
      });
    };

    const onError = (data: any) => {
      setToast(data.message || "Đã xảy ra lỗi", "error");
      // Reset loading states on error
      const state = useGameStore.getState();
      if (state.roomStatus === 'idle') {
        // User is on landing page, likely failed CREATE_ROOM or JOIN_ROOM
        // The page components will handle their own loading state reset via timeout
      }
    };

    const onRoomCancelled = () => {
      setToast("Phòng đã bị huỷ", "info");
      useGameStore.getState().reset(); // Resets back to idle
    };

    const onRoleAssigned = (data: any) => {
      setRole(data.role);
    };

    const onPhaseChanged = (data: any) => {
      setRoomState({
        phase: data.phase,
        round: data.round,
        deadlineTimestamp: data.deadlineTimestamp,
        deadPlayers: [...useGameStore.getState().deadPlayers, ...(data.metadata?.deadIds || [])],
        eliminatedId: data.metadata?.eliminatedId || null,
      });
    };

    const onWitchInfo = (data: any) => {
      setRoomState({ werewolfKillTargetId: data.werewolfKillTargetId });
    };

    socketManger.on("ROOM_UPDATED", onRoomUpdated);
    socketManger.on("ERROR", onError);
    socketManger.on("ROOM_CANCELLED", onRoomCancelled);
    socketManger.on("role_assigned", onRoleAssigned);
    socketManger.on("phase_changed", onPhaseChanged);
    socketManger.on("witch_info", onWitchInfo);
    
    // We can add more handlers later

    return () => {
      socketManger.off("ROOM_UPDATED", onRoomUpdated);
      socketManger.off("ERROR", onError);
      socketManger.off("ROOM_CANCELLED", onRoomCancelled);
      socketManger.off("role_assigned", onRoleAssigned);
      socketManger.off("phase_changed", onPhaseChanged);
      socketManger.off("witch_info", onWitchInfo);
    };
  }, [setRoomState, setRole, setToast]);

  return { emit: socketManger.emit.bind(socketManger) };
}
