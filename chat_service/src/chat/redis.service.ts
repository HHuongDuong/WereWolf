import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

interface ChannelState {
  enabled: boolean;
  allowedGuestIds: string[];
}

@Injectable()
export class RedisService implements OnModuleInit {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  onModuleInit() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    });

    this.client.on('connect', () => {
      this.logger.log('Connected to Redis');
    });

    this.client.on('error', (err) => {
      this.logger.error(`Redis error: ${err.message}`);
    });
  }

  async setChannelState(roomId: string, channel: string, state: ChannelState): Promise<void> {
    const key = `chat_channel:${roomId}:${channel}`;
    await this.client.set(key, JSON.stringify(state), 'EX', 3600); // TTL 1 hour
    this.logger.debug(`Channel state updated: ${key} -> enabled=${state.enabled}`);
  }

  async getChannelState(roomId: string, channel: string): Promise<ChannelState | null> {
    const key = `chat_channel:${roomId}:${channel}`;
    const data = await this.client.get(key);
    
    if (!data) return null;
    
    return JSON.parse(data);
  }

  async isChannelEnabled(roomId: string, channel: string): Promise<boolean> {
    const state = await this.getChannelState(roomId, channel);
    return state?.enabled || false;
  }

  async isSenderAllowed(roomId: string, channel: string, senderId: string): Promise<boolean> {
    const state = await this.getChannelState(roomId, channel);
    
    if (!state || !state.enabled) return false;
    
    // If allowedGuestIds is empty, allow all
    if (state.allowedGuestIds.length === 0) return true;
    
    return state.allowedGuestIds.includes(senderId);
  }
}
