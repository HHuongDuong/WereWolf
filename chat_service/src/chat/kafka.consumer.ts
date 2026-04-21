import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Kafka, Consumer } from 'kafkajs';
import { ChatService } from './chat.service';

@Injectable()
export class KafkaConsumerService implements OnModuleInit {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private kafka: Kafka;
  private consumer: Consumer;

  constructor(private readonly chatService: ChatService) {
    this.kafka = new Kafka({
      clientId: 'chat-service',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9094'],
    });
    this.consumer = this.kafka.consumer({ groupId: 'chat-service' });
  }

  async onModuleInit() {
    await this.consumer.connect();
    this.logger.log('Kafka consumer connected');

    await this.consumer.subscribe({ topic: 'game.chat.channel.updated', fromBeginning: false });

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const payload = JSON.parse(message.value.toString());
        this.logger.debug(
          `Received ${topic}: roomId=${payload.roomId}, channel=${payload.channel}, enabled=${payload.enabled}`,
        );

        if (topic === 'game.chat.channel.updated') {
          await this.chatService.handleChannelUpdate(payload);
        }
      },
    });
  }
}
