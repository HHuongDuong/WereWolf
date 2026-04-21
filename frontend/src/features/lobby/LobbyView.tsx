"use client";
import { useEffect, useMemo, useState } from "react";
import { useLobbyStore } from "@/entities/room/model/lobbyStore";
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

  useEffect(() => {
    socket.connect();
    const unsubscribe = socket.onEvent((message) => {
      if (message.event === "ROOM_UPDATED") {
        upsertRoomFromGateway(message.data);
        if (pendingCreatedRoomName && message.data.hostId === currentUserId) {
          setRoomName(message.data.roomId, pendingCreatedRoomName);
          setPendingCreatedRoomName(null);
        }
        if (!useLobbyStore.getState().currentRoomId) {
          setCurrentRoomId(message.data.roomId);
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
    upsertRoomFromGateway,
  ]);

  const handleCreateRoom = (name: string) => {
    if (!playerName) return;
    const normalizedRoomName = name.trim() || "Gathering";
    setPendingCreatedRoomName(normalizedRoomName);
    socket.send("CREATE_ROOM", {
      guestId: currentUserId,
      displayName: playerName,
    });
    setShowCreateModal(false);
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
        onStartGame={() => {
          socket.send("START_GAME", { guestId: currentUserId });
        }}
        onConfigureRoom={handleConfigureRoom}
      />
    );
  }

  return (
    <LobbyBrowser
      rooms={rooms}
      playerName={playerName}
      roomCodeInput={roomCodeInput}
      showCreateModal={showCreateModal}
      showJoinModal={showJoinModal}
      onRoomCodeInputChange={setRoomCodeInput}
      onJoinRoom={handleJoinRoom}
      onJoinByCode={handleJoinByCode}
      onOpenCreateModal={() => setShowCreateModal(true)}
      onCloseCreateModal={() => setShowCreateModal(false)}
      onCloseJoinModal={() => setShowJoinModal(false)}
      onCreateRoom={handleCreateRoom}
      onJoinByModalCode={handleJoinByCode}
      errorMessage={lastError}
    />
  );
}