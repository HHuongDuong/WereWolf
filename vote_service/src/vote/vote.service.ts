import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from './redis.service';
import { KafkaProducerService } from './kafka.producer';

interface VoteStartPayload {
  roomId: string;
  round: number;
  alivePlayerIds: string[];
  durationSec: number;
}

interface VotePayload {
  roomId: string;
  round: number;
  voterId: string;
  targetId: string;
}

@Injectable()
export class VoteService {
  private readonly logger = new Logger(VoteService.name);
  private voteTimers = new Map<string, NodeJS.Timeout>();

  constructor(
    private readonly redis: RedisService,
    private readonly kafkaProducer: KafkaProducerService,
  ) {}

  async handleVoteStart(payload: VoteStartPayload) {
    const { roomId, round, alivePlayerIds, durationSec } = payload;

    this.logger.log(`Vote started: roomId=${roomId}, round=${round}, duration=${durationSec}s`);

    // Initialize vote session in Redis
    await this.redis.initVoteSession(roomId, round);

    // Clear existing timer if any
    const timerKey = `${roomId}:${round}`;
    const existingTimer = this.voteTimers.get(timerKey);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set timer to auto-resolve vote after duration
    const timer = setTimeout(async () => {
      await this.resolveVote(roomId, round, alivePlayerIds);
      this.voteTimers.delete(timerKey);
    }, durationSec * 1000);

    this.voteTimers.set(timerKey, timer);
  }

  async handleVote(payload: VotePayload): Promise<{ success: boolean; reason?: string }> {
    const { roomId, round, voterId, targetId } = payload;

    // Validate: cannot vote for yourself
    if (voterId === targetId) {
      return { success: false, reason: 'CANNOT_VOTE_SELF' };
    }

    // Record vote
    const recorded = await this.redis.recordVote(roomId, round, voterId, targetId);
    
    if (!recorded) {
      return { success: false, reason: 'ALREADY_VOTED' };
    }

    this.logger.debug(`Vote recorded: roomId=${roomId}, round=${round}, voter=${voterId}, target=${targetId}`);

    // Check if all alive players voted
    // Note: We need alivePlayerIds from game.vote.start, but we don't have it here
    // For now, we'll rely on timeout to resolve
    // TODO: Store alivePlayerIds in Redis when vote starts

    return { success: true };
  }

  private async resolveVote(roomId: string, round: number, alivePlayerIds: string[]) {
    this.logger.log(`Resolving vote: roomId=${roomId}, round=${round}`);

    // Get vote counts
    const counts = await this.redis.countVotes(roomId, round);

    // Find max votes
    let maxVotes = 0;
    let eliminatedId: string | null = null;
    const candidates: string[] = [];

    for (const [targetId, count] of Object.entries(counts)) {
      if (count > maxVotes) {
        maxVotes = count;
        eliminatedId = targetId;
        candidates.length = 0;
        candidates.push(targetId);
      } else if (count === maxVotes) {
        candidates.push(targetId);
      }
    }

    // Check for tie
    const tied = candidates.length > 1;
    if (tied) {
      eliminatedId = null; // No one eliminated on tie
    }

    // Publish result
    await this.kafkaProducer.publishVoteResult({
      roomId,
      round,
      counts,
      eliminatedId,
      tied,
    });

    this.logger.log(
      `Vote resolved: roomId=${roomId}, round=${round}, eliminatedId=${eliminatedId}, tied=${tied}`,
    );
  }
}
