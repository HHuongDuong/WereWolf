import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class GatewayClient {
  private readonly logger = new Logger(GatewayClient.name);
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.GATEWAY_URL || 'http://localhost:3001';
  }

  async broadcastChatMessage(roomId: string, channel: string, message: any) {
    try {
      await axios.post(
        `${this.baseUrl}/internal/ws/chat/broadcast`,
        {
          roomId,
          channel,
          message,
        },
        {
          headers: {
            'x-internal-token': process.env.INTERNAL_API_TOKEN || '',
          },
        },
      );
      
      this.logger.debug(`Broadcast chat to room ${roomId}, channel ${channel}`);
    } catch (error) {
      this.logger.error(`Failed to broadcast chat: ${error.message}`);
      throw error;
    }
  }
}
