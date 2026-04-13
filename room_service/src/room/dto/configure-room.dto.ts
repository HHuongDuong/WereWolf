import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/** Partial config — chỉ cần gửi những field muốn thay đổi */
export class RoomConfigUpdateDto {
  @IsOptional() @IsInt() @Min(20) @Max(60)
  guardDuration?: number;

  @IsOptional() @IsInt() @Min(20) @Max(60)
  seerDuration?: number;

  @IsOptional() @IsInt() @Min(30) @Max(60)
  werewolfDuration?: number;

  @IsOptional() @IsInt() @Min(20) @Max(60)
  witchDuration?: number;

  @IsOptional() @IsInt() @Min(30) @Max(180)
  discussDuration?: number;

  @IsOptional() @IsInt() @Min(20) @Max(60)
  voteDuration?: number;
}

export class ConfigureRoomDto {
  @IsString()
  @Matches(/^guest_[a-zA-Z0-9]{10}$/)
  guestId: string;

  @IsOptional() @IsInt() @Min(6) @Max(12)
  maxPlayers?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => RoomConfigUpdateDto)
  config?: RoomConfigUpdateDto;
}
