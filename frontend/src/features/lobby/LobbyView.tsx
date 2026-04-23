"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLobbyStore } from "@/entities/room/model/lobbyStore";
import { useGameStore } from "@/entities/game/model/gameStore";
import { PlayerIdentityGate } from "@/features/lobby/set-player-name/ui/PlayerIdentityGate";
import { LobbyBrowser } from "@/widgets/lobby-browser/ui/LobbyBrowser";
import { RoomDetailsView } from "@/widgets/room-details/ui/RoomDetailsView";
import { getOrCreateGuestId } from "@/shared/lib/guestSession";
import { getRoomGatewaySocket } from "@/shared/network/roomGatewaySocket";

export default function LobbyView() {
  const rooms = useLobbyStore((state) => state.rooms);
  const playerName = useLobbyStore((state) => state.playerName);
  const setPlayerName = useLobbyStore((state) => state.setPlayerName);
  const currentRoomId = useLobbyStore((state) => state.currentRoomId);
  const setCurrentRoomId = useLobbyStore((state) => state.setCurrentRoomId);
  const upsertRoomFromGateway = useLobbyStore((state) => state.upsertRoomFromGateway);
  const setRoomName = useLobbyStore((state) => state.setRoomName);
  const removeRoom = useLobbyStore((state) => state.removeRoom);
  const lastError = useLobbyStore((state) => state.lastError);
  const setLastError = useLobbyStore((state) => state.setLastError);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [pendingCreatedRoomName, setPendingCreatedRoomName] = useState<string | null>(null);

  const currentUserId = useMemo(() => getOrCreateGuestId(), []);
  const socket = useMemo(() => getRoomGatewaySocket(), []);
  const router = useRouter();

  useEffect(() => {
    socket.connect();
    const unsubscribe = socket.onEvent((message) => {
      if (message.event === "ROOM_UPDATED") {
        upsertRoomFromGateway(message.data);
        const isPlayerInRoom = message.data.players.some((p: any) => p.guestId === currentUserId);
        
        if (!useLobbyStore.getState().currentRoomId && isPlayerInRoom) {
          setCurrentRoomId(message.data.roomId);
        } else if (useLobbyStore.getState().currentRoomId === message.data.roomId && !isPlayerInRoom) {
          setCurrentRoomId(null);
        }
        const activeRoomId = useLobbyStore.getState().currentRoomId;
        if (message.data.status === "in_game" && activeRoomId === message.data.roomId) {
          router.push("/game");
        }
        return;
      }

      if (message.event === "ROOM_CANCELLED") {
        removeRoom(message.data.roomId);
        if (useLobbyStore.getState().currentRoomId === message.data.roomId) {
          setCurrentRoomId(null);
        }
        return;
      }

      if (message.event === "ERROR") {
        setLastError(message.data.message);
        return;
      }

    });

    return () => {
      unsubscribe();
    };
  }, [
    currentUserId,
    pendingCreatedRoomName,
    removeRoom,
    setCurrentRoomId,
    setLastError,
    setRoomName,
    socket,
    router,
    upsertRoomFromGateway,
  ]);

  const handleCreateRoom = () => {
    if (!playerName) return;
    socket.send("CREATE_ROOM", {
      guestId: currentUserId,
      displayName: playerName,
    });
  };

  const handleJoinRoom = (roomId: string) => {
    const room = rooms.find((item) => item.id === roomId);
    if (!room || !playerName) return;

    socket.send("JOIN_ROOM", {
      guestId: currentUserId,
      displayName: playerName,
      roomCode: room.code,
    });
  };

  const handleJoinByCode = (code?: unknown) => {
    if (!playerName) return;
    const rawCode = typeof code === "string" ? code : roomCodeInput;
    const normalizedCode = rawCode.trim().toUpperCase();
    if (!normalizedCode) return;

    socket.send("JOIN_ROOM", {
      guestId: currentUserId,
      displayName: playerName,
      roomCode: normalizedCode,
    });
    if (typeof code !== "string") {
      setRoomCodeInput("");
    }
  };

  const handleConfigureRoom = (payload: {
    maxPlayers: number;
    config: {
      guardDuration: number;
      seerDuration: number;
      werewolfDuration: number;
      witchDuration: number;
      discussDuration: number;
      voteDuration: number;
    };
  }) => {
    socket.send("CONFIGURE_ROOM", {
      guestId: currentUserId,
      maxPlayers: payload.maxPlayers,
      config: payload.config,
    });
  };

  const handleStartGame = (roomId: string) => {
    if (!playerName) return;
    const activeRoomId = useLobbyStore.getState().currentRoomId;
    if (!activeRoomId || activeRoomId !== roomId) {
      setLastError("Không thể bắt đầu game vì chưa xác định phòng hiện tại.");
      return;
    }

    setLastError(null);
    socket.send("START_GAME", {
      guestId: currentUserId,
    });
  };

  if (!playerName) {
    return (
      <PlayerIdentityGate
        nameInput={nameInput}
        onNameInputChange={setNameInput}
        onConfirm={() => {
          if (nameInput.trim()) {
            setPlayerName(nameInput.trim());
          }
        }}
      />
    );
  }

  if (currentRoomId) {
    const room = rooms.find((item) => item.id === currentRoomId);
    if (!room) return null; // Or handle error

    return (
      <RoomDetailsView
        room={room}
        currentUserId={currentUserId}
        onLeaveRoom={() => {
          socket.send("LEAVE_ROOM", { roomId: room.id, guestId: currentUserId });
          setCurrentRoomId(null);
        }}
        onStartGame={() => handleStartGame(room.id)}
        onConfigureRoom={handleConfigureRoom}
      />
    );
  }

  return (
    <LobbyBrowser
      rooms={rooms}
      playerName={playerName}
      roomCodeInput={roomCodeInput}
      showJoinModal={showJoinModal}
      onRoomCodeInputChange={setRoomCodeInput}
      onJoinRoom={handleJoinRoom}
      onJoinByCode={handleJoinByCode}
      onCloseJoinModal={() => setShowJoinModal(false)}
      onCreateRoom={handleCreateRoom}
      onJoinByModalCode={handleJoinByCode}
      errorMessage={lastError}
    />
  );
}