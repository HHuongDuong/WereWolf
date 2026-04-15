import { IsString, Length, Matches, MinLength, MaxLength } from 'class-validator';

export class JoinRoomDto {
  @IsString()
  @Matches(/^guest_[a-zA-Z0-9]{10}$/, {
    message: 'guestId phải có định dạng guest_ + 10 ký tự alphanumeric',
  })
  guestId: string;

  @IsString()
  @MinLength(1)
  @MaxLength(20)
  displayName: string;

  /** Mã phòng 6 ký tự */
  @IsString()
  @Length(6, 6, { message: 'roomCode phải đúng 6 ký tự' })
  roomCode: string;
}
