import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Email } from './entities/email.entity';
import { EmailThread } from './entities/email-thread.entity';
import { MailService } from './mail.service';
import { MailAIService } from './mail-ai.service';
import { MailResolver } from './mail.resolver';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Email, EmailThread]),
    WebsocketModule,
  ],
  providers: [MailService, MailAIService, MailResolver],
  exports: [MailService, MailAIService],
})
export class MailModule {}
