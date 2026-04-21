import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducerService.name);
  private kafka: Kafka;
  private producer: Producer;

  constructor() {
    this.kafka = new Kafka({
      clientId: 'gateway-service',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9094'],
    });
    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    await this.producer.connect();
    this.logger.log('Kafka producer connected');
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
    this.logger.log('Kafka producer disconnected');
  }

  async publishNightAction(payload: {
    eventId: string;
    roomId: string;
    playerId: string;
    role: string;
    targetId: string | null;
  }) {
    try {
      await this.producer.send({
        topic: 'game.night.action',
        messages: [{ value: JSON.stringify(payload) }],
      });
      this.logger.debug(
        `Published game.night.action: roomId=${payload.roomId}, role=${payload.role}, playerId=${payload.playerId}`,
      );
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to publish game.night.action: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async publishHunterShoot(payload: {
    roomId: string;
    hunterId: string;
    targetId: string;
  }) {
    try {
      await this.producer.send({
        topic: 'game.hunter.shoot',
        messages: [{ value: JSON.stringify(payload) }],
      });
      this.logger.debug(
        `Published game.hunter.shoot: roomId=${payload.roomId}, hunterId=${payload.hunterId}, targetId=${payload.targetId}`,
      );
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to publish game.hunter.shoot: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}
