import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { WebSocketServer as WsServer, WebSocket } from 'ws';
import { RoomServiceClient } from './room.client';
import { validatePayload } from './validation';
import { CreateRoomDto } from './dto/create-room.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { ConfigureRoomDto } from './dto/configure-room.dto';
import { StartGameDto, CancelRoomDto, LeaveRoomDto } from './dto/room-action.dto';

@WebSocketGateway({ cors: { origin: '*' } })
export class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: WsServer;

  private readonly logger = new Logger(RoomGateway.name);
  private readonly sessions = new Map<string, { guestId?: string; roomId?: string }>();
  private readonly rooms = new Map<
    string,
    {
      roomId: string;
      roomCode?: string;
      hostId?: string;
      status?: 'waiting' | 'in_game' | 'finished';
      players: Array<{ guestId: string; displayName: string }>;
    }
  >();
  private readonly sockets = new Map<string, WebSocket>();
  private readonly socketIds = new Map<WebSocket, string>();
  private readonly roomMembers = new Map<string, Set<string>>();

  constructor(private readonly roomClient: RoomServiceClient) {}

  handleConnection(socket: WebSocket) {
    const socketId = randomUUID();
    this.sockets.set(socketId, socket);
    this.socketIds.set(socket, socketId);
    this.sessions.set(socketId, {});
    this.logger.log(`Client connected: ${socketId}`);
  }

  handleDisconnect(socket: WebSocket) {
    const socketId = this.socketIds.get(socket);
    if (!socketId) return;

    this.removeFromAllRooms(socketId);
    this.sessions.delete(socketId);
    this.sockets.delete(socketId);
    this.socketIds.delete(socket);
    this.logger.log(`Client disconnected: ${socketId}`);
  }

  @SubscribeMessage('CREATE_ROOM')
  async handleCreateRoom(
    @ConnectedSocket() socket: WebSocket,
    @MessageBody() payload: unknown,
  ) {
    const { dto, errors } = validatePayload(payload, CreateRoomDto);
    if (errors) return this.emitError(socket, 'VALIDATION_FAILED', errors[0]);

    const socketId = this.getSocketId(socket);
    if (!socketId) return;

    try {
      const created = await this.roomClient.createRoom({
        guestId: dto.guestId,
        displayName: dto.displayName,
      });

      if (dto.maxPlayers !== undefined) {
        await this.roomClient.configureRoom(created.roomId, {
          guestId: dto.guestId,
          maxPlayers: dto.maxPlayers,
        });
      }

      const players = [{ guestId: dto.guestId, displayName: dto.displayName }];
      this.rooms.set(created.roomId, {
        roomId: created.roomId,
        roomCode: created.roomCode,
        hostId: created.hostId,
        status: 'waiting',
        players,
      });

      this.trackSession(socketId, dto.guestId, created.roomId);
      this.addToRoom(socketId, created.roomId);

      this.emitRoomUpdated(created.roomId);
    } catch (err) {
      this.emitHttpError(socket, err);
    }
  }

  @SubscribeMessage('JOIN_ROOM')
  async handleJoinRoom(
    @ConnectedSocket() socket: WebSocket,
    @MessageBody() payload: unknown,
  ) {
    const { dto, errors } = validatePayload(payload, JoinRoomDto);
    if (errors) return this.emitError(socket, 'VALIDATION_FAILED', errors[0]);

    const socketId = this.getSocketId(socket);
    if (!socketId) return;

    try {
      const joined = await this.roomClient.joinRoom({
        guestId: dto.guestId,
        displayName: dto.displayName,
        roomCode: dto.roomCode,
      });

      const existing = this.rooms.get(joined.roomId);
      this.rooms.set(joined.roomId, {
        roomId: joined.roomId,
        roomCode: existing?.roomCode,
        hostId: existing?.hostId,
        status: existing?.status ?? 'waiting',
        players: joined.players,
      });

      this.trackSession(socketId, dto.guestId, joined.roomId);
      this.addToRoom(socketId, joined.roomId);

      this.emitRoomUpdated(joined.roomId);
    } catch (err) {
      this.emitHttpError(socket, err);
    }
  }

  @SubscribeMessage('CONFIGURE_ROOM')
  async handleConfigureRoom(
    @ConnectedSocket() socket: WebSocket,
    @MessageBody() payload: unknown,
  ) {
    const { dto, errors } = validatePayload(payload, ConfigureRoomDto);
    if (errors) return this.emitError(socket, 'VALIDATION_FAILED', errors[0]);

    const socketId = this.getSocketId(socket);
    const session = socketId ? this.sessions.get(socketId) : undefined;
    if (!session?.roomId) return this.emitError(socket, 'NO_ROOM', 'Bạn chưa ở trong phòng');

    try {
      await this.roomClient.configureRoom(session.roomId, {
        guestId: dto.guestId,
        maxPlayers: dto.maxPlayers,
        config: dto.config,
      });

      this.emitRoomUpdated(session.roomId);
    } catch (err) {
      this.emitHttpError(socket, err);
    }
  }

  @SubscribeMessage('START_GAME')
  async handleStartGame(
    @ConnectedSocket() socket: WebSocket,
    @MessageBody() payload: unknown,
  ) {
    const { dto, errors } = validatePayload(payload, StartGameDto);
    if (errors) return this.emitError(socket, 'VALIDATION_FAILED', errors[0]);

    const socketId = this.getSocketId(socket);
    const session = socketId ? this.sessions.get(socketId) : undefined;
    if (!session?.roomId) return this.emitError(socket, 'NO_ROOM', 'Bạn chưa ở trong phòng');

    try {
      await this.roomClient.startGame(session.roomId, { guestId: dto.guestId });

      const existing = this.rooms.get(session.roomId);
      if (existing) {
        existing.status = 'in_game';
        this.rooms.set(session.roomId, existing);
      }

      this.emitRoomUpdated(session.roomId);
    } catch (err) {
      this.emitHttpError(socket, err);
    }
  }

  @SubscribeMessage('LEAVE_ROOM')
  async handleLeaveRoom(
    @ConnectedSocket() socket: WebSocket,
    @MessageBody() payload: unknown,
  ) {
    const { dto, errors } = validatePayload(payload, LeaveRoomDto);
    if (errors) return this.emitError(socket, 'VALIDATION_FAILED', errors[0]);

    const socketId = this.getSocketId(socket);
    if (!socketId) return;

    try {
      const result = await this.roomClient.leaveRoom(dto.roomId, dto.guestId);

      const existing = this.rooms.get(dto.roomId);
      if (existing) {
        existing.players = existing.players.filter((p) => p.guestId !== dto.guestId);
        if (result?.newHostId) existing.hostId = result.newHostId;
        if (result?.roomDeleted) this.rooms.delete(dto.roomId);
        else this.rooms.set(dto.roomId, existing);
      }

      this.removeFromRoom(socketId, dto.roomId);
      this.sessions.set(socketId, { guestId: dto.guestId });

      if (!result?.roomDeleted) this.emitRoomUpdated(dto.roomId);
    } catch (err) {
      this.emitHttpError(socket, err);
    }
  }

  @SubscribeMessage('CANCEL_ROOM')
  async handleCancelRoom(
    @ConnectedSocket() socket: WebSocket,
    @MessageBody() payload: unknown,
  ) {
    const { dto, errors } = validatePayload(payload, CancelRoomDto);
    if (errors) return this.emitError(socket, 'VALIDATION_FAILED', errors[0]);

    const socketId = this.getSocketId(socket);
    const session = socketId ? this.sessions.get(socketId) : undefined;
    if (!session?.roomId) return this.emitError(socket, 'NO_ROOM', 'Bạn chưa ở trong phòng');

    try {
      await this.roomClient.cancelRoom(session.roomId, { guestId: dto.guestId });
      this.rooms.delete(session.roomId);
      this.broadcastToRoom(session.roomId, 'ROOM_CANCELLED', { roomId: session.roomId });
      this.roomMembers.delete(session.roomId);
    } catch (err) {
      this.emitHttpError(socket, err);
    }
  }

  private trackSession(socketId: string, guestId: string, roomId: string) {
    this.sessions.set(socketId, { guestId, roomId });
  }

  private emitRoomUpdated(roomId: string) {
    const state = this.rooms.get(roomId);
    if (!state) return;

    this.broadcastToRoom(roomId, 'ROOM_UPDATED', {
      roomId: state.roomId,
      roomCode: state.roomCode,
      players: state.players,
      hostId: state.hostId,
      status: state.status ?? 'waiting',
    });
  }

  private emitError(socket: WebSocket, code: string, message: string) {
    this.sendMessage(socket, 'ERROR', { code, message });
  }

  private emitHttpError(socket: WebSocket, err: unknown) {
    const anyErr = err as { response?: { data?: { code?: string; message?: string } } };
    const code = anyErr?.response?.data?.code ?? 'ROOM_SERVICE_ERROR';
    const message = anyErr?.response?.data?.message ?? 'Room service request failed';
    this.emitError(socket, code, message);
  }

  private getSocketId(socket: WebSocket) {
    return this.socketIds.get(socket);
  }

  private addToRoom(socketId: string, roomId: string) {
    const members = this.roomMembers.get(roomId) ?? new Set<string>();
    members.add(socketId);
    this.roomMembers.set(roomId, members);
  }

  private removeFromRoom(socketId: string, roomId: string) {
    const members = this.roomMembers.get(roomId);
    if (!members) return;

    members.delete(socketId);
    if (members.size === 0) this.roomMembers.delete(roomId);
  }

  private removeFromAllRooms(socketId: string) {
    for (const [roomId, members] of this.roomMembers.entries()) {
      if (members.delete(socketId) && members.size === 0) {
        this.roomMembers.delete(roomId);
      }
    }
  }

  private broadcastToRoom(roomId: string, event: string, data: unknown) {
    const members = this.roomMembers.get(roomId);
    if (!members) return;

    for (const socketId of members) {
      const socket = this.sockets.get(socketId);
      if (socket) this.sendMessage(socket, event, data);
    }
  }

  private sendMessage(socket: WebSocket, event: string, data: unknown) {
    if (socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify({ event, data }));
  }
}
