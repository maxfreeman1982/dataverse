import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { WorkflowExecutionService } from './workflow-execution.service';
import { Workflow } from './entities/workflow.entity';
import { WorkflowExecution } from './entities/workflow-execution.entity';
import { WorkflowLog } from './entities/workflow-log.entity';
import {
  CreateWorkflowInput,
  UpdateWorkflowInput,
  ExecuteWorkflowInput,
} from './dto/workflow.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@Resolver(() => Workflow)
export class WorkflowResolver {
  constructor(
    private readonly workflowService: WorkflowService,
    private readonly executionService: WorkflowExecutionService,
  ) {}

  @Query(() => [Workflow], { name: 'workflows' })
  @UseGuards(JwtAuthGuard)
  async getWorkflows(@CurrentUser() user: User): Promise<Workflow[]> {
    return this.workflowService.findAll(user.id);
  }

  @Query(() => Workflow, { name: 'workflow' })
  @UseGuards(JwtAuthGuard)
  async getWorkflow(@Args('id', { type: () => ID }) id: string): Promise<Workflow> {
    return this.workflowService.findOne(id);
  }

  @Mutation(() => Workflow)
  @UseGuards(JwtAuthGuard)
  async createWorkflow(
    @Args('input') input: CreateWorkflowInput,
    @CurrentUser() user: User,
  ): Promise<Workflow> {
    return this.workflowService.create(input, user.id);
  }

  @Mutation(() => Workflow)
  @UseGuards(JwtAuthGuard)
  async updateWorkflow(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateWorkflowInput,
    @CurrentUser() user: User,
  ): Promise<Workflow> {
    return this.workflowService.update(id, input, user.id);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteWorkflow(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.workflowService.delete(id, user.id);
  }

  @Mutation(() => Workflow)
  @UseGuards(JwtAuthGuard)
  async toggleWorkflowEnabled(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<Workflow> {
    return this.workflowService.toggleEnabled(id, user.id);
  }

  // ========== EXECUTIONS ==========

  @Query(() => [WorkflowExecution], { name: 'workflowExecutions' })
  @UseGuards(JwtAuthGuard)
  async getExecutions(
    @Args('workflowId', { type: () => ID }) workflowId: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<WorkflowExecution[]> {
    return this.executionService.getWorkflowExecutions(workflowId, limit);
  }

  @Query(() => WorkflowExecution, { name: 'workflowExecution' })
  @UseGuards(JwtAuthGuard)
  async getExecution(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<WorkflowExecution> {
    return this.executionService.getExecution(id);
  }

  @Query(() => [WorkflowLog], { name: 'executionLogs' })
  @UseGuards(JwtAuthGuard)
  async getExecutionLogs(
    @Args('executionId', { type: () => ID }) executionId: string,
  ): Promise<WorkflowLog[]> {
    return this.executionService.getExecutionLogs(executionId);
  }

  @Mutation(() => WorkflowExecution)
  @UseGuards(JwtAuthGuard)
  async executeWorkflow(
    @Args('input') input: ExecuteWorkflowInput,
  ): Promise<WorkflowExecution> {
    return this.executionService.executeWorkflow(
      input.workflowId,
      input.triggerData,
    );
  }
}
