import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workflow } from './entities/workflow.entity';
import {
  CreateWorkflowInput,
  UpdateWorkflowInput,
} from './dto/workflow.dto';
import { WebsocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class WorkflowService {
  constructor(
    @InjectRepository(Workflow)
    private readonly workflowRepository: Repository<Workflow>,
    private readonly websocketGateway: WebsocketGateway,
  ) {}

  async create(
    input: CreateWorkflowInput,
    userId: string,
  ): Promise<Workflow> {
    const workflow = this.workflowRepository.create({
      ...input,
      createdById: userId,
      nodes: [],
      edges: [],
    });

    const saved = await this.workflowRepository.save(workflow);

    this.websocketGateway.emitToAll('workflow:created', { workflow: saved });

    return saved;
  }

  async findAll(userId: string): Promise<Workflow[]> {
    return this.workflowRepository.find({
      where: { createdById: userId },
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Workflow> {
    const workflow = await this.workflowRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    return workflow;
  }

  async update(
    id: string,
    input: UpdateWorkflowInput,
    userId: string,
  ): Promise<Workflow> {
    const workflow = await this.findOne(id);

    if (workflow.createdById !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    Object.assign(workflow, input);

    const saved = await this.workflowRepository.save(workflow);

    this.websocketGateway.emitToAll('workflow:updated', { workflow: saved });

    return saved;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const workflow = await this.findOne(id);

    if (workflow.createdById !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    await this.workflowRepository.remove(workflow);

    this.websocketGateway.emitToAll('workflow:deleted', { workflowId: id });

    return true;
  }

  async toggleEnabled(id: string, userId: string): Promise<Workflow> {
    const workflow = await this.findOne(id);

    if (workflow.createdById !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    workflow.enabled = !workflow.enabled;

    return this.workflowRepository.save(workflow);
  }
}
