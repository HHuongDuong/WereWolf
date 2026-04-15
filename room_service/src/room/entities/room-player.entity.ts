import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Room } from './room.entity';

@Entity('room_players')
export class RoomPlayer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Room, (r) => r.players, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  room: Room;

  /** guestId từ frontend — dạng "guest_" + 10 ký tự */
  @Column({ name: 'player_id', length: 50 })
  playerId: string;

  @Column({ name: 'display_name', length: 50 })
  displayName: string;

  /** Dùng để chọn host mới: player join sớm nhất còn lại */
  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date;
}
