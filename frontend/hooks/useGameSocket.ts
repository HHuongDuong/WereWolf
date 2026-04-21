"use client";

import { useEffect, useCallback } from "react";
import { socketManger } from "@/lib/socket";
import { useGameStore } from "@/store/gameStore";

export function useGameSocket() {
  const { setRoomState, setRole, updateChat, setToast } = useGameStore();

  // Wrap all handlers in useCallback to maintain stable references
  const onRoomUpdated = useCallback((data: any) => {
      const state = useGameStore.getState();
      
      // Store session data for reconnection
      if (data.roomId && state.myGuestId) {
        socketManger.setSessionData(state.myGuestId, data.roomId);
      }
      
      // Phòng hờ Race condition: Backend xử lý rời phòng và bắn Kafka event (ROOM_UPDATED) 
      // NHANH HƠN việc Gateway xoá socket khỏi roomMembers, dẫn đến FE nhận được 
      // cục state phòng dù đã ấn Rời Phòng. 
      // => Check xem guestId của mìnnh còn trong list players trả về không.
      const isMeInRoom = data.players?.some((p: any) => p.guestId === state.myGuestId);
      if (!isMeInRoom) {
        // Nếu không có mình trong phòng, chắc chắn mình đã out. Force update status về idle.
        useGameStore.getState().reset();
        socketManger.clearSessionData();
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
    }, [setRoomState]);

    const onError = useCallback((data: any) => {
      const state = useGameStore.getState();
      
      // Lúc trước chúng ta chặn mọi ERROR nếu roomStatus === 'idle' (tức là đang ở màn Home).
      // Nhưng việc này vô tình chặn luôn cả các lỗi VALIDATION khi người dùng dán mã Join hoặc sai tên.
      // Giải pháp: Chỉ bỏ qua nếu đó là lỗi do disconnect/leave room đồng thời đang ở màn Home.
      if (state.roomStatus === 'idle' && (data.code === 'ROOM_NOT_FOUND' || data.code === 'SOCKET_NOT_FOUND')) {
        return;
      }
      
      setToast(data.message || "Đã xảy ra lỗi", "error");
    }, [setToast]);

    const onRoomCancelled = useCallback(() => {
      setToast("Phòng đã bị huỷ", "info");
      useGameStore.getState().reset(); // Resets back to idle
      socketManger.clearSessionData();
    }, [setToast]);

    const onRoleAssigned = useCallback((data: any) => {
      setRole(data.role);
    }, [setRole]);

    const onPhaseChanged = useCallback((data: any) => {
      const newDeadPlayers = [...useGameStore.getState().deadPlayers];
      
      // Add players who died during night (werewolf/witch kills)
      if (data.metadata?.deadIds) {
        newDeadPlayers.push(...data.metadata.deadIds);
      }
      
      // Add player who was eliminated by vote
      if (data.metadata?.eliminatedId && !newDeadPlayers.includes(data.metadata.eliminatedId)) {
        newDeadPlayers.push(data.metadata.eliminatedId);
      }
      
      setRoomState({
        phase: data.phase,
        round: data.round,
        deadlineTimestamp: data.deadlineTimestamp,
        deadPlayers: newDeadPlayers,
        eliminatedId: data.metadata?.eliminatedId || null,
        // Clear night action results when phase changes
        seerResult: null,
        werewolfKillTargetId: null,
        witchPotions: null,
      });
    }, [setRoomState]);

    const onWitchInfo = useCallback((data: any) => {
      // data: { werewolfKillTargetId, hasSavePotion, hasKillPotion }
      setRoomState({ 
        werewolfKillTargetId: data.werewolfKillTargetId || null,
        witchPotions: {
          hasSavePotion: data.hasSavePotion,
          hasKillPotion: data.hasKillPotion,
        }
      });
      
      // Show toast with info
      if (data.werewolfKillTargetId) {
        const targetPlayer = useGameStore.getState().players.find(p => p.guestId === data.werewolfKillTargetId);
        const targetName = targetPlayer?.displayName || 'Người chơi';
        setToast(`Ma Sói đã chọn ${targetName}`, "error");
      } else {
        setToast(`Ma Sói không chọn ai đêm nay`, "info");
      }
    }, [setRoomState, setToast]);

    const onSeerResult = useCallback((data: any) => {
      // data: { targetId, isWerewolf }
      setRoomState({ 
        seerResult: { 
          targetId: data.targetId, 
          isWerewolf: data.isWerewolf 
        } 
      });
      
      const targetPlayer = useGameStore.getState().players.find(p => p.guestId === data.targetId);
      const targetName = targetPlayer?.displayName || 'Người chơi';
      
      if (data.isWerewolf) {
        setToast(`${targetName} là Ma Sói!`, "error");
      } else {
        setToast(`${targetName} là Dân Làng.`, "info");
      }
    }, [setRoomState, setToast]);

    const onChatMessage = useCallback((data: any) => {
      // data: { senderName, channel, content, sentAt }
      // channel should be 'all' or 'wolves'
      console.log('[useGameSocket] Received chat_message:', data);
      if (data.channel === 'all' || data.channel === 'wolves') {
        updateChat(data.channel, data);
      }
    }, [updateChat]);

    const onVoteStarted = useCallback((data: any) => {
      setRoomState({
        phase: 'vote',
        round: data.round,
        deadlineTimestamp: data.deadlineTimestamp || (Date.now() + (data.durationSec * 1000)),
      });
    }, [setRoomState]);

    const onVoteResult = useCallback((data: any) => {
      // data: { eliminatedId, tied, counts }
      // Note: Don't add to deadPlayers here - wait for phase_changed which will include it in metadata.deadIds
      if (data.eliminatedId) {
        setRoomState({
          eliminatedId: data.eliminatedId,
        });
        setToast(`Người chơi đã bị treo cổ!`, "info");
      } else if (data.tied) {
        setToast(`Hòa phiếu! Không ai bị treo cổ.`, "info");
      } else {
        setToast(`Không ai bị treo cổ.`, "info");
      }
    }, [setRoomState, setToast]);

    const onHunterTrigger = useCallback((data: any) => {
      if (data.hunterId === useGameStore.getState().myGuestId) {
        setRoomState({ isHunterTriggered: true });
      }
    }, [setRoomState]);

    const onPlayerDisconnected = useCallback((data: any) => {
      const state = useGameStore.getState();
      setRoomState({
        players: state.players.map(p => p.guestId === data.guestId ? { ...p, isDisconnected: true } : p)
      });
      setToast(`Người chơi ${state.players.find(p => p.guestId === data.guestId)?.displayName || data.guestId} đa ngắt kết nối.`, "info");
    }, [setRoomState, setToast]);

    const onPlayerReconnected = useCallback((data: any) => {
      const state = useGameStore.getState();
      setRoomState({
        players: state.players.map(p => p.guestId === data.guestId ? { ...p, isDisconnected: false } : p)
      });
      setToast(`Người chơi ${state.players.find(p => p.guestId === data.guestId)?.displayName || data.guestId} đã kết nối lại.`, "info");
    }, [setRoomState, setToast]);

    const onGameEnded = useCallback((data: any) => {
      setRoomState({
        roomStatus: 'finished',
        winnerTeam: data.winner,
        finalRoles: data.roles
      });
    }, [setRoomState]);

    const onVoteAck = useCallback((data: any) => {
      if (data.success) {
        setToast('Vote đã được ghi nhận', 'info');
      }
    }, [setToast]);

    const onNightActionAck = useCallback((data: any) => {
      if (data.success) {
        setToast('Hành động đã được ghi nhận', 'info');
      }
    }, [setToast]);

  useEffect(() => {
    socketManger.connect();
    socketManger.on("ROOM_UPDATED", onRoomUpdated);
    socketManger.on("ERROR", onError);
    socketManger.on("ROOM_CANCELLED", onRoomCancelled);
    socketManger.on("role_assigned", onRoleAssigned);
    socketManger.on("phase_changed", onPhaseChanged);
    socketManger.on("witch_info", onWitchInfo);
    socketManger.on("seer_result", onSeerResult);
    socketManger.on("chat_message", onChatMessage);
    socketManger.on("vote_started", onVoteStarted);
    socketManger.on("vote_result", onVoteResult);
    socketManger.on("hunter_trigger", onHunterTrigger);
    socketManger.on("player_disconnected", onPlayerDisconnected);
    socketManger.on("player_reconnected", onPlayerReconnected);
    socketManger.on("game_ended", onGameEnded);
    socketManger.on("vote_ack", onVoteAck);
    socketManger.on("night_action_ack", onNightActionAck);
    
    // We can add more handlers later

    return () => {
      socketManger.off("ROOM_UPDATED", onRoomUpdated);
      socketManger.off("ERROR", onError);
      socketManger.off("ROOM_CANCELLED", onRoomCancelled);
      socketManger.off("role_assigned", onRoleAssigned);
      socketManger.off("phase_changed", onPhaseChanged);
      socketManger.off("witch_info", onWitchInfo);
      socketManger.off("seer_result", onSeerResult);
      socketManger.off("chat_message", onChatMessage);
      socketManger.off("vote_started", onVoteStarted);
      socketManger.off("vote_result", onVoteResult);
      socketManger.off("hunter_trigger", onHunterTrigger);
      socketManger.off("player_disconnected", onPlayerDisconnected);
      socketManger.off("player_reconnected", onPlayerReconnected);
      socketManger.off("game_ended", onGameEnded);
      socketManger.off("vote_ack", onVoteAck);
      socketManger.off("night_action_ack", onNightActionAck);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  return { emit: socketManger.emit.bind(socketManger) };
}

// Separate hook for components that only need emit function
export function useGameSocketEmit() {
  return { emit: socketManger.emit.bind(socketManger) };
}
