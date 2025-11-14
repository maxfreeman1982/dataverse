import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { WorkflowExecution } from './workflow-execution.entity';

export enum LogLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  DEBUG = 'debug',
}

registerEnumType(LogLevel, {
  name: 'LogLevel',
});

@ObjectType()
@Entity('workflow_logs')
export class WorkflowLog {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'execution_id' })
  executionId: string;

  @Field(() => WorkflowExecution)
  @ManyToOne(() => WorkflowExecution, (execution) => execution.logs)
  @JoinColumn({ name: 'execution_id' })
  execution: WorkflowExecution;

  @Field()
  @Column({ name: 'node_id' })
  nodeId: string;

  @Field(() => LogLevel)
  @Column({
    type: 'enum',
    enum: LogLevel,
    default: LogLevel.INFO,
  })
  level: LogLevel;

  @Field()
  @Column({ type: 'text' })
  message: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  data?: Record<string, any>;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
