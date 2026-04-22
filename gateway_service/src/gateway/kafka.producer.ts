import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class KafkaProducerService implements OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducerService.name);
  private readonly producer: Producer;
  private isConnected = false;

  constructor(private readonly configService: ConfigService) {
    const kafka = new Kafka({
      clientId: this.configService.get<string>('KAFKA_CLIENT_ID', 'gateway-service'),
      brokers: [this.configService.get<string>('KAFKA_BROKER', 'localhost:9094')],
    });
    this.producer = kafka.producer();
  }

  private async ensureConnected() {
    if (this.isConnected) return;
    await this.producer.connect();
    this.isConnected = true;
    this.logger.log('Kafka Producer connected');
  }

  async publish(topic: string, payload: unknown) {
    await this.ensureConnected();
    await this.producer.send({
      topic,
      messages: [{ value: JSON.stringify(payload) }],
    });
  }

  async onModuleDestroy() {
    if (!this.isConnected) return;
    await this.producer.disconnect();
    this.isConnected = false;
  }
}
