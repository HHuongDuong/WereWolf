import { IsString, IsNotEmpty, MaxLength, IsIn } from 'class-validator';

export class ChatMessageDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['all', 'wolves'])
  channel: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  content: string;
}
