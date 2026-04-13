import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer, Partitioners } from 'kafkajs';
import { Room } from '../room/entities/room.entity';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducerService.name);
  private producer: Producer;

  constructor(private readonly configService: ConfigService) {
    const kafka = new Kafka({
      clientId: this.configService.get<string>('KAFKA_CLIENT_ID', 'room-service'),
      brokers: [this.configService.get<string>('KAFKA_BROKER', 'localhost:9094')],
    });
    this.producer = kafka.producer({
      createPartitioner: Partitioners.LegacyPartitioner,
    });
  }

  async onModuleInit() {
    await this.producer.connect();
    this.logger.log('Kafka Producer connected');
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }

  /**
   * Publish sự kiện room.started lên Kafka.
   * Consumer: gameplay-service (Java).
   * Payload theo RSD mục 5 — dùng guestId, có đầy đủ config object.
   */
  async publishRoomStarted(room: Room): Promise<void> {
    const payload = {
      roomId: room.id,
      roomCode: room.code,
      players: room.players.map((p) => ({
        guestId: p.playerId,
        displayName: p.displayName,
      })),
      config: {
        maxPlayers: room.maxPlayers,
        guardDuration: room.config.guardDuration,
        seerDuration: room.config.seerDuration,
        werewolfDuration: room.config.werewolfDuration,
        witchDuration: room.config.witchDuration,
        discussDuration: room.config.discussDuration,
        voteDuration: room.config.voteDuration,
      },
    };

    await this.producer.send({
      topic: 'room.started',
      messages: [{ key: room.id, value: JSON.stringify(payload) }],
    });

    this.logger.log(`[room.started] roomId=${room.id} players=${room.players.length}`);
  }
}
