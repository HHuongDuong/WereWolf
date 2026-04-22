import { IsIn, IsOptional, IsString } from 'class-validator';

export class NightActionDto {
  @IsString()
  roomId: string;

  @IsString()
  @IsIn(['guard', 'seer', 'werewolf_kill', 'witch', 'hunter'])
  actionType: string;

  @IsOptional()
  @IsString()
  targetId?: string;
}

