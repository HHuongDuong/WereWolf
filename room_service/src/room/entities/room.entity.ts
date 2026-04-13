import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { RoomPlayer } from './room-player.entity';

// ── Config types ──────────────────────────────────────────────────
export interface RoomConfig {
  guardDuration: number;     // giây, default 30
  seerDuration: number;      // giây, default 30
  werewolfDuration: number;  // giây, default 45
  witchDuration: number;     // giây, default 30
  discussDuration: number;   // giây, default 60
  voteDuration: number;      // giây, default 30
}

export const DEFAULT_CONFIG: RoomConfig = {
  guardDuration: 30,
  seerDuration: 30,
  werewolfDuration: 45,
  witchDuration: 30,
  discussDuration: 60,
  voteDuration: 30,
};

export type RoomStatus = 'waiting' | 'in_game' | 'finished';

// ── Entity ────────────────────────────────────────────────────────
@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Mã phòng 6 ký tự [A-Z0-9], unique */
  @Column({ length: 6, unique: true })
  code: string;

  /** guestId của host */
  @Column({ name: 'host_id', length: 50 })
  hostId: string;

  /** waiting | in_game | finished */
  @Column({ default: 'waiting' })
  status: RoomStatus;

  /** Số người tối đa (6–12), default 8 */
  @Column({ name: 'max_players', default: 8 })
  maxPlayers: number;

  /** Cấu hình timeout từng phase — lưu dưới dạng JSONB */
  @Column({ type: 'jsonb' })
  config: RoomConfig;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /** null khi game chưa kết thúc */
  @Column({ name: 'ended_at', type: 'timestamptz', nullable: true })
  endedAt: Date | null;

  @OneToMany(() => RoomPlayer, (rp) => rp.room)
  players: RoomPlayer[];
}
