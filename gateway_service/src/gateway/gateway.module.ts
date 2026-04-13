import { Module } from '@nestjs/common';
import { RoomGateway } from './room.gateway';
import { RoomServiceClient } from './room.client';

@Module({
  providers: [RoomGateway, RoomServiceClient],
})
export class GatewayModule {}
