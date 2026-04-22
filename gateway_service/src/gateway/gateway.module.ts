import { Module } from '@nestjs/common';
import { RoomGateway } from './room.gateway';
import { RoomServiceClient } from './room.client';
import { KafkaConsumerService } from './kafka.consumer';
import { KafkaProducerService } from './kafka.producer';
import { InternalWsController } from './internal-ws.controller';

@Module({
  providers: [RoomGateway, RoomServiceClient, KafkaConsumerService, KafkaProducerService],
  controllers: [InternalWsController],
})
export class GatewayModule {}
