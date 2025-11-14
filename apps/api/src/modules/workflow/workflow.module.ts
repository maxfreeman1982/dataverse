import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowService } from './workflow.service';
import { WorkflowExecutionService } from './workflow-execution.service';
import { WorkflowResolver } from './workflow.resolver';
import { Workflow } from './entities/workflow.entity';
import { WorkflowExecution } from './entities/workflow-execution.entity';
import { WorkflowLog } from './entities/workflow-log.entity';
import { DatabaseModule } from '../database/database.module';
import { ChatModule } from '../chat/chat.module';
import { AIModule } from '../ai/ai.module';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workflow, WorkflowExecution, WorkflowLog]),
    DatabaseModule,
    ChatModule,
    AIModule,
    WebsocketModule,
  ],
  providers: [WorkflowService, WorkflowExecutionService, WorkflowResolver],
  exports: [WorkflowService, WorkflowExecutionService],
})
export class WorkflowModule {}
