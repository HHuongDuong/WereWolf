import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { RedisService } from './redis.service';
import { GatewayClient } from './gateway.client';
import { KafkaConsumerService } from './kafka.consumer';
import { Message } from './message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Message])],
  controllers: [ChatController],
  providers: [ChatService, RedisService, GatewayClient, KafkaConsumerService],
})
export class ChatModule {}
