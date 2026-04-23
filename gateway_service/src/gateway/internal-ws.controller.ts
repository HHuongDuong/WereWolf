import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RoomGateway } from './room.gateway';
import { InternalWsPrivateDto } from './dto/internal-ws-private.dto';
import { IsString, IsNumber, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

class ChatMessageDto {
  @IsString()
  @IsNotEmpty()
  senderName: string;

  @IsString()
  @IsNotEmpty()
  channel: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNumber()
  sentAt: number;
}

class BroadcastChatDto {
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @IsString()
  @IsNotEmpty()
  channel: string;

  @ValidateNested()
  @Type(() => ChatMessageDto)
  message: ChatMessageDto;
}

@Controller('internal/ws')
export class InternalWsController {
  constructor(
    private readonly roomGateway: RoomGateway,
    private readonly configService: ConfigService,
  ) {}

  @Post('private')
  @HttpCode(HttpStatus.OK)
  sendPrivate(
    @Headers('x-internal-token') token: string | undefined,
    @Body() dto: InternalWsPrivateDto,
  ) {
    this.assertInternalToken(token);
    return this.roomGateway.sendPrivateToGuest(dto.roomId, dto.guestId, dto.event, dto.data);
  }

  @Post('chat/broadcast')
  @HttpCode(HttpStatus.OK)
  broadcastChat(
    @Headers('x-internal-token') token: string | undefined,
    @Body() dto: any,
  ) {
    this.assertInternalToken(token);
    
    if (!dto.roomId || !dto.channel || !dto.message) {
      throw new UnauthorizedException({
        code: 'INVALID_PAYLOAD',
        message: 'Missing roomId, channel, or message',
      });
    }
    
    this.roomGateway.broadcastEvent(dto.roomId, 'chat_message', {
      senderName: dto.message.senderName,
      channel: dto.channel,
      content: dto.message.content,
      sentAt: dto.message.sentAt,
    });
    return { success: true };
  }

  private assertInternalToken(token: string | undefined) {
    const expected = this.configService.get<string>('INTERNAL_API_TOKEN');
    if (!expected) return;
    if (!token || token !== expected) {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Invalid internal token',
      });
    }
  }
}
