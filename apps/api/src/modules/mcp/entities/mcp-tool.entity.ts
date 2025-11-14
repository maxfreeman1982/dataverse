import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { MCPServer } from './mcp-server.entity';

@ObjectType()
@Entity('mcp_tools')
export class MCPTool {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ name: 'server_id' })
  serverId: string;

  @Field(() => MCPServer)
  @ManyToOne(() => MCPServer, (server) => server.tools)
  @JoinColumn({ name: 'server_id' })
  server: MCPServer;

  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @Field(() => GraphQLJSONObject)
  @Column({ type: 'simple-json', default: '{}' })
  schema: Record<string, any>; // JSON Schema for parameters

  @Field(() => [String], { nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  tags?: string[];

  @Field(() => GraphQLJSONObject, { nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  examples?: Array<{
    input: Record<string, any>;
    output: any;
  }>;

  @Field()
  @Column({ default: true, name: 'is_enabled' })
  isEnabled: boolean;

  @Field(() => Int)
  @Column({ default: 0, name: 'usage_count' })
  usageCount: number;

  @Field({ nullable: true })
  @Column({ nullable: true, name: 'last_used_at' })
  lastUsedAt?: Date;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
