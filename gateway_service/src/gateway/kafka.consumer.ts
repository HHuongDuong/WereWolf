import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Consumer } from 'kafkajs';
import { RoomGateway } from './room.gateway';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private consumer: Consumer;

  constructor(
    private readonly configService: ConfigService,
    private readonly roomGateway: RoomGateway,
  ) {
    const kafka = new Kafka({
      clientId: this.configService.get<string>('KAFKA_CLIENT_ID', 'gateway-service'),
      brokers: [this.configService.get<string>('KAFKA_BROKER', 'localhost:9094')],
    });
    this.consumer = kafka.consumer({ groupId: 'gateway-consumer-group' });
  }

  async onModuleInit() {
    await this.consumer.connect();
    this.logger.log('Kafka Consumer connected');

    await this.consumer.subscribe({ topic: 'room.updated', fromBeginning: false });
    await this.consumer.subscribe({ topic: 'room.deleted', fromBeginning: false });
    await this.consumer.subscribe({ topic: 'game.phase.changed', fromBeginning: false });
    await this.consumer.subscribe({ topic: 'game.vote.start', fromBeginning: false });
    await this.consumer.subscribe({ topic: 'vote.result', fromBeginning: false });
    await this.consumer.subscribe({ topic: 'game.ended', fromBeginning: false });
    
    await this.consumer.run({
      eachMessage: async ({ topic, message }) => {
        if (!message.value) return;
        const payload = JSON.parse(message.value.toString());

        if (topic === 'room.updated') {
            this.logger.debug(`[Kafka] Received room.updated for roomId=${payload.roomId}`);
            this.roomGateway.broadcastRoomUpdated(payload.roomId, payload);
        } else if (topic === 'room.deleted') {
            this.logger.debug(`[Kafka] Received room.deleted for roomId=${payload.roomId}`);
            this.roomGateway.broadcastRoomDeleted(payload.roomId);
        } else if (topic === 'game.phase.changed') {
            this.logger.debug(`[Kafka] Received game.phase.changed for roomId=${payload.roomId}, phase=${payload.phase}`);
            this.roomGateway.broadcastPhaseChanged(payload.roomId, payload);
        } else if (topic === 'game.vote.start') {
            this.logger.debug(`[Kafka] Received game.vote.start for roomId=${payload.roomId}, round=${payload.round}`);
            this.roomGateway.broadcastVoteStarted(payload.roomId, payload);
        } else if (topic === 'vote.result') {
            this.logger.debug(`[Kafka] Received vote.result for roomId=${payload.roomId}, eliminatedId=${payload.eliminatedId}`);
            this.roomGateway.broadcastVoteResult(payload.roomId, payload);
        } else if (topic === 'game.ended') {
            this.logger.debug(`[Kafka] Received game.ended for roomId=${payload.roomId}, winner=${payload.winner}`);
            this.roomGateway.broadcastGameEnded(payload.roomId, payload);
        }
      },
    });
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }
}
