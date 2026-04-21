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
import { NightActionDto } from './dto/night-action.dto';
import { VoteDto } from './dto/vote.dto';
import { ChatMessageDto } from './dto/chat-message.dto';
import { HunterShootDto } from './dto/hunter-shoot.dto';
import { KafkaProducerService } from './kafka.producer';
import { VoteServiceClient } from './vote.client';
import { ChatServiceClient } from './chat.client';

@WebSocketGateway({ cors: { origin: '*' } })
export class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: WsServer;

  private readonly logger = new Logger(RoomGateway.name);
  private readonly sessions = new Map<string, { guestId?: string; roomId?: string }>();
  private readonly sockets = new Map<string, WebSocket>();
  private readonly socketIds = new Map<WebSocket, string>();
  private readonly roomMembers = new Map<string, Set<string>>();
  private readonly lastRoomState = new Map<string, unknown>();
  private readonly disconnectTimers = new Map<string, NodeJS.Timeout>(); // Track disconnect timers
  private readonly RECONNECT_GRACE_PERIOD = 60000; // 60 seconds

  constructor(
    private readonly roomClient: RoomServiceClient,
    private readonly kafkaProducer: KafkaProducerService,
    private readonly voteClient: VoteServiceClient,
    private readonly chatClient: ChatServiceClient,
  ) {}

  handleConnection(socket: WebSocket) {
    const socketId = randomUUID();
    this.sockets.set(socketId, socket);
    this.socketIds.set(socket, socketId);
    this.sessions.set(socketId, {});
    this.logger.log(`Client connected: ${socketId}`);
  }

  @SubscribeMessage('RECONNECT')
  async handleReconnect(
    @ConnectedSocket() socket: WebSocket,
    @MessageBody() payload: unknown,
  ) {
    const socketId = this.getSocketId(socket);
    if (!socketId) return;

    // Validate payload has guestId and roomId
    if (!payload || typeof payload !== 'object') {
      return this.emitError(socket, 'VALIDATION_FAILED', 'Invalid reconnect payload');
    }

    const { guestId, roomId } = payload as { guestId?: string; roomId?: string };
    
    if (!guestId || !roomId) {
      return this.emitError(socket, 'VALIDATION_FAILED', 'Missing guestId or roomId');
    }

    const disconnectKey = `${roomId}:${guestId}`;
    const timer = this.disconnectTimers.get(disconnectKey);
    
    if (!timer) {
      return this.emitError(socket, 'RECONNECT_FAILED', 'Reconnect window expired or session not found');
    }

    // Clear the disconnect timer
    clearTimeout(timer);
    this.disconnectTimers.delete(disconnectKey);
    
    // Restore session
    this.trackSession(socketId, guestId, roomId);
    this.addToRoom(socketId, roomId);
    
    // Notify room that player reconnected
    this.broadcastToRoom(roomId, 'player_reconnected', {
      guestId: guestId,
    });
    
    this.logger.log(`Player ${guestId} reconnected to room ${roomId}`);
    
    // Send current room state to reconnected player
    const roomState = this.lastRoomState.get(roomId);
    if (roomState) {
      this.sendMessage(socket, 'ROOM_UPDATED', roomState);
    }
  }

  async handleDisconnect(socket: WebSocket) {
    const socketId = this.socketIds.get(socket);
    if (!socketId) return;

    const session = this.sessions.get(socketId);
    
    // Clean up socket references immediately
    this.sockets.delete(socketId);
    this.socketIds.delete(socket);
    
    if (session?.roomId && session?.guestId) {
      const disconnectKey = `${session.roomId}:${session.guestId}`;
      
      // Clear any existing timer for this player
      const existingTimer = this.disconnectTimers.get(disconnectKey);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }
      
      // Notify room that player disconnected (but not removed yet)
      this.broadcastToRoom(session.roomId, 'player_disconnected', {
        guestId: session.guestId,
      });
      
      this.logger.log(`Player ${session.guestId} disconnected from room ${session.roomId}, grace period: ${this.RECONNECT_GRACE_PERIOD}ms`);
      
      // Set timer to remove player after grace period
      const timer = setTimeout(async () => {
        this.logger.log(`Grace period expired for ${session.guestId} in room ${session.roomId}, removing from room`);
        
        try {
          await this.roomClient.leaveRoom(session.roomId, session.guestId);
        } catch (err: any) {
          // 404 is expected if room was already deleted (game ended, etc.)
          if (err?.response?.status === 404) {
            this.logger.debug(`Room ${session.roomId} no longer exists (already deleted)`);
          } else {
            this.logger.warn(`Failed to leave room after grace period: ${err.message}`);
          }
        }
        
        // Clean up session and room membership
        this.removeFromAllRooms(socketId);
        this.sessions.delete(socketId);
        this.disconnectTimers.delete(disconnectKey);
      }, this.RECONNECT_GRACE_PERIOD);
      
      this.disconnectTimers.set(disconnectKey, timer);
    } else {
      // No session, clean up immediately
      this.removeFromAllRooms(socketId);
      this.sessions.delete(socketId);
    }
    
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

      this.trackSession(socketId, dto.guestId, created.roomId);
      this.addToRoom(socketId, created.roomId);
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

      this.trackSession(socketId, dto.guestId, joined.roomId);
      this.addToRoom(socketId, joined.roomId);
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

      this.removeFromRoom(socketId, dto.roomId);
      this.sessions.set(socketId, { guestId: dto.guestId });
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
    } catch (err) {
      this.emitHttpError(socket, err);
    }
  }

  @SubscribeMessage('night_action')
  async handleNightAction(
    @ConnectedSocket() socket: WebSocket,
    @MessageBody() payload: unknown,
  ) {
    const { dto, errors } = validatePayload(payload, NightActionDto);
    if (errors) return this.emitError(socket, 'VALIDATION_FAILED', errors[0]);

    const socketId = this.getSocketId(socket);
    const session = socketId ? this.sessions.get(socketId) : undefined;
    
    if (!session?.roomId || !session?.guestId) {
      return this.emitError(socket, 'NO_SESSION', 'Bạn chưa ở trong phòng');
    }

    // Generate unique eventId for idempotency
    const eventId = randomUUID();

    // Publish to Kafka
    const result = await this.kafkaProducer.publishNightAction({
      eventId,
      roomId: session.roomId,
      playerId: session.guestId,
      role: dto.role,
      targetId: dto.targetId || null,
    });

    if (!result.success) {
      return this.emitError(socket, 'KAFKA_ERROR', 'Không thể gửi hành động');
    }

    // Send acknowledgment to client
    this.sendMessage(socket, 'night_action_ack', {
      actionType: dto.role.toLowerCase(),
      success: true,
    });
  }

  @SubscribeMessage('vote')
  async handleVote(
    @ConnectedSocket() socket: WebSocket,
    @MessageBody() payload: unknown,
  ) {
    const { dto, errors } = validatePayload(payload, VoteDto);
    if (errors) return this.emitError(socket, 'VALIDATION_FAILED', errors[0]);

    const socketId = this.getSocketId(socket);
    const session = socketId ? this.sessions.get(socketId) : undefined;
    
    if (!session?.roomId || !session?.guestId) {
      return this.emitError(socket, 'NO_SESSION', 'Bạn chưa ở trong phòng');
    }

    try {
      const result = await this.voteClient.submitVote({
        roomId: session.roomId,
        round: dto.round,
        voterId: session.guestId,
        targetId: dto.targetId,
      });

      if (!result.success) {
        return this.emitError(socket, result.code || 'VOTE_FAILED', result.message || 'Vote không hợp lệ');
      }

      // Send acknowledgment
      this.sendMessage(socket, 'vote_ack', { success: true });
    } catch (err) {
      this.logger.error(`Vote failed: ${err.message}`);
      this.emitError(socket, 'VOTE_SERVICE_ERROR', 'Không thể gửi vote');
    }
  }

  @SubscribeMessage('chat_message')
  async handleChatMessage(
    @ConnectedSocket() socket: WebSocket,
    @MessageBody() payload: unknown,
  ) {
    const { dto, errors } = validatePayload(payload, ChatMessageDto);
    if (errors) return this.emitError(socket, 'VALIDATION_FAILED', errors[0]);

    const socketId = this.getSocketId(socket);
    const session = socketId ? this.sessions.get(socketId) : undefined;
    
    if (!session?.roomId || !session?.guestId) {
      return this.emitError(socket, 'NO_SESSION', 'Bạn chưa ở trong phòng');
    }

    // Get player info from room state
    const roomState = this.lastRoomState.get(session.roomId) as any;
    const player = roomState?.players?.find((p: any) => p.guestId === session.guestId);
    
    if (!player) {
      return this.emitError(socket, 'PLAYER_NOT_FOUND', 'Không tìm thấy thông tin người chơi');
    }

    try {
      const result = await this.chatClient.sendMessage({
        roomId: session.roomId,
        channel: dto.channel,
        senderId: session.guestId,
        senderName: player.displayName,
        content: dto.content,
        round: 1, // TODO: Get from game state
        phase: 'day', // TODO: Get from game state
      });

      if (!result.success) {
        return this.emitError(socket, result.code || 'CHAT_FAILED', result.message || 'Không thể gửi tin nhắn');
      }
    } catch (err) {
      this.logger.error(`Chat failed: ${err.message}`);
      this.emitError(socket, 'CHAT_SERVICE_ERROR', 'Không thể gửi tin nhắn');
    }
  }

  @SubscribeMessage('hunter_shoot')
  async handleHunterShoot(
    @ConnectedSocket() socket: WebSocket,
    @MessageBody() payload: unknown,
  ) {
    const { dto, errors } = validatePayload(payload, HunterShootDto);
    if (errors) return this.emitError(socket, 'VALIDATION_FAILED', errors[0]);

    const socketId = this.getSocketId(socket);
    const session = socketId ? this.sessions.get(socketId) : undefined;
    
    if (!session?.roomId || !session?.guestId) {
      return this.emitError(socket, 'NO_SESSION', 'Bạn chưa ở trong phòng');
    }

    // Publish to Kafka
    const result = await this.kafkaProducer.publishHunterShoot({
      roomId: session.roomId,
      hunterId: session.guestId,
      targetId: dto.targetId,
    });

    if (!result.success) {
      return this.emitError(socket, 'KAFKA_ERROR', 'Không thể gửi hành động');
    }

    // Send acknowledgment to client
    this.sendMessage(socket, 'hunter_shoot_ack', {
      success: true,
    });
  }

  private trackSession(socketId: string, guestId: string, roomId: string) {
    this.sessions.set(socketId, { guestId, roomId });
  }

  public sendPrivateToGuest(
    roomId: string,
    guestId: string,
    event: string,
    data: unknown,
  ) {
    const socketId = this.findSocketIdByGuestInRoom(guestId, roomId);
    if (!socketId) return { delivered: false, reason: 'SOCKET_NOT_FOUND' };

    const socket = this.sockets.get(socketId);
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return { delivered: false, reason: 'SOCKET_NOT_OPEN' };
    }

    this.sendMessage(socket, event, data);
    return { delivered: true };
  }

  public broadcastRoomUpdated(roomId: string, data: any) {
    this.lastRoomState.set(roomId, data);

    const members = this.roomMembers.get(roomId);
    if (!members || members.size === 0) return;

    this.broadcastToRoom(roomId, 'ROOM_UPDATED', data);
  }

  public broadcastRoomDeleted(roomId: string) {
    this.broadcastToRoom(roomId, 'ROOM_CANCELLED', { roomId });
    this.roomMembers.delete(roomId);
    this.lastRoomState.delete(roomId);
  }

  public broadcastPhaseChanged(roomId: string, data: any) {
    this.logger.debug(`Broadcasting phase_changed to room ${roomId}: phase=${data.phase}, round=${data.round}`);
    this.broadcastToRoom(roomId, 'phase_changed', data);
  }

  public broadcastVoteStarted(roomId: string, data: any) {
    this.logger.debug(`Broadcasting vote_started to room ${roomId}: round=${data.round}`);
    this.broadcastToRoom(roomId, 'vote_started', {
      round: data.round,
      durationSec: data.durationSec,
      candidates: data.alivePlayerIds,
      deadlineTimestamp: Date.now() + (data.durationSec * 1000),
    });
  }

  public broadcastVoteResult(roomId: string, data: any) {
    this.logger.debug(`Broadcasting vote_result to room ${roomId}: eliminatedId=${data.eliminatedId}, tied=${data.tied}`);
    this.broadcastToRoom(roomId, 'vote_result', {
      eliminatedId: data.eliminatedId,
      tied: data.tied,
      counts: data.counts,
    });
  }

  public broadcastGameEnded(roomId: string, data: any) {
    this.logger.debug(`Broadcasting game_ended to room ${roomId}: winner=${data.winner}`);
    this.broadcastToRoom(roomId, 'game_ended', {
      winner: data.winner,
      round: data.round,
      roles: data.roles,
    });
  }

  public broadcastChatMessage(roomId: string, channel: string, message: any) {
    this.logger.log(`[BROADCAST] Broadcasting chat_message to room ${roomId}, channel ${channel}, message: ${JSON.stringify(message)}`);
    this.broadcastToRoom(roomId, 'chat_message', message);
    this.logger.log(`[BROADCAST] Finished broadcasting chat_message to room ${roomId}`);
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

  private findSocketIdByGuestInRoom(guestId: string, roomId: string) {
    for (const [socketId, session] of this.sessions.entries()) {
      if (session.guestId === guestId && session.roomId === roomId) {
        return socketId;
      }
    }

    return undefined;
  }

  private addToRoom(socketId: string, roomId: string) {
    const members = this.roomMembers.get(roomId) ?? new Set<string>();
    members.add(socketId);
    this.roomMembers.set(roomId, members);

    const lastState = this.lastRoomState.get(roomId);
    if (!lastState) return;

    const socket = this.sockets.get(socketId);
    if (socket) this.sendMessage(socket, 'ROOM_UPDATED', lastState);
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
    if (!members) {
      this.logger.debug(`[broadcastToRoom] No members found for room ${roomId}`);
      return;
    }

    this.logger.debug(`[broadcastToRoom] Broadcasting ${event} to ${members.size} members in room ${roomId}`);
    
    let sentCount = 0;
    for (const socketId of members) {
      const socket = this.sockets.get(socketId);
      if (socket) {
        this.sendMessage(socket, event, data);
        sentCount++;
      }
    }
    
    this.logger.debug(`[broadcastToRoom] Sent ${event} to ${sentCount}/${members.size} sockets in room ${roomId}`);
  }

  private sendMessage(socket: WebSocket, event: string, data: unknown) {
    if (socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify({ event, data }));
  }
}
