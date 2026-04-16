import { IsNotEmpty, IsObject, IsOptional, IsString, Matches } from 'class-validator';

export class InternalWsPrivateDto {
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @IsString()
  @Matches(/^guest_[a-zA-Z0-9]{10}$/, {
    message: 'guestId phai co dinh dang guest_ + 10 ky tu alphanumeric',
  })
  guestId: string;

  @IsString()
  @IsNotEmpty()
  event: string;

  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;
}
