import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { RedisService } from './redis.service';
import { GatewayClient } from './gateway.client';

interface ChannelUpdatePayload {
  roomId: string;
  channel: string;
  enabled: boolean;
  allowedGuestIds: string[];
  round: number;
}

interface ChatMessagePayload {
  roomId: string;
  channel: string;
  senderId: string;
  senderName: string;
  content: string;
  round: number;
  phase: string;
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private redisService: RedisService,
    private gatewayClient: GatewayClient,
  ) {}

  async handleChannelUpdate(payload: ChannelUpdatePayload) {
    const { roomId, channel, enabled, allowedGuestIds } = payload;

    await this.redisService.setChannelState(roomId, channel, {
      enabled,
      allowedGuestIds,
    });

    this.logger.log(
      `Channel updated: room=${roomId}, channel=${channel}, enabled=${enabled}, allowed=${allowedGuestIds.length}`,
    );
  }

  async handleChatMessage(payload: ChatMessagePayload): Promise<{ success: boolean; reason?: string }> {
    const { roomId, channel, senderId, senderName, content, round, phase } = payload;

    // Validate content length
    if (!content || content.length > 200) {
      return { success: false, reason: 'INVALID_CONTENT_LENGTH' };
    }

    // Check if channel is enabled
    const isEnabled = await this.redisService.isChannelEnabled(roomId, channel);
    if (!isEnabled) {
      return { success: false, reason: 'CHANNEL_DISABLED' };
    }

    // Check if sender is allowed
    const isAllowed = await this.redisService.isSenderAllowed(roomId, channel, senderId);
    if (!isAllowed) {
      return { success: false, reason: 'SENDER_NOT_ALLOWED' };
    }

    // Save to database
    const message = this.messageRepository.create({
      roomId,
      round,
      phase,
      channel,
      senderId,
      senderName,
      content,
    });

    await this.messageRepository.save(message);

    // Broadcast to clients via Gateway
    this.logger.log(`[BROADCAST] About to broadcast chat: room=${roomId}, channel=${channel}, sender=${senderName}, content="${content}"`);
    
    await this.gatewayClient.broadcastChatMessage(roomId, channel, {
      senderName,
      channel,
      content,
      sentAt: Date.now(),
    });

    this.logger.log(`[BROADCAST] Chat message broadcasted: room=${roomId}, channel=${channel}, sender=${senderName}`);

    return { success: true };
  }
}
