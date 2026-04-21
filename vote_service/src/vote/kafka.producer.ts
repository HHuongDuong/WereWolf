import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducerService.name);
  private kafka: Kafka;
  private producer: Producer;

  constructor() {
    this.kafka = new Kafka({
      clientId: 'vote-service',
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
  }

  async publishVoteResult(payload: {
    roomId: string;
    round: number;
    counts: Record<string, number>;
    eliminatedId: string | null;
    tied: boolean;
  }) {
    try {
      await this.producer.send({
        topic: 'vote.result',
        messages: [{ value: JSON.stringify(payload) }],
      });
      this.logger.log(
        `Published vote.result: roomId=${payload.roomId}, round=${payload.round}, eliminatedId=${payload.eliminatedId}, tied=${payload.tied}`,
      );
    } catch (error) {
      this.logger.error(`Failed to publish vote.result: ${error.message}`);
      throw error;
    }
  }
}
