import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  WorkflowExecution,
  ExecutionStatus,
} from './entities/workflow-execution.entity';
import { WorkflowLog, LogLevel } from './entities/workflow-log.entity';
import { Workflow } from './entities/workflow.entity';
import { RecordsService } from '../database/records.service';
import { ChatService } from '../chat/chat.service';
import { EnhancedAIService } from '../ai/enhanced-ai.service';

export enum NodeType {
  TRIGGER = 'trigger',
  CREATE_RECORD = 'create_record',
  UPDATE_RECORD = 'update_record',
  DELETE_RECORD = 'delete_record',
  SEND_MESSAGE = 'send_message',
  AI_TASK = 'ai_task',
  CONDITION = 'condition',
  DELAY = 'delay',
  WEBHOOK = 'webhook',
}

@Injectable()
export class WorkflowExecutionService {
  private readonly logger = new Logger(WorkflowExecutionService.name);

  constructor(
    @InjectRepository(WorkflowExecution)
    private readonly executionRepository: Repository<WorkflowExecution>,
    @InjectRepository(WorkflowLog)
    private readonly logRepository: Repository<WorkflowLog>,
    @InjectRepository(Workflow)
    private readonly workflowRepository: Repository<Workflow>,
    private readonly recordsService: RecordsService,
    private readonly chatService: ChatService,
    private readonly enhancedAIService: EnhancedAIService,
  ) {}

  /**
   * Execute a workflow
   */
  async executeWorkflow(
    workflowId: string,
    triggerData?: Record<string, any>,
  ): Promise<WorkflowExecution> {
    const workflow = await this.workflowRepository.findOne({
      where: { id: workflowId },
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    if (!workflow.enabled) {
      throw new Error('Workflow is disabled');
    }

    // Create execution record
    const execution = this.executionRepository.create({
      workflowId,
      status: ExecutionStatus.PENDING,
      triggerData,
    });

    const savedExecution = await this.executionRepository.save(execution);

    // Execute asynchronously
    this.runWorkflow(savedExecution.id, workflow, triggerData).catch((error) => {
      const err = error as Error;
      this.logger.error(`Workflow execution failed: ${err.message}`, error);
    });

    return savedExecution;
  }

  /**
   * Run workflow execution
   */
  private async runWorkflow(
    executionId: string,
    workflow: Workflow,
    triggerData?: Record<string, any>,
  ): Promise<void> {
    const startTime = Date.now();

    try {
      // Update status to running
      await this.executionRepository.update(executionId, {
        status: ExecutionStatus.RUNNING,
      });

      // Find start node (trigger)
      const startNode = workflow.nodes.find((n) => n.type === NodeType.TRIGGER);
      if (!startNode) {
        throw new Error('No trigger node found');
      }

      // Execute workflow graph
      const context = { triggerData, variables: {} };
      await this.executeNode(
        executionId,
        startNode,
        workflow.nodes,
        workflow.edges,
        context,
      );

      // Mark as success
      const duration = Date.now() - startTime;
      await this.executionRepository.update(executionId, {
        status: ExecutionStatus.SUCCESS,
        completedAt: new Date(),
        durationMs: duration,
      });

      // Update workflow stats
      await this.workflowRepository.update(workflow.id, {
        lastExecutedAt: new Date(),
        executionCount: () => 'execution_count + 1',
      });

      this.logger.log(`Workflow ${workflow.id} executed successfully in ${duration}ms`);
    } catch (error) {
      const err = error as Error;
      const duration = Date.now() - startTime;
      await this.executionRepository.update(executionId, {
        status: ExecutionStatus.FAILED,
        error: err.message,
        completedAt: new Date(),
        durationMs: duration,
      });

      await this.createLog(
        executionId,
        'error',
        LogLevel.ERROR,
        `Workflow failed: ${err.message}`,
        { error: err.stack },
      );

      throw error;
    }
  }

  /**
   * Execute a single node
   */
  private async executeNode(
    executionId: string,
    node: any,
    allNodes: any[],
    edges: any[],
    context: Record<string, any>,
  ): Promise<any> {
    await this.createLog(
      executionId,
      node.id,
      LogLevel.INFO,
      `Executing node: ${node.type}`,
      { nodeData: node.data },
    );

    let result: any;

    try {
      switch (node.type) {
        case NodeType.TRIGGER:
          result = context.triggerData;
          break;

        case NodeType.CREATE_RECORD:
          result = await this.handleCreateRecord(node.data, context);
          break;

        case NodeType.UPDATE_RECORD:
          result = await this.handleUpdateRecord(node.data, context);
          break;

        case NodeType.DELETE_RECORD:
          result = await this.handleDeleteRecord(node.data, context);
          break;

        case NodeType.SEND_MESSAGE:
          result = await this.handleSendMessage(node.data, context);
          break;

        case NodeType.AI_TASK:
          result = await this.handleAITask(node.data, context);
          break;

        case NodeType.CONDITION:
          result = await this.handleCondition(node.data, context);
          break;

        case NodeType.DELAY:
          result = await this.handleDelay(node.data);
          break;

        case NodeType.WEBHOOK:
          result = await this.handleWebhook(node.data, context);
          break;

        default:
          throw new Error(`Unknown node type: ${node.type}`);
      }

      // Store result in context
      context.variables[node.id] = result;

      await this.createLog(
        executionId,
        node.id,
        LogLevel.INFO,
        `Node completed successfully`,
        { result },
      );

      // Find next nodes
      const nextEdges = edges.filter((e) => e.source === node.id);

      // Handle conditional branching
      if (node.type === NodeType.CONDITION && result !== undefined) {
        const targetHandle = result ? 'true' : 'false';
        const conditionalEdge = nextEdges.find((e) => e.sourceHandle === targetHandle);
        if (conditionalEdge) {
          const nextNode = allNodes.find((n) => n.id === conditionalEdge.target);
          if (nextNode) {
            await this.executeNode(executionId, nextNode, allNodes, edges, context);
          }
        }
      } else {
        // Execute all next nodes
        for (const edge of nextEdges) {
          const nextNode = allNodes.find((n) => n.id === edge.target);
          if (nextNode) {
            await this.executeNode(executionId, nextNode, allNodes, edges, context);
          }
        }
      }

      return result;
    } catch (error) {
      const err = error as Error;
      await this.createLog(
        executionId,
        node.id,
        LogLevel.ERROR,
        `Node failed: ${err.message}`,
        { error: err.stack },
      );
      throw error;
    }
  }

  // ========== NODE HANDLERS ==========

  private async handleCreateRecord(
    data: any,
    context: Record<string, any>,
  ): Promise<any> {
    const { tableId, recordData } = data;
    const resolvedData = this.resolveVariables(recordData, context);

    return await this.recordsService.create(tableId, resolvedData, 'system');
  }

  private async handleUpdateRecord(
    data: any,
    context: Record<string, any>,
  ): Promise<any> {
    const { tableId, recordId, recordData } = data;
    const resolvedData = this.resolveVariables(recordData, context);
    const resolvedId = this.resolveVariables(recordId, context);

    return await this.recordsService.update(tableId, resolvedId, resolvedData);
  }

  private async handleDeleteRecord(
    data: any,
    context: Record<string, any>,
  ): Promise<any> {
    const { tableId, recordId } = data;
    const resolvedId = this.resolveVariables(recordId, context);

    return await this.recordsService.delete(resolvedId);
  }

  private async handleSendMessage(
    data: any,
    context: Record<string, any>,
  ): Promise<any> {
    const { channelId, content } = data;
    const resolvedContent = this.resolveVariables(content, context);

    return await this.chatService.createMessage(
      {
        channelId,
        content: resolvedContent,
      },
      'system',
    );
  }

  private async handleAITask(
    data: any,
    context: Record<string, any>,
  ): Promise<any> {
    const { prompt, conversationId } = data;
    const resolvedPrompt = this.resolveVariables(prompt, context);

    const response = await this.enhancedAIService.sendMessage(
      conversationId,
      resolvedPrompt,
      'system',
      true,
    );

    return response.message.content;
  }

  private async handleCondition(
    data: any,
    context: Record<string, any>,
  ): Promise<boolean> {
    const { operator, leftValue, rightValue } = data;

    const left = this.resolveVariables(leftValue, context);
    const right = this.resolveVariables(rightValue, context);

    switch (operator) {
      case 'equals':
        return left === right;
      case 'not_equals':
        return left !== right;
      case 'greater_than':
        return left > right;
      case 'less_than':
        return left < right;
      case 'contains':
        return String(left).includes(String(right));
      case 'starts_with':
        return String(left).startsWith(String(right));
      case 'ends_with':
        return String(left).endsWith(String(right));
      default:
        return false;
    }
  }

  private async handleDelay(data: any): Promise<void> {
    const { duration } = data; // in milliseconds
    await new Promise((resolve) => setTimeout(resolve, duration));
  }

  private async handleWebhook(
    data: any,
    context: Record<string, any>,
  ): Promise<any> {
    const { url, method = 'POST', headers = {}, body } = data;
    const resolvedBody = this.resolveVariables(body, context);

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(resolvedBody),
    });

    return await response.json();
  }

  /**
   * Resolve variables in strings like {{triggerData.id}}
   */
  private resolveVariables(value: any, context: Record<string, any>): any {
    if (typeof value === 'string') {
      // Replace {{variable.path}} with actual values
      return value.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
        const parts = path.trim().split('.');
        let result: any = context;

        for (const part of parts) {
          if (result && typeof result === 'object') {
            result = result[part];
          } else {
            return match; // Keep original if path not found
          }
        }

        return result !== undefined ? result : match;
      });
    } else if (typeof value === 'object' && value !== null) {
      // Recursively resolve object properties
      const resolved: any = Array.isArray(value) ? [] : {};
      for (const key in value) {
        resolved[key] = this.resolveVariables(value[key], context);
      }
      return resolved;
    }

    return value;
  }

  /**
   * Create execution log
   */
  private async createLog(
    executionId: string,
    nodeId: string,
    level: LogLevel,
    message: string,
    data?: Record<string, any>,
  ): Promise<void> {
    const log = this.logRepository.create({
      executionId,
      nodeId,
      level,
      message,
      data,
    });

    await this.logRepository.save(log);
  }

  /**
   * Get execution logs
   */
  async getExecutionLogs(executionId: string): Promise<WorkflowLog[]> {
    return this.logRepository.find({
      where: { executionId },
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Get execution by ID
   */
  async getExecution(id: string): Promise<WorkflowExecution> {
    const execution = await this.executionRepository.findOne({
      where: { id },
      relations: ['workflow', 'logs'],
    });

    if (!execution) {
      throw new NotFoundException('Execution not found');
    }

    return execution;
  }

  /**
   * Get workflow executions
   */
  async getWorkflowExecutions(
    workflowId: string,
    limit = 50,
  ): Promise<WorkflowExecution[]> {
    return this.executionRepository.find({
      where: { workflowId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
