import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatModule } from './chat/chat.module';
import { Message } from './chat/message.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5436'),
      username: process.env.POSTGRES_USER || 'werewolf',
      password: process.env.POSTGRES_PASSWORD || 'werewolf123',
      database: process.env.POSTGRES_DB || 'werewolf',
      entities: [Message],
      synchronize: true, // Auto-create tables (disable in production)
    }),
    ChatModule,
  ],
})
export class AppModule {}
