import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room, DEFAULT_CONFIG, RoomConfig, RoomStatus } from './entities/room.entity';
import { RoomPlayer } from './entities/room-player.entity';

@Injectable()
export class RoomRepository {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepo: Repository<Room>,

    @InjectRepository(RoomPlayer)
    private readonly playerRepo: Repository<RoomPlayer>,
  ) {}

  // ── Finders ──────────────────────────────────────────────────────

  findByCode(code: string): Promise<Room | null> {
    return this.roomRepo.findOne({
      where: { code },
      relations: ['players'],
    });
  }

  findByIdWithPlayers(id: string): Promise<Room | null> {
    return this.roomRepo.findOne({
      where: { id },
      relations: ['players'],
    });
  }

  // ── Writers ──────────────────────────────────────────────────────

  /** Tạo phòng + thêm host vào room_players trong 2 bước */
  async createRoom(
    hostId: string,
    displayName: string,
    code: string,
  ): Promise<Room> {
    // 1. Tạo room
    const room = this.roomRepo.create({
      code,
      hostId,
      status: 'waiting',
      maxPlayers: 8,
      config: DEFAULT_CONFIG,
    });
    await this.roomRepo.save(room);

    // 2. Thêm host là player đầu tiên
    const player = this.playerRepo.create({
      room: { id: room.id },
      playerId: hostId,
      displayName,
    });
    await this.playerRepo.save(player);

    return this.findByIdWithPlayers(room.id);
  }

  /** Thêm một player vào phòng */
  async addPlayer(
    roomId: string,
    guestId: string,
    displayName: string,
  ): Promise<void> {
    const player = this.playerRepo.create({
      room: { id: roomId },
      playerId: guestId,
      displayName,
    });
    await this.playerRepo.save(player);
  }

  /** Cập nhật maxPlayers và/hoặc config (merge partial config) */
  async updateConfig(
    roomId: string,
    maxPlayers?: number,
    configPatch?: Partial<RoomConfig>,
  ): Promise<void> {
    const room = await this.roomRepo.findOne({ where: { id: roomId } });
    if (!room) return;

    if (maxPlayers !== undefined) room.maxPlayers = maxPlayers;
    if (configPatch) room.config = { ...room.config, ...configPatch };

    await this.roomRepo.save(room);
  }

  /** Đổi status phòng (in_game | finished) */
  async setStatus(roomId: string, status: RoomStatus): Promise<void> {
    const updates: Partial<Room> = { status };
    if (status === 'finished') updates.endedAt = new Date();
    await this.roomRepo.update(roomId, updates);
  }

  /** Xóa phòng — CASCADE xóa room_players */
  async deleteRoom(roomId: string): Promise<void> {
    await this.roomRepo.delete(roomId);
  }

  /** Xóa một player khỏi phòng */
  async removePlayer(roomId: string, guestId: string): Promise<void> {
    await this.playerRepo.delete({
      room: { id: roomId },
      playerId: guestId,
    });
  }

  /** Cập nhật host mới */
  async updateHost(roomId: string, newHostId: string): Promise<void> {
    await this.roomRepo.update(roomId, { hostId: newHostId });
  }

  /**
   * Lấy player có joined_at sớm nhất còn lại (để assign host mới).
   * Query AFTER đã xóa player cũ.
   */
  async getEarliestPlayer(roomId: string): Promise<RoomPlayer | null> {
    return this.playerRepo.findOne({
      where: { room: { id: roomId } },
      order: { joinedAt: 'ASC' },
    });
  }

  /**
   * Xóa các phòng lơ lửng ở trạng thái 'waiting' quá lâu (zombie rooms)
   */
  async deleteZombieRooms(minutesOld: number = 30): Promise<number> {
    const thresholdDate = new Date();
    thresholdDate.setMinutes(thresholdDate.getMinutes() - minutesOld);

    const result = await this.roomRepo
      .createQueryBuilder()
      .delete()
      .from(Room)
      .where("status = :status AND created_at < :threshold", {
        status: 'waiting',
        threshold: thresholdDate,
      })
      .execute();

    return result.affected || 0;
  }
}
