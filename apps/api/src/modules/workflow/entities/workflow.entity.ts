import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { User } from '../../users/user.entity';
import { WorkflowExecution } from './workflow-execution.entity';

export enum TriggerType {
  RECORD_CREATED = 'record_created',
  RECORD_UPDATED = 'record_updated',
  RECORD_DELETED = 'record_deleted',
  SCHEDULE = 'schedule',
  WEBHOOK = 'webhook',
  MANUAL = 'manual',
}

registerEnumType(TriggerType, {
  name: 'TriggerType',
});

@ObjectType()
@Entity('workflows')
export class Workflow {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field(() => TriggerType)
  @Column({
    type: 'simple-enum',
    enum: TriggerType,
    name: 'trigger_type',
  })
  triggerType: TriggerType;

  @Field(() => GraphQLJSONObject)
  @Column({ type: 'jsonb', name: 'trigger_config' })
  triggerConfig: Record<string, any>;

  @Field(() => GraphQLJSONObject)
  @Column({ type: 'jsonb', default: '[]' })
  nodes: Array<{
    id: string;
    type: string;
    position: { x: number; y: number };
    data: Record<string, any>;
  }>;

  @Field(() => GraphQLJSONObject)
  @Column({ type: 'jsonb', default: '[]' })
  edges: Array<{
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
  }>;

  @Field(() => Boolean)
  @Column({ default: true })
  enabled: boolean;

  @Column({ name: 'created_by' })
  createdById: string;

  @Field(() => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Field(() => [WorkflowExecution], { nullable: true })
  @OneToMany(() => WorkflowExecution, (execution) => execution.workflow)
  executions?: WorkflowExecution[];

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Field({ nullable: true })
  @Column({ nullable: true, name: 'last_executed_at' })
  lastExecutedAt?: Date;

  @Field(() => Int)
  @Column({ default: 0, name: 'execution_count' })
  executionCount: number;
}
