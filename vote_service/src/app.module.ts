import { Module } from '@nestjs/common';
import { VoteModule } from './vote/vote.module';

@Module({
  imports: [VoteModule],
})
export class AppModule {}
