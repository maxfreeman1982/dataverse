import { InputType, Field, ID } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { MCPServerType } from '../entities/mcp-server.entity';

@InputType()
export class CreateMCPServerInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => MCPServerType)
  type: MCPServerType;

  @Field()
  url: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  config?: Record<string, any>;

  @Field(() => GraphQLJSONObject, { nullable: true })
  headers?: Record<string, string>;

  @Field({ nullable: true })
  isPublic?: boolean;
}

@InputType()
export class UpdateMCPServerInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  url?: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  config?: Record<string, any>;

  @Field(() => GraphQLJSONObject, { nullable: true })
  headers?: Record<string, string>;

  @Field({ nullable: true })
  isEnabled?: boolean;

  @Field({ nullable: true })
  isPublic?: boolean;
}

@InputType()
export class ExecuteToolInput {
  @Field(() => ID)
  toolId: string;

  @Field(() => GraphQLJSONObject)
  parameters: Record<string, any>;
}
