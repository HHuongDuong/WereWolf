import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ChatService } from './chat.service';

class SendMessageDto {
  roomId: string;
  channel: string;
  senderId: string;
  senderName: string;
  content: string;
  round: number;
  phase: string;
}

@Controller('chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(private readonly chatService: ChatService) {}

  @Post('send')
  async sendMessage(@Body() dto: SendMessageDto) {
    this.logger.log(`[RECEIVED] Chat request: room=${dto.roomId}, channel=${dto.channel}, sender=${dto.senderName}, content="${dto.content}"`);

    const result = await this.chatService.handleChatMessage(dto);

    if (!result.success) {
      return {
        success: false,
        code: result.reason,
        message: this.getErrorMessage(result.reason),
      };
    }

    return { success: true };
  }

  private getErrorMessage(reason: string): string {
    switch (reason) {
      case 'INVALID_CONTENT_LENGTH':
        return 'Tin nhắn quá dài (tối đa 200 ký tự)';
      case 'CHANNEL_DISABLED':
        return 'Kênh chat đã bị tắt';
      case 'SENDER_NOT_ALLOWED':
        return 'Bạn không được phép chat trong kênh này';
      default:
        return 'Không thể gửi tin nhắn';
    }
  }
}
