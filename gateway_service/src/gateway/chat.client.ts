import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ChatServiceClient {
  private readonly logger = new Logger(ChatServiceClient.name);
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.CHAT_SERVICE_URL || 'http://localhost:3003';
  }

  async sendMessage(payload: {
    roomId: string;
    channel: string;
    senderId: string;
    senderName: string;
    content: string;
    round: number;
    phase: string;
  }) {
    try {
      const response = await axios.post(`${this.baseUrl}/chat/send`, payload);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to send chat message: ${error.message}`);
      throw error;
    }
  }
}
