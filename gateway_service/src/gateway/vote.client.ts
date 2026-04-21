import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class VoteServiceClient {
  private readonly logger = new Logger(VoteServiceClient.name);
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.VOTE_SERVICE_URL || 'http://localhost:3004';
  }

  async submitVote(payload: {
    roomId: string;
    round: number;
    voterId: string;
    targetId: string;
  }) {
    try {
      const response = await axios.post(`${this.baseUrl}/vote/submit`, payload);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to submit vote: ${error.message}`);
      throw error;
    }
  }
}
