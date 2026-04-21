import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

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

  getClient(): Redis {
    return this.client;
  }

  // Initialize vote session
  async initVoteSession(roomId: string, round: number): Promise<void> {
    const key = `votes:${roomId}:${round}`;
    // Delete old hash if exists
    await this.client.del(key);
    // Set TTL 600s (10 minutes)
    await this.client.expire(key, 600);
    this.logger.debug(`Initialized vote session: ${key}`);
  }

  // Record a vote
  async recordVote(roomId: string, round: number, voterId: string, targetId: string): Promise<boolean> {
    const key = `votes:${roomId}:${round}`;
    
    // Check if voter already voted
    const existing = await this.client.hexists(key, voterId);
    if (existing) {
      return false; // Already voted
    }

    // Record vote atomically
    await this.client.hset(key, voterId, targetId);
    return true;
  }

  // Get all votes
  async getAllVotes(roomId: string, round: number): Promise<Record<string, string>> {
    const key = `votes:${roomId}:${round}`;
    return await this.client.hgetall(key);
  }

  // Count votes
  async countVotes(roomId: string, round: number): Promise<Record<string, number>> {
    const votes = await this.getAllVotes(roomId, round);
    const counts: Record<string, number> = {};

    for (const targetId of Object.values(votes)) {
      counts[targetId] = (counts[targetId] || 0) + 1;
    }

    return counts;
  }

  // Check if all alive players voted
  async checkAllVoted(roomId: string, round: number, alivePlayerIds: string[]): Promise<boolean> {
    const votes = await this.getAllVotes(roomId, round);
    const votedIds = new Set(Object.keys(votes));

    return alivePlayerIds.every(id => votedIds.has(id));
  }
}
