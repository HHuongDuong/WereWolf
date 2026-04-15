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
import { Server, Socket } from 'socket.io';
import { RoomServiceClient } from './room.client';
import { validatePayload } from './validation';
import { CreateRoomDto } from './dto/create-room.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { ConfigureRoomDto } from './dto/configure-room.dto';
import { StartGameDto, CancelRoomDto, LeaveRoomDto } from './dto/room-action.dto';

@WebSocketGateway({ cors: { origin: '*' } })
export class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

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

  constructor(private readonly roomClient: RoomServiceClient) {}

  handleConnection(socket: Socket) {
    this.sessions.set(socket.id, {});
    this.logger.log(`Client connected: ${socket.id}`);
  }

  handleDisconnect(socket: Socket) {
    this.sessions.delete(socket.id);
    this.logger.log(`Client disconnected: ${socket.id}`);
  }

  @SubscribeMessage('CREATE_ROOM')
  async handleCreateRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: unknown,
  ) {
    const { dto, errors } = validatePayload(payload, CreateRoomDto);
    if (errors) return this.emitError(socket, 'VALIDATION_FAILED', errors[0]);

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

      this.trackSession(socket, dto.guestId, created.roomId);
      socket.join(created.roomId);

      this.emitRoomUpdated(created.roomId);
    } catch (err) {
      this.emitHttpError(socket, err);
    }
  }

  @SubscribeMessage('JOIN_ROOM')
  async handleJoinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: unknown,
  ) {
    const { dto, errors } = validatePayload(payload, JoinRoomDto);
    if (errors) return this.emitError(socket, 'VALIDATION_FAILED', errors[0]);

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

      this.trackSession(socket, dto.guestId, joined.roomId);
      socket.join(joined.roomId);

      this.emitRoomUpdated(joined.roomId);
    } catch (err) {
      this.emitHttpError(socket, err);
    }
  }

  @SubscribeMessage('CONFIGURE_ROOM')
  async handleConfigureRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: unknown,
  ) {
    const { dto, errors } = validatePayload(payload, ConfigureRoomDto);
    if (errors) return this.emitError(socket, 'VALIDATION_FAILED', errors[0]);

    const session = this.sessions.get(socket.id);
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
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: unknown,
  ) {
    const { dto, errors } = validatePayload(payload, StartGameDto);
    if (errors) return this.emitError(socket, 'VALIDATION_FAILED', errors[0]);

    const session = this.sessions.get(socket.id);
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
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: unknown,
  ) {
    const { dto, errors } = validatePayload(payload, LeaveRoomDto);
    if (errors) return this.emitError(socket, 'VALIDATION_FAILED', errors[0]);

    try {
      const result = await this.roomClient.leaveRoom(dto.roomId, dto.guestId);

      const existing = this.rooms.get(dto.roomId);
      if (existing) {
        existing.players = existing.players.filter((p) => p.guestId !== dto.guestId);
        if (result?.newHostId) existing.hostId = result.newHostId;
        if (result?.roomDeleted) this.rooms.delete(dto.roomId);
        else this.rooms.set(dto.roomId, existing);
      }

      socket.leave(dto.roomId);
      this.sessions.set(socket.id, { guestId: dto.guestId });

      if (!result?.roomDeleted) this.emitRoomUpdated(dto.roomId);
    } catch (err) {
      this.emitHttpError(socket, err);
    }
  }

  @SubscribeMessage('CANCEL_ROOM')
  async handleCancelRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: unknown,
  ) {
    const { dto, errors } = validatePayload(payload, CancelRoomDto);
    if (errors) return this.emitError(socket, 'VALIDATION_FAILED', errors[0]);

    const session = this.sessions.get(socket.id);
    if (!session?.roomId) return this.emitError(socket, 'NO_ROOM', 'Bạn chưa ở trong phòng');

    try {
      await this.roomClient.cancelRoom(session.roomId, { guestId: dto.guestId });
      this.rooms.delete(session.roomId);
      this.server.to(session.roomId).emit('ROOM_CANCELLED', { roomId: session.roomId });
    } catch (err) {
      this.emitHttpError(socket, err);
    }
  }

  private trackSession(socket: Socket, guestId: string, roomId: string) {
    this.sessions.set(socket.id, { guestId, roomId });
  }

  private emitRoomUpdated(roomId: string) {
    const state = this.rooms.get(roomId);
    if (!state) return;

    this.server.to(roomId).emit('ROOM_UPDATED', {
      roomId: state.roomId,
      roomCode: state.roomCode,
      players: state.players,
      hostId: state.hostId,
      status: state.status ?? 'waiting',
    });
  }

  private emitError(socket: Socket, code: string, message: string) {
    socket.emit('ERROR', { code, message });
  }

  private emitHttpError(socket: Socket, err: unknown) {
    const anyErr = err as { response?: { data?: { code?: string; message?: string } } };
    const code = anyErr?.response?.data?.code ?? 'ROOM_SERVICE_ERROR';
    const message = anyErr?.response?.data?.message ?? 'Room service request failed';
    this.emitError(socket, code, message);
  }
}
