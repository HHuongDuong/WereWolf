import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Kafka, Consumer } from 'kafkajs';
import { VoteService } from './vote.service';

@Injectable()
export class KafkaConsumerService implements OnModuleInit {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private kafka: Kafka;
  private consumer: Consumer;

  constructor(private readonly voteService: VoteService) {
    this.kafka = new Kafka({
      clientId: 'vote-service',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9094'],
    });
    this.consumer = this.kafka.consumer({ groupId: 'vote-service' });
  }

  async onModuleInit() {
    await this.consumer.connect();
    this.logger.log('Kafka consumer connected');

    await this.consumer.subscribe({ topic: 'game.vote.start', fromBeginning: false });

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const payload = JSON.parse(message.value.toString());
        this.logger.debug(`Received ${topic}: roomId=${payload.roomId}, round=${payload.round}`);

        if (topic === 'game.vote.start') {
          await this.voteService.handleVoteStart(payload);
        }
      },
    });
  }
}
