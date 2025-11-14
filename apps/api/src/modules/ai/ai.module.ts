import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AIService } from './ai.service';
import { AIResolver } from './ai.resolver';
import { EnhancedAIService } from './enhanced-ai.service';
import { EnhancedAIResolver } from './enhanced-ai.resolver';
import { RAGService } from './rag.service';
import { AIConversation } from './entities/ai-conversation.entity';
import { AIMessage } from './entities/ai-message.entity';
import { DocumentEmbedding } from './entities/document-embedding.entity';
import { DatabaseModule } from '../database/database.module';
import { BuilderModule } from '../builder/builder.module';
import { ChatModule } from '../chat/chat.module';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AIConversation, AIMessage, DocumentEmbedding]),
    DatabaseModule,
    BuilderModule,
    ChatModule,
    WebsocketModule,
  ],
  providers: [
    AIService,
    AIResolver,
    EnhancedAIService,
    EnhancedAIResolver,
    RAGService,
  ],
  exports: [AIService, EnhancedAIService, RAGService],
})
export class AIModule {}
