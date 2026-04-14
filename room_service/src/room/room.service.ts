import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RoomRepository } from './room.repository';
import { KafkaProducerService } from '../kafka/kafka.producer';
import { CreateRoomDto } from './dto/create-room.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { ConfigureRoomDto } from './dto/configure-room.dto';
import { StartGameDto, CancelRoomDto } from './dto/room-action.dto';

@Injectable()
export class RoomService {
  private readonly logger = new Logger(RoomService.name);

  constructor(
    private readonly roomRepo: RoomRepository,
    private readonly kafkaProducer: KafkaProducerService,
  ) {}
  // user press btb CREATE ROOM
  // ── R-01: Tạo phòng ─────────────────────────────────────────────
  async createRoom(dto: CreateRoomDto) {
    const code = await this.generateUniqueCode();
    const room = await this.roomRepo.createRoom(dto.guestId, dto.displayName, code);

    this.logger.log(`Room created: code=${code} host=${dto.guestId}`);
    return {
      roomId: room.id,
      roomCode: room.code,
      hostId: room.hostId,
    };
  }
  // user press btn JOIN
  // ── R-02: Join phòng ────────────────────────────────────────────
  async joinRoom(dto: JoinRoomDto) {
    const code = dto.roomCode.toUpperCase();
    const room = await this.roomRepo.findByCode(code);

    if (!room) {
      throw new NotFoundException({
        code: 'ROOM_NOT_FOUND',
        message: 'Phòng không tồn tại',
      });
    }
    if (room.status !== 'waiting') {
      throw new BadRequestException({
        code: 'ROOM_NOT_AVAILABLE',
        message: 'Game đang chạy hoặc đã kết thúc',
      });
    }
    if (room.players.length >= room.maxPlayers) {
      throw new BadRequestException({
        code: 'ROOM_FULL',
        message: 'Phòng đã đủ người',
      });
    }

    // Idempotent: nếu đã trong phòng thì trả về state hiện tại
    const alreadyIn = room.players.some((p) => p.playerId === dto.guestId);
    if (!alreadyIn) {
      await this.roomRepo.addPlayer(room.id, dto.guestId, dto.displayName);
    }

    const updated = await this.roomRepo.findByCode(code);
    return {
      roomId: updated.id,
      players: updated.players.map((p) => ({
        guestId: p.playerId,
        displayName: p.displayName,
      })),
    };
  }
  // User cấu hình phòng
  // ── R-03: Cấu hình phòng ────────────────────────────────────────
  async configureRoom(roomId: string, dto: ConfigureRoomDto) {
    const room = await this.roomRepo.findByIdWithPlayers(roomId);

    if (!room) {
      throw new NotFoundException({ code: 'ROOM_NOT_FOUND', message: 'Phòng không tồn tại' });
    }
    if (room.hostId !== dto.guestId) {
      throw new ForbiddenException({ code: 'NOT_HOST', message: 'Chỉ host mới có quyền cấu hình' });
    }
    if (room.status !== 'waiting') {
      throw new BadRequestException({ code: 'GAME_ALREADY_STARTED', message: 'Không thể cấu hình khi game đang chạy' });
    }
    if (dto.maxPlayers !== undefined && dto.maxPlayers < room.players.length) {
      throw new BadRequestException({
        code: 'MAX_LESS_THAN_CURRENT',
        message: `Phòng đang có ${room.players.length} người, không thể giảm xuống ${dto.maxPlayers}`,
      });
    }

    await this.roomRepo.updateConfig(roomId, dto.maxPlayers, dto.config);
    return { updated: true };
  }

  // User press start game
  // ── R-04: Start game ────────────────────────────────────────────
  async startGame(roomId: string, dto: StartGameDto) {
    const room = await this.roomRepo.findByIdWithPlayers(roomId);

    if (!room) {
      throw new NotFoundException({ code: 'ROOM_NOT_FOUND', message: 'Phòng không tồn tại' });
    }
    if (room.hostId !== dto.guestId) {
      throw new ForbiddenException({ code: 'NOT_HOST', message: 'Chỉ host mới có quyền start game' });
    }
    if (room.status !== 'waiting') {
      throw new BadRequestException({ code: 'GAME_ALREADY_STARTED', message: 'Game đã bắt đầu rồi' });
    }
    if (room.players.length !== room.maxPlayers) {
      throw new BadRequestException({
        code: 'NOT_ENOUGH_PLAYERS',
        message: `Cần ${room.maxPlayers} người, hiện có ${room.players.length}`,
      });
    }

    // Đổi status trước khi publish (tránh duplicate event nếu retry)
    await this.roomRepo.setStatus(roomId, 'in_game');

    await this.kafkaProducer.publishRoomStarted(room);
    this.logger.log(`Game started: roomId=${roomId}`);

    return { started: true };
  }

  // ── R-05: Cancel phòng ──────────────────────────────────────────
  async cancelRoom(roomId: string, guestId: string) {
    const room = await this.roomRepo.findByIdWithPlayers(roomId);

    if (!room) {
      throw new NotFoundException({ code: 'ROOM_NOT_FOUND', message: 'Phòng không tồn tại' });
    }
    if (room.hostId !== guestId) {
      throw new ForbiddenException({ code: 'NOT_HOST', message: 'Chỉ host mới có quyền cancel' });
    }
    if (room.status !== 'waiting') {
      throw new BadRequestException({ code: 'CANNOT_CANCEL', message: 'Không thể cancel khi game đang chạy' });
    }

    await this.roomRepo.deleteRoom(roomId);
    this.logger.log(`Room cancelled: roomId=${roomId}`);
    return { cancelled: true };
  }

  // ── R-06: Player tự out ─────────────────────────────────────────
  async leaveRoom(roomId: string, guestId: string) {
    const room = await this.roomRepo.findByIdWithPlayers(roomId);

    if (!room) {
      throw new NotFoundException({ code: 'ROOM_NOT_FOUND', message: 'Phòng không tồn tại' });
    }

    const inRoom = room.players.some((p) => p.playerId === guestId);
    if (!inRoom) {
      throw new NotFoundException({ code: 'PLAYER_NOT_FOUND', message: 'Player không có trong phòng' });
    }

    await this.roomRepo.removePlayer(roomId, guestId);

    // Check nếu phòng trống sau khi remove → xóa phòng ngay
    const remainingPlayers = await this.roomRepo.getPlayerCount(roomId);
    
    if (remainingPlayers === 0) {
      await this.roomRepo.deleteRoom(roomId);
      this.logger.log(`Room deleted (no players left): roomId=${roomId}`);
      return { left: true, roomDeleted: true };
    }

    // Nếu host rời và còn người và phòng đang 'waiting' → assign host mới
    if (room.hostId === guestId && room.status === 'waiting') {
      return this.assignNewHost(roomId);
    }

    return { left: true };
  }

  // ── R-07: Assign host mới ───────────────────────────────────────
  async assignNewHost(roomId: string) {
    const earliest = await this.roomRepo.getEarliestPlayer(roomId);

    if (!earliest) {
      // Không còn ai → xóa phòng
      await this.roomRepo.deleteRoom(roomId);
      this.logger.log(`Room deleted (no players left): roomId=${roomId}`);
      return { left: true, roomDeleted: true };
    }

    await this.roomRepo.updateHost(roomId, earliest.playerId);
    this.logger.log(`New host assigned: roomId=${roomId} newHost=${earliest.playerId}`);
    return { left: true, newHostId: earliest.playerId };
  }

  // ── R-08: Cập nhật status khi game kết thúc (Kafka consumer) ───
  async finishRoom(roomId: string): Promise<void> {
    const room = await this.roomRepo.findByIdWithPlayers(roomId);
    if (!room) {
      this.logger.warn(`game.ended received for unknown roomId: ${roomId}`);
      return;
    }
    if (room.status !== 'in_game') {
      this.logger.warn(`game.ended ignored, room status is already '${room.status}': ${roomId}`);
      return;
    }
    await this.roomRepo.setStatus(roomId, 'finished');
    this.logger.log(`Room finished: roomId=${roomId}`);
  }

  // ── R-09-1: Lấy trạng thái phòng (internal) ─────────────────────
  async getRoomState(roomId: string) {
    const room = await this.roomRepo.findByIdWithPlayers(roomId);
    if (!room) {
      throw new NotFoundException({ code: 'ROOM_NOT_FOUND', message: 'Phòng không tồn tại' });
    }

    return {
      roomId: room.id,
      roomCode: room.code,
      hostId: room.hostId,
      status: room.status,
      players: room.players.map((p) => ({
        guestId: p.playerId,
        displayName: p.displayName,
      })),
    };
  }

  // ── R-09: Quét dọn tự động (Cron Job) ───────────────────────────
  @Cron(CronExpression.EVERY_10_MINUTES)
  async cleanupZombieRooms() {
    this.logger.debug('Running cron job: cleaning up zombie rooms (waiting > 30 mins)...');
    const deletedCount = await this.roomRepo.deleteZombieRooms(30);
    if (deletedCount > 0) {
      this.logger.log(`Cron job completed: deleted ${deletedCount} zombie room(s).`);
    } else {
      this.logger.debug('Cron job completed: no zombie rooms found.');
    }
  }

  // ── Helper: Sinh roomCode 6 ký tự unique ────────────────────────
  private async generateUniqueCode(): Promise<string> {
    const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = Array.from(
        { length: 6 },
        () => CHARS[Math.floor(Math.random() * CHARS.length)],
      ).join('');

      const existing = await this.roomRepo.findByCode(code);
      if (!existing) return code;
    }
    throw new Error('Failed to generate unique room code after 5 attempts');
  }
}
