import { IsInt, IsString, Min } from 'class-validator';

export class VoteActionDto {
  @IsString()
  roomId: string;

  @IsInt()
  @Min(1)
  round: number;

  @IsString()
  targetId: string;
}
