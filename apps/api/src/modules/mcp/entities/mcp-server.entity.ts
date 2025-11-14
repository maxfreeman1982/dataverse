import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { User } from '../../auth/entities/user.entity';
import { MCPTool } from './mcp-tool.entity';

export enum MCPServerStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
}

export enum MCPServerType {
  HTTP = 'http',
  WEBSOCKET = 'websocket',
  STDIO = 'stdio',
}

registerEnumType(MCPServerStatus, {
  name: 'MCPServerStatus',
});

registerEnumType(MCPServerType, {
  name: 'MCPServerType',
});

@ObjectType()
@Entity('mcp_servers')
export class MCPServer {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @Field(() => MCPServerType)
  @Column({
    type: 'enum',
    enum: MCPServerType,
    default: MCPServerType.HTTP,
  })
  type: MCPServerType;

  @Field()
  @Column()
  url: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  config?: Record<string, any>;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  headers?: Record<string, string>;

  @Field(() => MCPServerStatus)
  @Column({
    type: 'enum',
    enum: MCPServerStatus,
    default: MCPServerStatus.DISCONNECTED,
  })
  status: MCPServerStatus;

  @Field()
  @Column({ default: true, name: 'is_enabled' })
  isEnabled: boolean;

  @Field()
  @Column({ default: false, name: 'is_public' })
  isPublic: boolean;

  @Field()
  @Column({ name: 'created_by_id' })
  createdById: string;

  @Field(() => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Field(() => [MCPTool], { nullable: true })
  @OneToMany(() => MCPTool, (tool) => tool.server, { cascade: true })
  tools?: MCPTool[];

  @Field({ nullable: true })
  @Column({ nullable: true, name: 'last_connected_at' })
  lastConnectedAt?: Date;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true, name: 'last_error' })
  lastError?: string;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
