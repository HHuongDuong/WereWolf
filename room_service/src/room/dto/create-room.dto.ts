import { IsString, Matches, MinLength, MaxLength } from 'class-validator';

export class CreateRoomDto {
  /** Format: guest_ + 10 ký tự alphanumeric */
  @IsString()
  @Matches(/^guest_[a-zA-Z0-9]{10}$/, {
    message: 'guestId phải có định dạng guest_ + 10 ký tự alphanumeric',
  })
  guestId: string;

  @IsString()
  @MinLength(1, { message: 'displayName tối thiểu 1 ký tự' })
  @MaxLength(20, { message: 'displayName tối đa 20 ký tự' })
  displayName: string;
}
