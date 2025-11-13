import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatResolver } from './chat.resolver';
import { Channel } from './entities/channel.entity';
import { Message } from './entities/message.entity';
import { User } from '../users/user.entity';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Channel, Message, User]),
    WebsocketModule,
  ],
  providers: [ChatService, ChatResolver],
  exports: [ChatService],
})
export class ChatModule {}
