import { IsString, Matches } from 'class-validator';

export class StartGameDto {
  @IsString()
  @Matches(/^guest_[a-zA-Z0-9]{10}$/, {
    message: 'guestId phải có định dạng guest_ + 10 ký tự alphanumeric',
  })
  guestId: string;
}

export class CancelRoomDto {
  @IsString()
  @Matches(/^guest_[a-zA-Z0-9]{10}$/)
  guestId: string;
}

export class LeaveRoomDto {
  @IsString()
  @Matches(/^guest_[a-zA-Z0-9]{10}$/)
  guestId: string;

  @IsString()
  roomId: string;
}
