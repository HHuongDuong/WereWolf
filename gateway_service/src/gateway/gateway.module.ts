import { Module } from '@nestjs/common';
import { RoomGateway } from './room.gateway';
import { RoomServiceClient } from './room.client';
import { VoteServiceClient } from './vote.client';
import { ChatServiceClient } from './chat.client';
import { KafkaConsumerService } from './kafka.consumer';
import { KafkaProducerService } from './kafka.producer';
import { InternalWsController } from './internal-ws.controller';

@Module({
  providers: [RoomGateway, RoomServiceClient, VoteServiceClient, ChatServiceClient, KafkaConsumerService, KafkaProducerService],
  controllers: [InternalWsController],
})
export class GatewayModule {}
