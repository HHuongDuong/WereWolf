import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class VoteServiceClient {
  private readonly http: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    const baseURL = this.configService.get<string>(
      'VOTE_SERVICE_URL',
      'http://localhost:8084',
    );
    this.http = axios.create({ baseURL, timeout: 5000 });
  }

  async castVote(payload: {
    roomId: string;
    round: number;
    voterId: string;
    targetId: string;
  }) {
    await this.http.post('/api/votes', payload);
  }
}
