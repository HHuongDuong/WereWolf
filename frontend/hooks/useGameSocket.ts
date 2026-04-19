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
      const state = useGameStore.getState();
      
      // Phòng hờ Race condition: Backend xử lý rời phòng và bắn Kafka event (ROOM_UPDATED) 
      // NHANH HƠN việc Gateway xoá socket khỏi roomMembers, dẫn đến FE nhận được 
      // cục state phòng dù đã ấn Rời Phòng. 
      // => Check xem guestId của mìnnh còn trong list players trả về không.
      const isMeInRoom = data.players?.some((p: any) => p.guestId === state.myGuestId);
      if (!isMeInRoom) {
        // Nếu không có mình trong phòng, chắc chắn mình đã out. Force update status về idle.
        useGameStore.getState().reset();
        return;
      }

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
      const state = useGameStore.getState();
      
      // Lúc trước chúng ta chặn mọi ERROR nếu roomStatus === 'idle' (tức là đang ở màn Home).
      // Nhưng việc này vô tình chặn luôn cả các lỗi VALIDATION khi người dùng dán mã Join hoặc sai tên.
      // Giải pháp: Chỉ bỏ qua nếu đó là lỗi do disconnect/leave room đồng thời đang ở màn Home.
      if (state.roomStatus === 'idle' && (data.code === 'ROOM_NOT_FOUND' || data.code === 'SOCKET_NOT_FOUND')) {
        return;
      }
      
      setToast(data.message || "Đã xảy ra lỗi", "error");
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
