import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { Workflow } from './workflow.entity';
import { WorkflowLog } from './workflow-log.entity';

export enum ExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

registerEnumType(ExecutionStatus, {
  name: 'ExecutionStatus',
});

@ObjectType()
@Entity('workflow_executions')
export class WorkflowExecution {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'workflow_id' })
  workflowId: string;

  @Field(() => Workflow)
  @ManyToOne(() => Workflow, (workflow) => workflow.executions)
  @JoinColumn({ name: 'workflow_id' })
  workflow: Workflow;

  @Field(() => ExecutionStatus)
  @Column({
    type: 'enum',
    enum: ExecutionStatus,
    default: ExecutionStatus.PENDING,
  })
  status: ExecutionStatus;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @Column({ type: 'jsonb', nullable: true, name: 'trigger_data' })
  triggerData?: Record<string, any>;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  result?: Record<string, any>;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  error?: string;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true, name: 'duration_ms' })
  durationMs?: number;

  @Field(() => [WorkflowLog], { nullable: true })
  @OneToMany(() => WorkflowLog, (log) => log.execution)
  logs?: WorkflowLog[];

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field({ nullable: true })
  @Column({ nullable: true, name: 'completed_at' })
  completedAt?: Date;
}
