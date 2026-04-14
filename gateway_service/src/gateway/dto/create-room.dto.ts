import { IsString, Matches, MinLength, MaxLength } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @Matches(/^guest_[a-zA-Z0-9]{10}$/, {
    message: 'guestId phải có định dạng guest_ + 10 ký tự alphanumeric',
  })
  guestId: string;

  @IsString()
  @MinLength(1)
  @MaxLength(20)
  displayName: string;
}
