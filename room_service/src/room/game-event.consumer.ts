import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Consumer } from 'kafkajs';
import { RoomService } from './room.service';

/**
 * Kafka consumer cho topic `game.ended`.
 * Khi gameplay-service kết thúc game → update rooms.status = 'finished'.
 * Đặt trong RoomModule để inject RoomService trực tiếp (tránh circular dep).
 */
@Injectable()
export class GameEventConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(GameEventConsumer.name);
  private consumer: Consumer;

  constructor(
    private readonly configService: ConfigService,
    private readonly roomService: RoomService,
  ) {
    const kafka = new Kafka({
      clientId: `${this.configService.get<string>('KAFKA_CLIENT_ID', 'room-service')}-consumer`,
      brokers: [this.configService.get<string>('KAFKA_BROKER', 'localhost:9094')],
    });
    this.consumer = kafka.consumer({
      groupId: this.configService.get<string>('KAFKA_GROUP_ID', 'room-service-group'),
    });
  }

  async onModuleInit() {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: 'game.ended', fromBeginning: false });

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        if (!message.value) return;
        try {
          const payload = JSON.parse(message.value.toString());
          this.logger.log(`[${topic}] partition=${partition} payload=${JSON.stringify(payload)}`);

          if (topic === 'game.ended' && payload.roomId) {
            await this.roomService.finishRoom(payload.roomId);
          }
        } catch (err) {
          this.logger.error(`Error processing ${topic}: ${err.message}`, err.stack);
        }
      },
    });

    this.logger.log('Kafka Consumer connected — listening to [game.ended]');
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }
}
