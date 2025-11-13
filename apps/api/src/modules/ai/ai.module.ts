import { Module } from '@nestjs/common';
import { AIService } from './ai.service';
import { AIResolver } from './ai.resolver';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [AIService, AIResolver],
  exports: [AIService],
})
export class AIModule {}
