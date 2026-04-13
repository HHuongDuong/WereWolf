import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from './entities/room.entity';
import { RoomPlayer } from './entities/room-player.entity';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { RoomRepository } from './room.repository';
import { GameEventConsumer } from './game-event.consumer';

@Module({
  imports: [
    // Đăng ký entities — KafkaProducerService available via @Global() KafkaModule
    TypeOrmModule.forFeature([Room, RoomPlayer]),
  ],
  controllers: [RoomController],
  providers: [RoomService, RoomRepository, GameEventConsumer],
  exports: [RoomService],
})
export class RoomModule {}
