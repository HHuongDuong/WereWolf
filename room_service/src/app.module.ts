import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { KafkaModule } from './kafka/kafka.module';
import { RoomModule } from './room/room.module';
import { Room } from './room/entities/room.entity';
import { RoomPlayer } from './room/entities/room-player.entity';

@Module({
  imports: [
    // Config global — đọc .env
    ConfigModule.forRoot({ isGlobal: true }),

    // Schedule (Cron)
    ScheduleModule.forRoot(),

    // PostgreSQL — synchronize: false vì dùng init.sql để tạo schema
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        entities: [Room, RoomPlayer],
        synchronize: false,
        logging: config.get<string>('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),

    // Kafka producer (@Global — available in KafkaModule everywhere)
    KafkaModule,

    // Room feature
    RoomModule,
  ],
})
export class AppModule {}
