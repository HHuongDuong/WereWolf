import { Controller, Post, Body, Logger } from '@nestjs/common';
import { VoteService } from './vote.service';

class SubmitVoteDto {
  roomId: string;
  round: number;
  voterId: string;
  targetId: string;
}

@Controller('vote')
export class VoteController {
  private readonly logger = new Logger(VoteController.name);

  constructor(private readonly voteService: VoteService) {}

  @Post('submit')
  async submitVote(@Body() dto: SubmitVoteDto) {
    this.logger.debug(`Received vote: roomId=${dto.roomId}, voter=${dto.voterId}, target=${dto.targetId}`);
    
    const result = await this.voteService.handleVote(dto);
    
    if (!result.success) {
      return {
        success: false,
        code: result.reason,
        message: this.getErrorMessage(result.reason),
      };
    }

    return { success: true };
  }

  private getErrorMessage(reason: string): string {
    switch (reason) {
      case 'CANNOT_VOTE_SELF':
        return 'Không thể vote cho chính mình';
      case 'ALREADY_VOTED':
        return 'Bạn đã vote rồi';
      default:
        return 'Vote không hợp lệ';
    }
  }
}
