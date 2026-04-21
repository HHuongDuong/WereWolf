import { Module } from '@nestjs/common';
import { VoteService } from './vote.service';
import { VoteController } from './vote.controller';
import { RedisService } from './redis.service';
import { KafkaConsumerService } from './kafka.consumer';
import { KafkaProducerService } from './kafka.producer';

@Module({
  controllers: [VoteController],
  providers: [VoteService, RedisService, KafkaConsumerService, KafkaProducerService],
})
export class VoteModule {}
