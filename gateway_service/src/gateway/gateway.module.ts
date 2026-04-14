import { Module } from '@nestjs/common';
import { RoomGateway } from './room.gateway';
import { RoomServiceClient } from './room.client';
import { KafkaConsumerService } from './kafka.consumer';

@Module({
  providers: [RoomGateway, RoomServiceClient, KafkaConsumerService],
})
export class GatewayModule {}
