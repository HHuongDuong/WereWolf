import { Module } from '@nestjs/common';
import { RoomGateway } from './room.gateway';
import { RoomServiceClient } from './room.client';
import { KafkaConsumerService } from './kafka.consumer';
import { InternalWsController } from './internal-ws.controller';

@Module({
  providers: [RoomGateway, RoomServiceClient, KafkaConsumerService],
  controllers: [InternalWsController],
})
export class GatewayModule {}
