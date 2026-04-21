import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class NightActionDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['GUARD', 'SEER', 'WEREWOLF', 'WITCH'])
  role: string;

  @IsString()
  @IsOptional()
  targetId?: string | null;
}
