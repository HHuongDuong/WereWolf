import { IsString, IsNotEmpty } from 'class-validator';

export class HunterShootDto {
  @IsString()
  @IsNotEmpty()
  targetId: string;
}
