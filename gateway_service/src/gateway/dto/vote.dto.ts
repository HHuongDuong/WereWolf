import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class VoteDto {
  @IsNumber()
  round: number;

  @IsString()
  @IsNotEmpty()
  targetId: string;
}
