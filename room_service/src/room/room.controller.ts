import {
  Controller,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { ConfigureRoomDto } from './dto/configure-room.dto';
import { StartGameDto, CancelRoomDto } from './dto/room-action.dto';

@ApiTags('rooms')
@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  /**
   * R-01 — Tạo phòng
   * POST /rooms
   * Body: { guestId, displayName }
   * Return: { roomId, roomCode, hostId }
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo phòng mới (R-01)' })
  @ApiResponse({ status: 201, description: 'Phòng được tạo thành công' })
  createRoom(@Body() dto: CreateRoomDto) {
    return this.roomService.createRoom(dto);
  }

  /**
   * R-02 — Join phòng
   * POST /rooms/join
   * Body: { guestId, displayName, roomCode }
   * Return: { roomId, players[] }
   */
  @Post('join')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Join phòng (R-02)' })
  @ApiResponse({ status: 200, description: 'Join thành công, trả về danh sách player' })
  @ApiResponse({ status: 400, description: 'Phòng đầy hoặc không thể join' })
  @ApiResponse({ status: 404, description: 'Phòng không tồn tại' })
  joinRoom(@Body() dto: JoinRoomDto) {
    return this.roomService.joinRoom(dto);
  }

  /**
   * R-03 — Cấu hình phòng (chỉ host)
   * PATCH /rooms/:roomId/config
   * Body: { guestId, maxPlayers?, config? }
   */
  @Patch(':roomId/config')
  @ApiOperation({ summary: 'Cấu hình phòng (R-03)' })
  configureRoom(
    @Param('roomId') roomId: string,
    @Body() dto: ConfigureRoomDto,
  ) {
    return this.roomService.configureRoom(roomId, dto);
  }

  /**
   * R-04 — Start game (chỉ host, đủ người)
   * POST /rooms/:roomId/start
   * Body: { guestId }
   */
  @Post(':roomId/start')
  @ApiOperation({ summary: 'Start game (R-04)' })
  startGame(@Param('roomId') roomId: string, @Body() dto: StartGameDto) {
    return this.roomService.startGame(roomId, dto);
  }

  /**
   * R-05 — Cancel phòng (chỉ host, chỉ khi waiting)
   * DELETE /rooms/:roomId
   * Body: { guestId }
   */
  @Delete(':roomId')
  @ApiOperation({ summary: 'Cancel phòng (R-05)' })
  cancelRoom(@Param('roomId') roomId: string, @Body() dto: CancelRoomDto) {
    return this.roomService.cancelRoom(roomId, dto.guestId);
  }

  /**
   * R-06 — Player tự out
   * DELETE /rooms/:roomId/players/:guestId
   */
  @Delete(':roomId/players/:guestId')
  @ApiOperation({ summary: 'Player tự out khỏi phòng (R-06)' })
  leaveRoom(
    @Param('roomId') roomId: string,
    @Param('guestId') guestId: string,
  ) {
    return this.roomService.leaveRoom(roomId, guestId);
  }

  /**
   * R-07 — Assign host mới (internal — gọi bởi gateway khi detect disconnect)
   * PATCH /rooms/:roomId/host
   */
  @Patch(':roomId/host')
  @ApiOperation({ summary: 'Assign host mới (R-07) - Gọi internal bởi gateway' })
  assignHost(@Param('roomId') roomId: string) {
    return this.roomService.assignNewHost(roomId);
  }
}
