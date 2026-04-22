import { Module } from '@nestjs/common';
import { RoomGateway } from './room.gateway';
import { RoomServiceClient } from './room.client';
import { KafkaConsumerService } from './kafka.consumer';
import { KafkaProducerService } from './kafka.producer';
import { InternalWsController } from './internal-ws.controller';
import { VoteServiceClient } from './vote.client';

@Module({
  providers: [RoomGateway, RoomServiceClient, VoteServiceClient, KafkaConsumerService, KafkaProducerService],
  controllers: [InternalWsController],
})
export class GatewayModule {}
