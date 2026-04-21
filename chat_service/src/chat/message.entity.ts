import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('messages')
@Index(['roomId', 'channel', 'sentAt'])
export class Message {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @Column({ type: 'uuid' })
  roomId: string;

  @Column({ type: 'int' })
  round: number;

  @Column({ type: 'varchar', length: 20 })
  phase: string;

  @Column({ type: 'varchar', length: 20 })
  channel: string; // 'all' | 'wolves'

  @Column({ type: 'varchar', length: 50 })
  senderId: string;

  @Column({ type: 'varchar', length: 50 })
  senderName: string;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn({ type: 'timestamptz' })
  sentAt: Date;
}
