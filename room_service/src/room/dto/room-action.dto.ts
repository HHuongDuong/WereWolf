import { IsString, Matches } from 'class-validator';

export class StartGameDto {
  @IsString()
  @Matches(/^guest_[a-zA-Z0-9]{10}$/, {
    message: 'guestId phải có định dạng guest_ + 10 ký tự alphanumeric',
  })
  guestId: string;
}

/** Dùng cho DELETE /rooms/:roomId — host cancel phòng */
export class CancelRoomDto {
  @IsString()
  @Matches(/^guest_[a-zA-Z0-9]{10}$/)
  guestId: string;
}
