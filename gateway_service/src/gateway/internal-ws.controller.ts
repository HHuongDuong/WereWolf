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
